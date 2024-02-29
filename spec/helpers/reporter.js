/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const HtmlReporter = require('jasmine-pretty-html-reporter-jasmine3.8').Reporter;

jasmine.getEnv().configure({
    random: false,
    oneFailurePerSpec: false
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
jasmine.getEnv().clearReporters(); // remove default reporter logs
jasmine.getEnv().addReporter(new SpecReporter({ // add jasmine-spec-reporter
    suite: {
        // display each suite number (hierarchical)
        displayNumber: true
    },
    spec: {
        // display error messages for each failed assertion
        displayErrorMessages: true,

        // display stacktrace for each failed assertion
        displayStacktrace: true,

        // display each successful spec
        displaySuccessful: true,

        // display each failed spec
        displayFailed: true,

        // display each pending spec
        displayPending: true,

        // display each spec duration
        displayDuration: false
    },
    summary: {
        // display error messages for each failed assertion
        displayErrorMessages: false,

        // display stacktrace for each failed assertion
        displayStacktrace: false,

        // display summary of all successes after execution
        displaySuccessful: true,

        // display summary of all failures after execution
        displayFailed: true,

        // display summary of all pending specs after execution
        displayPending: true,

        // display execution duration
        displayDuration: false
    }
}));

jasmine.getEnv().addReporter(new HtmlReporter({
    path: path.join(__dirname, '../../')
}));
