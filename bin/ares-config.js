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
    commonTools = require('./../lib/base/common-tools');

const version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    appdata = commonTools.appdata,
    errHndl = commonTools.errMsg;

const processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function (err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

if (process.argv.length === 2) {
    process.argv.splice(2, 0, '--help');
}

const knownOpts = {
    // generic options
    "help": Boolean,
    "version": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error'],
    // command-specific options
    "profile": [String, null],
    "profile-details": Boolean
};

const shortHands = {
    // generic aliases
    "h": ["--help"],
    "V": ["--version"],
    "v": ["--level", "verbose"],
    "p": ["--profile"],
    "c": ["--profile-details"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-*.js'*/);

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
    profile: argv.profile
};

const configFiles = {
    "ose": "files/conf-base/profile/config-ose.json",
    "tv": "files/conf-base/profile/config-tv.json"
};

const envFiles = {
    "ose": "files/conf-base/env/sdk-ose.json",
    "tv": "files/conf-base/env/sdk-tv.json"
};

const templateFiles = {
    "ose": "files/conf-base/template-conf/ose-templates.json",
    "tv": "files/conf-base/template-conf/tv-sdk-templates.json",
};

const queryPaths = {
    "common": "files/conf-base/query/"
};

const keyFiles = {
};

let op;
if (argv.version) {
    version.showVersionAndExit();
} else if (argv.help) {
    help.display(processName, appdata.getConfig(true).profile);
    cliControl.end();
} else if (argv['profile-details']) {
    op = curConfig;
} else {
    op = config;
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

function config() {
    log.info("config()", "options:", options);
    if (!Object.prototype.hasOwnProperty.call(configFiles, options.profile)) {
        if (options.profile === 'true') {
            return finish(errHndl.getErrMsg("EMPTY_VALUE", "profile"));
        }
        return finish(errHndl.getErrMsg("INVALID_VALUE", "profile", options.profile));
    }

    const queryPath = queryPaths.common;
    appdata.setQuery(path.join(__dirname, '..', queryPath), function(err, status) {
        if (typeof status === 'undefined')
            return finish(errHndl.getErrMsg("INVALID_VALUE", "query configuration"));
    });

    const templateData = require(path.join(__dirname, '..', templateFiles[options.profile]));
    appdata.setTemplate(templateData, function(err, status) {
        if (typeof status === 'undefined')
            return finish(errHndl.getErrMsg("INVALID_VALUE", "template configuration"));
    });

    const envData = require(path.join(__dirname, '..', envFiles[options.profile]));
    appdata.setEnv(envData, function(err, status) {
        if (typeof status === 'undefined')
            return finish(errHndl.getErrMsg("INVALID_VALUE", "env configuration"));
    });

    let keyFile = "";
    if (keyFiles[options.profile]) {
        keyFile = path.join(__dirname, '..', keyFiles[options.profile]);
    }
    appdata.setKey(keyFile, function(err) {
        if (err)
            return finish(errHndl.getErrMsg("INVALID_VALUE", "key configuration"));
    });

    const configData = require(path.join(__dirname, '..', configFiles[options.profile]));
    appdata.setConfig(configData, function(err, status) {
        if (typeof status === 'undefined') {
            return finish(errHndl.getErrMsg("INVALID_VALUE", "configuration"));
        }
        finish(err, {msg: "profile and config data is changed to " + status.profile});
    });
}

function curConfig() {
    const curConfigData = appdata.getConfig(true);
    if (typeof curConfigData.profile === 'undefined') {
        return finish(errHndl.getErrMsg("INVALID_VALUE", "profile details"));
    } else if (curConfigData.profile.trim() === "") {
        return finish(errHndl.getErrMsg("EMPTY_PROFILE"));
    }
    finish(null, {msg: "Current profile set to " + curConfigData.profile});
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
