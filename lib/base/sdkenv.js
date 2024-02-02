/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs'),
    path = require('path');

(function() {
    const sdkenv = {};
    function SdkEnv() {
        // Read SDK ENV
        let sdkPath,
            sdkBrowserPath;

        try {
            const confFile = path.join(__dirname, '../../files/conf/sdk.json'),
                sdkConf = JSON.parse(fs.readFileSync(confFile, 'utf8'));
            sdkPath = process.env[sdkConf.SDKPATH_ENV_NAME];
            sdkBrowserPath = sdkConf.BROWSER_PATH_IN_SDK[process.platform];
        } catch(e) {
            // TBD. allowing exceptions...
        }

        const browserPath = process.env.ARES_BUNDLE_BROWSER
                            || (sdkPath && sdkBrowserPath) ? path.join(sdkPath, sdkBrowserPath) : null;
        this.envList = {};

        if (sdkPath && fs.existsSync(sdkPath)) {
            this.envList.SDK = sdkPath;
        }

        if (browserPath && fs.existsSync(browserPath)) {
            this.envList.BROWSER = browserPath;
        }
    }

    sdkenv.Env = SdkEnv;

    sdkenv.create = function() {
        return new SdkEnv();
    };

    SdkEnv.prototype = {
        getEnvList: function(next) {
            const envNameList = Object.keys(this.envList);
            setImmediate(next, null, envNameList);
        },
        getEnvValue: function(name, next) {
            const envValue = this.envList[name];
            setImmediate(next, null, envValue);
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = sdkenv;
    }
}());
