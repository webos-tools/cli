/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    crypto = require('crypto'),
    fs = require('fs'),
    npmlog = require('npmlog'),
    path = require('path'),
    streamBuffers = require('stream-buffers'),
    util = require('util'),
    sessionLib = require('./session'),
    Appdata = require('./base/cli-appdata'),
    errHndl = require('./base/error-handler'),
    luna = require('./base/luna'),
    novacom = require('./base/novacom'),
    spinner = require('./util/spinner');

(function() {
    const cliData = new Appdata(),
        log = npmlog;

    log.heading = 'installer';
    log.level = 'warn';

    const installer = {
        /**
         * @property {Object} log an npm log instance
         */
        log: log,

        /**
         * Install the given package on the given target device
         * @param {Object} options installation options
         * @options options {Object} device the device to install the package onto, or null to select the default device
         * @param {String} hostPkgPath absolute path on the host of the package to be installed
         * @param {Function} next common-js callback
         */
        install: function(options, hostPkgPath, next, middleCb) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            if (!hostPkgPath) {
                return next(errHndl.getErrMsg("EMPTY_VALUE", "PACKAGE_FILE"));
            }

            const hostPkgName = path.basename(hostPkgPath),
                configData = cliData.getConfig(true),
                config = {
                    'tempDirForIpk': '/media/developer/temp',
                    'changeTempDir' : true,
                    'removeIpkAfterInst' : true
                };

            if (configData.install) {
                const conf = configData.install;
                for (const prop in conf) {
                    if (Object.prototype.hasOwnProperty.call(config, prop)) {
                        config[prop] = conf[prop];
                    }
                }
            }

            const appId = 'com.ares.defaultName',
                devicePkgPath = path.join(config.tempDirForIpk, hostPkgName).replace(/\\/g,'/'),
                os = new streamBuffers.WritableStreamBuffer();
            let srcMd5, dstMd5, md5DataSize = 200;
            options = options || {};

            log.info('install#install()', 'installing ' + hostPkgPath);
            async.waterfall([
                function(next) {
                    options.nReplies = 0; // -i
                    makeSession(options, next);
                },
                function(session, next) {
                    if (options.opkg) {
                        // FIXME: Need more consideration whether this condition is necessary or not.
                        if (options.session.getDevice().username !== 'root') {
                            return setImmediate(next, errHndl.getErrMsg("NEED_ROOT_PERMISSION", "opkg install"));
                        }
                    }
                    let cmd = '/usr/bin/test -d ' + config.tempDirForIpk + ' || /bin/mkdir -p ' + config.tempDirForIpk;
                    if (options.session.getDevice().username === 'root') {
                        cmd += ' && /bin/chmod 777 ' + config.tempDirForIpk;
                    }
                    options.op = (options.session.target.files || 'stream') + 'Put';
                    options.session.run(cmd, null, null, null, next);
                },
                function(next) {
                    middleCb("Installing package " + hostPkgPath);
                    spinner.start();
                    options.session.put(hostPkgPath, devicePkgPath, next);
                },
                function(next) {
                    options.session.run("/bin/ls -l \"" + devicePkgPath + "\"", null, os, null, next);
                },
                function(next) {
                    log.verbose("install#install()", "ls -l:", os.getContents().toString());
                    next();
                },
                function(next) {
                    const md5 = crypto.createHash('md5'),
                        buffer = Buffer.alloc(md5DataSize);
                    let pos = 0;

                    async.waterfall([
                        fs.lstat.bind(fs, hostPkgPath),
                        function(stat, next) {
                            if (stat.size > md5DataSize) {
                                pos = stat.size-md5DataSize;
                            } else {
                                pos = 0;
                                md5DataSize = stat.size;
                            }
                            next();
                        },
                        fs.open.bind(fs, hostPkgPath, 'r'),
                        function(fd, next) {
                            fs.read(fd, buffer, 0, md5DataSize, pos, function() {
                                md5.update(buffer);
                                next();
                            });
                        },
                        function() {
                            srcMd5 = md5.digest('hex');
                            if (!srcMd5) {
                                log.warn("install#install()", "Failed to get md5sum from the ipk file");
                            }
                            log.silly("install#install()", "srcMd5:", srcMd5);
                            next();
                        }
                    ], function(err) {
                        next(err);
                    });
                },
                function(next) {
                    const cmd = "/usr/bin/tail -c " + md5DataSize + " \"" + devicePkgPath + "\" | /usr/bin/md5sum";
                    async.series([
                        function(next) {
                            options.session.run(cmd, null, _onData, null, next);
                        }
                    ], function(err) {
                        if (err) {
                            return next(err);
                        }
                    });

                    function _onData(data) {
                        let str;
                        if (Buffer.isBuffer(data)) {
                            str = data.toString().trim();
                        } else {
                            str = data.trim();
                        }
                        if (str) {
                            dstMd5 = str.split('-')[0].trim();
                            log.silly("install#install()", "dstMd5:", dstMd5);
                        }
                        if (!dstMd5) {
                            log.warn("install#install()", "Failed to get md5sum from the transmitted file");
                        }
                        next();
                    }
                },
                function(next)	{
                    if (!srcMd5 || !dstMd5) {
                        log.warn("install#install()", "Cannot verify transmitted file");
                    } else {
                        log.verbose("install#install()", "srcMd5:", srcMd5, ", dstMd5:", dstMd5);
                        if (srcMd5 !== dstMd5) {
                            return next(errHndl.getErrMsg("FAILED_TRANSMIT_FILE"));
                        }
                    }
                    next();
                },
                function(next) {
                    const op = (options.opkg) ? _opkg : _appinstalld;
                    op(next);

                    function _opkg(next) {
                        let cmd = '/usr/bin/opkg install "' + devicePkgPath + '"';
                        cmd =  cmd.concat((options.opkg_param)? ' ' + options.opkg_param : '');

                        async.series([
                            options.session.run.bind(options.session, cmd, null, __data, __data),
                            options.session.run.bind(options.session, '/usr/sbin/ls-control scan-services ', null, null, __data)
                        ], function(err) {
                            if (err) {
                                return next(err);
                            }
                            next(null, null);
                        });

                        function __data(data) {
                            const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                            middleCb(str.trim());
                        }
                    }

                    function _appinstalld(next) {
                        const target = options.session.getDevice(),
                            addr = target.lunaAddr.install,
                            returnValue = addr.returnValue.split('.'),
                            param = {
                                // luna param
                                id: appId,
                                ipkUrl: devicePkgPath,
                                subscribe: true
                            };
                        options.sessionCall = false;

                        luna.send(options, addr, param, function(lineObj, next) {
                            let resultValue = lineObj;

                            for (let index = 1; index < returnValue.length; index++) {
                                resultValue = resultValue[returnValue[index]];
                            }

                            if (resultValue.match(/FAILED/i)) {
                                // failure: stop
                                log.verbose("install#install()", "failure");
                                const errValue = ((lineObj.details && lineObj.details.reason) ? lineObj.details.reason :
                                               (resultValue ? resultValue : ''));
                                next(errHndl.getErrMsg("FAILED_CALL_LUNA", errValue, null, addr.service));
                            } else if (resultValue.match(/installed|^SUCCESS/i)) {
                                // success: stop
                                log.verbose("install#install()", "success");
                                next(null, resultValue);
                            } else {
                                // no err & no status : continue
                                log.verbose("install#install()", "waiting");
                                next(null, null);
                            }
                        }, next);
                    }
                },
                function(status, next) {
                    if (typeof status === 'function') {
                        next = status;
                    }

                    if (config.removeIpkAfterInst) {
                        options.session.run('/bin/rm -f "' + devicePkgPath + '"', null, null, null, next);
                    } else {
                        next();
                    }
                },
                function(next) {
                    next(null, {msg : "Success"});
                }
            ], function(err, result) {
                next(err, result);
            });
        },

        remove: function(options, packageName, next, middleCb) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            options = options || {};
            async.waterfall([
                function(next) {
                    options.nReplies = 0; // -i
                    makeSession(options, next);
                },
                function(session, next) {
                    if (options.opkg) {
                        // FIXME: Need more consideration whether this condition is necessary or not.
                        if (options.session.getDevice().username !== 'root') {
                            return setImmediate(next, errHndl.getErrMsg("NEED_ROOT_PERMISSION","opkg remove"));
                        }
                    }
                    setImmediate(next);
                },
                function(next) {
                    const op = (options.opkg) ? _opkg : _appinstalld;
                    op(next);

                    function _opkg(next) {
                        let cmd = '/usr/bin/opkg remove ' + packageName;
                        cmd =  cmd.concat((options.opkg_param)? ' ' + options.opkg_param : '');

                        async.series([
                            options.session.run.bind(options.session, cmd,null, __data, __error),
                            options.session.run.bind(options.session, '/usr/sbin/ls-control scan-services ',null, null, __error)
                        ], function(err) {
                            if (err) {
                                return next(err);
                            }
                            next(null, {});
                        });

                        function __data(data) {
                            const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                            if (str.match(/No packages installed or removed/g)) {
                                return next(errHndl.getErrMsg("FAILED_REMOVE_PACKAGE", packageName));
                            } else {
                                middleCb(str.trim());
                            }
                        }

                        function __error(data) {
                            const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                            return next(new Error(str));
                        }
                    }

                    function _appinstalld(next) {
                        const target = options.session.getDevice(),
                            addr = target.lunaAddr.remove,
                            returnValue = addr.returnValue.split('.'),
                            param = {
                                // luna param
                                id: packageName,
                                subscribe: true
                            };
                        let exit = 0;
                        options.sessionCall = false;

                        luna.send(options, addr, param, function(lineObj, next) {
                            let resultValue = lineObj;

                            for (let index = 1; index < returnValue.length; index++) {
                                resultValue = resultValue[returnValue[index]];
                            }

                            if (resultValue.match(/FAILED/i)) {
                                // failure: stop
                                log.verbose("install#remove()", "failure");
                                if (!exit) {
                                    exit++;
                                    const errValue = ((lineObj.details && lineObj.details.reason) ? lineObj.details.reason :
                                                (resultValue ? resultValue : ''));
                                    next(errHndl.getErrMsg("FAILED_CALL_LUNA", errValue, null, addr.service));
                                }
                            } else if (resultValue.match(/removed|^SUCCESS/i)) {
                                log.verbose("install#remove()", "success");
                                // success: stop
                                next(null, {
                                    status: resultValue
                                });
                            } else {
                                // no err & no status : continue
                                log.verbose("install#remove()", "waiting");
                                next();
                            }
                        }, next);
                    }
                }
            ], function(err, result) {
                log.silly("install#remove()", "err:", err, ", result:", result);
                if (!err) {
                    result.msg = 'Removed package ' + packageName;
                }
                next(err, result);
            });
        },

        list: function(options, next, middleCb) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            options = options || {};
            async.series([
                function(next) {
                    options.nReplies = 1; // -n 1
                    makeSession(options, next);
                },
                function(next) {
                    if (options.opkg) {
                        // FIXME: Need more consideration whether this condition is necessary or not.
                        if (options.session.getDevice().username !== 'root') {
                            return setImmediate(next, errHndl.getErrMsg("NEED_ROOT_PERMISSION", "opkg list"));
                        }
                    }
                    setImmediate(next);
                },
                function(next) {
                    sessionLib.getSessionList(options, next);
                },
                function(next) {
                    const op = (options.opkg) ? _opkg : _appinstalld;
                    op(next);

                    function _opkg(next) {
                        let cmd = '/usr/bin/opkg list';
                        cmd =  cmd.concat((options.opkg_param)? ' ' + options.opkg_param : '');

                        async.series([
                            options.session.run.bind(options.session, cmd,
                                null, __data, __data)
                        ], function(err) {
                            if (err) {
                                return next(err);
                            }
                            next(null, {});
                        });

                        function __data(data) {
                            const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                            middleCb(str.trim());
                        }
                    }

                    function _appinstalld(next) {
                        const addr = options.session.getDevice().lunaAddr.list,
                            returnValue = addr.returnValue.split('.'),
                            param = {
                                // luna param
                                subscribe: false
                            };

                        luna.send(options, addr, param, function(lineObj, next) {
                            let resultValue = lineObj;
                            for (let index = 1; index < returnValue.length; index++) {
                                resultValue = resultValue[returnValue[index]];
                            }

                            if (Array.isArray(resultValue)) {
                                // success: stop
                                for (let index = 0; index < resultValue.length; index++) {
                                    if (!resultValue[index].visible) {
                                        resultValue.splice(index, 1);
                                        index--;
                                    }
                                }
                                log.verbose("install#list()", "success");
                                next(null, resultValue);
                            } else {
                                // failure: stop
                                log.verbose("install#list()", "failure");
                                next(errHndl.getErrMsg("INVALID_OBJECT"));
                            }

                        }, next);
                    }
                }
            ], function(err, results) {
                log.silly("install#list()", "err:", err, ", results:", results[3]);
                next(err, results[3]);
            });
        }
    };

    function makeSession(options, next){
        if (!options.session) {
            log.info("install#makeSession()", "need to make new session");
            const printTarget = true;
            options.session = new novacom.Session(options.device, printTarget, next);
        } else {
            log.info("install#makeSession()", "already exist session");
            next(null, options.session);
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = installer;
    }
}());
