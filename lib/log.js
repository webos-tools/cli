/*
 * Copyright (c) 2021-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const util = require('util'),
    async = require('async'),
    npmlog = require('npmlog'),
    fs = require('fs'),
    path = require('path'),
    novacom = require('./base/novacom'),
    errHndl = require('./base/error-handler'),
    sessionLib = require('./session'),
    createDateFileName = require('./util/createFileName').createDateFileName;

(function() {

    const log = npmlog;
    log.heading = 'log';
    log.level = 'warn';

    const reservedOption = ["--level", "--device", "--save"];
    let idx, savedFilePath;

    const logLib = {

        /**
         * @property {Object} log an npm log instance
         */
        log: log,

        show: function(options, next) {
            log.info("log#show()");
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            options = options || {};
            async.series([
                _makeSession,
                _checkUser,
                this.checkLogDaemon.bind(this, options),
                _getSession,
                _createLogFile,
                _generateCmd,
                function(next) {
                    // For id-filter with follow options, the pty option is required for ssh connection.
                    if (options.argv["id-filter"]) {
                        options.session.runWithOption(options.cmd, {pty:true}, process.stdin, _onData, process.stderr, next);
                    } else {
                        options.session.run(options.cmd, process.stdin, _onData, process.stderr, next);
                    }
                },
            ],  function(err) {
                    if (options.argv.save) {
                        next(err, {msg: "\nCreated " + savedFilePath + "\nSuccess"});
                    } else if (options.argv["id-filter"] && err && err[0].heading === "[ssh exec failure]:") {
                        next(errHndl.getErrMsg("NOT_MATCHED_LOG"));
                    } else {
                        next(err, null);
                    }
            });

            function _onData(data) {
                log.info("log#show()#_onData()");
                const strLogs = (Buffer.isBuffer(data)) ? data.toString() : data;
                process.stdout.write(strLogs);

                if (options.argv.save) {
                    fs.writeFileSync(savedFilePath, data, {encoding: 'utf8', flag:'a'});
                }
            }

            function _getSession(next) {
                log.info("log#show()#_getSession()");
                if (options.display) {
                    options.returnWithError = true;
                    sessionLib.getSessionList(options, next);
                } else {
                    next();
                }
            }

            function _createLogFile(next) {
                log.info("log#show()#_createLogFile()");
                if (options.argv.save) {
                    createLogFile(options, next);
                } else {
                    next();
                }
            }

            function _makeSession(next) {
                options.printTarget = false;
                makeSession(options, next);
            }

            function _checkUser(next) {
                checkUser(options, next);
            }

            function _generateCmd(next) {
                generateCmd(options, next);
            }
        },

        readMode: function(options, next) {
            log.info("log#readMode()");
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            options = options || {};
            async.series([
                _makeSession,
                _checkUser,
                this.checkLogDaemon.bind(this, options),
                _getLogDir,
                _generateCmd,
                _createLogFile,
                function(next) {
                    options.session.run(options.cmd, process.stdin, _onData, process.stderr, next);
                },
            ],  function(err) {
                if (options.argv.save) {
                    next(err, {msg: "\nCreated " + savedFilePath + "\nSuccess"});
                } else {
                    next(err, null);
                }
            });

            function _onData(data) {
                log.info("log#readMode()#_onData()");
                const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                console.log(str); // Do not remove

                if (options.argv.save) {
                    fs.writeFileSync(savedFilePath, data, {encoding: 'utf8', flag:'a'});
                }
            }

            function _getLogDir(next) {
                log.info("log#readMode()#_getLogDir()");
                const getLogDirCmd = "ls /run/log/journal/";
                options.session.run(getLogDirCmd, process.stdin, _onDirData, process.stderr, next);
            }

            function _onDirData(data) {
                log.info("log#readMode()#_onDirData()");
                options.logDir = (Buffer.isBuffer(data)) ? data.toString() : data;
                options.logDir = options.logDir.trim();
            }

            function _generateCmd(next) {
                log.info("log#readMode()#_generateCmd()");
                if (options.argv.file === "true") {
                    return next(errHndl.getErrMsg("EMPTY_FILENAME"));
                }

                if (options.argv.file) {
                    options.cmd = "journalctl --file /run/log/journal/" + options.logDir + "/" + options.argv.file;
                    if (options.argv.output) {
                        options.cmd += " --output " + options.argv.argv.remain;
                    }
                }

                if (options.argv['file-list']) {
                    options.cmd = "ls /run/log/journal/" + options.logDir;
                }

                log.verbose("log#readMode()#_generateCmd()", "options.cmd:" + options.cmd);
                next();
            }

            function _createLogFile(next) {
                log.info("log#readMode()#_createLogFile()");
                if (options.argv.save) {
                    createLogFile(options, next);
                } else {
                    next();
                }
            }

            function _makeSession(next) {
                options.printTarget = false;
                makeSession(options, next);
            }

            function _checkUser(next) {
                checkUser(options, next);
            }
        },

        printUnitList: function(options, next) {
            log.info("log#printUnitList()");
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            options = options || {};
            async.series([
                _makeSession,
                _checkUser,
                this.checkLogDaemon.bind(this, options),
                _getSession,
                _generateCmd,
                function(next) {
                    options.session.run(options.cmd, process.stdin, _onData, process.stderr, next);
                },
            ],  function(err) {
                next(err, null);
            });

            function _onData(data) {
                log.info("log#printUnitList()#_onData()");
                const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                const exp = /(\s\w[\S]*\.service)/g;

                if (Array.isArray(str.match(exp))) {
                    str.match(exp).forEach(function(item) {
                        console.log(item.trim()); // Do not remove
                    });
                }
            }

            function _getSession(next) {
                log.info("log#printUnitList()#_getSession()");
                if (options.display) {
                    options.returnWithError = true;
                    sessionLib.getSessionList(options, next);
                } else {
                    next();
                }
            }

            function _generateCmd(next) {
                log.info("log#printUnitList()#_generateCmd()");
                options.cmd = "systemctl list-units --type service";

                if (options.sessionId) {
                    options.cmd = "systemctl --user list-units --type service";
                    options.cmd = `su ${options.sessionId} -l -c "${options.cmd}"`;
                }

                log.verbose("log#printUnitList()#_generateCmd()", "options.cmd:" + options.cmd);
                next();
            }

            function _makeSession(next) {
                options.printTarget = false;
                makeSession(options, next);
            }

            function _checkUser(next) {
                checkUser(options, next);
            }
        },

        contextMode: function(options, next) {
            log.info("log#contextMode()");
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            options = options || {};
            async.series([
                _makeSession,
                _checkUser,
                this.checkLogDaemon.bind(this, options),
                _getSession,
                _generateCmd,
                function(next) {
                    if (options.argv["context-list"]) {
                        options.session.run(options.cmd, process.stdin, _onListData, process.stderr, next);
                    } else if (options.argv["set-level"]) {
                        options.session.run(options.cmd, process.stdin, _onSetData, process.stderr, next);
                    }
                },
            ],  function(err) {
                next(err, null);
            });

            function _onListData(data) {
                log.info("log#contextMode()#_onListData()");
                const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                console.log(str.replace(/PmLogCtl: Context '(.*)'/g, '$1').trim());
            }

            function _onSetData(data) {
                log.info("log#contextMode()#_onSetData()");
                const str = (Buffer.isBuffer(data)) ? data.toString() : data;
                console.log(str.replace(/PmLogCtl: /g, '').trim());
            }

            function _getSession(next) {
                log.info("log#contextMode()#_getSession()");
                if (options.display) {
                    options.returnWithError = true;
                    sessionLib.getSessionList(options, next);
                } else {
                    next();
                }
            }

            function _generateCmd(next) {
                log.info("log#contextMode()#_generateCmd()");
                if (options.argv["context-list"]) {
                    options.cmd = "PmLogCtl show";
                } else if (options.argv["set-level"]) {
                    reservedOption.forEach(function(item) {
                        idx = options.argv.argv.cooked.indexOf(item);
                        if (idx > -1) {
                            options.argv.argv.cooked.splice(idx, 1);
                            options.argv.argv.cooked.splice(idx, 1);
                        }
                    });

                    options.argv.argv.cooked.splice(0, 1);
                    options.cmd = `PmLogCtl set ${options.argv.argv.cooked.join(" ")}`;
                }
                log.verbose("log#contextMode()#_generateCmd()", "options.cmd:" + options.cmd);
                next();
            }

            function _makeSession(next) {
                options.printTarget = true;
                makeSession(options, next);
            }

            function _checkUser(next) {
                checkUser(options, next);
            }
        },

        checkLogDaemon: function(options, next) {
            log.info("log#checkLogDaemon()");
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            options = options || {};

            let serviceParam = "",
                cmd = "",
                logFilePath = "",
                returnData = "",
                logDaemonStatus = false,
                existLogFile = false;

            async.series([
                _makeSession,
                _setparam,
                function(next) {
                    options.session.run(cmd, process.stdin, _checkService, process.stderr, function(err) {
                        if (err) {
                            return next(err);
                        }
                        if (!logDaemonStatus) {
                            return next(errHndl.getErrMsg("NOT_MATCHED_LOGDAEMON", options.currentDaemon === "journald" ? "pmlogd" : "journald"));
                        }

                        cmd = `ls -al ${logFilePath}`;
                        options.session.run(cmd, process.stdin, _checkFile, process.stderr, function(error) {
                            if (error) {
                                return next(err);
                            }
                            if (!existLogFile) {
                                return next(errHndl.getErrMsg("NOT_EXIST_LOGFILE"));
                            }
                            next();
                        });
                    });
                },
            ], function(err) {
                if (err) {
                    console.log("CLI's current logging daemon : " + options.currentDaemon);
                    next(err, null);
                } else {
                    next(null, {msg: "CLI's current logging daemon : " + options.currentDaemon
                                    + "\nThe target's current logging daemon : " + options.currentDaemon});
                }
            });

            function _setparam(next) {
                log.info("log#checkLogDaemon()#_setparam()");
                if (options.currentDaemon === "journald") {
                    serviceParam = "systemd-journald";
                    logFilePath = "/run/log/journal";
                } else if (options.currentDaemon === "pmlogd") {
                    serviceParam = "pm-log-daemon";
                    logFilePath = "/var/log/messages";
                }

                cmd = `systemctl status ${serviceParam}.service | tee`;
                next();
            }

            function _checkService(data) {
                log.info("log#checkLogDaemon()#_checkService()");
                returnData += (Buffer.isBuffer(data)) ? data.toString() : data;

                if (returnData.indexOf("active (running)") !== -1) {
                    logDaemonStatus = true;
                }
            }

            function _checkFile(data) {
                log.info("log#checkLogDaemon()#_checkFile()");
                const str = (Buffer.isBuffer(data)) ? data.toString() : data;

                if (str.length) {
                    existLogFile = true;
                }
            }

            function _makeSession(next) {
                options.printTarget = true;
                makeSession(options, next);
            }
        }
    };

    function makeSession(options, next) {
        if (!options.session) {
            log.info("log#makeSession()", "need to make new session");
            const printTarget = options.printTarget;
            options.session = new novacom.Session(options.device, printTarget, next);
        } else {
            log.info("log#makeSession()", "already exist session");
            next();
        }
    }

    function checkUser(options, next) {
        log.info("log#checkUser()", "username:", options.session.getDevice().username);
        if (options.session.getDevice().username !== 'root') {
            return next(errHndl.getErrMsg("NEED_ROOT_PERMISSION"));
        } else {
            next();
        }
    }

    function generateCmd(options, next) {
        log.info("log#generateCmd()", "options.currentDaemon:", options.currentDaemon);

        if (options.currentDaemon === "pmlogd") {
            const pmLogFilePath = " /var/log/messages";

            if (options.argv.follow) {
                options.cmd = "tail -f";
            } else if (options.argv.lines) {
                options.cmd = "tail";
            } else {
                options.cmd = "cat";
            }

            if (options.argv.lines) {
                options.cmd += ` -n ${options.argv.lines}`;
            }
            options.cmd += pmLogFilePath;

            if (options.argv["id-filter"]) {
                // Handle when another option appears without id-filter value
                const idReg = /^-/;
                if (options.argv["id-filter"] === "true" || options.argv["id-filter"].match(idReg)) {
                    return next(errHndl.getErrMsg("EMPTY_VALUE", "id-filter"));
                } else {
                    const convertReg = /\./g;
                    let filter = options.argv["id-filter"];
                    filter = filter.replace(convertReg, '\\.');

                    options.cmd += ` | grep -E "\\[(\\d*|\\d*\\:\\d*)\\] ${filter}"`;
                }
            }
        } else if (options.currentDaemon === "journald") {
            if (options.display && !options.argv.unit) {
                return next(errHndl.getErrMsg("INVALID_COMBINATION"));
            }

            reservedOption.forEach(function(item) {
                idx = options.argv.argv.cooked.indexOf(item);
                if (idx > -1) {
                    options.argv.argv.cooked.splice(idx, 1);
                    options.argv.argv.cooked.splice(idx, 1);
                }
            });
    
            if (options.argv.pid) {
                idx = options.argv.argv.cooked.indexOf("-pid");

                if (idx === -1) {
                    idx = options.argv.argv.cooked.indexOf("--pid");
                }

                if (idx > -1) {
                    options.argv.argv.cooked.splice(idx, 1, "_PID=");
                }
            }

            if (options.argv.since) {
                if (options.argv.argv.remain.length > 0) {
                    idx = options.argv.argv.cooked.indexOf("--since");

                    let sinceTmp = options.argv.argv.cooked[idx+1];
                    if (options.argv.argv.cooked[idx+2]) {
                        sinceTmp += " " + options.argv.argv.cooked[idx+2];
                    }

                    options.argv.argv.cooked.splice(idx+1, 2, "\"" + sinceTmp + "\"");
                }
            }
    
            if (options.argv.until) {
                if (options.argv.argv.remain.length > 0) {
                    idx = options.argv.argv.cooked.indexOf("--until");

                    let untilTmp = options.argv.argv.cooked[idx+1];
                    if (options.argv.argv.cooked[idx+2]) {
                        untilTmp += " " + options.argv.argv.cooked[idx+2];
                    }

                    options.argv.argv.cooked.splice(idx+1, 2, "\"" + untilTmp + "\"");
                }
            }
 
            options.cmd = `journalctl ${options.argv.argv.cooked.join(" ")}`;
            options.cmd = options.cmd.replace('_PID= ', '_PID=');

            if (options.display && options.argv.unit) {
                idx = options.argv.argv.cooked.indexOf("--unit");
                options.argv.argv.cooked.splice(idx, 1, "--user-unit");

                idx = options.argv.argv.cooked.indexOf("--display");
                options.argv.argv.cooked.splice(idx, 2);

                options.cmd = `journalctl ${options.argv.argv.cooked.join(" ")}`;
                options.cmd = `su ${options.sessionId} -l -c "${options.cmd}"`;
            }
        }
        log.verbose("log#generateCmd()", "options.cmd:", options.cmd);
        next();
    }

    function createLogFile(options, next) {
        log.info("log#createLogFile()");

        const fileNameSeperator = "_",
            fileExt = "log";

        if (options.argv.argv.remain.length === 0) {
            savedFilePath = path.resolve(createDateFileName(fileNameSeperator, fileExt));
        } else {
            if (path.extname(options.argv.argv.remain[0]) === "") {
                options.argv.argv.remain[0] = options.argv.argv.remain[0] + "." + fileExt;
            }

            if (path.extname(options.argv.argv.remain[0]) === ".") {
                options.argv.argv.remain[0] = options.argv.argv.remain[0] + fileExt;
            }

            savedFilePath = path.resolve(options.argv.argv.remain[0]);
        }
        log.verbose("log#createLogFile()", "savedFilePath:" + savedFilePath);

        // For error handling of non exist path
        fs.open(savedFilePath, 'w', function(err, fd) {
            if (err) {
                return next(errHndl.getErrMsg(err));
            }
            fs.closeSync(fd);
        });
        // Defense code
        if (fs.existsSync(savedFilePath)) {
            fs.unlinkSync(savedFilePath);
        }
        log.verbose("log#createLogFile()", savedFilePath + " is exist: " + fs.existsSync(savedFilePath));
        next();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = logLib;
    }
}());
