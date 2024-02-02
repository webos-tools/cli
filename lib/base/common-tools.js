/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const Appdata = require('./cli-appdata'),
    cliControl = require('./cli-control'),
    errMsg = require('./error-handler'),
    help = require('./help-format'),
    sdkenv = require('./sdkenv'),
    setupDevice = require('./setup-device'),
    version = require('./version-tools');

(function() {
    const commonTools = {};

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = commonTools;
    }

    commonTools.help = help;
    commonTools.version = version;
    commonTools.errMsg = errMsg;
    commonTools.cliControl = cliControl;
    commonTools.setupDevice = setupDevice;
    commonTools.appdata = new Appdata();
    commonTools.sdkenv = new sdkenv.Env();
}());
