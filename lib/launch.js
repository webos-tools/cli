/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    exec = require('child_process').exec,
    fs = require('fs'),
    npmlog = require('npmlog'),
    os = require('os'),
    path = require('path'),
    semver = require('semver'),
    util = require('util'),
    fileWatcher = require('./base/file-watcher'),
    inspector = require('./inspect'),
    installer = require('./install'),
    sessionLib = require('./session'),
    errHndl = require('./base/error-handler'),
    luna = require('./base/luna'),
    novacom = require('./base/novacom'),
    sdkenv = require('./base/sdkenv'),
    spinner = require('./util/spinner');

(function() {
    const log = npmlog;
    log.heading = 'launcher';
    log.level = 'warn';

    const launcher = {
        /**
         * @property {Object} log an npm log instance
         */
        log: log,

        /**
         * Launch the given application id
         * @param {Object} options
         * @property options {String} device the device to connect to
         * @property options {Boolean} inspect run the application with web-inspector turned on
         */
        launch: function(options, id, params, next, middleCb) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            const self = this,
                hostedAppId = "com.sdk.ares.hostedapp";
            let hostedAppInstalled = false;
            options = options || {};

            async.series([
                _checkInstalledApp,
                _checkRunningApp,
                _installHostedApp,
                _makeSession,
                _runAppServer,
                _setAppServerInfo,
                _getSessionList,
                _checkDisplayAffinity,
                _launch,
                _runFileWatcher,
                _runInspector
            ], function(err, results) {
                log.silly("launch#launch()", "err:", err, ", results:", results);
                const result = results[8];
                if (!err) {
                    if (options.installMode !== "Hosted") {
                        result.msg = "Launched application " + id;
                        if (self.displayId !== undefined) {
                            result.msg += " on display " + self.displayId;
                        }
                    } else {
                        options.session = null;
                        options.printTarget = false;
                        self.close(options, hostedAppId, params, next);
                        result.msg = "";
                        return;
                    }
                }
                next(err, result);
            });

            function _checkInstalledApp(next) {
                if (options.installMode === "Hosted") {
                    installer.list(options, function(err, result) {
                        for (const index in result) {
                            if (result[index].id === hostedAppId) {
                                hostedAppInstalled = true;
                                break;
                            }
                        }
                        next(err);
                    });
                } else {
                    next();
                }
            }

            function _checkRunningApp(next) {
                if (options.installMode === "Hosted") {
                    self.listRunningApp(options, function(err, result) {
                        for (const index in result) {
                            if (result[index].id === hostedAppId) {
                                self.close(options, hostedAppId, params, next);
                                return;
                            }
                        }
                        next(err);
                    });
                } else {
                    next();
                }
            }

            function _installHostedApp(next) {
                if (options.installMode === "Hosted" && !hostedAppInstalled) {
                    const hostedAppUrl = path.join(__dirname, hostedAppId + ".ipk");
                    options.appId = id;
                    installer.install(options, hostedAppUrl, next, function(value) {
                        middleCb(value);
                    });
                } else {
                    next();
                }
            }

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _runAppServer(next) {
                if (options.installMode === "Hosted") {
                    options.session.runHostedAppServer(options.hostedurl, next);
                    spinner.stop();
                    middleCb("Ares Hosted App is now running...");
                } else {
                    next();
                }
            }

            function _setAppServerInfo(next) {
                if (options.installMode === "Hosted") {
                    if (options.hostIp) {
                        options.localIP = options.hostIp;
                    } else {
                        const networkInterfaces = os.networkInterfaces();
                        let localIP = "";

                        for (const devName in networkInterfaces) {
                            for (let index = 0; index < networkInterfaces[devName].length; index++) {
                                const alias = networkInterfaces[devName][index];
                                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                                    localIP = localIP || alias.address;
                                    options.localIP = localIP;
                                }
                            }
                        }
                    }
                    const port = options.session.getHostedAppServerPort();
                    if (params === null) {
                        params = {};
                    }
                    params.hostedurl = "http://" + options.localIP + ":" + port + "/";
                }
                next();
            }

            function _getSessionList(next) {
                sessionLib.getSessionList(options, next);
            }

            function _checkDisplayAffinity(next) {
                checkDisplayAffinity(options, params, next);
            }

            function _launch(next) {
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.launch,
                    returnValue = addr.returnValue.split('.'),
                    param = {
                        // luna param
                        id: id,
                        subscribe: false,
                        params: params
                    };

                luna.send(options, addr, param, function(lineObj, next) {
                    let resultValue = lineObj;

                    for (let index = 1; index < returnValue.length; index++) {
                        resultValue = resultValue[returnValue[index]];
                    }

                    if (resultValue) {
                        // success: stop
                        log.verbose("launch#launch()#_launch()", "success");

                        // If sam returns "displayId" show displayId in result msg
                        if (lineObj.displayId !== undefined) {
                            self.displayId = lineObj.displayId;
                        }
                        next(null, {procId: resultValue});
                    } else {
                        // failure: stop
                        log.verbose("launch#launch()#_launch()", "failure");
                        next(errHndl.getErrMsg("INVALID_OBJECT"));
                    }
                }, next);
            }

            function _runFileWatcher(next) {
                if (options.installMode === "Hosted") {
                    log.verbose("launcher#launch#_runFileWatcher()");
                    options.appId = id;
                    fileWatcher.watch(options, params);
                    next();
                } else {
                    next();
                }
            }

            function _runInspector(next) {
                if (options.inspect) {
                    options.appId = id;
                    options.running = true;

                    async.series([
                            inspector.inspect.bind(inspector, options, null),
                            function() {
                                // TODO: hold process to keep alive
                            }
                    ], function(err) {
                        next(err);
                    });
                } else if (options.installMode === "Hosted") {
                    process.on("SIGINT", function () {
                        log.verbose("launcher#launch#_runInspector():", "SIGINT is detected in Hosted mode");
                        next();
                    });
                } else {
                    next();
                }
            }
        },
        /**
         * Close the given application id
         * @param {Object} options
         * @property options {String} device the device to connect to
         * @property options {Boolean} inspect run the application with web-inspector turned on
         */
        close: function(options, id, params, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            const self = this;
            options = options || {};

            async.series([
                _makeSession,
                _getSessionList,
                _checkDisplayAffinity,
                _close
            ], function(err, results) {
                log.silly("launch#close()", "err:", err, ", results:", results);
                // 2 steps in async.series, we want to
                // the value returned by the second
                // step (index=1)
                const result = results[3];
                if (result) {
                    if (options.installMode !== "Hosted") {
                        result.msg = "Closed application " + id;
                        if (self.displayId !== undefined) {
                            result.msg += " on display " + self.displayId;
                        }
                    } else {
                        result.msg = "...Closed Ares Hosted App";
                    }
                }
                next(err, result);
            });

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _getSessionList(next) {
                sessionLib.getSessionList(options, next);
            }

            function _checkDisplayAffinity(next) {
                checkDisplayAffinity(options, params, next);
            }

            function _close(next) {
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.terminate,
                    returnValue = addr.returnValue.split('.'),
                    param = {
                        // luna param
                        id: id,
                        subscribe: false,
                        params: params
                    };

                luna.send(options, addr, param, function(lineObj, next) {
                    let resultValue = lineObj;

                    for (let index = 1; index < returnValue.length; index++) {
                        resultValue = resultValue[returnValue[index]];
                    }

                    if (resultValue) {
                        // success: stop
                        log.verbose("launch#close()#_close()", "success");

                        // If sam returns "displayId" show displayId in result msg
                        if (lineObj.displayId !== undefined) {
                            self.displayId = lineObj.displayId;
                        }
                        next(null, {procId: resultValue});
                    } else {
                        // failure: stop
                        log.verbose("launch#close()#_close()", "failure");
                        next(errHndl.getErrMsg("INVALID_OBJECT"));
                    }
                }, next);
            }
        },

        /**
         * list the running applications
         * @param {Object} options
         * @property options {String} device the device to connect to
         * @property options {Boolean} inspect run the application with web-inspector turned on
         */
        listRunningApp: function(options, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            options = options || {};
            async.series([
                _makeSession,
                _getSessionList,
                _listRunningApp
            ], function(err, results) {
                log.silly("launch#listRunningApp()", "err:", err, ", results:", results);
                next(err, results[2]);
            });

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _getSessionList(next) {
                sessionLib.getSessionList(options, next);
            }

            function _listRunningApp(next) {
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.running,
                    returnValue = addr.returnValue.split('.'),
                    param = {
                            // luna param
                        subscribe: false
                    };

                if (!addr || !returnValue) {
                    return next(errHndl.getErrMsg("NOT_SUPPORT_RUNNINGLIST"));
                }

                luna.send(options, addr, param, function(lineObj, next) {
                    let resultValue = lineObj;

                    for (let index = 1; index < returnValue.length; index++) {
                        resultValue = resultValue[returnValue[index]];
                    }
                    resultValue = resultValue || [];

                    if (lineObj.returnValue) {
                        // success: stop
                        log.verbose("launch#listRunningApp()", "success");
                        next(null, resultValue);
                    } else {
                        // failure: stop
                        log.verbose("launch#listRunningApp()", "failure");
                        next(errHndl.getErrMsg("INVALID_OBJECT"));
                    }
                }, next);
            }
        },

        /**
         * Launch the given application directory to the simulator
         * @param {Object} options
         * @property options {String} webOSTV the webOS TV version of simulator to launch
         * @param {String} appDir the path of application directory
         * @param {Object} params parameters to launch with
         */
         launchSimulator: function (options, appDir, params, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            options = options || {};
            async.waterfall([
                _checkSimulatorDirectory,
                _findSimulatorVersion,
                _launchSimulator
            ], function (err, results) {
                next(err, results);
            });

            function _checkSimulatorDirectory(next) {
                const env = new sdkenv.Env();
                env.getEnvValue("SDK", function (err, sdkHomePath) {
                    if (sdkHomePath) {
                        options.simulatorDir = path.join(sdkHomePath, 'Simulator');
                    } else {
                        options.simulatorDir = path.resolve(__dirname, '../../Simulator');
                    }

                    if (fs.existsSync(options.simulatorDir)) {
                        if (fs.statSync(options.simulatorDir).isDirectory()) {
                            console.log('Finding simulator in ' + options.simulatorDir);
                            const simulArr = fs.readdirSync(options.simulatorDir);
                            next(null, simulArr);
                        } else {
                            return setImmediate(next, errHndl.getErrMsg('NOT_DIRTYPE_PATH', options.simulatorDir));
                        }
                    } else {
                        return setImmediate(next, errHndl.getErrMsg('NOT_EXIST_PATH', options.simulatorDir));
                    }
                });
            }

            function _findSimulatorVersion(simulArr, next) {
                options.simulatorPrefix = `webOS_TV_${options.webOSTV}_Simulator`;
                let versionArr = [];
                for (let i = 0; i < simulArr.length; i++) {
                    if (simulArr[i].indexOf(options.simulatorPrefix) === 0) {
                        if (fs.statSync(path.resolve(options.simulatorDir, simulArr[i])).isDirectory()) {
                            // extract version of simulator file
                            versionArr.push(simulArr[i].slice(options.simulatorPrefix.length + 1));
                        }
                    }
                }

                if (versionArr.length === 0) {
                    return setImmediate(next, errHndl.getErrMsg('UNMATCHED_VERSION', options.simulatorPrefix));
                } else {
                    // sort version descending order
                    versionArr = versionArr.sort(semver.rcompare);
                    options.simulatorVer = versionArr[0];
                    next();
                }
            }

            function _launchSimulator(next) {
                let ext = '';
                switch (process.platform) {
                    case 'win32':
                        ext = 'exe';
                        break;
                    case 'linux':
                        ext = 'appimage';
                        break;
                    case 'darwin':
                        ext = 'app';
                        break;
                    default:
                }
                const simulatorName = `${options.simulatorPrefix}_${options.simulatorVer}`;
                const simulatorPath = path.join(options.simulatorDir, simulatorName, `${simulatorName}.${ext}`);
                if (!fs.existsSync(simulatorPath)) {
                    return setImmediate(next, errHndl.getErrMsg('NOT_EXIST_PATH', simulatorPath));
                }
                const paramsStr = JSON.stringify(params).replace(/"/g, "\\\"");
                const cmd = process.platform === 'darwin'
                    ? `open "${simulatorPath}" --args "${appDir}" "${paramsStr}"`
                    : `"${simulatorPath}" "${appDir}" "${paramsStr}"`;
                log.verbose("launcher#launchSimulator#_launchSimulator():", "cmd:", cmd);

                exec(cmd, function (err) {
                    if (err) {
                        return setImmediate(next, err);
                    }
                    const result = {};
                    result.msg = 'Launched ' + path.basename(simulatorPath);
                    next(null, result);
                });
                // exec callback is called when the simulator is closed.
                // Call next callback if there is no error for 1 second.
                setTimeout(function () {
                    const result = {};
                    result.msg = 'Launched ' + path.basename(simulatorPath);
                    next(null, result);
                }, 1000);
            }
        }
    };

    function makeSession(options, next) {
        options.nReplies = 1; // -n 1
        if (!options.session) {
            log.info("launch#makeSession()", "need to make new session");
            const printTarget = (options.printTarget === false) ? options.printTarget : true;
            options.session = new novacom.Session(options.device, printTarget, next);
        } else {
            log.info("launch#makeSession()", "already exist session");
            next();
        }
    }

    function checkDisplayAffinity(options, params, next) {
        // case of do not need to call session call(ose), check displayAffinity with display
        if (!options.sessionCall) {
            if (params && params.displayAffinity !== undefined && params.displayAffinity !== null) {
                if (typeof(params.displayAffinity) === 'string') {
                    next(errHndl.getErrMsg("INVALID_DISPLAY"));
                }

                if (options && options.display && (Number(options.display) !== params.displayAffinity)) {
                     if (Number(options.display) !== params.displayAffinity) {
                        next(errHndl.getErrMsg("UNMATCHED_DISPLAY_AFFINITY"));
                    }
                }
            } else {
                params.displayAffinity = 0;
                if (options && options.display) {
                    params.displayAffinity = Number(options.display);
                }
            }
        }
        next(null, {});
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = launcher;
    }
}());
