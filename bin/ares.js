#!/usr/bin/env node

/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    Table = require('easy-table'),
    fs = require('fs'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    commonTools = require('./../lib/base/common-tools');

const cliControl = commonTools.cliControl,
    version = commonTools.version,
    help = commonTools.help,
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
    "help": Boolean,
    "list": Boolean,
    "version": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "h": ["--help"],
    "l": ["--list"],
    "V": ["--version"],
    "v": ["--level", "verbose"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2),
    profile = appdata.getConfig(true).profile;

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
if (argv.list) {
    op = commandList;
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.help) {
    showUsage();
    cliControl.end();
} else {
    op = display;
}

if (op) {
    version.checkNodeVersion(function() {
        async.series([
            op.bind(this)
        ],finish);
    });
}

function commandList() {
    log.info("commandList()");
    const table = new Table();
    try {
        const commandsList = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'files', 'conf', 'ares.json')));
        Object.keys(commandsList).forEach(function(cmd) {
            if (commandsList[cmd].profile && !commandsList[cmd].profile.includes(profile)) {
                return;
            } else if (!fs.existsSync(path.join(__dirname, cmd + '.js'))) {
                return;
            }
            table.cell('CMD', cmd);
            table.cell('Description', commandsList[cmd].description);
            table.newRow();
        });
        finish(null, {msg: table.print().trim()});
    } catch (err) {
        finish(errHndl.getErrMsg("INVALID_JSON_FORMAT"));
    }
}

function display (next) {
    log.info("display()");
    let found = false;
    try{
        const commandsList = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'files', 'conf', 'ares.json')));
        for (const arg in argv) {
            if (Object.hasOwnProperty.call(commandsList, 'ares-'+ arg) && fs.existsSync(path.join(__dirname, 'ares-'+ arg + '.js'))) {
                if (commandsList['ares-'+ arg].profile && !commandsList['ares-'+ arg].profile.includes(profile)) {
                    return next(errHndl.getErrMsg("NOT_SUPPORT_COMMOND", profile));
                } else {
                    help.display('ares-'+arg, appdata.getConfig(true).profile);
                    found = true;
                }
            }

            if (!found) {
                return next(errHndl.getErrMsg("INVALID_COMMAND"));
            } else {
                return next();
            }
        }
    } catch (err) {
        next(errHndl.getErrMsg("INVALID_JSON_FORMAT"));
    }
}

function showUsage () {
    help.display(processName, appdata.getConfig(true).profile);
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
