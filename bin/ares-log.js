#!/usr/bin/env node

/*
 * Copyright (c) 2021-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    logLib = require('./../lib/log'),
    commonTools = require('./../lib/base/common-tools');

const version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    appdata = commonTools.appdata,
    setupDevice = commonTools.setupDevice,
    errHndl = commonTools.errMsg;

let processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function(err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

const knownOpts = {
    "help": Boolean,
    "version": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error'],
    "device": [String, null],
    "device-list": Boolean,
    // command options
    "switch-daemon": String,
    "current-daemon": Boolean,
    // show options
    "lines": Number,
    "reverse": Boolean,
    "follow": Boolean,
    // filter options
    "since": String,
    "until": String,
    "priority": String,
    "kernel": Boolean,
    "boot": Boolean,
    "pid": Number,
    // output option
    "output": Boolean,
    // save option
    "save": Boolean,
    // read options
    "file": String,
    "file-list": Boolean,
    // unit options
    "unit": String,
    "unit-list": Boolean,
    "display": [String, null],
    // context options
    "context-list": Boolean,
    "set-level": String,
    "id-filter": String
};

const shortHands = {
    // generic aliases
    "h": ["--help"],
    "V": ["--version"],
    "v": ["--level", "verbose"],
    "d": ["--device"],
    "D": ["--device-list"],
    "sd": ["--switch-daemon"],
    "cd": ["--current-daemon"],
    "n": ["--lines"],
    "r": ["--reverse"],
    "f": ["--follow"],
    "S": ["--since"],
    "U": ["--until"],
    "p": ["--priority"],
    "k": ["--dmesg"],
    "b": ["--boot"],
    "pid": ["--pid"],
    "o": ["--output"],
    "s": ["--save"],
    "file": ["--file"],
    "fl": ["--file-list"],
    "u": ["--unit"],
    "ul": ["--unit-list"],
    "dp": ["--display"],
    "cl": ["--context-list"],
    "sl": ["--set-level"],
    "id": ["--id-filter"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-*.js'*/);

log.heading = processName;
log.level = argv.level || 'warn';
log.verbose("argv", argv);

const curConfigData = appdata.getConfig(true);
if (!["ose","apollo"].includes(curConfigData.profile)) {
    return finish(errHndl.getErrMsg("NOT_SUPPORT_COMMOND", curConfigData.profile));
}

const options = {
    device: argv.device,
    display: argv.display,
    argv: argv
};

const pmLogOptions = ["follow", "lines", "context-list", "set-level", "id-filter", "save", "level", "device"],
    journalLogOptions = ["follow", "reverse", "lines", "since", "until", "pid", "dmesg", "boot", "output", "file",
                        "priority", "save", "display", "level", "device", "file", "file-list", "unit", "unit-list"];

let op;
if (argv['device-list']) {
    op = deviceList;
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.help) {
    const currentDaemon = appdata.getConfig().logDaemon;
    if (currentDaemon === "pmlogd") {
        processName += "-pmlogd";
    }
    help.display(processName, appdata.getConfig().profile);
    cliControl.end();
} else if (argv['current-daemon']) {
    op = checkCurrentDaemon;
} else if (argv['switch-daemon']) {
    op = switchDaemon;
} else if (argv['unit-list']) {
    op = showUnitList;
} else if (argv['file-list'] || argv.file) {
    op = readMode;
} else if (argv['context-list'] || argv['set-level']) {
    op = contextMode;
} else {
    op = showLog;
}

if (op) {
    version.checkNodeVersion(function(err) {
        if (err)
            return finish(err);
        async.series([
            op.bind(this)
        ],finish);
    });
}

function deviceList() {
    setupDevice.showDeviceList(finish);
}

function showLog() {
    log.info("showLog()");

    checkOption();
    logLib.show(options, finish);
}

function readMode() {
    log.info("readMode()");

    checkOption();
    logLib.readMode(options, finish);
}

function showUnitList() {
    log.info("showUnitList()");

    checkOption();
    logLib.printUnitList(options, finish);
}

function contextMode() {
    log.info("contextMode()");

    checkOption();
    logLib.contextMode(options, finish);
}

function checkCurrentDaemon() {
    log.info("checkCurrentDaemon()");

    options.currentDaemon = appdata.getConfig().logDaemon;
    logLib.checkLogDaemon(options, finish);
}

function switchDaemon() {
    log.info("switchDaemon()");

    if (curConfigData.profile === "apollo") {
        return finish(errHndl.getErrMsg("NOT_SUPPORT_OPTION", curConfigData.profile));
    }

    if (argv['switch-daemon'] !== "journald" && argv['switch-daemon'] !== "pmlogd") {
        return finish(errHndl.getErrMsg("NOT_EXIST_LOGDAEMON"));
    }

    const configData = appdata.getConfig();
    configData.logDaemon = argv['switch-daemon'];
    appdata.setConfig(configData);
    options.currentDaemon = configData.logDaemon;

    logLib.checkLogDaemon(options, finish);
}

function checkOption() {
    options.currentDaemon = appdata.getConfig(true).logDaemon;
    options.currentOption = Object.keys(argv);
    options.currentOption.splice(-1, 1);

    if (options.currentDaemon === "journald") {
        log.info("checkOption()", "journald options");

        options.currentOption.forEach(function(item) {
            if (!journalLogOptions.includes(item)) {
                return finish(errHndl.getErrMsg("NOT_SUPPORT_JOURNALD", item));
            }
        });
    } else if (options.currentDaemon === "pmlogd") {
        log.info("checkOption()", "pmlogd options");

        options.currentOption.forEach(function(item) {
            if (!pmLogOptions.includes(item)) {
                return finish(errHndl.getErrMsg("NOT_SUPPORT_PMLOGD", item));
            }
        });
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