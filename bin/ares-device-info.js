#!/usr/bin/env node

/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const log = require('npmlog'),
    path = require('path'),
    commonTools = require('./../lib/base/common-tools');

const cliControl = commonTools.cliControl,
    errHndl = commonTools.errMsg;

const processName = path.basename(process.argv[1], '.js');

process.on('uncaughtException', function(err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});
log.heading = processName;

const error = errHndl.getErrMsg("NOT_SUPPORT_COMMOND_DEPRECATED");
for(const idx in error) {
     log.error(error[idx].heading, error[idx].message);
}

cliControl.end(-1);
