/*
 * Copyright (c) 2021-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const ora = require('ora');

(function() {
    const spinnerHdlr = {},
        spinner = ora({ 
        text: "Processing\n",
        color: "white",
        spinner: "simpleDots",
        interval: 200,
        stream:  process.stdout
    });
    
    spinnerHdlr.start = function(text) {
        if (text) {
            spinner.text = text ;
        }
        if (!spinner.isSpinning) {
            spinner.start();
        }
    };

    spinnerHdlr.stop = function() {
        if (spinner.isSpinning) {
            spinner.stop();
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = spinnerHdlr;
    }
}());
