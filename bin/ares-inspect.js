#!/usr/bin/env node

/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    inspectLib = require('./../lib/inspect'),
    commonTools = require('./../lib/base/common-tools'),
    spinner = require('../lib/util/spinner');

const cliControl = commonTools.cliControl,
    version = commonTools.version,
    help = commonTools.help,
    setupDevice = commonTools.setupDevice,
    appdata = commonTools.appdata,
    errHndl = commonTools.errMsg;

const processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function(err) {
    spinner.stop();
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

if (process.argv.length === 2) {
    process.argv.splice(2, 0, '--help');
}

const knownOpts = {
    "device": [String, null],
    "app": [String, null],
    "service": [String, Array],
    "device-list": Boolean,
    "open": Boolean,
    "host-port": [String, null],
    "display": [String, null],
    "version": Boolean,
    "help": Boolean,
    "hidden-help": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "d": ["--device"],
    "a": ["--app"],
    "s": ["--service"],
    "D": ["--device-list"],
    "o": ["--open"],
    "P": ["--host-port"],
    "dp": ["--display"],
    "V": ["--version"],
    "h": ["--help"],
    "hh": ["--hidden-help"],
    "v": ["--level", "verbose"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-inspect.js'*/);

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

const options = {
        device: argv.device,
        appId: argv.app || argv.argv.remain[0],
        serviceId: argv.service,
        open: argv.open,
        hostPort: argv["host-port"],
        display: argv.display || 0
    };

let op;
if (argv.help || argv['hidden-help']) {
    showUsage(argv['hidden-help']);
    cliControl.end();
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv['device-list']) {
    op = deviceList;
} else {
    op = inspect;
}

if (op) {
    version.checkNodeVersion(function() {
        async.series([
            op.bind(this)
        ], finish);
    });
}

function deviceList() {
    setupDevice.showDeviceList(finish);
}

function showUsage(hiddenFlag) {
    if (hiddenFlag) {
        help.display(processName, appdata.getConfig(true).profile, hiddenFlag);
    } else {
        help.display(processName, appdata.getConfig(true).profile);
    }
}

function inspect() {
    log.info("inspect()", "AppId:", options.appId, ", ServiceId:", options.serviceId);

    if (!options.appId && !options.serviceId) {
        showUsage();
        cliControl.end(-1);
    } else if (options.appId && options.appId[0] === 'true' || options.appId === 'true') {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "APP_ID"));
    } else if (options.serviceId && options.serviceId[0] === 'true') {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "SERVICE_ID"));
    }

    if (argv.display !== undefined && isNaN(Number(argv.display))) {
        return finish(errHndl.getErrMsg("INVALID_DISPLAY"));
    }

    async.waterfall([
        inspectLib.inspect.bind(inspectLib, options),
        function(inspectInfo) {
            console.log(inspectInfo.msg);
        }
    ], function(err, results) {
        finish(err, results);
    });
}

function finish(err, value) {
    spinner.stop();

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
