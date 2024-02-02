/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    chalk = require('chalk'),
    createCsvWriter = require('csv-writer').createObjectCsvWriter,
    fs = require('fs'),
    npmlog = require('npmlog'),
    path = require('path'),
    streamBuffers = require('stream-buffers'),
    Table = require('easy-table'),
    util = require('util'),
    pullLib = require('./pull'),
    errHndl = require('./base/error-handler'),
    luna = require('./base/luna'),
    novacom = require('./base/novacom'),
    createDateFileName = require('./util/createFileName').createDateFileName,
    convertJsonToList = require('./util/json').convertJsonToList;

(function() {
    const log = npmlog;
    log.heading = 'device';
    log.level = 'warn';

    const device = {

        /**
         * @property {Object} log an npm log instance
         */
        log: log,

        /**
         * Print system information of the given device
         * @property options {String} device the device to connect to
         */
        systemInfo: function(options, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            options = options || {};
            async.series([
                _makeSession,
                _getOsInfo,
                _getDeviceInfo,
                _getChromiumVersion,
                _getQtbaseVersion,
                _getSoftwareInfo
            ],  function(err, results) {
                log.silly("device#systemInfo()", "err:", err, ", results:", results);
                let resultTxt = "";
                for (let i = 1; i < results.length; i++) {
                    resultTxt += results[i] + "\n";
                }
                next(err, {msg: resultTxt.trim()});
            });

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _getOsInfo(next) {
                log.info("device#systemInfo()#_getOsInfo()");
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.osInfo,
                    param = {
                            // luna param
                            parameters:["webos_build_id","webos_imagename","webos_name","webos_release",
                                        "webos_manufacturing_version", "core_os_kernel_version"],
                            subscribe: false
                        };

                luna.send(options, addr, param, function(lineObj, next) {
                    const resultValue = lineObj;

                    if (resultValue.returnValue) {
                        log.verbose("device#systemInfo()#_getOsInfo()", "success");
                        delete resultValue.returnValue; // remove unnecessary data
                        next(null, _makeReturnTxt(resultValue));
                    } else {
                        log.verbose("device#systemInfo()#_getOsInfo()", "failure");
                        next(errHndl.getErrMsg("INVALID_OBJECT"));
                    }
                }, next);
            }

            function _getDeviceInfo(next) {
                log.info("device#systemInfo()#_getDeviceInfo()");
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.deviceInfo,
                    param = {
                            // luna param
                            subscribe: false
                        };

                luna.send(options, addr, param, function(lineObj, next) {
                    const resultValue = lineObj,
                        returnObj ={};

                    if (resultValue.returnValue) {
                        log.verbose("device#systemInfo()#_getDeviceInfo()", "success");
                        returnObj.device_name = resultValue.device_name;
                        returnObj.device_id = resultValue.device_id;
                        next(null, _makeReturnTxt(returnObj));
                    } else {
                        log.verbose("device#systemInfo()#_getDeviceInfo()", "failure");
                        next(errHndl.getErrMsg("INVALID_OBJECT"));
                    }
                }, next);
            }

            function _getChromiumVersion(next) {
                log.info("device#systemInfo()#_getChromiumInfo()");

                // opkg is required permission as root.
                if (options.session.getDevice().username !== 'root') {
                    return next(null, "chromium_version : " + "not supported");
                } else {
                    const cmd = '/usr/bin/opkg list-installed webruntime*';
                    options.session.run(cmd, null, __data, null, function(err) {
                        if (err) {
                            return next(err);
                        }
                    });
                }
                function __data(data) {
                    const str = (Buffer.isBuffer(data)) ? data.toString() : data,
                        exp = /\d*\.\d*\.\d*\.\d*/,
                        version = str.match(exp);

                    next(null, "chromium_version : " + version);
                }
            }

            function _getQtbaseVersion(next) {
                log.info("device#systemInfo()#_getQtbaseInfo()");

                // opkg is required permission as root.
                if (options.session.getDevice().username !== 'root') {
                    return next(null, "qt_version : " + "not supported");
                } else {
                    const cmd = '/usr/bin/opkg list-installed qtbase';
                    options.session.run(cmd, null, __data, null, function(err) {
                        if (err) {
                            return next(err);
                        }
                    });
                }
                function __data(data) {
                    const str = (Buffer.isBuffer(data)) ? data.toString() : data,
                        exp = /\d*\.\d*\.\d*/,
                        version = str.match(exp);
                    next(null, "qt_version : " + version);
                }
            }

            function _getSoftwareInfo(next) {
                log.info("device#systemInfo#_getSoftwareInfo()");
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.softwareInfo,
                    param = {
                        parameters: ["nodejs_versions"]
                    };

                luna.sendWithoutErrorHandle(options, addr, param, function(lineObj, next) {
                    log.silly("device#systemInfo#_getSoftwareInfo():", "lineObj:", lineObj);

                    const resultValue = lineObj,
                    returnObj ={};

                    if (resultValue.returnValue) {
                        log.verbose("device#systemInfo#_getSoftwareInfo():", "success");
                        returnObj.nodejs_versions = resultValue.nodejs_versions;
                        next(null, _makeReturnTxt(returnObj));
                    } else {
                        // handle if the target device does not support softwareInfo/query
                        return next(null, "nodejs_versions : " + "not supported");
                    }
                }, next);
            }

            function _makeReturnTxt(resultValue) {
                let returnTxt = "";

                for (const key in resultValue) {
                    if (resultValue[key] === undefined) {
                        resultValue[key] = "(unknown)";
                    }
                    returnTxt += key + " : " + resultValue[key] + "\n";
                }
                return returnTxt.trim();
            }
        },
        /**
         * Print session information of the given device
         * @property options {String} device the device to connect to
         */
        sessionInfo: function(options, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            options = options || {};
            async.series([
                _makeSession,
                _getSessionList
            ],  function(err, results) {
                log.silly("device#sessionInfo()", "err:", err, ", results:", results);
                let resultTxt = "";

                if (results[1] !== undefined) {
                    if (typeof results[1] === "object") {
                        if (results[1].length === 0) {
                            return next(errHndl.getErrMsg("SELECT_PROFILE"));
                        }
                        for (let i = 0; i < results[1].length; i++) {
                            resultTxt += convertJsonToList(results[1][i], 0) + '\n';
                        }
                    } else {
                        resultTxt = results[1];
                    }
                }
                next(err, {msg: resultTxt.trim()});
            });

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _getSessionList(next) {
                log.info("device#sessionInfo#_getSessionList()");
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.getSessionList,
                    param = {
                        // luna param
                        subscribe: false
                    };

                luna.send(options, addr, param, function(lineObj, next) {
                    if (lineObj.returnValue) {
                        log.verbose("device#sessionInfo()#_getSessionList()", "success");
                        next(null, lineObj.sessionList);
                    } else {
                        log.verbose("device#sessionInfo()#_getSessionList()", "failure");
                        next(errHndl.getErrMsg("INVALID_OBJECT"));
                    }
                }, next);
            }
        },
        /**
         * Print system information of the given device
         * @property options {String} device the device to connect to
         */
         tvSystemInfo: function(options, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            options = options || {};
            async.series([
                _makeSession,
                _getSystemInfo,
            ], function(err, results) {
                log.silly("device#tvSystemInfo()", "err:", err, ", results:", results);
                next(err, {msg: results[1]});
            });

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _getSystemInfo(next) {
                log.info("device#tvSystemInfo#_getSystemInfo()");
                const target = options.session.getDevice(),
                    addr = target.lunaAddr.deviceInfoSystem,
                    param = {
                        // luna param
                        keys: ["modelName", "sdkVersion", "firmwareVersion", "boardType", "otaId"],
                        subscribe: false
                    };

                luna.sendWithoutErrorHandle(options, addr, param, function (lineObj, next) {
                    if (lineObj) {
                        log.verbose("deviceInfo#systemInfo#_getSystemInfo():", "success");
                        next(null, __makeReturnObj(lineObj, param.keys));
                    } else {
                        next(errHndl.getErrMsg("INVALID_OBJECT"));
                    }
                }, next);
            }

            function __makeReturnObj(resultValue, paramkey) {
                let returnTxt = "";

                for (const key in paramkey) {
                    if (Object.hasOwnProperty.call(resultValue, paramkey[key]))
                        returnTxt += paramkey[key] + " : " + resultValue[paramkey[key]] + "\n";
                }
                log.verbose("deviceInfo#systemInfo#__makeReturnObj():", returnTxt);
                return returnTxt.trim();
            }
        },
        /**
         * Get all CPUs and memories usage of target device
         * @property options {String} device, interval
         */
        systemResource: function(options, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            const systemGroup = {};
            systemGroup.initialExecution = true;
            options = options || {};
            options.destinationPath = "";
            options.fileName = "";
            options.csvPath = "";
            async.series([
                _createOutputPath,
                _makeSession,
                _getSystemResouceInfo
            ],  function(err, results) {
                log.silly("device#systemResource()", "err:", err, ", results:", results);
                next(err);
            });

            function _createOutputPath(next) {
                if (options.save && options.csvPath === "") {
                    makeCSVOutputPath(options, next);
                } else {
                    next();
                }
            }

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _getSystemResouceInfo(next) {
                log.info("device#systemResource()#_getSystemResouceInfo()");

                let timerId;
                if (!options.interval) {
                    // If interval option is not given, call timer logic 2 times
                    const defaultRepeat = 2;
                    let repeatCount = 0;
                    try {
                        timerId = setTimeout(function repeat() {
                            if (repeatCount < defaultRepeat) {
                                _callSystemResourceInfoCmd();
                                repeatCount++;
                                timerId = setTimeout(repeat, 1000);
                            } else {
                                clearTimeout(timerId);
                                return next();
                            }
                        }, 100);
                    } catch (err) {
                        log.silly("device#systemResource()#_getSystemResouceInfo()", "one timer. err:", err.toString());
                        clearTimeout(timerId);
                        // ignore timer logic error
                        return next();
                    }
                } else {
                    try {
                        // when interval option is given, print initial data at first
                        const defaultRepeat = 1;
                        let repeatCount = 0;
                        timerId = setTimeout(function repeat() {
                            if (repeatCount < defaultRepeat) {
                                _callSystemResourceInfoCmd();
                                repeatCount++;
                                timerId = setTimeout(repeat, 1000);
                            } else {
                                _callSystemResourceInfoCmd();
                                timerId = setTimeout(repeat, options.interval * 1000);
                            }
                        }, 100);
                    } catch (err) {
                        log.silly("device#systemResource()#_getSystemResouceInfo()", "repeat timer. err:", err.toString());
                        clearTimeout(timerId);
                        // ignore timer logic error
                        return next();
                    }
                }
            }

            function _callSystemResourceInfoCmd() {
                log.info("device#systemResource()#_callSystemResourceInfoCmd()");

                const wStream = new streamBuffers.WritableStreamBuffer();
                const cmd = 'date "+%Y-%m-%d %H:%M:%S"; grep -c ^processor /proc/cpuinfo; grep "cpu *" /proc/stat; free -k';
                try {
                    options.session.run(cmd, null, wStream, null, function(err) {
                        if (err) {
                            // do not print error message to user
                            // when user press Ctrl + C , the ssh connection is not completed, it makes error
                            log.silly("device#systemResource()#_callSystemResourceInfoCmd()", "ssh call. err:"+ err.toString());
                            return next();
                        } else {
                            const result = wStream.getContentsAsString();
                            _setSystemResouceInfo(result);
                            systemGroup.initialExecution = false;
                        }
                    });
                } catch (err) {
                    // do not print error message to user
                    // when user press Ctrl + C , the ssh connection is not completed, it makes error
                    log.silly("device#systemResource()#_callSystemResourceInfoCmd()", "in try-catch. err:", err.toString());
                    return next();
                }
            }

            function _setSystemResouceInfo(systemData) {
                log.info("device#systemResource()#_callSystemResourceInfoCmd()");

                const CPU_PATTERN = /\s+/,
                    cpuinfo = {},
                    meminfo = {};
                let sysinfo = {};
                try {
                    const allvalues = systemData.split("\n"),
                        date = allvalues[0], // Setup date
                        pcore = +allvalues[1] * 100;
                    let index,
                        columns,
                        isBuff_Cached = false; // This is to check the format version of kernel to find system memory parameter
                    for (index = 2; index < (allvalues.length - 1); index++) {
                        columns = allvalues[index].split(CPU_PATTERN);
                        // setup CPU information
                        if (columns[0].indexOf("cpu") === 0) {
                            const prevTotal = "prev" + columns[0] + "Total",
                                prevIdle = "prev" + columns[0] + "Idle",
                                prevUser = "prev" + columns[0] + "User",
                                prevkernel = "prev" + columns[0] + "Kernel",
                                prevOther = "prev" + columns[0] + "Other";
                            if (!systemGroup[prevTotal]) {
                                systemGroup[prevTotal] = 0;
                                systemGroup[prevIdle] = 0;
                                systemGroup[prevUser] = 0;
                                systemGroup[prevkernel] = 0;
                                systemGroup[prevOther] = 0;
                            }
                            const user = parseInt(columns[1]),
                                nice = parseInt(columns[2]),
                                kernel = parseInt(columns[3]),
                                idle = parseInt(columns[4]),
                                other = nice + parseInt(columns[5]) + parseInt(columns[6]) + parseInt(columns[7]) + parseInt(columns[8]) +
                                    parseInt(columns[9]) + parseInt(columns[10]),
                                subTotal = user + nice + kernel + idle + other;

                            if (!systemGroup.initialExecution) {
                                const diffIdle = idle - systemGroup[prevIdle],
                                    diffUser = user - systemGroup[prevUser],
                                    diffKernel = kernel - systemGroup[prevkernel],
                                    diffOther = other - systemGroup[prevOther],
                                    diffTotal = subTotal - systemGroup[prevTotal];

                                let userModeCpuOccupation = (diffUser/diffTotal) * 100,
                                    kernelModeCpuOccupation = (diffKernel/diffTotal) * 100,
                                    otherModeCpuOccupation = (diffOther/diffTotal) * 100,
                                    overallCpuOccupation = ((diffTotal - diffIdle)/diffTotal) * 100;

                                userModeCpuOccupation < 0 ? (userModeCpuOccupation = 0) : userModeCpuOccupation;
                                userModeCpuOccupation > pcore ? (userModeCpuOccupation = pcore) : userModeCpuOccupation;
                                kernelModeCpuOccupation < 0 ? (kernelModeCpuOccupation = 0) : kernelModeCpuOccupation;
                                kernelModeCpuOccupation > pcore ? (kernelModeCpuOccupation = pcore) : kernelModeCpuOccupation;
                                otherModeCpuOccupation < 0 ? (otherModeCpuOccupation = 0) : otherModeCpuOccupation;
                                otherModeCpuOccupation > pcore ? (otherModeCpuOccupation = pcore) : otherModeCpuOccupation;
                                overallCpuOccupation < 0 ? (overallCpuOccupation = 0) : overallCpuOccupation;
                                overallCpuOccupation > pcore ? (overallCpuOccupation = pcore) : overallCpuOccupation;
    
                                cpuinfo[columns[0]] = {
                                    "overall": +overallCpuOccupation.toFixed(2),
                                    "usermode": +userModeCpuOccupation.toFixed(2),
                                    "kernelmode": +kernelModeCpuOccupation.toFixed(2),
                                    "others": +otherModeCpuOccupation.toFixed(2)
                                };
                            }
                            systemGroup[prevIdle] = idle;
                            systemGroup[prevUser] = user;
                            systemGroup[prevkernel] = kernel;
                            systemGroup[prevOther] = other;
                            systemGroup[prevTotal] = subTotal;
                        }

                        if (!systemGroup.initialExecution) {
                            // setup memory infomation
                            if (columns[5] && columns[5].indexOf('buff/cache') !== -1) {
                                isBuff_Cached = true;
                            }
                            if (columns[0].indexOf('Mem:') === 0) {
                                meminfo['memory'] = !isBuff_Cached ? {
                                    "total": +columns[1],
                                    "used": +columns[2],
                                    "free": +columns[3],
                                    "shared": +columns[4],
                                    "buffers": +columns[5],
                                    "cached": +columns[6]
                                } : {
                                    "total": +columns[1],
                                    "used": +columns[2],
                                    "free": +columns[3],
                                    "shared": +columns[4],
                                    "buff_cache": +columns[5],
                                    "available": +columns[6]
                                };
                            }
                            if (columns[0].indexOf('-/+') === 0) {
                                meminfo['buffers'] = {
                                    "used": +columns[2],
                                    "free": +columns[3]
                                };
                            }
                            if (columns[0].indexOf('Swap:') === 0) {
                                meminfo['swap'] = {
                                    "total": +columns[1],
                                    "used": +columns[2],
                                    "free": +columns[3]
                                };
                            }
                        }
                    }
                    if (!systemGroup.initialExecution) {
                        sysinfo = {
                            "date": date,
                            "cpuinfo": cpuinfo,
                            "meminfo": meminfo
                        };
                        _printSystemInfo(sysinfo);
                    }
                } catch (err) {
                    // do not print error message to user
                    // when user press Ctrl + C , the ssh cmd data is not completed, it makes error
                    log.silly("device#systemResource()#_setSystemResouceInfo()", "in try-catch. err:", err.toString());
                    return;
                }
            }
            
            function _printSystemInfo(sysinfo) {
                const cpuinfo = sysinfo.cpuinfo,
                    meminfo = sysinfo.meminfo,
                    cpuinfoTable = new Table(),
                    meminfoTable = new Table(),
                    dataForCSV = [];

                // add CPU info to the table
                for (const key in cpuinfo) {
                    cpuinfoTable.cell('(%)', key);
                    cpuinfoTable.cell('overall', cpuinfo[key].overall);
                    cpuinfoTable.cell('usermode', cpuinfo[key].usermode);
                    cpuinfoTable.cell('kernelmode', cpuinfo[key].kernelmode);
                    cpuinfoTable.cell('others', cpuinfo[key].others);
                    cpuinfoTable.newRow();

                    // Add csv array
                    const obj = {
                        time: sysinfo.date,
                        cpu: key,
                        overall: cpuinfo[key].overall,
                        usermode: cpuinfo[key].usermode,
                        kernelmode: cpuinfo[key].kernelmode,
                        others: cpuinfo[key].others
                    };
                    dataForCSV.push(obj);
                }
                // add memoryInfo to the table
                for (const key in meminfo) {
                    meminfoTable.cell('(KB)', key);
                    meminfoTable.cell('total', meminfo[key].total);
                    meminfoTable.cell('used', meminfo[key].used);
                    meminfoTable.cell('free', meminfo[key].free);
                    meminfoTable.cell('shared', meminfo[key].shared);
                    meminfoTable.cell('buff/cache', meminfo[key].buff_cache);
                    meminfoTable.cell('available', meminfo[key].available);
                    meminfoTable.newRow();

                    const obj = {
                        time: sysinfo.date,
                        memory: key,
                        total: meminfo[key].total,
                        used: meminfo[key].used,
                        free: meminfo[key].free,
                        shared: meminfo[key].shared,
                        "buff/cache": meminfo[key].buff_cache,
                        available: meminfo[key].available
                    };
                    dataForCSV.push(obj);
                }
                // write CSV file if user gives --save option
                if (options.save && options.csvPath) {
                    // write csv file
                    // when openMode is false, the new csv file will be created and "Header" add to the file 
                    let openMode = false;
                    if (fs.existsSync(options.csvPath)) {
                        openMode = true;
                    }

                    const csvWriter = createCsvWriter({
                        path: options.csvPath,
                        header: [
                            {id: 'time', title: 'time'},
                            {id: 'cpu', title: '(%)'},
                            {id: 'overall', title: 'overall'},
                            {id: 'usermode', title: 'usermode'},
                            {id: 'kernelmode', title: 'kernelmode'},
                            {id: 'others', title: 'others'},
                            {id: 'memory', title: '(KB)'},
                            {id: 'total', title: 'total'},
                            {id: 'used', title: 'used'},
                            {id: 'free', title: 'free'},
                            {id: 'shared', title: 'shared'},
                            {id: 'buff/cache', title: 'buff/cache'},
                            {id: 'available', title: 'available'}
                        ],
                        append: openMode
                    });

                    csvWriter
                    .writeRecords(dataForCSV)
                    .then(function() {
                        log.silly("device#systemResource()#_printSystemInfo()", "CSV file updated");
                        // csv file has been created at first
                        if (openMode === false) {
                            const resultTxt = "Create " + chalk.green(options.fileName) + " to " + options.destinationPath;
                            console.log(resultTxt);
                        }
                        __printTable();
                    }).catch(function(err) {
                        return setImmediate(next, errHndl.getErrMsg(err));
                    });
                } else {
                    __printTable();
                }

                function __printTable() {
                    console.log(sysinfo.date + "\n");
                    console.log(cpuinfoTable.toString());
                    console.log(meminfoTable.toString());
                    console.log("=================================================================");
                }
            }
        },
        /**
         * Get running apps and services CPUs and memories usage
         * @property options {String} device, interval
         */
        processResource: function(options, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            const processGroup = {};
            processGroup.initialExecution = true;
            options = options || {};
            options.destinationPath = "";
            options.fileName = "";
            options.csvPath = "";

            async.series([
                _createOutputPath,
                _makeSession,
                _getProcessResouceInfo
            ],  function(err, results) {
                log.silly("device#processResource()", "err:", err, ", results:", results);
                next(err);
            });

            function _createOutputPath(next) {
                if (options.save && options.csvPath === "") {
                    makeCSVOutputPath(options, next);
                } else {
                    next();
                }
            }

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _getProcessResouceInfo(next) {
                log.info("device#processResource()#_getProcessResouceInfo()");

                let timerId;
                if (!options.interval) {
                    // If interval option is not given, call timer logic 2 times
                    const defaultRepeat = 2;
                    let repeatCount = 0;
                    try {
                        timerId = setTimeout(function repeat() {
                            if (repeatCount < defaultRepeat) {
                                _callProcessInfoCmd();
                                repeatCount++;
                                timerId = setTimeout(repeat, 1000);
                            } else {
                                clearTimeout(timerId);
                                return next();
                            }
                        }, 100);
                    } catch (err) {
                        log.silly("device#systemResource()#_getProcessResouceInfo()", "one timer. err:", err.toString());
                        clearTimeout(timerId);
                        // ignore timer logic error
                        return next();
                    }
                } else {
                    try {
                        // when interval option is given, print initial data at first
                        const defaultRepeat = 1;
                        let repeatCount = 0;
                        timerId = setTimeout(function repeat() {
                            if (repeatCount < defaultRepeat) {
                                _callProcessInfoCmd();
                                repeatCount++;
                                timerId = setTimeout(repeat, 1000);
                            } else {
                                _callProcessInfoCmd();
                                timerId = setTimeout(repeat, options.interval * 1000);
                            }
                        }, 100);
                    } catch (err) {
                        log.silly("device#systemResource()#_getProcessResouceInfo()", "repeat timer. err:", err.toString());
                        clearTimeout(timerId);
                        // ignore timer logic error
                        return next();
                    }
                }
            }

            function _callProcessInfoCmd() {
                log.info("device#processResource()#_callProcessInfoCmd()");

                const wStream = new streamBuffers.WritableStreamBuffer();
                const cmd = 'date "+%Y-%m-%d %H:%M:%S"; grep "cpu *" /proc/stat | sed "1d" | awk \'{for (i=0;i<NR;i++){if (i==NR-1){totalSum+=$2+$3+$4+$5+$6+$7+$8+$9+$10+$11;idleSum+=$5}}} END { for (i=0;i<NR;i++){if (i==NR-1){print idleSum;print totalSum}}}\'; cat /proc/[0-9]*/stat; echo \'psList\' ;  ps -ax | sed "1d" | awk \'/ /{print $1 "\t"$5}\'; echo \'serviceStringStart\'; ls /media/developer/apps/usr/palm/services ; echo \'serviceStringEnd\'; luna-send-pub -n 1 -f luna://com.webos.applicationManager/dev/running \'{}\'; grep -c ^processor /proc/cpuinfo';
                try {
                    options.session.run(cmd, null, wStream, null, function(err) {
                        if (err) {
                            // do not print error message to user
                            // when user press Ctrl + C , the ssh connection is not completed, it makes error
                            log.silly("device#processResource()#_callProcessInfoCmd()", "ssh call. err:", err.toString());
                            return next(null);
                        } else {
                            const result = wStream.getContentsAsString();
                            _setProcessInfo(result);
                            processGroup.initialExecution = false;
                        }
                    });
                } catch (err) {
                    // do not print error message to user
                    // when user press Ctrl + C , the ssh connection is not completed, it makes error
                    log.silly("device#processResource()#_callProcessInfoCmd()", "in try-catch. err:", err.toString());
                    return next(null);
                }
            }

            function _setProcessInfo(processData) {
                log.info("device#processResource()#_setProcessInfo()");
                const PROC_GROUP_INFO_PATTERN = /\s+/;
                try {
                    // Intialize temporary groups with values
                    const processList = ["Service", "System"],
                        groupProcessList = [],
                        tempProcGrps = {},
                        arrActiveServices = [];
                    // loop through all the categories and create groups
                    for (let i = 0; i < processList.length; i++) {
                        tempProcGrps[processList[i]] = {};
                        tempProcGrps[processList[i]]["pid"] = 0;
                        tempProcGrps[processList[i]]["cputime"] = 0;
                        tempProcGrps[processList[i]]["RSS"] = 0;
                        tempProcGrps[processList[i]]["pmem"] = 0;
                    }

                    const processinfo = [],
                        groupProcessinfo = [], // only for dev app & service info
                        allvalues = processData.split("\n"),
                        otherList = [],
                        date = allvalues[0],
                        lastIndex = allvalues.length;
                    
                    allvalues.splice(lastIndex - 1, 1);
                    const pcore = +allvalues[allvalues.length-1] * 100;
                    /* memCol[1] from 'grep "MemTotal *" /proc/meminfo' is not used */
                    let totalRAM = 0;
                    const idleCPUtime = +allvalues[1],
                        totalCPUtime = +allvalues[2],
                        psListStartIndex = allvalues.indexOf("psList", 2),
                        serviceStartIndex = allvalues.indexOf("serviceStringStart", 2), // from where to start (2)
                        serviceEndIndex = allvalues.indexOf("serviceStringEnd", 2); // from where to start (2)

                    const arryInstalledServices = [];
                    for (let i = serviceStartIndex + 1; i < serviceEndIndex; i++) {
                        arryInstalledServices[i-serviceStartIndex-1] = allvalues[i];
                    }
                    
                    // get processid of external service on ps list
                    let arrayCount = 0; 
                    for (let k = psListStartIndex+1 ; k < serviceStartIndex ;k++) { 
                        const columns = allvalues[k].trim().split(PROC_GROUP_INFO_PATTERN),
                            pid = parseInt(columns[0]),
                            procname = columns[1].trim();

                        if (arryInstalledServices.indexOf(procname) !== -1) {
                            const ObjService = {
                                "processid": pid,
                                "id": procname
                            };
                            arrActiveServices[arrayCount++] = ObjService;
                        }
                    }
                    
                    const appStartIndex = allvalues.indexOf("{", 2); // From where to start (2)
                    // some times specific platform does not gives list of running info itself then appStartIndex becomes -1
                    if (appStartIndex < 0) {
                        // do not print error message to user
                        // when user press Ctrl + C , the ssh cmd data is not completed, it makes error
                        log.silly("device#processResource()#_setProcessInfo()", "running app list is invalid");
                        return;
                    }
                    const appEndIndex = allvalues.length-1;
                    let strActiveApps = "",
                        objActiveApps;
                    for (let i = appStartIndex; i < appEndIndex; i++) {
                        strActiveApps += allvalues[i];
                    }
                    try {
                        objActiveApps = JSON.parse(strActiveApps);
                    } catch (err) {
                        // do not print error message to user
                        // when user press Ctrl + C , the ssh cmd data is not completed, it makes error
                        log.silly("device#processResource()#_setProcessInfo()", "active app parsing. err:", err.toString());
                        return;
                    }

                    if (objActiveApps.returnValue === false) {
                        const errValue = objActiveApps["errorText"] || "running app list is invalid";
                        return next(errHndl.getErrMsg("FAILED_CALL_LUNA", errValue, null, "com.webos.applicationManager"));
                    }

                    const arrActiveApps = objActiveApps["running"],
                        groupObjList = {};

                    // 1st row is date, 2nd row is total CPU time and last row is total RAM(Meminfo) hence ignore it
                    // check process group info until "psList" string
                    for (let k = 3; k < psListStartIndex; k++) {
                        const columns = allvalues[k].trim().split(PROC_GROUP_INFO_PATTERN),
                            procname = columns[1].trim().split(/.*\(|\)/gi)[1],
                            grpname = _getProcessGrp(procname),
                            pid = parseInt(columns[0]),
                            pname = procname,
                            ppid = parseInt(columns[3]),
                            cputime = parseInt(columns[13]) + parseInt(columns[14]),
                            rss = parseInt(columns[23]) * 4,
                            pmem = (rss * 100);
                        // sum total used RSS
                        totalRAM += rss;
                        if (grpname === "Other") {
                            const objOther = {};
                                objOther["pid"] = pid;
                                objOther["pname"] = pname;
                                objOther["ppid"] = ppid;
                                objOther["cputime"] = cputime;
                                objOther["RSS"] = rss;
                                objOther["pmem"] = pmem;
                                otherList.push(objOther);
                        } else {
                            tempProcGrps[grpname]["pid"] = pid;
                            tempProcGrps[grpname]["cputime"] += cputime;
                            tempProcGrps[grpname]["RSS"] += rss;
                            tempProcGrps[grpname]["pmem"] += pmem;
                        }
                    }
                    // get the Children of Service
                    for (const k in tempProcGrps) {
                        const attrName = k;
                        if (attrName === "System") {
                            continue;
                        }
                        const objOther = tempProcGrps[k];
                        for (let i = 0; i < otherList.length; i++) {
                            if (objOther["pid"] !== otherList[i]["ppid"]) {
                                continue;
                            }
                        }
                    }

                    // this variable will mantain the aggregate pcpuVal of Service + dynamic apps
                    let aggcpuVal = 0;
                    // get the Web App processes data
                    if (arrActiveApps.length === 0) {
                        // get only the existing categories(3) if no running apps.
                        // dispose all the existing process variables
                        for (const name in processGroup) {
                            // if propertyName starts with "prev_" then dispose it
                            if (!Object.prototype.hasOwnProperty.call(processGroup, name)) {
                                continue;
                            }
                            if (name.indexOf("prev_app_") >= 0) {
                                processGroup[name] = undefined;
                            }
                        }
                    } else {
                        // loop through each of the running apps
                        // in loop - Check if app is newly running app (or) already existing running app
                        for (let j = 0; j < arrActiveApps.length; j++) {
                            const objActApp = arrActiveApps[j],
                                webprocId = objActApp["webprocessid"],
                                procId = objActApp["processid"],
                                displayId = objActApp["displayId"] || 0;
                            let processId;
                            if (webprocId !== "" && webprocId !== undefined && webprocId !== "undefined") {
                                processId = webprocId;
                            } else if (procId !== "" && procId !== undefined && procId !== "undefined") {
                                processId = procId;
                            } else {
                                break;
                            }

                            const prevcpuTime = "prev_app_" + processId + "cputime",
                                appid = parseInt(processId);
                            let pcputime = 0;
                            // get the cputime from otherList
                            for (let l = 0; l < otherList.length; l++) {
                                if (otherList[l]["pid"] !== appid) {
                                    continue;
                                }
                                pcputime = otherList[l]["cputime"];
                                if (!processGroup[prevcpuTime]) {
                                    processGroup[prevcpuTime] = pcputime;
                                    break;
                                }
                                let webpcpuval = ((pcputime - processGroup[prevcpuTime]) * 100/(totalCPUtime - processGroup.prevTotalcputime));
                                // restrict showing the negative % values by making lowest to be zero.
                                if (webpcpuval < 0 || webpcpuval === undefined || isNaN(webpcpuval)) webpcpuval = 0;
                                    aggcpuVal += webpcpuval;
                                    const groupListAppKey = objActApp["id"]+ "-" + appid;
                                    groupObjList[groupListAppKey] = {
                                        "id": objActApp["id"],
                                        "pid": appid,
                                        "cpu": webpcpuval,
                                        "memory": {
                                            "size": otherList[l]["RSS"],
                                            "percent": otherList[l]["pmem"].toFixed(2)
                                        },
                                    "displayId": displayId
                                };
                                processGroup[prevcpuTime] = pcputime;
                                otherList.splice(l, 1);
                                break;
                            }
                        }
                    }
                    // get the service processes data
                    if (arrActiveServices.length === 0) {
                        // get only the existing categories(3) if no running apps.
                        // dispose all the existing process variables
                        for (const name in processGroup) {
                            // if propertyName starts with "prev_" then dispose it
                            if (!Object.prototype.hasOwnProperty.call(processGroup, name)) {
                                continue;
                            }
                            if (name.indexOf("prev_svc_") >= 0) {
                                processGroup[name] = undefined;
                            }
                        }
                    } else {
                        // loop through each of the running apps
                        // in loop - Check if app is newly running app (or) already existing running app
                        for (let j = 0; j < arrActiveServices.length; j++) {
                            const objActService = arrActiveServices[j],
                                processId = objActService["processid"],
                                prevcpuTime = "prev_svc_" + processId + "cputime",
                                appid = parseInt(processId);
                            let pcputime = 0;
                            // get the cputime from otherList
                            for (let l = 0; l < otherList.length; l++) {
                                if (otherList[l]["pid"] !== appid) {
                                    continue;
                                }
                                pcputime = otherList[l]["cputime"];
                                if (!processGroup[prevcpuTime]) {
                                    processGroup[prevcpuTime] = pcputime;
                                    break;
                                }
                                let svcpcpuval = ((pcputime - processGroup[prevcpuTime]) * 100/(totalCPUtime - processGroup.prevTotalcputime));
                                // restrict showing the negative % values by making lowest to be zero.
                                if (svcpcpuval < 0 || svcpcpuval === undefined || isNaN(svcpcpuval)) svcpcpuval = 0;
                                    aggcpuVal+= svcpcpuval;
                                    groupObjList[objActService["id"]] = {
                                            "pid": appid,
                                            "cpu": svcpcpuval,
                                            "memory": {
                                                "size": otherList[l]["RSS"],
                                                "percent": otherList[l]["pmem"].toFixed(2)
                                            }
                                };
                                processGroup[prevcpuTime] = pcputime;
                                otherList.splice(l, 1);
                                break;
                            }
                        }
                    }
                    // get the remaining System Category processes
                    for (let i = 0; i < otherList.length; i++) {
                        tempProcGrps["System"]["pid"] = otherList[i]["pid"];
                        tempProcGrps["System"]["cputime"]+= otherList[i]["cputime"];
                        tempProcGrps["System"]["RSS"]+= otherList[i]["RSS"];
                        tempProcGrps["System"]["pmem"]+= otherList[i]["pmem"];
                    }
                    if (!processGroup.initialExecution) {
                        const diffIdle = idleCPUtime - processGroup.prevIdlecputime,
                            diffTotal = totalCPUtime - processGroup.prevTotalcputime,
                            overallCpuOccupation = ((diffTotal - diffIdle)/diffTotal) * 100;
                        // assign all the values to return Object
                        for (const key in tempProcGrps) {
                            const processName = key;
                            let tempPcpuval = 0;
                            if (processName === "Service") {
                                tempPcpuval = ((tempProcGrps[processName]["cputime"] - processGroup.prevServicecputime) * 100/diffTotal);
                            }
                            // restrict showing the negative % values by making lowest to be zero.
                            if (tempPcpuval < 0 || tempPcpuval === undefined || isNaN(tempPcpuval)) tempPcpuval = 0;
                            aggcpuVal += tempPcpuval;
                            // system = overallCpuOccupation - (Service used + dynamic apps used);
                            if (processName === "System") {
                                tempPcpuval = overallCpuOccupation - aggcpuVal;
                            }
                            // restrict Negative/peak values due to cores fluctuation
                            tempPcpuval < 0 ? (tempPcpuval = 0) : tempPcpuval;
                            tempPcpuval > pcore ? (tempPcpuval = pcore) : tempPcpuval;
                            tempProcGrps[processName]["pmem"] /= totalRAM;
                            const procinfo = {
                                "pid": tempProcGrps[processName]["pid"],
                                "appid": processName,
                                "cpu": parseFloat(tempPcpuval.toFixed(2)),
                                "memory": {
                                    "size": tempProcGrps[processName]["RSS"],
                                    "percent": tempProcGrps[processName]["pmem"].toFixed(2)
                                }
                            };
                            processinfo.push(procinfo);
                        }
                        // push the calculated groups into list
                        for (const propertyName in groupObjList) {
                            if (!Object.prototype.hasOwnProperty.call(groupObjList, propertyName)) {
                                continue;
                            }
    
                            const procObj = groupObjList[propertyName];
                            let pcpuval = parseFloat(procObj["cpu"].toFixed(2));
                            if (pcpuval === undefined || isNaN(pcpuval)) {
                                pcpuval = 0;
                            }
                            procObj["memory"]["percent"] /= totalRAM;
                            const procinfo = {
                                "pid": procObj["pid"],
                                "appid": procObj["id"] || propertyName,
                                "cpu": pcpuval,
                                "memory": {
                                    "size": procObj["memory"]["size"],
                                    "percent": parseFloat(procObj["memory"]["percent"]).toFixed(2)
                                },
                                "displayId": procObj["displayId"]
                            };

                            processinfo.push(procinfo);
                            // copy only app and service info to group for printing
                            groupProcessinfo.push(procinfo);

                            if (processinfo.indexOf(propertyName) < 0) {
                                processList.push(propertyName);
                                groupProcessList.push(propertyName);
                            }
                        }
                    }
                    processGroup.prevIdlecputime = idleCPUtime;
                    processGroup.prevTotalcputime = totalCPUtime;
                    processGroup.prevServicecputime = tempProcGrps["Service"]["cputime"];
    
                    if (!processGroup.initialExecution) {
                        const processgrpinfo = {
                            "date": date,
                            "processinfo": groupProcessinfo,
                            "processList": groupProcessList
                        };
                        _printProcessList(processgrpinfo);
                    }
                } catch (err) {
                    // do not print error message to user
                    // when user press Ctrl + C , the ssh cmd data is not completed, it makes error
                    log.silly("device#processResource()#_setProcessInfo()", "in try-catch. err:", err.toString());
                    return;
                }
            }

            function _getProcessGrp(pname) {
                let group;
                switch (pname) {
                    case 'ls-hubd':
                        group = 'Service'; break;
                    default:
                        group = 'Other'; // it could be children of above categories or System
                    }
                return group;
            }
            
            function _printProcessList(processgrpinfo) {
                log.info("device#processResource()#_printProcessList()",  JSON.stringify(processgrpinfo));

                const processinfo = processgrpinfo.processinfo,
                    processinfoTable = new Table();

                let found = false;
                if (options.id) {
                    processinfo.forEach(function(process) {
                        if (options.id === process.appid) {
                            found = true;
                        }
                    });
                    if (found === false) {
                        // print guide message to user
                        console.log("<" + options.id + ">" + " is not running. Please launch the app or service.");
                        return;
                    }
                }
                if (processgrpinfo.processList.length === 0) {
                    // print guide message to user
                    console.log("There are no running apps or services. Please launch any app or service.");
                    return;
                }

                // add process list to table
                const dataForCSV = [];
                if (Array.isArray(processinfo)) {
                    processinfo.forEach(function(process) {
                        // if user gives ID, print only the ID's information
                        if (options.id && options.id !== process.appid) {
                            return;
                        }
                        processinfoTable.cell('PID', process.pid);
                        processinfoTable.cell('ID', process.appid);
                        processinfoTable.cell('DISPLAY ID', process.displayId);
                        processinfoTable.cell('CPU(%)', process.cpu);

                        const meminfo = process.memory;
                        processinfoTable.cell('MEMORY(%)', meminfo.percent);
                        processinfoTable.cell('MEMORY(KB)', meminfo.size);
                        processinfoTable.newRow();

                        // add data object
                        const obj = {
                              time: processgrpinfo.date,
                              pid: process.pid,
                              id: process.appid,
                              displayId: process.displayId,
                              cpu: process.cpu,
                              memory: meminfo.percent,
                              memory_size: meminfo.size
                        };
                        dataForCSV.push(obj);
                    });
                }
                // write CSV file if user gives --save option
                if (options.save && options.csvPath) {
                    // write csv file
                    // when openMode is false, the new csv file will be created and "Header" add to the file 
                    let openMode = false;
                    if (fs.existsSync(options.csvPath)) {
                        openMode = true;
                    }
                    const csvWriter = createCsvWriter({
                        path: options.csvPath,
                        header: [
                            {id: 'time', title: 'TIME'},
                            {id: 'pid', title: 'PID'},
                            {id: 'id', title: 'ID'},
                            {id: 'displayId', title: 'DISPLAY ID'},
                            {id: 'cpu', title: 'CPU(%)'},
                            {id: 'memory', title: 'MEMORY(%)'},
                            {id: 'memory_size', title: 'MEMORY(KB)'}
                        ],
                        append: openMode
                    });

                    csvWriter
                    .writeRecords(dataForCSV)
                    .then(function() {
                        log.silly("device#processResource()#_printProcessList()", "CSV file updated");
                        // csv file has been created at first
                        if (openMode === false) {
                            const resultTxt = "Create " + chalk.green(options.fileName) + " to " + options.destinationPath;
                            console.log(resultTxt);
                        }
                        __printTable();
                    }).catch(function(err) {
                        return setImmediate(next, errHndl.getErrMsg(err));
                    });
                } else {
                    __printTable();
                }

                function __printTable() {
                    // Print resullt to terminal
                    console.log(processgrpinfo.date + "\n");
                    console.log(processinfoTable.toString());
                    console.log("======================================================================");
                }
            }
        },
        /**
         * get screen capture of the given device
         * @property options {String} device, display, outputPath
         */
        captureScreen: function(options, next) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }
            options = options || {};
            async.series([
                _makeSession,
                _makeCaptureOption,
                _captureScreenFile,
                _copyFileToLocal
            ],  function(err, results) {
                log.silly("device#captureScreen()", "err:", err, ", results:", results);
                const resultTxt = "Create " + chalk.green(options.captureFileName) + " to " + options.destinationPath +"\nSuccess";

                // clean up /tmp/aresCapture directory in target device
                if (options.createdTmpDir) {
                    _removeTmpDir(function finish(removeErr) {
                        next(err ? err : removeErr, {msg: resultTxt});
                    });
                } else {
                    next(err, {msg: resultTxt});
                }
            });

            function _makeSession(next) {
                makeSession(options, next);
            }

            function _makeCaptureOption(next) {
                log.info("device#captureScreen()#_makeCaptureOption()");

                const captureFormat = "PNG", // PNG is default format
                    fileNameSeperator = "_";

                let captureFileName = options.session.target.name + "_" + "display" + options.display + "_",
                    destinationPath = "";

                if (options.outputPath === null) {
                    captureFileName += createDateFileName(fileNameSeperator, captureFormat.toLowerCase());
                    destinationPath = path.resolve('.');
                } else {
                    // get directory path, file path, file Extenstion from given path
                    const parseDirPath = path.dirname(options.outputPath),
                        parseBase = path.parse(options.outputPath).base;

                    let parseExt = path.parse(options.outputPath).ext;

                    parseExt = parseExt.split('.').pop();
                    log.info("device#captureScreen()#_makeCaptureOption()" + "dir name:" + parseDirPath
                        + " ,file name:" + parseBase + " ,inputFormat:" + parseExt);

                    // if specific path is given
                    if (parseBase) {
                        captureFileName = parseBase;
                        destinationPath = path.resolve(parseDirPath);
                        // parseBase is [filename].[ext] format
                        if (parseExt === "") {
                            // paresBase does not have file extesntion, add .png format
                            captureFileName += "." + captureFormat.toLowerCase();
                        } else if (parseExt !== "png" && parseExt !== "bmp" && parseExt !== "jpg") {
                            return next(errHndl.getErrMsg("INVALID_CAPTURE_FORMAT"));
                        }
                    } else if (parseDirPath) {
                        // the path has only "directory" without parseBase
                        // for example, "ares-device -c /"
                        captureFileName = createDateFileName(fileNameSeperator, captureFormat.toLowerCase());
                        destinationPath = path.resolve(parseDirPath);
                    }
                }

                options.captureFormat = captureFormat;
                options.captureFileName = captureFileName;
                options.captureDirPath = "/tmp/aresCapture/";
                options.sourcePath = options.captureDirPath + captureFileName;
                options.destinationPath = destinationPath;
                options.ignore = true;
                options.silent = true;
                
                next();
            }

            function _captureScreenFile(next) {
                log.info("device#captureScreen()#_captureScreenFile()");
                const cmd = "/bin/mkdir -p " + options.captureDirPath;
                options.session.run(cmd, null, null, null, function(err) {
                    if (err) {
                        return setImmediate(next, err);
                    } else {
                        options.createdTmpDir = true;
                        const target = options.session.getDevice(),
                            addr = target.lunaAddr.captureCompositorOutput,
                            param = {
                                // luna param
                                subscribe: false,
                                output: options.sourcePath,
                                format: options.captureFormat,
                                displayId: options.display
                            };

                        luna.send(options, addr, param, function(lineObj, next) {
                            if (lineObj.returnValue) {
                                log.verbose("device#captureScreen()#_captureScreenFile()","Capture file in target:" + lineObj.output);
                                next(null, {});
                            } else {
                                log.verbose("device#captureScreen()#_captureScreenFile()", "failure");
                                next(errHndl.getErrMsg("INVALID_OBJECT"));
                            }
                        }, next);
                    }
                });
            }

            function _copyFileToLocal(next) {
                log.info("device#captureScreen()#_copyFileToLocal()");
                pullLib.pull(options.sourcePath, options.destinationPath, options, next);
            }

            function _removeTmpDir(next) {
                log.info("device#captureScreen()#_removeTmpDir()");
                const cmd = '/bin/rm -rf ' + options.captureDirPath;
                options.session.run(cmd, null, null, null, function(err) {
                    if (err) {
                        return setImmediate(next, err);
                    } else {
                        next();
                    }
                });
            }
        }
    };

    function makeSession(options, next) {
        options.nReplies = 1; // -n 1
        if (!options.session) {
            log.info("device#makeSession()", "need to make new session");
            const printTarget = true;
            options.session = new novacom.Session(options.device, printTarget, next);
        } else {
            log.info("device#makeSession()", "already exist session");
            next();
        }
    }

    function makeCSVOutputPath(options, next) {
        const csvFormat = "csv", // csv is default format
             fileNameSeperator = "_";

        if (options.outputPath === null) {
            options.fileName = createDateFileName(fileNameSeperator, csvFormat);
            options.destinationPath = path.resolve('.');
        } else {
            // get directory path, file path, file Extenstion from given path
            const parseDirPath = path.dirname(options.outputPath),
                parseBase = path.parse(options.outputPath).base;

            let parseExt = path.parse(options.outputPath).ext;

            parseExt = parseExt.split('.').pop();
            log.info("device#captureScreen()#_makeCaptureOption()" + "dir name:" + parseDirPath
                + " ,file name:" + parseBase + " ,inputFormat:" + parseExt);

            // if specific path is given
            if (parseBase) {
                options.fileName = parseBase;
                options.destinationPath = path.resolve(parseDirPath);
                // parseBase is [filename].[ext] format
                if (parseExt === "") {
                    // paresBase does not have file extesntion, add .png format
                    options.fileName += "." + csvFormat;
                } else if (parseExt !== csvFormat) {
                    return next(errHndl.getErrMsg("INVALID_CSV_FORMAT"));
                }
            } else if (parseDirPath) {
                // the path has only "directory" without parseBase
                // for example, "ares-device -r -s /"
                options.fileName = createDateFileName(fileNameSeperator, csvFormat);
                options.destinationPath = path.resolve(parseDirPath);
            }
        }

        options.csvPath = path.resolve(options.destinationPath, options.fileName);
        log.verbose("device#makeCSVOutputPath()", "csvPath:", options.csvPath);

        fs.open(options.csvPath, 'w', function(err, fd) {
            if (err) {
                return next(errHndl.getErrMsg(err));
            }
            fs.close(fd, function(error) {
                if (error) {
                    return next(errHndl.getErrMsg(error));
                }
                log.verbose("device#makeCSVOutputPath()", options.csvPath + " is closed");

                // Defense code
                if (fs.existsSync(options.csvPath)) {
                    fs.unlinkSync(options.csvPath);
                }
                log.verbose("device#makeCSVOutputPath()", options.csvPath + " is exist: " + fs.existsSync(options.csvPath));
                next();
            });
        });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = device;
    }
}());
