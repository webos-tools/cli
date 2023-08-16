/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs'),
    Validator = require('jsonschema').Validator,
    mkdirp = require('mkdirp'),
    log = require('npmlog'),
    path = require('path'),
    shelljs = require('shelljs'),
    errHndl = require('./error-handler.js'),
    clone = require('./../util/objclone').deepCopy;

const Cli = (function() {
    let instance;

    function finish(err, returnValue, next) {
        if (next && typeof next === 'function') {
            if (!returnValue) {
                return setImmediate(next, err);
            }
            return setImmediate(next, err, returnValue);
        }
        return err || returnValue;
    }

    function init() {
        const
            workParentDir = path.resolve(process.env.APPDATA || process.env.HOME || process.env.USERPROFILE),
            builtinFiles = {
                "config": {
                    "dir": path.join(__dirname, "../../files", "conf"),
                    "file": "config.json"
                },
                "commands": {
                    "dir": path.join(__dirname, "../../files", "conf"),
                    "file": "command-service.json"
                },
                "deviceList": {
                    "dir": path.join(__dirname, "../../files", "conf"),
                    "file": "novacom-devices.json"
                },
                "deviceListSchema": {
                    "dir": path.join(__dirname, "../../files", "schema"),
                    "file": "NovacomDevices.schema"
                },
                "template": {
                    "dir": path.join(__dirname, "../../files", "conf"),
                    "file": "template.json"
                },
                "env": {
                    "dir": path.join(__dirname, "../../files", "conf"),
                    "file": "sdk.json"
                }
            },
            queryPath = path.join(__dirname, "../../files/conf/query");

        function _store(store, n, file) {
            store[n] = JSON.parse(fs.readFileSync(file));
            store[n + 'File'] = file;
        }

        for (const key in builtinFiles) {
            const filePath = path.join( builtinFiles[key].dir, builtinFiles[key].file );
            _store(this, key, filePath);
        }

        const
            workDir = (this.config.dataDir)? path.join(workParentDir, this.config.dataDir) : path.join(workParentDir, '.webos'),
            builtinDeviceListFile = path.join(builtinFiles.deviceList.dir, builtinFiles.deviceList.file),
            userDeviceListFile = path.join(workDir, builtinFiles.deviceList.file);

        if (!fs.existsSync(workDir)) {
            mkdirp.sync(workDir);
        }

        try {
            const userDeviceList = JSON.parse(fs.readFileSync(userDeviceListFile)),
                result = validateDevice(this.deviceListSchema, userDeviceList);

            if (result && result.resultValue) {
                this.deviceList = userDeviceList;
            } else {
                log.verbose("cli-appdata#init()", "schema check failure:", userDeviceListFile);
                log.verbose("cli-appdata#init()", "result:", result);
                log.verbose("cli-appdata#init()", "copy " + builtinDeviceListFile + " to " + userDeviceListFile);
                shelljs.cp('-f', builtinDeviceListFile, userDeviceListFile);
            }
        } catch (err) {
            log.verbose("cli-appdata#init()", "err:", err);
            log.verbose("cli-appdata#init()", "copy " + builtinDeviceListFile + " to " + userDeviceListFile);
            shelljs.cp('-f', builtinDeviceListFile, userDeviceListFile);
        }

        this.builtinDeviceListFile = builtinDeviceListFile;
        this.deviceListFile = userDeviceListFile;
        this.workDir = workDir;
        this.queryPath = queryPath;
        return true;
    }

    function validateDevice(schema, data) {
        let result = {
            resultValue: false,
            err: null
        };
        const schemaArray = {
            "id": "test",
            "type": "array",
            "items": {
                "$ref": "/deviceSchema"
            }
        };
        const v = new Validator();

        try {
            v.addSchema(schema, "/deviceSchema");
            result =  v.validate(data, schemaArray);
            if (result && result.errors.length > 0) {
                let errMsg = "Invalid device info.";
                for (const idx in result.errors) {
                    errMsg = errMsg.concat("\n");
                    let res,
                        errMsgLine = result.errors[idx].property + " " + result.errors[idx].message;
                    const regex = /instance\[*.*\]*\./g;
                    if ((res = regex.exec(errMsgLine)) !== null) {
                        errMsgLine = errMsgLine.substring(res[0].length);
                    }
                    errMsg = errMsg.concat(errMsgLine);
                }
                result.err = new Error(errMsg);
            } else {
                result.resultValue = true;
            }
        } catch (err) {
            // ignore exception
            result.err = err;
        }
        return result;
    }

    function CliAppData() {
        if (instance) {
            return instance;
        }
        instance = this;
        if (!this.inialized) {
            this.inialized = init.call(this);
        }
    }

    CliAppData.prototype = {
        getPath: function(next) {
            return finish(null, this.workDir, next);
        },

        getAppDir: function(next) {
            return finish(null, path.join(__dirname, '..'), next);
        },

        getConfig: function(next) {
            return finish(null, clone(this.config), next);
        },

        compareProfile: function(query, next) {
            next(null, query.toLowerCase() === this.config.profile.toLowerCase());
        },

        compareProfileSync: function(query){
            return query.toLowerCase() === this.config.profile.toLowerCase();
        },

        getDeviceList: function(renewal, next) {
            return finish(null, clone(this.deviceList), next);
        },

        getCommandService: function (next) {
            return finish(null, clone(this.commands), next);
        },

        setDeviceList: function(deviceListData, next) {
            log.info("cli-appdata#CliAppData#setDeviceList()");
            try {
                const result = validateDevice(this.deviceListSchema, deviceListData);
                if (result && !result.resultValue) {
                    const err = result.err || "invalid data";
                    return finish(err, this.deviceList, next);
                }
                this.deviceList = deviceListData;
                fs.writeFileSync(this.deviceListFile, JSON.stringify(this.deviceList, null, Number(4)));
            } catch (err) {
                return finish(err, this.deviceList, next);
            }
            return finish(null, this.deviceList, next);
        },

        setConfig: function (configData, next) {
            try {
                this.config = configData;
                fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, Number(4)) + "\n");
            } catch (err) {
                return finish(err, this.config, next);
            }
            return finish(null, this.config, next);
        },

        setTemplate: function (templateData, next) {
            try {
                this.template = templateData;
                fs.writeFileSync(this.templateFile, JSON.stringify(this.template, null, Number(4)));
            } catch (err) {
                return finish(err, this.template, next);
            }
        },
        setEnv: function (envData, next) {
            try {
                this.env = envData;
                fs.writeFileSync(this.envFile, JSON.stringify(this.env, null, Number(4)) + "\n");
            } catch (err) {
                return finish(err, this.env, next);
            }
        },
        setKey: function (keyPath, next) {
            try {
                const dstPubkey = path.join(__dirname, "../../files/conf", "pubkey.pem");
                if (fs.existsSync(dstPubkey)) {
                    shelljs.rm(dstPubkey);
                }
                if (keyPath) {
                    shelljs.cp(keyPath, dstPubkey);
                }
            } catch (err) {
                return finish(errHndl.getErrMsg(err), keyPath, next);
            }
            return finish(null, keyPath, next);
        },
        setQuery: function (queryBasePath, next) {
            try {
                if (fs.existsSync(this.queryPath)) {
                    shelljs.ls(this.queryPath).forEach(function(file){
                        shelljs.rm(path.join(__dirname, "../../files/conf/query",file));
                    });
                } else {
                    fs.mkdirSync(this.queryPath);
                }

                shelljs.ls(queryBasePath+'/*.json').forEach(function(file){
                        shelljs.cp(file, path.join(__dirname, "../../files/conf", "query"));
                });
            } catch (err) {
                return finish(err, this.queryPath, next);
            }
            return finish(null, this.queryPath, next);
        },
        resetDeviceList: function(next) {
            log.info("cli-appdata#CliAppData#resetDeviceList()");
            try {
                if (fs.existsSync(this.deviceListFile)) {
                    shelljs.rm(this.deviceListFile);
                }

                shelljs.cp(this.builtinDeviceListFile, this.deviceListFile );
                this.deviceList = JSON.parse(fs.readFileSync(this.deviceListFile));
            } catch (err) {
                log.verbose("cli-appdata#CliAppData#resetDeviceList()", "err:", err);
                return finish(err, clone(this.deviceList), next);
            }
            return finish(null, clone(this.deviceList), next);
        }
    };
    return CliAppData;
}());

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cli;
}
