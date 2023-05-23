#!/usr/bin/env node

/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    Pusher = require('./../lib/pusher'),
    commonTools = require('./../lib/base/common-tools'),
    spinner = require('./../lib/util/spinner');

const version = commonTools.version,
    cliControl = commonTools.cliControl,
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
    "device" : [ String, null ],
    "ignore" : Boolean,
    "device-list" : Boolean,
    "version" : Boolean,
    "help":     Boolean,
    "level":    ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "d" : [ "--device" ],
    "i" : [ "--ignore" ],
    "D" : [ "--device-list" ],
    "V" : [ "--version" ],
    "h": ["--help"],
    "v": ["--level", "verbose"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /** drop 'node' &  'ares-install.js'*/);

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
    if (argv.argv.remain.length===0 && (Object.keys(argv)).length === 1) {
        argv.help=true;
    }
}

const curConfigData = appdata.getConfig(true);
if (curConfigData.profile !== "ose") {
    return finish(errHndl.getErrMsg("NOT_SUPPORT_COMMOND", curConfigData.profile));
}

let op;
const options = {
        appId : 'com.ares.defaultName',
        device : argv.device,
        ignore : argv.ignore
    };

if (argv['device-list']) {
    op = deviceList;
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.help) {
    showUsage();
    cliControl.end();
} else {
    op = push;
}

if (op) {
    version.checkNodeVersion(function() {
        op(finish);
    });
}

function showUsage() {
    help.display(processName, appdata.getConfig(true).profile);
}

function deviceList() {
    setupDevice.showDeviceList(finish);
}

function push() {
    const pusher = new Pusher(),
        srcPaths = argv.argv.remain.slice(0, argv.argv.remain.length-1),
        dstPath = argv.argv.remain[argv.argv.remain.length-1];

    if (!srcPaths || !dstPath) {
        showUsage();
        cliControl.end(-1);
    }

    pusher.push(srcPaths, dstPath, options, finish, outputTxt);
}

function outputTxt(value) {
    log.info("outputTxt()", "value:", value);
    console.log(value);
}

function finish(err, value) {
    log.info("finish()");
    spinner.stop();
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
