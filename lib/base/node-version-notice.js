/*
 * Copyright (c) 2026 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const chalk = require('chalk');

(function() {
    // Supported Node.js version guide per profile.
    // The Node.js version on the target device changes over time, so we point
    // developers to the official docs instead of hard-coding a version number.
    // NOTE: signage currently reuses the TV link until a dedicated page is provided.
    const SUPPORTED_NODE_URL = {
        "tv": "https://webostv.developer.lge.com/develop/guides/js-service-basics#supported-nodejs-version",
        "signage": "https://webostv.developer.lge.com/develop/guides/js-service-basics#supported-nodejs-version"
    };

    const nodeVersionNotice = {};

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = nodeVersionNotice;
    }

    /**
     * Print a warning that the Node.js version on the target device may be lower
     * than the development environment. Only shown for profiles whose devices
     * ship a bundled Node.js runtime (tv, signage).
     * @param {String} profile current CLI profile (tv, ose, apollo, signage)
     */
    nodeVersionNotice.print = function(profile) {
        const url = SUPPORTED_NODE_URL[profile];
        if (!url) {
            return;
        }

        console.log(chalk.yellow(
            "[Warning] The Node.js version available on the target device may be " +
            "lower than your development environment. Check the supported version " +
            "before using recent Node.js features:\n" + url
        ));
    };
}());
