/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    chalk = require('chalk'),
    Table = require('easy-table'),
    npmlog = require('npmlog'),
    Appdata = require('./cli-appdata'),
    errHndl = require('./error-handler'),
    novacom = require('./novacom');

(function() {
    const log = npmlog;
    log.heading = 'setup-device';
    log.level = 'warn';

    const appdata = new Appdata(),
        devicetools = {},
        defaultDeviceInfo = appdata.getConfig(true).defaultDeviceInfo;
        defaultDeviceInfo.profile = appdata.getConfig(true).profile;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = devicetools;
        module.exports.isValidDeviceName = isValidDeviceName;
        module.exports.isValidIpv4 = isValidIpv4;
        module.exports.isValidPort =isValidPort;
        module.exports.replaceDefaultDeviceInfo = replaceDefaultDeviceInfo;
        module.exports.displayGetKeyGuide = displayGetKeyGuide;
    }

    function isValidDeviceName(name) {
        return ['$', '%'].indexOf(name[0]) === -1;
    }

    function isValidIpv4(host) {
        return host === "localhost" ||  host.match(/^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/);
    }

    function isValidPort(port) {
        const intPort = Number(port);
        return Number.isInteger(intPort) && intPort > 0 && intPort <= 65535;
    }

    devicetools.showDeviceList = function(next) {
        async.waterfall([
            _getDeviceInfo.bind(this, 'list'),
            function(data, next) {
                const table = new Table();
                data.forEach(function(item) {
                    if (!isValidDeviceName(item.name)) {
                        return;
                    }
                    table.cell('name', (item.default === true) ? item.name + chalk.green(' (default)') : item.name);
                    table.cell('deviceinfo', item.info);
                    table.cell('connection', item.connection);
                    table.cell('profile', item.profile);
                    table.cell('passphrase', item.passphrase);
                    table.newRow();
                });
                next(null, table.toString());
            }
        ], function(err, results) {
            next(err, {msg: results});
        });
    };

    devicetools.showDeviceListFull = function(next) {
        async.waterfall([
            _getDeviceInfo.bind(this, 'full'),
            function(data, next) {
                next(null, JSON.stringify(data, null, 4));
            }
        ], function(err, results) {
            next(err, {msg: results});
        });
    };

    devicetools.resetDeviceList = function(next) {
        async.series([
            function(next) {
                appdata.resetDeviceList(next);
            },
            this.showDeviceList.bind(this, next)
        ], function(err) {
            next(err);
        });
    };

    devicetools.setDefaultDevice = function(name, next) {
        try {
            const resolver = this.resolver || (this.resolver = new novacom.Resolver()),
                inDevice = {name: name, default: true};
            async.series([
                resolver.load.bind(resolver),
                resolver.modifyDeviceFile.bind(resolver, 'default', inDevice),
                this.showDeviceList.bind(this, next)
            ], function(err) {
                if (err) {
                    return next(err);
                }
                next();
            });
        } catch (err) {
            next(err);
        }
    };

    devicetools.removeDeviceInfo = function(options, next) {
        try {
            // For CLI
            if (options.remove === 'true') {
                next(errHndl.getErrMsg("EMPTY_VALUE", "DEVICE_NAME"));
            }
            // For API
            if (!options.remove) {
                next(errHndl.getErrMsg("INVALID_REMOVE_MODE"));
            }

            const resolver = this.resolver || (this.resolver = new novacom.Resolver()),
                inDevice = {name: options.remove, profile: defaultDeviceInfo.profile};
            async.series([
                resolver.load.bind(resolver),
                resolver.modifyDeviceFile.bind(resolver, 'remove', inDevice),
                this.showDeviceList.bind(this, next)
            ], function(err) {
                if (err) {
                    return next(err);
                }
                next();
            });
        } catch (err) {
            next(err);
        }
    };

    devicetools.modifyDeviceInfo = function(options, next) {
        try {
            const mode = (options.add) ? "add" : (options.modify) ? "modify" : null;
            if (!mode) {
                return next(errHndl.getErrMsg("INVALID_MODE"));
            }
            if (options[mode].match(/^-/)) {
                let indexMode = options.argv.cooked.indexOf("--" + mode);
                if (indexMode != -1 && options.argv.cooked.length > indexMode + 2 && !options.argv.cooked[indexMode + 2].match(/^--[a-z]+$/)) {
                    return next(errHndl.getErrMsg("EMPTY_VALUE", "DEVICE_NAME"));
                }
            }
            const argName = (options.info) ? "info" : mode;
            const inDevice = _getParams(options, argName);
            if (!inDevice.name) {
                if (options[mode] === "true") {
                    return next(errHndl.getErrMsg("EMPTY_VALUE", "DEVICE_NAME"));
                }
                inDevice.name = options[mode];
            }

            log.info("modifyDeviceInfo()", "devicename:", inDevice.name, ", mode:", mode);

            if (inDevice.default !== undefined && mode === "modify") {
                log.verbose("modifyDeviceInfo()", "Ignoring invalid arguments:default");
                inDevice.default = undefined;
            }

            if (inDevice.privateKey) {
                inDevice.privatekey = inDevice.privateKey;
            }
            if (typeof inDevice.privatekey === "string") {
                inDevice.privateKey = inDevice.privatekey;
                inDevice.privateKey = { "openSsh": inDevice.privateKey };
                delete inDevice.privatekey;
                inDevice.password = "@DELETE@";
            }
            if (typeof inDevice.password !== "undefined" && inDevice.password !== "@DELETE@") {
                inDevice.privateKey = "@DELETE@";
                inDevice.passphrase = "@DELETE@";
            }

            if (mode === "add") {
                replaceDefaultDeviceInfo(inDevice);
                if (!inDevice.privateKey && !inDevice.password) {
                    inDevice.password = "";
                }
            }
            // check validation
            if (!isValidDeviceName(inDevice.name)) {
                return next(errHndl.getErrMsg("INVALID_DEVICENAME"));
            }
            if (inDevice.host && !isValidIpv4(inDevice.host)) {
                return next(errHndl.getErrMsg("INVALID_VALUE", "host", inDevice.host));
            }
            if (inDevice.port && !isValidPort(inDevice.port)) {
                return next(errHndl.getErrMsg("INVALID_VALUE", "port", inDevice.port));
            }
            if (inDevice.port) {
                inDevice.port = Number(inDevice.port);
            }
            if (!inDevice.profile) {
                inDevice.profile = defaultDeviceInfo.profile;
            }
            const resolver = this.resolver || (this.resolver = new novacom.Resolver());
            async.series([
                resolver.load.bind(resolver),
                resolver.modifyDeviceFile.bind(resolver, mode, inDevice),
                this.showDeviceList.bind(this)
            ], function(err, results) {
                if (err) {
                    return next(err);
                }
                if(results[2] && results[2].msg){
                    console.log(results[2].msg);
                }
                if(inDevice.username === 'prisoner' && mode === 'add'){
                    displayGetKeyGuide(inDevice.name);
                }
                next();
            });
        } catch (err) {
            next(err);
        }
    };

    function _getDeviceInfo(mode, next) {
        const datas= [],
            resolver = new novacom.Resolver();
        async.waterfall([
            resolver.load.bind(resolver),
            resolver.list.bind(resolver),
            function(devices, next) {
                if (Array.isArray(devices)) {
                    devices.forEach(function(device) {
                        const conn = device.conn.concat([]),
                            info = (device.username && device.host && device.port) ? device.username + '@' + device.host + ':' + device.port : device.id,
                            item = {
                                profile: device.profile,
                                name: device.name,
                                default: device.default,
                                deviceinfo: {},
                                connection: device.conn || ['ssh'],
                                details: {
                                    platform: device.type
                                }
                            };

                        if (conn.length === 1 && conn.indexOf('novacom') !== -1) {
                            item.deviceinfo.uid = device.id;
                            item.details.type = device.name.slice(0, 3);
                        } else {
                            item.deviceinfo = {
                                ip: device.host,
                                port: String(device.port),
                                user: device.username
                            };

                            item.details.password = device.password;
                            item.details.privatekey = device.privateKeyName;
                            item.details.passphrase = device.passphrase;
                            item.details.description = device.description;
                        }

                        if (device.id) {
                            item.deviceinfo.uid = device.id;
                            item.details.type = device.name.slice(0, 3);
                        }
                        const data = (mode === 'full')
                                        ? item
                                        : {
                                            name: device.name,
                                            default: device.default,
                                            info: info,
                                            connection: (device.conn || 'ssh'),
                                            profile: device.profile,
                                            passphrase: device.passphrase || ""
                                        };
                        datas.push(data);
                    });
                }
                next(null, datas);
            }
        ], function(err, results) {
            next(err, results);
        });
    }

    function _getParams(argv, option) {
        let inputParams = [];
        const params = {};
        if (argv[option]) {
            inputParams = [].concat(argv[option]);
        }

        if (inputParams.length === 1 && inputParams[0].indexOf('{') !== -1 && inputParams[0].indexOf('}') !== -1 &&
            ((inputParams[0].split("'").length - 1) % 2) === 0) {
            // eslint-disable-next-line no-useless-escape
            inputParams[0] = inputParams[0].replace(/\'/g, '"');
        }
        inputParams.forEach(function(strParam) {
            try {
                const data = JSON.parse(strParam);
                for (const k in data) {
                    params[k] = data[k];
                }
            } catch (err) {
                const tokens = strParam.split('=');
                if (tokens.length === 2) {
                    params[tokens[0]] = tokens[1];
                    log.verbose("_getParams()", "Inserting params ", tokens[0] + " = " + tokens[1]);
                } else {
                    log.verbose("_getParams()", "Ignoring invalid arguments:", strParam);
                }
            }
        });

        // FIXME : -i default=true is set as "true" string
        if (params.default !== undefined && typeof params.default === "string") {
            params.default = (params.default === "true");
        }

        log.silly("_getParams()", "params:", JSON.stringify(params));
        return params;
    }

    function replaceDefaultDeviceInfo(inDevice) {
        if (inDevice) {
            inDevice.profile = inDevice.profile || defaultDeviceInfo.profile;
            inDevice.type = inDevice.type || defaultDeviceInfo.type;
            inDevice.host = inDevice.host || defaultDeviceInfo.ipAddress;
            inDevice.port = inDevice.port || defaultDeviceInfo.port;
            inDevice.username = inDevice.username || defaultDeviceInfo.user;
            inDevice.files = inDevice.files || defaultDeviceInfo.files;
            inDevice.description = inDevice.description || defaultDeviceInfo.description;
            inDevice.default = inDevice.default || defaultDeviceInfo.default;
        }
    }

    function displayGetKeyGuide(deviceName) {
        const guideSteps = "** To connect to TV you need to do following steps:"
                              + "\n 1. Turning on Developer Mode following this guide: https://webostv.developer.lge.com/develop/getting-started/developer-mode-app"
                              + "\n 2. Launch the Developer Mode app and click the Key Server button in the Developer Mode app"
                              + "\n 3. Get the ssh key file from your webOS TV with the following command on your PC"
                              + "\n    > ares-novacom --device " + deviceName + " --getkey"
                              + "\n    > Enter the passphrase displayed on the Developer Mode app";
                    
        console.log(guideSteps);
    }
}());
