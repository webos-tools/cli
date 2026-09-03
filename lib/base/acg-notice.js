/*
 * Copyright (c) 2026 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const chalk = require('chalk');

(function() {
    // Profiles whose platforms enforce ACG (Access Control Group).
    // The warning is shown for these; other profiles (ose, apollo, ...) are ignored.
    const ACG_PROFILES = ["tv", "signage"];

    // Guide URL per profile. Only profiles with an official guide page are listed.
    // The "For details, see" line is appended only when a URL exists for the profile.
    // TODO: Add the signage ACG guide URL here once it is available.
    const ACG_GUIDE_URL = {
        "tv": "https://webostv.developer.lge.com/develop/guides/acg-guide"
    };

    const acgNotice = {};

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = acgNotice;
    }

    /**
     * Warn the developer that the 'requiredACG' field is missing in appinfo.json.
     * Shown only for profiles whose platforms enforce ACG (tv, signage); other
     * profiles (ose, apollo, ...) are ignored. Packaging is not blocked.
     * @param {String} profile current CLI profile (tv, ose, apollo, signage)
     */
    acgNotice.print = function(profile) {
        if (ACG_PROFILES.indexOf(profile) === -1) {
            return;
        }

        let msg =
            "[Warning] The 'requiredACG' field is not defined in appinfo.json.\n" +
            "ACG (Access Control Group) controls an app's permission to call Luna Bus APIs on webOS.\n " +
            "Depending on the target webOS version, this field can be required for every app to pass " +
            "the submission eligibility check - even apps that do not call any Luna APIs. \n" +
            "If your app does not use Luna APIs, declare an empty array: \"requiredACG\": []";

        const url = ACG_GUIDE_URL[profile];
        if (url) {
            msg += "\nFor details, see: " + url;
        }

        console.log(chalk.yellow(msg));
    };
}());
