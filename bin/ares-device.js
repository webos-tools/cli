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
    deviceLib = require('./../lib/device'),
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
    "system-info": Boolean,
    "session-info": Boolean,
    "resource-monitor": Boolean,
    // resource-monitor parameter
    "list" : Boolean,
    "id-filter" : [String, null],
    "time-interval" : [Number, null],
    "save" : Boolean,
    "capture-screen" : Boolean,
    "display" : Number,
    "device":   [String, null],
    "device-list":  Boolean,
    "version":  Boolean,
    "help":     Boolean,
    "level":    ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "i": ["--system-info"],
    "se": ["--session-info"],
    "r": ["--resource-monitor"],
    "l": ["--list"],
    "id":["--id-filter"],
    "t": ["--time-interval"],
    "s": ["--save"],
    "c": ["--capture-screen"],
    "dp": ["--display"],
    "d": ["--device"],
    "D": ["--device-list"],
    "V": ["--version"],
    "h": ["--help"],
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

const curConfigData = appdata.getConfig(true);
const options = {
    device: argv.device,
    display : argv.display || 0,
    outputPath : argv.argv.remain[0] || null
};

let op;
if (argv['device-list']) {
    op = deviceList;
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.help) {
    showUsage();
    cliControl.end();
} else if (argv['system-info']) {
    op = getDeviceInfo;
} else if (argv['session-info']) {
    op = getSessionInfo;
} else if (argv['resource-monitor']) {
    op = getResourceMonitor;
} else if (argv['capture-screen']) {
    op = captureScreen;
} else {
    showUsage();
    cliControl.end();
}

if (argv.argv.remain.length > 1) {
    finish(errHndl.getErrMsg("INVALID_ARGV"));
}

if (op) {
    version.checkNodeVersion(function(err) {
        if(err)
            return finish(err);
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

function getDeviceInfo() {
    if (curConfigData.profile === "ose") {
        deviceLib.systemInfo(options, finish);
    } else if (curConfigData.profile === "tv") {
        deviceLib.tvSystemInfo(options, finish);
    }
}

function getSessionInfo() {
    deviceLib.sessionInfo(options, finish);
}

function getResourceMonitor() {
    options.interval = argv["time-interval"] || null;
    options.save = argv["save"] || null;
    options.outputPath = argv.argv.remain[0] || null;

    if (argv.argv.cooked.indexOf("--time-interval") !== -1 ) {
        if (options.interval <= 0) {
            return finish(errHndl.getErrMsg("INVALID_INTERVAL"));
        }

        if (!argv["time-interval"]) {
            // when user does not give the time-interval
            return finish(errHndl.getErrMsg("EMPTY_VALUE", "time-interval"));
        } else if (argv.argv.original.indexOf(options.interval.toString()) === -1) {
            // nopt set default value "1" when user puts only "-t" option without value
            return finish(errHndl.getErrMsg("EMPTY_VALUE", "time-interval"));
        }
    }
    log.info("getResourceMonitor()", "interval:", options.interval);

    if (argv["id-filter"]) {
        // Handle when another option appears without id-filter value
        const idReg = /^-/;
        if (argv["id-filter"] === "true" || argv["id-filter"].match(idReg)) {
            return finish(errHndl.getErrMsg("EMPTY_VALUE", "id-filter"));
        }
        options.id = argv["id-filter"];
        deviceLib.processResource(options, finish);
    } else if (argv.list) {
        deviceLib.processResource(options, finish);
    } else {
        deviceLib.systemResource(options, finish);
    }
}

function captureScreen() {
    if (curConfigData.profile !== "ose") {
        return finish(errHndl.getErrMsg("NOT_SUPPORT_OPTION", curConfigData.profile));
    }
    deviceLib.captureScreen(options, finish);
}

function finish(err, value) {
    log.info("finish()");
    if (err) {
        // handle err from getErrMsg()
        if (Array.isArray(err) && err.length > 0) {
            for(const index in err) {
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
