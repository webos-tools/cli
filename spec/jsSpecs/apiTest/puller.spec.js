/*
 * Copyright (c) 2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    exec = require('child_process').exec,
    common = require('../common-spec'),
    puller = require('../../../lib/pull');

const aresCmd = 'Puller',
    dstPath = path.join(__dirname, "../..", "tempFiles"),
    pullOptions = {};

let options,
    outputData="";

beforeAll(function(done) {
    common.getOptions()
    .then(function(result) {
        options = result;
        done();
    });
});

beforeEach(function(done) {
    const shellCmd = common.makeCmd('ares-shell');
    exec(shellCmd + ' -r "touch /tmp/aresfile"', function() {
        done();
    });
});

afterEach(function(done) {
    common.removeOutDir(path.join(dstPath, "aresfile"));
    done();
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

describe(aresCmd + '.pull()', function() {
    it('Copy file from a device to host machine', function(done) {
        puller.pull("/tmp/aresfile", `${dstPath}`, pullOptions, function(err, value) {
            expect(outputData).toContain(dstPath);
            expect(outputData).toContain("1 file(s) pulled");
            expect(value.msg).toContain("Success");
            done();
        }, function(output) {
            outputData += output;
        });
    });

    it('Copy file from a device to host machine with ignore option', function(done) {
        outputData="";
        pullOptions.ignore = true;
        puller.pull("/tmp/aresfile", `${dstPath}`, pullOptions, function(err, value) {
            expect(outputData).toContain("1 file(s) pulled");
            expect(value.msg).toContain("Success");
            done();
        }, function(output) {
            outputData += output;
        });
    });
});

describe(aresCmd + ' negative TC', function() {
    beforeEach(function(done) {
        const shellCmd = common.makeCmd('ares-shell');
        exec(shellCmd + ' -r "touch /tmp/aresfile"', function() {
            done();
        });
    });

    it('Copy file to not exist local directory', function(done) {
        puller.pull("/tmp/aresfile", 'invalidDir', pullOptions, function(err) {
            expect(err.toString()).toContain("ENOENT: no such file or directory, lstat");
            expect(err.toString()).toContain("Please check if the path is valid");
            done();
        });
    });

    it('Copy invalid file from target', function(done) {
        puller.pull("/tmp/invalidFile", 'tempDir', pullOptions, function(err) {
            expect(err.toString()).toContain("The specified path does not exist <SOURCE> : /tmp/invalidFile");
            done();
        });
    });
});
