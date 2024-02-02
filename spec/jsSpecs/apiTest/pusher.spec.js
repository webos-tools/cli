/*
 * Copyright (c) 2023-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    exec = require('child_process').exec,
    common = require('../common-spec'),
    Pusher = require('../../../lib/pusher');

const aresCmd = 'Pusher',
    srcPath = path.join(__dirname, "../..", "tempFiles/copyFiles"),
    push = new Pusher(),
    src = [`${srcPath}`];

let options;

const pushOptions = {
};

beforeAll(function(done) {
    common.getOptions()
    .then(function(result) {
        options = result;
        done();
    });
});

afterAll(function(done) {
    const shellCmd = common.makeCmd('ares-shell');
    exec(shellCmd + ` -r "rm -rf /tmp/copyFiles"`, function() {
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

describe(aresCmd + ".push", function() {
    beforeEach(function(done) {
        const shellCmd = common.makeCmd('ares-shell');
        exec(shellCmd + ` -r "rm -rf /tmp/copyFiles"`, function() {
            done();
        });
    });

    it('Copy directory', function(done) {
        let outputTxt = "";
        push.push(src, '/tmp', pushOptions, function(err, value) {
            expect(value.msg).toContain("Success");
            expect(outputTxt).toContain("/tmp/copyFiles/testFile.txt");
            expect(outputTxt).toContain("/tmp/copyFiles/helloFile.txt");
            expect(outputTxt).toContain("2 file(s) pushed");
            setTimeout(function() {
                done();
            },3000);
        }, function(data) {
            outputTxt += data;
        });
    });

    it('Copy directory with ignore option', function(done) {
        let outputTxt = "";
        pushOptions.ignore = true;
        push.push(src, '/tmp', pushOptions, function(err, value) {
            expect(value.msg).toContain("Success");
            expect(outputTxt).not.toContain("/tmp/copyFiles/testFile.txt");
            expect(outputTxt).not.toContain("/tmp/copyFiles/helloFile.txt");
            expect(outputTxt).toContain("2 file(s) pushed");
            setTimeout(function() {
                done();
            },3000);
        }, function(data) {
            outputTxt += data;
        });
    });
});

describe(aresCmd + ' negative TC', function() {
    it('Set invaild source path', function(done) {
        push.push(["invalidDir"], '/tmp', pushOptions, function(err) {
            expect(err.toString()).toContain("ENOENT: no such file or directory, lstat");
            expect(err.toString()).toContain("Please check if the path is valid");
            setTimeout(function() {
                done();
            },3000);
        }, function() {
        });
    });
});
