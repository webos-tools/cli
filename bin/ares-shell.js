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
    shellLib = require('./../lib/shell'),
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

const knownOpts = {
    "device": [String, null],
    "device-list": Boolean,
    "display": [String, null],
    "version": Boolean,
    "run": [String, null],
    "help": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "d": ["--device"],
    "D": ["--device-list"],
    "dp": ["--display"],
    "V": ["--version"],
    "r": ["--run"],
    "h": ["--help"],
    "v": ["--level", "verbose"]
};
const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-shell.js'*/);

log.heading = processName;
log.level = argv.level || 'warn';
log.verbose("argv", argv);

const curConfigData = appdata.getConfig(true);
if (curConfigData.profile !== "ose") {
    return finish(errHndl.getErrMsg("NOT_SUPPORT_COMMOND", curConfigData.profile));
}

const options = {
        device: argv.device,
        display: argv.display
    };

let op;
if (argv['device-list']) {
    op = deviceList;
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.run) {
    op = run;
} else if (argv.help) {
    showUsage();
    cliControl.end();
} else {
    op = shell;
}

if (op) {
    version.checkNodeVersion(function() {
        async.series([
            op.bind(this)
        ],finish);
    });
}

function showUsage() {
    help.display(processName, appdata.getConfig(true).profile);
}

function deviceList() {
    setupDevice.showDeviceList(finish);
}

function run() {
    if (argv.display !== undefined && isNaN(Number(argv.display))) {
        return finish(errHndl.getErrMsg("INVALID_DISPLAY"));
    }
    shellLib.remoteRun(options, argv.run, finish);
}

function shell() {
    if (argv.display !== undefined && isNaN(Number(argv.display))) {
        return finish(errHndl.getErrMsg("INVALID_DISPLAY"));
    }
    shellLib.shell(options, finish);
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
