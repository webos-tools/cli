#!/usr/bin/env node

/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    fs = require('fs'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    commonTools = require('./../lib/base/common-tools'),
    serverLib = require('./../lib/base/server');

const version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    sdkenv = commonTools.sdkenv,
    appdata = commonTools.appdata,
    errHndl = commonTools.errMsg;

const processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function(err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

if (process.argv.length === 2) {
    process.argv.splice(2, 0, '--help');
}

const knownOpts = {
    "version": Boolean,
    "help": Boolean,
    "open": Boolean,
    "port": String,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "V": ["--version"],
    "h": ["--help"],
    "o": ["--open"],
    "p": ["--port"],
    "v": ["--level", "verbose"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-*.js' */);

log.heading = processName;
log.level = argv.level || 'warn';
log.verbose("argv", argv);

/**
 * For consistent of "$command -v", argv is used.
 * By nopt, argv is parsed and set key-value in argv object.
 * If -v or --level option is input with command, it is set key-value in argv.
 * After it is deleted, If remained key is only one in argv object
 * (If any other are remained, it's mean another options is input)
 * and there is no remaining after parsing the input command by nopt
 * (If any other are remained, it's mean another parameters ares input),
 * each command of webOS CLI print help message with log message.
 */
if (argv.level) {
    delete argv.level;
    if (argv.argv.remain.length === 0 && (Object.keys(argv)).length === 1) {
        argv.help = true;
    }
}

let op;
if (argv.help) {
    showUsage();
    cliControl.end();
} else if (argv.version) {
    version.showVersionAndExit();
} else {
    op = runServer;
}

if (op) {
    version.checkNodeVersion(function() {
        async.series([
            op.bind(this)
        ], finish);
    });
}

function showUsage() {
    help.display(processName, appdata.getConfig(true).profile);
}

function runServer() {
    let killTimer,
        serverUrl = "",
        port = 0,
        appPath = argv.argv.remain.splice(0, 1).join("");

    if (!appPath) {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "APP_DIR"));
    }
    appPath = fs.realpathSync(appPath);

    if (!isNaN(argv.port)) {
        port = parseInt(argv.port);
        log.verbose("runServer()", "port:", port);
    }

    log.info("runServer()", "appPath:", appPath, ", port:", port);
    async.waterfall([
        serverLib.runServer.bind(serverLib, appPath, port, _reqHandler),
        function(serverInfo, next) {
            if (serverInfo && serverInfo.port) {
                serverUrl = serverInfo.url;
                console.log(serverInfo.msg);
            }
            if (argv.open && serverInfo.port) {
                async.series([
                    sdkenv.getEnvValue.bind(sdkenv, "BROWSER")
                ], function(err, browserPath) {
                    if (err) {
                        return next(err);
                    }
                    log.info("runServer()", "serverInfo.openBrowserUrl:", serverInfo.openBrowserUrl, ", browserPath :", browserPath[0]);
                    serverLib.openBrowser(serverInfo.openBrowserUrl, browserPath[0]);
                });
            }
            next();
        },
        function() {
            // TODO: Holding process to keep alive
        }
    ], finish);

    function _reqHandler(code, res) {
        if (code === "@@ARES_CLOSE@@") {
            res.status(200).send();
            killTimer = setTimeout(function() {
                cliControl.end();
            }, 2 * 1000);
        } else if (code === "@@GET_URL@@") {
            clearTimeout(killTimer);
            res.status(200).send(serverUrl);
        }
    }
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
