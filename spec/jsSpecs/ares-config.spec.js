/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const exec = require('child_process').exec,
    common = require('./common-spec');

const aresCmd = 'ares-config';

let cmd,
    options;

beforeAll(function (done) {
    cmd = common.makeCmd(aresCmd);
    common.getOptions()
    .then(function(result){
        options = result;
        done();
    });
});

describe(aresCmd + ' --profile(-p)', function() {
    it("Set a device profile to ose", function(done) {
        exec(cmd + ' -p ose', function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("profile and config data is changed to ose");
            done();
        });
    });

    it("Set a device profile to tv", function(done) {
        exec(cmd + ' -p tv', function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("profile and config data is changed to tv");
            done();
        });
    });

    it("Set a device profile input", function(done) {
        exec(cmd + ` -p ${options.profile}`, function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`profile and config data is changed to ${options.profile}`);
            done();
        });
    });
});

describe(aresCmd + ' --prefile-details(-c)', function() {
    it("Set a device profile to configure", function(done) {
        exec(cmd + ' -c', function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Current profile set to ${options.profile}`, error);
            done();
        });
    });
});

describe(aresCmd + ' negative TC', function() {
    it("Set invalid device profile", function(done) {
        exec(cmd + ' -p test', function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain(`ares-config ERR! [Tips]: Invalid value <profile> : test`, error);
            }
            done();
        });
    });
});
