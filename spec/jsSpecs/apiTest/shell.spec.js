/*
 * Copyright (c) 2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const common = require('../common-spec'),
    shell = require('../../../lib/shell');

const aresCmd = 'Shell',
    shellOption = {};

let options;

beforeAll(function(done) {
    common.getOptions()
    .then(function(result) {
        options = result;
        done();
    });
});

describe("Test setting", function() {
    it("Add device with ares-setup-device", function(done) {
        common.resetDeviceList()
        .then(function() {
            return common.addDeviceInfo();
        }).then(function(result) {
            expect(result).toContain(options.device);
            done();
        }).catch(function(err) {
            expect(err).toContain("The specified value already exist");
            done();
        });
    });
});

describe(aresCmd + '.removeRun()', function() {
    let outputTxt ="";
    it('Run command on target', function(done) {
        shell.remoteRun(shellOption, "echo $PATH", function(err, value) {
            outputTxt += value.msg;
        });
        setTimeout(() => {
            expect(outputTxt).toContain("/usr/sbin:/usr/bin:/sbin:/bin");
            done(); 
        }, 5000);
    });
});
