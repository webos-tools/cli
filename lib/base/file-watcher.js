const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const npmlog = require('npmlog');
const luna = require('./luna');
const errHndl = require('./error-handler');

(function() {
    const log = npmlog;
    log.heading = 'fileWatcher';
    log.level = 'warn';
    let isCalled = false;
    const ignoreListFile = '.reloadignore';

    const fileWatcher = {
        /**
         * @property {Object} log an npm log instance
         */
        log: log,

        /**
         * Start to watch the given path in local PC
         * and relaunch the hosted app when any event is triggered
         * @param {Object} options
         * @property options {String} device the device to connect to
         * @property options {String} directory path to watch
         */
        watch: function(options, params) {
            log.verbose('file-watcher#watch()');
            const watchDir = options.hostedurl;
            const watcher = this._startWatcher(watchDir);

            watcher.on('all', (event, filePath) => {
                log.verbose('file-watcher#watch():', event, filePath);
                if (path.basename(filePath) === ignoreListFile) {
                    // Close and restart watcher with modified watch option
                    watcher.close().then(() => {
                        log.verbose('file-watcher#watch():', 'ignoreListFile changed');
                        this.watch(options);
                    });
                } else {
                    this._launch(options, params, function(err) {
                        if (err) {
                            console.log('Failed to relaunch Ares Hosted App');
                            log.error(err.toString());
                            log.verbose(err.stack);
                        }
                        return;
                    });
                }
            });

            watcher.on('error', (err) => {
                log.error(`Watcher error: ${err}`);
            });

            process.on("SIGINT", function() {
                watcher.close().then(() => {
                   log.verbose('file-watcher#watch():', 'SIGINT is detected, watcher close', watchDir);
                });
            });
        },

        _startWatcher: function(watchDir) {
            const ignoredFiles = this._readIgnoreList(watchDir);
            log.verbose('file-watcher#_startWatcher():', 'ignored', ignoredFiles);
            const watchOptions = {
                ignored: ignoredFiles,
                ignoreInitial: true
            };
            return chokidar.watch(watchDir, watchOptions);
        },

        _readIgnoreList: function(watchDir) {
            const ignoreListFilePath = path.join(watchDir, ignoreListFile);
            log.verbose('file-watcher#_readIgnoreList():', ignoreListFilePath);
            if (fs.existsSync(ignoreListFilePath)) {
                try {
                    // read and parse ignoreListFile into an array
                    const ignoreListStr = fs.readFileSync(ignoreListFilePath, 'utf-8');
                    log.silly('file-watcher#_readIgnoreList():', 'fs.readFileSync:', ignoreListStr);
                    const ignoreListArr = ignoreListStr.split(/\r?\n/);
                    for (let i = 0; i < ignoreListArr.length; i++) {
                        // check if empty
                        if (ignoreListArr[i] === '') {
                            ignoreListArr.splice(i, 1);
                            i--;
                            continue;
                        }
                        // check if path is absolute, otherwise change to absolute
                        if (ignoreListArr[i] && !path.isAbsolute(ignoreListArr[i])) {
                            if (ignoreListArr[i].indexOf('**') === 0) {
                                continue;
                            }
                            ignoreListArr[i] = path.join(watchDir, ignoreListArr[i]);
                        }
                    }
                    return ignoreListArr;
                } catch (err) {
                    log.error(err);
                    return [];
                }
            } else {
                return [];
            }
        },

        _launch: function(options, params, next) {
            if (isCalled) {
                return;
            } else {
                isCalled = true;
            }
            const target = options.session.getDevice();
            const addr = target.lunaAddr.launch;
            const returnValue = addr.returnValue.split('.');
            const param = {
                // luna param
                id: options.appId,
                subscribe: false,
                params: params
            };
            luna.send(options, addr, param, function(lineObj, next) {
                log.silly('file-watcher#_launch():', 'Relaunch lineObj:', lineObj);
                let resultValue = lineObj;

                for (let index = 1; index < returnValue.length; index++) {
                    resultValue = resultValue[returnValue[index]];
                }
                if (resultValue) {
                    // success: stop
                    log.verbose('file-watcher#_launch():', 'Relaunch success');
                    isCalled = false;
                    next(null);
                } else {
                    // failure: stop
                    log.verbose('file-watcher#_launch():', 'Relaunch failure');
                    isCalled = false;
                    next(errHndl.getErrMsg("INVALID_OBJECT"));
                }
            }, next);
        },
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = fileWatcher;
    }

}());
