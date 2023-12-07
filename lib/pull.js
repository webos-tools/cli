/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    npmlog = require('npmlog'),
    path = require('path'),
    streamBuffers = require('stream-buffers'),
    util = require('util'),
    errHndl = require('./base/error-handler'),
    novacom = require('./base/novacom'),
    spinner = require('./util/spinner');

(function() {
    const log = npmlog;
    log.heading = 'pull';
    log.level = 'warn';

    const pull = {
        pull: function(srcPaths, dstPath, options, next, middleCb) {
            if (typeof next !== 'function') {
                throw errHndl.getErrMsg("MISSING_CALLBACK", "next", util.inspect(next));
            }

            const writeIsFile = new streamBuffers.WritableStreamBuffer(),
                writeIsDir = new streamBuffers.WritableStreamBuffer(),
                writeDirList = new streamBuffers.WritableStreamBuffer(),
                writeFileList = new streamBuffers.WritableStreamBuffer();

            let iCount = 0,
                totalSize = 0,
                timeStart = new Date().getTime(),
                timeEnd = new Date().getTime(),
                sourcePath = srcPaths,
                destinationPath = dstPath,
                stringArray = [];

            String.prototype.replaceAll = function(token, newToken, ignoreCase) {
                let str = this + "",
                    i = -1;

                if (typeof token === "string") {
                    if (ignoreCase) {
                        while((i = str.toLowerCase().indexOf(token, i >= 0 ? i + newToken.length : 0)) !== -1) {
                            str = str.substring(0, i) + newToken + str.substring(i + token.length);
                        }
                    } else {
                        return this.split(token).join(newToken);
                    }
                }
                return str;
            };

            function _makeSession(next) {
                if (options.session) {
                    return next(null, options.session);
                } else {
                    const printTarget = true;
                    options.session = new novacom.Session(options.device, printTarget, next);
                }
            }

            function _transferFiles(session, next) {
                log.verbose('pull#transferFiles()', 'sourcePath:' + sourcePath + ', destinationPath:'+ destinationPath);
                try {
                    const orginalSourcePath = sourcePath,
                        dirIndex = sourcePath.length;

                    sourcePath = sourcePath.replaceAll(" ","\\ ");
                    let cmd = "[ -f " + sourcePath + " ] && echo 'f' || echo 'nf'";

                    session.run(cmd, null, writeIsFile, null, function() {
                        if (!options.silent) {
                            spinner.start();
                        }
                        timeStart = new Date().getTime();
                        if (writeIsFile.getContentsAsString() === 'f\n') {
                            fs.exists(destinationPath, function(exists) {
                                let stats;
                                try {
                                    stats = fs.lstatSync(destinationPath);
                                    if (exists) {
                                        if (stats.isDirectory()) {
                                            destinationPath = path.resolve(destinationPath, path.basename(orginalSourcePath));
                                        }
                                    }
                                } catch (err) {
                                    return setImmediate(next, errHndl.getErrMsg(err));
                                } 
                                session.get(sourcePath, destinationPath, function(err) {
                                    if (err) {
                                        return setImmediate(next, err);
                                    } else {
                                        if (!options.ignore) {
                                            spinner.stop();
                                            middleCb("Pull: " + sourcePath + " -> " + destinationPath);
                                        }
                                        totalSize += stats.size;
                                        iCount++;
                                        setImmediate(next);
                                    }
                                });
                            });
                        } else {
                            cmd = "[ -d " + sourcePath + " ] && echo 'd' || echo 'nd'";
                            session.run(cmd, null, writeIsDir, null,  function() {
                                function _copyAllFolders(next) {
                                    cmd = "find " + sourcePath + " -type d -follow -print";
                                    session.run(cmd, null, writeDirList, null, function() {
                                        stringArray = writeDirList.getContentsAsString().split('\n');
                                        async.eachSeries(stringArray, function(item, callback) {
                                            const filepath = path.join(destinationPath, item.substring(dirIndex));
                                            mkdirp(filepath, function(err) {
                                                if (!options.ignore && path.resolve(filepath) !== destinationPath) {
                                                    spinner.stop();
                                                    middleCb("Pull: " + item + " -> " + filepath);
                                                }
                                                setImmediate(callback, err);
                                            });
                                        }, function(err) {
                                               setImmediate(next, err);
                                        });
                                    });
                                }

                                function _copyAllFiles(next) {
                                    cmd = "find " + sourcePath + " -type f -follow -print";
                                    session.run(cmd, null, writeFileList, null, function() {
                                        if (writeFileList.size() === 0) {
                                            return setImmediate(next);
                                        }

                                        stringArray = writeFileList.getContentsAsString().split('\n');
                                        stringArray.pop();
                                        async.eachSeries(stringArray, function(item, callback) {
                                            const filepath = path.join(destinationPath, item.substring(dirIndex));
                                            session.get(item.replaceAll(" ","\\ "), filepath, function(err) {
                                                if (err) {
                                                    return setImmediate(next, err);
                                                } else {
                                                    if (!options.ignore) {
                                                        spinner.stop();
                                                        middleCb("Pull: " + item + " -> " + filepath);
                                                    }
                                                    iCount++;
                                                    const stat = fs.lstatSync(filepath);
                                                    totalSize += stat.size;
                                                    setImmediate(callback);
                                                }
                                            });
                                        }, function(err) {
                                               setImmediate(next, err);
                                        });
                                    });
                                }

                                if (writeIsDir.getContentsAsString() === 'd\n') {
                                    destinationPath = path.resolve(path.join(destinationPath, path.basename(sourcePath)));
                                    try {
                                        const stat = fs.lstatSync(destinationPath);
                                        if (!stat.isDirectory()) {
                                            return next(errHndl.getErrMsg("NOT_DIRTYPE_PATH", destinationPath));
                                        }
                                    } catch(e) {
                                        if (e && e.code === 'ENOENT') {
                                            mkdirp.sync(destinationPath);
                                        } else {
                                            return next(e);
                                        }
                                    }

                                    if (!options.ignore) {
                                        spinner.stop();
                                        middleCb("Pull: " + sourcePath + " -> " + destinationPath);
                                    }

                                    async.waterfall([
                                            _copyAllFolders,
                                            _copyAllFiles
                                    ], function(err, result) {
                                           setImmediate(next, err, result);
                                    });
                                } else {
                                    const err = errHndl.getErrMsg("NOT_EXIST_PATH", "SOURCE", sourcePath);
                                    return setImmediate(next, err);
                                }
                            });
                        }
                    });
                }
                catch (err) {
                    let error;
                    if (err.code === 1) {
                        error = errHndl.getErrMsg("INVALID_VALUE", "path", err);
                    }
                    finish(error);
                }
            }

            function finish(err, result) {
                log.silly("pull#finsish()", "err:", err, ", result:", result);
                if (!err) {
                    timeEnd = new Date().getTime();
                    const timeDur = (timeEnd-timeStart)/1000;
                    if (!options.silent) {
                        spinner.stop();
                        middleCb(iCount+" file(s) pulled");
                        middleCb(Math.round((totalSize)/(1024*timeDur))+" KB/s ("+totalSize+" bytes in "+timeDur+"s)");
                    }
                    result = {msg:"Success"};
                }
                return next(err, result);
            }

            async.waterfall([
                _makeSession,
                _transferFiles
            ], function(err, result) {
                finish(err, result);
            });
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = pull;
    }
}());
