#!/usr/bin/env node

/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    inquirer = require('inquirer'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    Ssdp = require('ssdp-js'),
    commonTools = require('./../lib/base/common-tools'),
    novacom = require('./../lib/base/novacom');

const version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    appdata = commonTools.appdata,
    errHndl = commonTools.errMsg,
    setupDevice = commonTools.setupDevice;

const processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function(err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

const knownOpts = {
    // generic options
    "help": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error'],
    "version": Boolean,
    // command-specific options
    "list": Boolean,
    "listfull": Boolean,
    "add": [String, null],
    "remove": [String, null],
    "modify": [String, null],
    "default": [String, null],
    "search": Boolean,
    "timeout": [String, null],
    "info": [String, Array],
    "reset": Boolean
};

const shortHands = {
    // generic aliases
    "h": ["--help"],
    "v": ["--level", "verbose"],
    "V": ["--version"],
    // command-specific aliases
    "l": ["--list"],
    "F": ["--listfull"],
    "i": ["--info"],
    "a": ["--add"],
    "r": ["--remove"],
    "m": ["--modify"],
    "f": ["--default"],
    "s": ["--search"],
    "t": ["--timeout"],
    "R": ["--reset"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-*.js'*/);

log.heading = processName;
log.level = argv.level || 'warn';
log.verbose("argv", argv);

const inqChoices = ["add", "modify"],
    dfChoices = ["set default"],
    rmChoices = ["remove"],
    totChoices = inqChoices.concat(rmChoices, dfChoices);

let questions = [],
    op;

if (argv.list) {
    op = deviceList;
} else if (argv.listfull) {
    op = deviceListFull;
} else if (argv.reset) {
    op = reset;
} else if (argv.search || argv.timeout) {
    op = search;
} else if (argv.add || argv.modify || argv.info) {
    op = modifyDeviceInfo;
} else if (argv.remove) {
    op = removeDeviceInfo;
} else if (argv.default) {
    op = setDefaultDeviceInfo;
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.help) {
    help.display(processName, appdata.getConfig(true).profile);
    cliControl.end();
} else {
    op = interactiveInput;
}

if (op) {
    version.checkNodeVersion(function() {
        async.series([
            op.bind(this)
        ],finish);
    });
}

const _needInq = function(choice) {
    return function(choices) {
        return (choices.indexOf(choice) !== -1);
    };
};

function deviceList() {
    setupDevice.showDeviceList(finish);
}

function deviceListFull() {
    setupDevice.showDeviceListFull(finish);
}

function reset() {
    setupDevice.resetDeviceList(finish);
}

function _queryAddRemove(ssdpDevices, next) {
    let selDevice = {};
    const resolver = this.resolver || (this.resolver = new novacom.Resolver());
    if (typeof ssdpDevices === 'function') {
        next = ssdpDevices;
        ssdpDevices = null;
    }
    async.waterfall([
        resolver.load.bind(resolver),
        resolver.list.bind(resolver),
        function(devices, next) {
            if (!ssdpDevices) return next(null, devices, null);
            const ssdpDevMap = {};
            ssdpDevices.forEach(function(sd) {
                const key = sd.name + ' # '+sd.address;
                for (const idx in devices) {
                    if (devices[idx].name === sd.name)
                    {
                        ssdpDevMap[key] = devices[idx];
                        ssdpDevMap[key].op = 'modify';
                        ssdpDevMap[key].host = sd.address;
                        break;
                    }
                }
                if (!ssdpDevMap[key]) {
                    ssdpDevMap[key] = {
                        name: sd.name,
                        host: sd.address,
                        op: 'add'
                    };
                }
            });

            questions = [{
                type: "list",
                name: "discovered",
                message: "Select",
                choices: Object.keys(ssdpDevMap)
            }];
            inquirer.prompt(questions).then(function(answers) {
                next(null, devices, ssdpDevMap[answers.discovered]);
            });
        },
        function(devices, ssdpDevice, next) {
            const deviceNames = devices.filter(function(device) {
                return (device.conn.indexOf('novacom') === -1);
            }).map(function(device) {
                return (device.name);
            });
            questions = [{
                type: "list",
                name: "op",
                message: "Select",
                choices: function() {
                    if (ssdpDevice) {
                        if (ssdpDevice.op === 'modify') return inqChoices;
                        else return ['add'];
                    }
                    if (deviceNames.length > 1) return totChoices;
                    // deveice list has emulator only > unsupported remove option
                    return inqChoices.concat(dfChoices);
                },
                filter: function(val) {
                    return val.toLowerCase();
                },
                default: function() {
                    if (ssdpDevice && ssdpDevice.op) return ssdpDevice.op;
                    else return null;
                }
            }, {
                type: "input",
                name: "device_name",
                message: "Enter Device Name:",
                when: function(answers) {
                    return (answers.op === "add");
                },
                default: function() {
                    if (ssdpDevice && ssdpDevice.name) return ssdpDevice.name;
                    else return null;
                },
                validate: function(input) {
                    if (input.length < 1) {
                        return errHndl.getErrStr("EMPTY_VALUE");
                    }
                    if (deviceNames.indexOf(input) !== -1) {
                        return errHndl.getErrStr("EXISTING_VALUE");
                    }
                    if (!setupDevice.isValidDeviceName(input)) {
                        return errHndl.getErrStr("INVALID_DEVICENAME");
                    }
                    return true;
                }
            }, {
                type: "list",
                name: "device_name",
                message: "Select a device",
                choices: deviceNames.filter(dv => dv !== "emulator"),
                when: function(answers) {
                    return (["remove"].indexOf(answers.op) !== -1 && !ssdpDevice);
                }
            }, {
                type: "list",
                name: "device_name",
                message: "Select a device",
                choices: deviceNames,
                when: function(answers) {
                    return (["modify", "set default"].indexOf(answers.op) !== -1 && !ssdpDevice);
                }
            }];
            inquirer.prompt(questions)
            .then(function(answers) {
                devices.forEach(function(device) {
                    if (answers.device_name === device.name) {
                        selDevice = device;
                    }
                });
                selDevice.name = answers.device_name || ((ssdpDevice) ? ssdpDevice.name : null);
                selDevice.mode = answers.op || ((ssdpDevice) ? ssdpDevice.op : null);
                selDevice.host = (ssdpDevice) ? ssdpDevice.host : (selDevice.host || null);
                next(null, selDevice, null);
            });
        }
    ], function(err, result) {
        next(err, result);
    });
}

function _queryDeviceInfo(selDevice, next) {
    let mode = selDevice.mode;
    const deviceName = selDevice.name,
        resolver = this.resolver || (this.resolver = new novacom.Resolver()),
        defaultDeviceInfo = appdata.getConfig(true).defaultDeviceInfo;

    questions = [{
        type: "input",
        name: "ip",
        message: "Enter Device IP address:",
        default: function() {
            return selDevice.host || defaultDeviceInfo.ipAddress;
        },
        validate: function(answers) {
            if (!setupDevice.isValidIpv4(answers)) {
                return errHndl.getErrStr("INVALID_VALUE");
            }
            return true;
        },
        when: function() {
            return _needInq(mode)(inqChoices);
        }
    }, {
        type: "input",
        name: "port",
        message: "Enter Device Port:",
        default: function() {
            return selDevice.port || defaultDeviceInfo.port;
        },
        validate: function(answers) {
            if (!setupDevice.isValidPort(answers)) {
                return errHndl.getErrStr("INVALID_VALUE");
            }
            return true;
        },
        when: function() {
            return _needInq(mode)(inqChoices);
        }
    }, {
        type: "input",
        name: "user",
        message: "Enter ssh user:",
        default: function() {
            return selDevice.username || defaultDeviceInfo.user;
        },
        when: function() {
            return _needInq(mode)(inqChoices);
        }
    }, {
        type: "input",
        name: "description",
        message: "Enter description:",
        default: function() {
            return selDevice.description || defaultDeviceInfo.description;
        },
        when: function() {
            return _needInq(mode)(inqChoices);
        }
    }, {
        type: "list",
        name: "auth_type",
        message: "Select authentication",
        choices: ["password", "ssh key"],
        default: function() {
            let idx = 0;
            if (selDevice.privateKeyName) {
                idx = 1;
            }
            return idx;
        },
        when: function(answers) {
            return _needInq(mode)(inqChoices) && answers.user === "root";
        }
    }, {
        type: "password",
        name: "password",
        message: "Enter password:",
        when: function(answers) {
            return _needInq(mode)(inqChoices) && (answers.auth_type === "password");
        }
    }, {
        type: "input",
        name: "ssh_key",
        message: "Enter ssh private key file name:",
        default: function() {
            return selDevice.privateKeyName || "webos_emul";
        },
        when: function(answers) {
            return _needInq(mode)(inqChoices) && (answers.auth_type === "ssh key");
        }
    }, {
        type: "confirm",
        name: "default",
        message: "Set default ?",
        default: false,
        when: function() {
            return (mode === "add");
        }
    }, {
        type: "confirm",
        name: "confirm",
        message: "Save ?",
        default: true
    }];

    inquirer.prompt(questions).then(function(answers) {
        if (answers.confirm) {
            log.info("interactiveInput()#_queryDeviceInfo()", "saved");
        } else {
            log.info("interactiveInput()#_queryDeviceInfo()", "canceled");
            return next(null, {
                "msg": "Canceled"
            });
        }
        const inDevice = {
          profile: appdata.getConfig(true).profile,
          name: deviceName,
          host: answers.ip,
          port: answers.port,
          description: answers.description,
          username: answers.user,
          default: answers.default
        };

        if (answers.user !== 'prisoner' && ["add", "modify"].includes(mode)) {
            if (answers.auth_type && answers.auth_type === "password") {
                inDevice.password = answers.password;
                inDevice.privateKey = "@DELETE@";
                inDevice.passphrase = "@DELETE@";
                inDevice.privateKeyName = "@DELETE@";
            } else if ((answers.auth_type && answers.auth_type === "ssh key") ||  answers.user === "developer") {
                inDevice.password = "@DELETE@";
                inDevice.privateKey = {
                    "openSsh": answers.ssh_key || "webos_emul"
                };
                inDevice.passphrase = answers.ssh_passphrase || "@DELETE@";
                inDevice.privateKeyName = "@DELETE@";
            } else {
                return next(errHndl.getErrMsg("NOT_SUPPORT_AUTHTYPE", answers.auth_type));
            }
        }

        if (mode === 'set default') {
            inDevice.default = true;
            mode = 'default';
        }

        setupDevice.replaceDefaultDeviceInfo(inDevice);
        if (inDevice.port) {
            inDevice.port = Number(inDevice.port);
        }
        async.series([
            resolver.load.bind(resolver),
            resolver.modifyDeviceFile.bind(resolver, mode, inDevice),
            setupDevice.showDeviceList.bind(this),
        ], function(err, results) {
            if (err) {
                return next(err);
            }
            if(results[2] && results[2].msg){
                console.log(results[2].msg);
            }
            if(inDevice.username === 'prisoner' && mode === 'add'){
                setupDevice.displayGetKeyGuide(inDevice.name);
            }
            finish();
        });
    });
}

function interactiveInput() {
    async.waterfall([
        setupDevice.showDeviceList.bind(this),
        function(data, next) {
            console.log(data.msg);
            console.log("** You can modify the device info in the above list, or add new device.");
            next();
        },
        _queryAddRemove,
        _queryDeviceInfo
    ], function(err, result) {
        finish(err, result);
    });
}

function search(next) {
    const TIMEOUT = 5000,
        ssdp = new Ssdp(),
        timeout = Number(argv.timeout) * 1000 || TIMEOUT,
        outterNext = next,
        self = this;
    let discovered = [],
        end = false;

    console.log("Searching...");
    log.verbose("search()", "timeout:", timeout);
    ssdp.start();
    ssdp.onDevice(function(device) {
        if (!device.headers || !device.headers.SERVER ||
            device.headers.SERVER.indexOf('WebOS') < 0 || end) {
            return finish(null, {msg: "No devices is discovered."});
        }
        log.verbose("search()# %s:%s (%s)", '[Discovered]', device.name, device.address);
    });
    async.waterfall([
        function(next) {
            setTimeout(function() {
                discovered = ssdp.getList().map(function(device) {
                    end = true;
                    return {
                        "uuid": device.headers.USN.split(':')[1],
                        "name": device.name.replace(/\s/g, '_'),
                        "address": device.address,
                        "registered": false
                    };
                });
                // ssdp.destroy();
                if (discovered.length === 0) {
                    console.log("No devices is discovered.");
                    return outterNext();
                }
                log.verbose("search()", "discovered:", discovered.length);
                next(null, discovered);
            }, timeout);
        },
        _queryAddRemove.bind(self),
        _queryDeviceInfo.bind(self)
    ], function(err) {
        next(err);
    });
}

function modifyDeviceInfo() {
    setupDevice.modifyDeviceInfo(argv, finish);
}

function setDefaultDeviceInfo() {
    setupDevice.setDefaultDevice(argv.default, finish);
}

function removeDeviceInfo() {
    setupDevice.removeDeviceInfo(argv, finish);
}

function finish(err, value) {
    log.info("finish()");
    if (err) {
        // handle err from getErrMsg()
        if (Array.isArray(err) && err.length > 0) {
            for (const index in err) {
                log.error(err[index].heading, err[index].message);
            }
            log.verbose(err[0].stack);
        } else {
            // handle general err (string & object)
            log.error(err.toString());
            log.verbose(err.stack);
        }
        cliControl.end(-1);
    } else {
        log.verbose("finish()", "value:", value);
        if (value && value.msg) {
            console.log(value.msg);
        }
        cliControl.end();
    }
}
