#!/usr/bin/env node

/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    fs = require('fs'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    launchLib = require('./../lib/launch'),
    commonTools = require('./../lib/base/common-tools');

const version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    setupDevice = commonTools.setupDevice,
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
    "running": Boolean,
    "close": Boolean,
    "hosted": Boolean,
    "host-ip": [String, null],
    "display": [String, null],
    "params": [String, Array],
    "inspect": Boolean,
    "open": Boolean,
    "simulator": [String, null],
    "simulator-path": [String, null],
    "device": [String, null],
    "device-list": Boolean,
    "version": Boolean,
    "help": Boolean,
    "hidden-help": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "r": ["--running"],
    "c": ["--close"],
    "H": ["--hosted"],
    "I": ["--host-ip"],
    "dp": ["--display"],
    "p": ["--params"],
    "i": ["--inspect"],
    "o": ["--open"],
    "s": ["--simulator"],
    "sp": ["--simulator-path"],
    "d": ["--device"],
    "D": ["--device-list"],
    "V": ["--version"],
    "h": ["--help"],
    "hh": ["--hidden-help"],
    "v": ["--level", "verbose"],
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-*.js' */);

log.heading = processName;
log.level = argv.level || 'warn';
launchLib.log.level = log.level;
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

const options = {
        device: argv.device,
        inspect: argv.open || argv.inspect,
        open: argv.open,
        installMode: "Installed",
        display: argv.display,
        hostIp: argv["host-ip"],
        simulator: argv.simulator,
        simulatorPath: argv["simulator-path"]
    },
    appId = argv.argv.remain[0];

if (argv.argv.remain.length > 1) {
    finish("Please check arguments");
}

let op,
    params = {};
if (argv.help || argv['hidden-help']) {
    showUsage(argv['hidden-help']);
    cliControl.end();
} else if (argv.close) {
    op = close;
} else if (argv.running) {
    op = running;
} else if (argv['device-list']) {
    op = deviceList;
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.hosted){
    options.installMode = "Hosted";
    op = launchHostedApp;
} else if (argv.simulator) {
    op = launchSimulator;
} else if (argv['simulator-path']) {
    if (!argv.simulator) {
        finish(errHndl.getErrMsg("USE_WITH_OPTIONS", "simulator, simulator-path"));
    }
} else {
    op = launch;
}

if (op) {
    version.checkNodeVersion(function() {
        async.series([
            op.bind(this)
        ], finish);
    });
}

function showUsage(hiddenFlag) {
    if (hiddenFlag) {
        help.display(processName, appdata.getConfig(true).profile, hiddenFlag);
    } else {
        help.display(processName, appdata.getConfig(true).profile);
    }
}

function deviceList() {
    setupDevice.showDeviceList(finish);
}

function launch() {
    const pkgId = appId;
    params = getParams();
    log.info("launch()", "pkgId:", pkgId);
    if (!pkgId) {
        showUsage();
        cliControl.end(-1);
    } else {
        launchLib.launch(options, pkgId, params, finish, outputTxt);
    }
}

function launchHostedApp() {
    const pkgId = "com.sdk.ares.hostedapp";
    log.info("launchHostedApp():", "pkgId:", pkgId, ", appDir:", appId);

    if (!appId) {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "APP_DIR"));
    }
    if (!fs.existsSync(path.normalize(appId))) {
        return finish(errHndl.getErrMsg("NOT_EXIST_PATH", appId));
    }
    if (options.hostIp) {
        if (options.hostIp === "true") {
            return finish(errHndl.getErrMsg("EMPTY_VALUE", "HOST_IP"));
        } else {
            const ipFormat = /^(?:(?:\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/mg;
            if (!ipFormat.exec(options.hostIp)) {
                return finish(errHndl.getErrMsg("INVALID_IP", options.hostIp));
            }
        }
    }

    options.hostedurl = fs.realpathSync(appId);
    params = getParams();
    launchLib.launch(options, pkgId, params, finish, outputTxt);
}

function getParams() {
    const inputParams = argv.params || [];
    params = {};
    if (inputParams.length === 1 && inputParams[0].indexOf('{') !== -1 && inputParams[0].indexOf('}') !== -1 &&
        ((inputParams[0].split("'").length - 1) % 2) === 0) {
        // eslint-disable-next-line no-useless-escape
        inputParams[0] = inputParams[0].replace(/\'/g,'"');
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
            } else {
                log.warn('Ignoring invalid arguments:', strParam);
            }
        }
    });

    if (argv.display !== undefined && isNaN(Number(argv.display))) {
        return finish(errHndl.getErrMsg("INVALID_DISPLAY"));
    }

    log.info("getParams()", "params:", JSON.stringify(params));
    return params;
}

function close() {
    const pkgId = appId;
    params = getParams();
    log.info("close()", "pkgId:", pkgId);
    if (!pkgId) {
        showUsage();
        cliControl.end(-1);
    }
    launchLib.close(options, pkgId, params, finish);
}

function running() {
    launchLib.listRunningApp(options, function(err, runningApps) {
        let strRunApps = "";
        let cnt = 0;

        if (err) {
            return finish(err);
        }
        if (runningApps instanceof Array) runningApps.forEach(function (runApp) {
            if (cnt++ !== 0) {
                strRunApps = strRunApps.concat('\n');
            }
            strRunApps = strRunApps.concat(runApp.id);
            if (runApp.displayId !== undefined) {
                strRunApps += " - display " + runApp.displayId;
            }
        });
        finish(null, {msg : strRunApps});
    });
}

function launchSimulator() {
    log.info("launchSimulator():", "simulator:", options.simulator, "/ simulatorPath:", options.simulator, "/ appDir:", appId);

    const curConfigData = appdata.getConfig();
    if (curConfigData.profile !== "tv") {
        return finish(errHndl.getErrMsg("NOT_SUPPORT_OPTION", curConfigData.profile));
    }
    if (options.simulator === 'true') {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "WEBOS_TV_VERSION"));
    }
    if (options.simulatorPath === 'true') {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "simlator-path"));
    }

    if (!appId) {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "APP_DIR"));
    } else {
        const appDir = path.resolve(appId);
        if (!fs.existsSync(appDir)) {
            return finish(errHndl.getErrMsg("NOT_EXIST_PATH", appId));
        } else if (!fs.statSync(appDir).isDirectory()) {
            return finish(errHndl.getErrMsg("NOT_DIRTYPE_PATH", appId));
        }

        params = getParams();
        launchLib.launchSimulator(options, appDir, params, finish, outputTxt);
    }
}

function outputTxt(value) {
    log.info("outputTxt()", "value:", value);
    console.log(value);
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
