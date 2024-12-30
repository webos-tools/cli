/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    chalk = require('chalk'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    net = require('net'),
    log = require('npmlog'),
    path = require('path'),
    request = require('request'),
    shelljs = require('shelljs'),
    Ssh2 = require('ssh2'),
    stream = require('stream'),
    util = require('util'),
    Appdata = require('./cli-appdata'),
    errHndl = require('./error-handler'),
    server = require('./server');

// novacom emulation layer, on top of ssh
(function() {
    const novacom = {};

    log.heading = 'novacom';
    log.level = 'warn';
    novacom.log = log;

    const keydir = path.resolve(process.env.HOME || process.env.USERPROFILE, '.ssh');
    let cliData;

    function makeExecError(cmd, code, signal, orgErrMsg) {
        let err = null; // null:success, undefined:did-not-run, Error:failure

        if (orgErrMsg) {
            orgErrMsg = "\n(Original Message: " + orgErrMsg.replace(/\u001b[^m]*?m/g,"").trim() + ")";
        } else {
            orgErrMsg = "";
        }

        if (signal) {
            signal = " (signal: " + signal + ")";
        } else {
            signal = "";
        }

        if (code !== 0 || signal) {
            err = new Error();
            err.message = "Command '" + cmd + "' exited with code=" + code + signal + orgErrMsg;
            err.code = code;

            return errHndl.getErrMsg(err);
        }
        return err;
    }

    novacom.Resolver = Resolver;

    /**
     * @constructor
     */
    function Resolver() {
        /**
         * @property devices
         * This list use to be maintained by novacomd
         */
        this.devices = [];
        this.deviceFileContent = null;
        cliData = new Appdata();
    }

    novacom.Resolver.prototype = {
        /**
         * Load the resolver DB from the filesystem
         * @param {Function} next a common-JS callback invoked when the DB is ready to use.
         */
        load: function(next) {
            log.info("novacom#Resolver()#load()");
            const resolver = this;

            async.waterfall([
                _replaceBuiltinSshKey.bind(resolver),
                _adjustList.bind(resolver),
                _loadString.bind(resolver)
            ], function(err) {
                if (err) {
                    setImmediate(next, err);
                } else {
                    log.silly("novacom#Resolver()#load()", "devices:", resolver.devices);
                    setImmediate(next);
                }
            });

            function _replaceBuiltinSshKey(next) {
                log.silly("novacom#Resolver()#load()#_replaceBuiltinSshKey()");
                const builtinPrvKeyForEmul = path.join(__dirname, "../../files/conf/", 'webos_emul'),
                    userHomePrvKeyForEmul = path.join(keydir, 'webos_emul');

                fs.stat(builtinPrvKeyForEmul, function(err, builtinKeyStat) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            setImmediate(next);
                        } else {
                            setImmediate(next, err);
                        }
                    } else {
                        fs.stat(userHomePrvKeyForEmul, function(error, userKeyStat) {
                            if (error) {
                                if (error.code === 'ENOENT') {
                                    mkdirp(keydir, function() {
                                        shelljs.cp('-rf', builtinPrvKeyForEmul, keydir);
                                        fs.chmodSync(userHomePrvKeyForEmul, '0600');
                                        setImmediate(next);
                                    });
                                } else {
                                    setImmediate(next, error);
                                }
                            } else {
                                if (builtinKeyStat.mtime.getTime() > userKeyStat.mtime.getTime()) {
                                    shelljs.cp('-rf', builtinPrvKeyForEmul, keydir);
                                    fs.chmodSync(userHomePrvKeyForEmul, '0600');
                                }
                                setImmediate(next);
                            }
                        });
                    }
                });
            }

            /*
             * Add "default" field to list files
             * Set "emulator" to default target
             */
            function _adjustList(next) {
                const defaultTarget = "emulator";
                let inDevices = cliData.getDeviceList(true);

                // count targes does not have "default field"
                const defaultFields = inDevices.filter(function(device) {
                    return (device.default !== undefined);
                });
                if (defaultFields.length < 1) {
                    log.silly("novacom#Resolver()#load()#_adjustList()", "rewrite default field");
                    inDevices = inDevices.map(function(dev) {
                        if (defaultTarget === dev.name) {
                            dev.default = true;
                        } else {
                            dev.default = false;
                        }
                        return dev;
                    });
                    this.save(inDevices);
                }
                setImmediate(next);
            }

            /*
             * Load devices described in the given string
             * (supposed to be a JSON Array).
             */
            function _loadString(next) {
                let inDevices = cliData.getDeviceList(true);

                if (!Array.isArray(inDevices)) {
                    setImmediate(next, errHndl.getErrMsg("INVALID_FILE"));
                    return;
                }
                inDevices = inDevices.map((device, index) => ({...device, index}));
                async.forEach(inDevices, function(inDevice, next) {
                    async.series([
                        resolver._loadOne.bind(resolver, inDevice),
                        resolver._addOne.bind(resolver, inDevice)
                    ], next);
                }, function(err) {
                    if (err) {
                        setImmediate(next, err);
                    } else {
                        setImmediate(next);
                    }
                });
            }
        },

        /*
         * Resolve the SSH private key of the given device
         * into a usable string.  Prefer already fetch keys,
         * then manually-configured OpenSSH one & finally
         * fetch it from a distant device (webOS Pro only).
         */
        _loadOne: function(inDevice, next) {
            if (typeof inDevice.privateKey === 'string') {
                inDevice.privateKeyName = inDevice.privateKey;
                inDevice.privateKey = Buffer.from(inDevice.privateKey, 'base64');
                setImmediate(next);
            } else if (typeof inDevice.privateKey === 'object' && typeof inDevice.privateKey.openSsh === 'string') {
                inDevice.privateKeyName = inDevice.privateKey.openSsh;
                async.waterfall([
                    fs.readFile.bind(this, path.join(keydir, inDevice.privateKey.openSsh), next),
                    function(privateKey, next) {
                        inDevice.privateKey = privateKey;
                        setImmediate(next);
                    }
                ], function(err) {
                    // do not load non-existing OpenSSH private key files
                    if (err) {
                        log.verbose("novacom#Resolver()#_loadOne()", "Unable to find SSH private key named '" +
                                    inDevice.privateKey.openSsh + "' from '" + keydir + " for '" + inDevice.name + "'");
                        inDevice.privateKey = undefined;
                    }
                    setImmediate(next);
                });
            } else if (inDevice.type !== undefined && inDevice.type === 'webospro') {
                // FIXME: here is the place to stream-down the SSH private key from the device
                setImmediate(next, errHndl.getErrMsg("NOT_IMPLEMENTED", "webOS Pro device type handling"));
            } else { // private Key is not defined in novacom-device.json
                if (!inDevice.password) {
                    log.silly("novacom#Resolver()#_loadOne()", "Regist privateKey : need to set a SSH private key in " +
                                keydir + " for'" + inDevice.name + "'");
                }
                inDevice.privateKeyName = undefined;
                inDevice.privateKey = undefined;
                setImmediate(next);
            }
        },

        /*
         * Add given inDevice to the Resolver DB, overwritting
         * any existing one with the same "name:" is needed.
         */
        _addOne: function(inDevice, next) {
            // add the current profile device only
            if (!inDevice.profile || !cliData.compareProfileSync(inDevice.profile)) {
                return setImmediate(next);
            }

            inDevice.display = {
                name: inDevice.name,
                type: inDevice.type,
                privateKeyName: inDevice.privateKeyName,
                passphrase: inDevice.passphrase,
                description: inDevice.description,
                conn: inDevice.conn || ['ssh'],
                devId: inDevice.id || null
            };

            if (inDevice.username && inDevice.host && inDevice.port) {
                inDevice.display.addr = "ssh://" + inDevice.username + "@" + inDevice.host + ":" + inDevice.port;
            }

            for (const n in inDevice) {
                if (n !== "display") {
                    inDevice.display[n] = inDevice[n];
                }
            }

            // filter-out `this.devices` from the one having the same name as `inDevice`...
            this.devices = this.devices.filter(function(device) {
                return device.name !== inDevice.name;
            });

            // ...hook proper luna interface
            const systemCmd = cliData.getCommandService();
            inDevice.lunaSend = systemCmd.lunaSend;
            inDevice.lunaAddr = systemCmd.lunaAddr;

            // ...and then append `inDevice`
            this.devices.push(inDevice);
            setImmediate(next);
        },


        /**
         * @public
         */
        save: function(devicesData, next) {
            log.info("novacom#Resolver()#save()");
            return cliData.setDeviceList(devicesData, next);
        },

        /**
         * @public
         */
        list: function(next) {
            log.info("novacom#Resolver()#list()");
            setImmediate(next, null, this.devices.map(function(device) {
                return device.display;
            }));
        },

        setTargetName: function(target, printTarget, next) {
            let name = (typeof target === 'string' ? target : target && target.name);
            if (!name) {
                const usbDevices = this.devices.filter(function(device) {
                    return (device.conn && device.conn.indexOf("novacom") !== -1);
                });

                if (usbDevices.length > 1) {
                    return next(errHndl.getErrMsg("CONNECTED_MULTI_DEVICE"));
                }

                // default target priority
                // specified target name > target connected by novacom > user setting > emulator
                if (usbDevices.length > 0 && usbDevices[0].name) {
                    name = usbDevices[0].name;
                } else {
                    const defaultTargets = this.devices.filter(function(device) {
                        return (device.default && device.default === true);
                    });

                    if (defaultTargets.length > 1) {
                        return next(errHndl.getErrMsg("SET_DEFAULT_MULTI_DEVICE"));
                    } else if (defaultTargets.length === 1) {
                        name = defaultTargets[0].name;
                    } else {
                        // if cannot find default target in list, set to "emulator"
                        name = "emulator";
                    }
                }
            }
            if (printTarget) {
                console.log(chalk.green("[Info] Set target device : " + name));
            }
            next(null, 'name', name);
        },

        getDeviceBy: function(key, value, next) {
            log.info("novacom#Resolver()#getDeviceBy()", "key:", key, ", value:", value);
            const devices = this.devices.filter(function(device) {
                return device[key] && device[key] === value;
            });

            if (devices.length < 1) {
                setImmediate(next, errHndl.getErrMsg("UNMATCHED_DEVICE", key, value));
            } else if (typeof next === 'function') {
                setImmediate(next, null, devices[0]);
            } else {
                return devices[0];
            }
        },

        getSshPrvKey: function(target, next) {
            let name = (typeof target === 'string' ? target : target && target.name);
            if (!name) {
                // if name is not specified, find default target
                const defaultTargets = this.devices.filter(function(device) {
                    return (device.default && device.default === true);
                });
                if (defaultTargets.length > 1) {
                    return next(errHndl.getErrMsg("SET_DEFAULT_MULTI_DEVICE"));
                } else if (defaultTargets.length === 1) {
                    name = defaultTargets[0].name;
                } else {
                    // if cannot find default target in list, set to "emulator"
                    name = "emulator";
                }
                // assign target name
                if (typeof target === 'string') {
                    target = name;
                } else if (typeof target === 'object') {
                    target.name = name;
                }
            }

            async.waterfall([
                this.getDeviceBy.bind(this, 'name', name),
                function(targetDevice, next) {
                    log.info("Resolver#getSshPrvKey()", "targetDevice.host:", targetDevice.host);
                    const url = 'http://' + targetDevice.host + ':9991' + '/webos_rsa';
                    const keyFileNamePrefix = targetDevice.name.replace(/(\s+)/gi, '_');
                    const keyFileName = keyFileNamePrefix + "_webos";
                    const keySavePath = path.join(keydir, keyFileName);
                    request.head(url, function(err, res) {
                        if (err || (res && res.statusCode !== 200)) {
                            return setImmediate(next, errHndl.getErrMsg("FAILED_GET_SSHKEY"));
                        }
                        log.info("Resolver#getSshPrvKey()#head", "content-type:", res.headers['content-type']);
                        log.info("Resolver#getSshPrvKey()#head", "content-length:", res.headers['content-length']);
                        request(url).pipe(fs.createWriteStream(keySavePath)).on('close', function(error) {
                            if (error) {
                                return setImmediate(next, errHndl.getErrMsg("FAILED_GET_SSHKEY"));
                            } else {
                                setImmediate(next, error, keySavePath, keyFileName);
                            }
                        });
                    });
                },
                function(keyFilePath, keyFileName, next) {
                    log.info("Resolver#getSshPrvKey()", "SSH Private Key:", keyFilePath);
                    console.log("SSH Private Key:", keyFilePath);
                    fs.chmodSync(keyFilePath, '0600');
                    setImmediate(next, null, keyFileName);
                }
            ], next);
        },

        modifyDeviceFile: function(op, target, next) {
            log.info("novacom#Resolver()#modifyDeviceFile()", "op:", op);
            let defaultTarget = "emulator",
                inDevices = cliData.getDeviceList(true);

            if (!target.name) {
                return setImmediate(next, errHndl.getErrMsg("EMPTY_VALUE", "target"));
            }

            if (!Array.isArray(inDevices)) {
                return setImmediate(next, errHndl.getErrMsg("INVALID_FILE"));
            }

            const matchedDevices = inDevices.filter(function(dev) {
                let match = false;
                if (target.name === dev.name) {
                    if (target.profile) {
                        if (target.profile === dev.profile) {
                            match = true;
                        }
                    } else {
                        match = true;
                    }
                }
                return match;
            });

            if (op === 'add') {
                if (matchedDevices.length > 0) {
                    return setImmediate(next, errHndl.getErrMsg("EXISTING_VALUE", "DEVICE_NAME", target.name));
                }

                for (const key in target) {
                    if (target[key] === "@DELETE@") {
                        delete target[key];
                    }
                }

                if (target.default === true) {
                    defaultTarget = target.name;
                } else if (target.default === false) {
                    // new device is not a default target, keep current default target device.
                    defaultTarget = null;
                }

                inDevices = inDevices.concat(target);
            } else if (op === 'remove' || op === 'modify' || op === 'default') {
                if (matchedDevices.length === 0) {
                    return setImmediate(next, errHndl.getErrMsg("INVALID_VALUE", "DEVICE_NAME", target.name));
                }

                if (op === 'remove') {
                    inDevices = inDevices.filter(function(dev) {
                        if (target.name === dev.name) {
                            if (dev.indelible === true) {
                                return setImmediate(next, errHndl.getErrMsg("CANNOT_REMOVE_DEVICE", dev.name));
                            } else {
                                // removed target is not default target, do not set defalut to others
                                if (dev.default === false) {
                                    defaultTarget = null;
                                }
                                return false;
                            }
                        } else {
                            return true;
                        }
                    });
                } else if (op === 'modify') {
                    inDevices = inDevices.map(function(dev) {
                        if (target.name === dev.name) {
                            if (dev.default === true) {
                                // keep current default device as modified target
                                defaultTarget = dev.name;
                            } else {
                                // do not change default device
                                defaultTarget = null;
                            }

                            for (const prop in target) {
                                if (Object.prototype.hasOwnProperty.call(target, prop)) {
                                    dev[prop] = target[prop];
                                    if (dev[prop] === "@DELETE@") {
                                        delete dev[prop];
                                    }
                                }
                            }
                        }
                        return dev;
                    });
                } else if (op === 'default') {
                    inDevices.map(function(dev) {
                        if (target.name === dev.name) {
                            if (target.default === true) {
                                defaultTarget = target.name;
                            }
                        }
                    });
                }
            } else {
                return setImmediate(next, errHndl.getErrMsg("UNKNOWN_OPERATOR", op));
            }

            // Set default target & others to no default target(false)
            if (defaultTarget != null) {
                inDevices = inDevices.map(function(dev) {
                    if (defaultTarget === dev.name) {
                        dev.default = true;
                    } else {
                        dev.default = false;
                    }
                    return dev;
                });
            }
            this.save(inDevices, next);
        }
    };

    /**
     * @constructor
     * @param {String} target the name of the target device to connect to.  "default"
     * @param {Function} next common-js callback, invoked when the Session becomes usable or definitively unusable (failed)
     */
    function Session(target, printTarget, next) {
        if (typeof next !== 'function') {
            throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
        }

        const name = (typeof target === 'string' ? target : target && target.name);
        log.info("novacom#Session()", "opening session to '" + (name ? name : "default device") + "'");
        this.resolver = new Resolver();

        async.waterfall([
            this.resolver.load.bind(this.resolver),
            this.resolver.setTargetName.bind(this.resolver, target, printTarget),
            this.resolver.getDeviceBy.bind(this.resolver),
            this.checkConnection.bind(this),
            this.begin.bind(this)
        ], next);
    }

    novacom.Session = Session;

    novacom.Session.prototype = {
        /**
         * Check if socket can be connected
         * This method can be called multiple times.
         * @param {Function} next common-js callback
         */
        checkConnection: function(target, next) {
            let alive = false;
            if (target && target.host && target.port) {
                const socket = new net.Socket();
                socket.setTimeout(2000);
                const client = socket.connect({
                    host: target.host,
                    port: target.port
                });
                client.on('connect', function() {
                    alive = true;
                    client.end();
                    setImmediate(next, null, target);
                });
                client.on('error', function(err) {
                    client.destroy();
                    setImmediate(next, errHndl.getErrMsg(err));
                });
                client.on('timeout', function() {
                    client.destroy();
                    if (!alive) {
                        setImmediate(next, errHndl.getErrMsg("TIME_OUT"));
                    }
                });
            } else {
                setImmediate(next, null, target);
            }
        },

        /**
         * Begin a novacom session with the current target
         * This method can be called multiple times.
         * @param {Function} next common-js callback
         */
        begin: function(target, next) {
            log.verbose("novacom#Session()#begin()", "target:", target.display);
            const self = this;
            this.target = target || this.target;

            if (this.target.conn && (this.target.conn.indexOf('ssh') === -1)) {
                setImmediate(next, null, this);
                return this;
            }

            if (this.target.privateKey === undefined && this.target.password === undefined) {
                return setImmediate(next, errHndl.getErrMsg("NOT_EXIST_SSHKEY_PASSWD"));
            }

            if (!this.ssh) {
                this.forwardedPorts = [];
                this.ssh = new Ssh2.Client();
                this.ssh.on('connect', function() {
                    log.info("novacom#Session()#begin()", "ssh session event: connected");
                });
                this.ssh.on('ready', _next.bind(this));
                this.ssh.on('error', _next.bind(this));
                this.ssh.on('end', function() {
                    log.info("novacom#Session()#begin()", "ssh session event: end");
                });
                this.ssh.on('close', function(had_error) {
                    log.info("novacom#Session()#begin()", "ssh session event: close (had_error:", had_error, ")");
                });
                this.target.readyTimeout = 30000;
                //Explicit overrides for the default transport layer algorithms used for the connection.
                this.target.algorithms = {
                    "kex": [
                        "diffie-hellman-group1-sha1",
                        "ecdh-sha2-nistp256",
                        "ecdh-sha2-nistp384",
                        "ecdh-sha2-nistp521",
                        "diffie-hellman-group-exchange-sha256",
                        "diffie-hellman-group14-sha1"
                      ],
                }
                this.ssh.connect(this.target);

                process.on("SIGHUP", _clearSession);
                process.on("SIGINT", _clearSession);
                process.on("SIGQUIT", _clearSession);
                process.on("SIGTERM", _clearSession);
                process.on("exit", function() {
                    _clearSession();
                });
                // Node.js cannot handle SIGKILL, SIGSTOP
                // process.on("SIGKILL", _clearSession);
                // process.on("SIGSTOP", _clearSession);
            }
            return this;

            function _next(err) {
                if (err) {
                    const errorMessages = errHndl.getErrMsg(err);
                    if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                        for (const index in errorMessages) {
                            log.error(
                                "novacom#Session()#begin() " + errorMessages[index].heading,
                                errorMessages[index].message
                            );
                        }
                    }
                    if (this.errorImmediate) clearImmediate(this.errorImmediate);
                    this.errorImmediate = setImmediate(next, errorMessages, this);
                } else setImmediate(next, null, this);
            }

            function _clearSession() {
                log.verbose("novacom#Session()#begin()", "clear Session");
                self.end();
                setTimeout(function() {
                    process.exit();
                }, 500);
            }
        },

        /**
         * @return the resolved device actually in use for this session
         */
        getDevice: function() {
            return this.target;
        },

        /**
         * Suspend the novacom session.  Underlying resources
         * are released (eg. SSH connections are closed).
         */
        end: function() {
            log.info('novacom#Session()#end()', "user-requested termination");
            if (this.ssh) {
                this.ssh.end();
            }
            return this;
        },

        _checkSftp: function(next) {
            // FIXME: This is workaround to prevent hang from ssh2.sftp()
            //       - issue in ssh2: https://github.com/mscdex/ssh2/issues/240
            //       This way only works with ssh2@0.2.x, not working with ssh2@0.4.x, ssh2@0.3.x.
            const self = this;
            self.ssh.subsys('sftp', function(err, _stream) {
                if (err) {
                    return setImmediate(next, err);
                }

                _stream.once('data', function(data) {
                    const regex = new RegExp("sftp-server(.| )+not found", "gi");
                    if (data.toString().match(regex)) {
                        const sftpError = errHndl.getErrMsg("UNABLE_USE_SFTP");
                        sftpError.code = 4;
                        return setImmediate(next, sftpError);
                    }
                });
            });
        },

        /**
         * Upload a file on the device
         * @param {String} inPath location on the host
         * @param {String} outPath location on the device
         * @param {Function} next common-js callback
         */
        put: function(inPath, outPath, next) {
            log.info("novacom#Session()#put()", "uploding into device:", outPath, "from host:", inPath);
            const self = this;
            let inStream;

            log.verbose("novacom#Session()#put()", "sftpPut()::start");
            self.sftpPut(inPath, outPath, function(err) {
                if (err) {
                    log.verbose(err);
                    if (4 === err.code || 127 === err.code) {
                        log.info("novacom#Session()#put()", "sftp is not available, attempt transfering file via streamPut");
                        inStream = fs.createReadStream(inPath);
                        self.streamPut(outPath, inStream, next);
                    } else if (14 === err.code) {
                        const detailMsg = errHndl.getErrMsg("NO_FREE_SPACE");
                        setImmediate(next, detailMsg);
                    } else {
                        setImmediate(next, err);
                    }
                } else {
                    log.info("novacom#Session()#put()", "sftpPut()::done");
                    setImmediate(next);
                }
            });
        },

        /**
         * Upload a file on the device via ssh stream
         * @param {String} outPath location on the device
         * @param {ReadableStream} inStream paused host-side source
         * @param {Function} next common-js callback
         */
        streamPut: function(outPath, inStream, next) {
            log.info("novacom#Session()#streamPut()", "streaming into device:" + outPath);
            const cmd = '/bin/cat > "' + outPath + '"';
            this.run(cmd, inStream /* stdin*/ , null /* stdout*/ , process.stderr /* stderr*/ , next);
        },

        /**
         * Upload a file on the device via sftp
         * @param {String} inPath location on the host
         * @param {String} outPath location on the device
         * @param {Function} next common-js callback
         */
        sftpPut: function(inPath, outPath, next) {
            log.verbose('novacom#Session()#sftpPut()', 'host:' + inPath + ' => ' + 'device:' + outPath);
            const self = this;
            self._checkSftp(next);

            async.series({
                transfer: function(next) {
                    self.ssh.sftp(function(err, sftp) {
                        if (err) {
                            return setImmediate(next, err);
                        }

                        const readStream = fs.createReadStream(inPath),
                            writeStream = sftp.createWriteStream(outPath);

                        writeStream.on('close', function() {
                            sftp.end();
                            setImmediate(next);
                        });

                        // Exit when the remote process has terminated
                        writeStream.on('exit', function(code, signal) {
                            err = makeExecError('sftpPut', code, signal);
                            setImmediate(next, err);
                        });

                        writeStream.on('error', function(error) {
                            log.verbose('novacom#Session()#sftpPut()', "error:", error);
                            setImmediate(next, error);
                        });

                        readStream.pipe(writeStream);
                    });
                }
            }, function(err) {
                setImmediate(next, err);
            });
        },

        /**
         * Download file on the device
         * @param {String} inPath location on the device
         * @param {String} outPath location on the host
         * @param {Function} next common-js callback
         */
        get: function(inPath, outPath, next) {
            log.verbose("novacom#Session()#get()", "downloading into host:", outPath, "from target:", inPath);
            const self = this;

            log.verbose("novacom#Session()#get()", "sftpGet()::start");
            self.sftpGet(inPath, outPath, function(err) {
                if (err) {
                    log.verbose(err);
                    if (4 === err.code || 127 === err.code) {
                        log.info("novacom#Session()#get()", "sftp is not available, attempt transfering file via streamPut");
                        const os = fs.createWriteStream(outPath);
                        os.on('error', function(error) {
                            setImmediate(next, errHndl.getErrMsg(error));
                        });
                        self.streamGet(inPath, os, next);
                    } else {
                        setImmediate(next, err);
                    }
                } else {
                    log.verbose("novacom#Session()#get()", "sftpGet()::done");
                    setImmediate(next);
                }
            });
        },

        /**
         * Read a file from the device via ssh stream
         * @param {String} inPath the device file path to be read
         * @param {WritableStream} outStream host-side destination to copy the file into
         * @param {Function} next commonJS callback invoked upon completion or failure
         */
        streamGet: function(inPath, outStream, next) {
            log.verbose('novacom#Session()#streamGet()', "streaming from device:" + inPath);
            const cmd = '/bin/cat ' + inPath;
            this.run(cmd, null /* stdin*/ , outStream /* stdout*/ , process.stderr /* stderr*/ , next);
        },

        /**
         * Download file on the device via sftp
         * @param {String} inPath location on the device
         * @param {String} outPath location on the host
         * @param {Function} next common-js callback
         */
        sftpGet: function(inPath, outPath, next) {
            log.verbose("novacom#Session()#sftpGet()", "target:" + inPath + " => " + "host:" + outPath);
            const self = this;
            self._checkSftp(next);
            async.series({
                transfer: function(next) {
                    self.ssh.sftp(function(err, sftp) {
                        if (err) {
                            setImmediate(next, err);
                            return;
                        }

                        const readStream = sftp.createReadStream(inPath),
                            writeStream = fs.createWriteStream(outPath);

                        readStream.on('close', function() {
                            sftp.end();
                            setImmediate(next);
                        });

                        // Exit when the remote process has terminated
                        readStream.on('exit', function(code, signal) {
                            err = makeExecError('sftpGet', code, signal);
                            setImmediate(next, err);
                        });

                        readStream.on('error', function(error) {
                            log.verbose("novacom#Session()#sftpGet()", "error:", error);
                            setImmediate(next, error);
                        });

                        readStream.pipe(writeStream);
                    });
                }
            }, function(err) {
                setImmediate(next, err);
            });
        },

        /**
         * Run a command on the device
         * @param {String} cmd the device command to run
         * @param {stream.ReadableStream} stdin given as novacom process stdin
         * @param {stream.WritableStream} stdout given as novacom process stdout
         * @param {stream.WritableStream} stderr given as novacom process stderr
         * @param {Function} next commonJS callback invoked upon completion or failure
         */
        run: function(cmd, stdin, stdout, stderr, next) {
            this.run_ssh(cmd, {}, stdin, stdout, stderr, next);
        },

        /**
         * Run a command with exec option on the device
         * @param {String} cmd the device command to run
         * @param {Object} opt given as exec option
         * @param {stream.ReadableStream} stdin given as novacom process stdin
         * @param {stream.WritableStream} stdout given as novacom process stdout
         * @param {stream.WritableStream} stderr given as novacom process stderr
         * @param {Function} next commonJS callback invoked upon completion or failure
         */
        runWithOption: function(cmd, opt, stdin, stdout, stderr, next) {
            this.run_ssh(cmd, opt, stdin, stdout, stderr, next);
        },

        /**
         * Run a command on the device
         * @param {String} cmd the device command to run
         * @param {Object} opt given as exec option
         * @param {stream.ReadableStream} stdin given as novacom process stdin
         * @param {stream.WritableStream} stdout given as novacom process stdout
         * @param {stream.WritableStream} stderr given as novacom process stderr
         * @param {Function} next commonJS callback invoked upon completion or failure
         */
        run_ssh: function(cmd, opt, stdin, stdout, stderr, next) {
            log.info("novacom#Session()#run()", "cmd:" + cmd + ", opt:" + JSON.stringify(opt));
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            // plumb output
            const write = {},
                obj = {};
                let orgErrMsg;

            if (!stdout) {
                log.silly("novacom#Session()#run()", "stdout: none");
                write.stdout = function() {};
            } else if (stdout instanceof stream.Stream) {
                log.silly("novacom#Session()#run()", "stdout: stream");
                write.stdout = stdout.write;
                obj.stdout = stdout;
            } else if (stdout instanceof Function) {
                log.silly("novacom#Session()#run()", "stdout: function");
                write.stdout = stdout;
            } else {
                return setImmediate(next, errHndl.getErrMsg("INVALID_VALUE", "stdout", util.inspect(stdout)));
            }

            if (!stderr) {
                log.silly("novacom#Session()#run()", "stderr: none");
                write.stderr = function() {};
            } else if (stderr instanceof stream.Stream) {
                log.silly("novacom#Session()#run()", "stderr: stream");
                write.stderr = stderr.write;
                obj.stderr = stderr;
            } else if (stderr instanceof Function) {
                log.silly("novacom#Session()#run()", "stderr: function");
                write.stderr = stderr;
            } else {
                return setImmediate(next, errHndl.getErrMsg("INVALID_VALUE", "stderr", util.inspect(stderr)));
            }

            // execute command
            this.ssh.exec(cmd, opt, (function(err, chStream) {
                log.silly("novacom#Session()#run()", "exec cmd:" + cmd + ", opt:" + JSON.stringify(opt) + ", err:" + err);
                if (err) {
                    return setImmediate(next, err);
                }

                // manual pipe(): handle & divert data chunks
                chStream.on('data', function(data, extended) {
                    extended = extended || 'stdout';
                    log.verbose("novacom#Session()#run()", "on data (" + extended + ")");
                    write[extended].bind(obj[extended])(data);
                }).stderr.on('data', function(data) {
                    log.verbose("novacom#Session()#run()", "on data (stderr)");
                    orgErrMsg = data.toString();
                });

                // manual pipe(): handle EOF
                chStream.on('end', function() {
                    log.silly("novacom#Session()#run()", "event EOF from (cmd:" + cmd + ")");
                    if ((stdout !== process.stdout) && (stdout instanceof stream.Stream)) {
                        stdout.end();
                    }
                    if ((stderr !== process.stderr) && (stderr instanceof stream.Stream)) {
                        stderr.end();
                    }
                });

                // Exit when the remote process has terminated
                chStream.on('exit', function(code, signal) {
                    log.silly("novacom#Session()#run()", "event exit code:" + code + ', signal:' + signal + " (cmd:" + cmd + ")");
                    err = makeExecError(cmd, code, signal, orgErrMsg);
                    setImmediate(next, err);
                });

                // Exit if the 'exit' event was not
                // received (dropbear <= 0.51)
                chStream.on('close', function() {
                    log.silly("novacom#Session()#run()", "event close (cmd:" + cmd + ")");
                    if (err === undefined) {
                        setImmediate(next);
                    }
                });

                if (stdin) {
                    stdin.pipe(chStream);
                    log.verbose("novacom#Session()#run()", "resuming input");
                }
            }));
        },

        /**
         * Run a command on the device considerless return stdout
         * @param {String} cmd the device command to run
         * @param {Function} callback invoked upon exit event
         * @param {Function} next commonJS callback invoked upon completion or failure
         */
        runNoHangup: function(cmd, cbData, cbExit, next) {
            this.runNoHangup_ssh(cmd, cbData, cbExit, next);
        },

        /**
         * Run a command on the device considerless return stdout
         * @param {String} cmd the device command to run
         * @param {Function} callback invoked upon exit event
         * @param {Function} next commonJS callback invoked upon completion or failure
         */
        runNoHangup_ssh: function(cmd, cbData, cbExit, next) {
            log.info("novacom#Session()#runNoHangup()", "cmd=" + cmd);
            if (arguments.length < 2) {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next");
            }

            for (const arg in arguments) {
                if (typeof arguments[arg] === 'undefined') {
                    delete arguments[arg];
                    arguments.length--;
                }
            }

            switch (arguments.length) {
                case 2:
                    next = cbData;
                    cbData = cbExit = null;
                    break;
                case 3:
                    next = cbExit;
                    cbExit = cbData;
                    cbData = null;
                    break;
                default:
                    break;
            }

            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            // execute command
            this.ssh.exec(cmd, (function(err, _stream) {
                log.verbose("novacom#Session()#run()", "exec cmd:" + cmd + ", err:" + err);
                if (err) {
                    return setImmediate(next, err);
                }

                _stream.on('data', function(data) {
                    const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                    log.verbose("novacom#Session()#runNoHangup()#onData", str);
                    if (cbData) cbData(data);
                }).stderr.on('data', function(data) {
                    const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                    log.verbose("novacom#Session()#runNoHangup()#onData#stderr#", str);
                    if (cbData) cbData(data);
                });

                // Exit when the remote process has terminated
                if (cbExit) {
                    _stream.on('exit', function(code, signal) {
                        log.verbose("novacom#Session()#runNoHangup()", "event exit code=" + code + ', signal=' + signal + " (cmd: " + cmd + ")");
                        err = makeExecError(cmd, code, signal);
                        cbExit(err);
                    });
                }
                setImmediate(next);
            }));
        },

        /**
         * Forward the given device port on the host.
         * As any other public method, this one can be called
         * only once the ssh session has emitted the 'ready'
         * event, so as part of the Session()#next callback.
         * @public
         * @param {Function} next commonJS callback invoked upon completion or failure
         */
        forward: function(devicePort, localPort, forwardName, next) {
            log.info("novacom#Session()#forward()", "devicePort:", devicePort, ", localPort:", localPort);
            const session = this;
            let forwardInUse = false,
                registerName = null;

            if (typeof forwardName === 'function') {
                next = forwardName;
            } else if (forwardName) {
                    registerName = forwardName;
            }

            if (localPort !== 0) {
                if (session.forwardedPorts.indexOf({
                        name: registerName,
                        local: localPort,
                        device: devicePort
                    }) > 0) {
                    forwardInUse = true;
                }
            } else if (session.forwardedPorts.filter(function(forwardItem) {
                        return (forwardItem.device === devicePort && forwardItem.name === registerName);
                    }).length > 0) {
                    forwardInUse = true;
            }

            if (forwardInUse) {
                return setImmediate(next);
            }

            const localServer = net.createServer(function(inCnx) {
                log.info("novacom#Session()#forward()", "new client, localPort:", localPort);
                log.verbose("novacom#Session()#forward()", "new client, from: " + inCnx.remoteAddress + ':' + inCnx.remotePort);

                inCnx.on('error', function(err) {
                    log.verbose("novacom#Session()#forward()", "inCnx::error, err::" + err);
                });

                // Open the outbound connection on the device to match the incoming client.
                session.ssh.forwardOut("127.0.0.1" /* srcAddr*/ , inCnx.remotePort /* srcPort*/ , "127.0.0.1" /* dstAddr*/ , devicePort /* dstPort*/ , function(err, outCnx) {
                    if (err) {
                        console.log("novacom#Session()#forward()", "failed forwarding client localPort:",
                                    localPort, "(inCnx.remotePort:", inCnx.remotePort, ")=> devicePort:", devicePort);
                        log.warn("novacom#Session()#forward()", "failed forwarding client localPort:",
                                localPort, "=> devicePort:", devicePort);
                        inCnx.destroy();
                        return;
                    }

                    log.info("novacom#Session()#forward()", "connected, devicePort:", devicePort);
                    inCnx.on('data', function(data) {
                        if (outCnx.writable && outCnx.writable === true) {
                            if (outCnx.write(data) === false) {
                                inCnx.pause();
                            }
                        }
                    });

                    inCnx.on('close', function(had_err) {
                        log.verbose("novacom#Session()#forward()", "inCnx::close, had_err:", had_err);
                        outCnx.destroy();
                    });

                    outCnx.on('drain', function() {
                        inCnx.resume();
                    });

                    outCnx.on('data', function(data) {
                        inCnx.write(data);
                    });

                    outCnx.on('close', function(had_err) {
                        log.verbose("novacom#Session()#forward()", "outCnx::close, had_err:", had_err);
                    });
                });
            });

            session.ssh.on('close', function() {
                localServer.close();
            });

            try {
                localServer.listen(localPort, null, (function() {
                    const localServerPort = localServer.address().port;
                    session.forwardedPorts.push({
                        name: registerName,
                        local: localServerPort,
                        device: devicePort
                    });
                    setImmediate(next);
                }));
            } catch (err) {
                setImmediate(next, err);
            }
        },

        getLocalPortByName: function(queryName) {
            const session = this;
            let found = null;
            session.forwardedPorts.forEach(function(portItem) {
                if (portItem.name === queryName) {
                    found = portItem.local;
                    return;
                }
            });
            return found;
        },

        runHostedAppServer: function(url, next) {
            server.runServer(url, 0, function(err, serverInfo) {
                if (serverInfo && serverInfo.port) {
                    this.setHostedAppServerPort(serverInfo.port);
                }
                next(err);
            }.bind(this));
        },

        setHostedAppServerPort: function(port) {
            this.hostedAppServerPort = port;
        },

        getHostedAppServerPort: function() {
            return this.hostedAppServerPort;
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = novacom;
    }
}());
