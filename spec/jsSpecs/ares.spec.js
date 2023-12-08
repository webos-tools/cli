/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    common = require('./common-spec');

const aresCmd = 'ares';

let cmd,
    expectedList;

beforeAll(function(done) {
    cmd = common.makeCmd(aresCmd);
    common.getOptions()
    .then(function() {
        return common.getExpectedResult(aresCmd);
    }).then(function(result) {
        expectedList = result.list;
        done();
    });
});


// ares command test
describe(aresCmd + ' --list(-l)', function() {
    it('Should show all the ares commands', function(done) {
        exec(cmd + ' --list', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            // get expected list
            expectedList = expectedList.join('\n'); // multi string in array. need to join
            stdout = stdout.trim().replace(/\s+['\n']/g, '\n');
            expect(stdout).toBe(expectedList);
            done();
        });
    });
});

describe(aresCmd + ' --version(-v)', function() {
    it('Check version info with package.json', function(done) {
        exec(cmd + ' --version', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            // get CLI version
            const text = fs.readFileSync(path.join(__dirname, "../../", "package.json"), 'utf8');
            const pkgInfoObj = JSON.parse(text);
            const cliVersion = "Version: " + pkgInfoObj.version;
            expect(stdout.trim()).toBe(cliVersion);
            done();
        });
    });
});

describe(aresCmd + ' --<COMMAND>', function() {
    it('Display the help information of the generate', function(done) {
        exec(cmd + ' -generate', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd + ' negative TC', function() {
    it('Set invalid command', function(done) {
        exec(cmd + ` --build`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain("ares ERR! [Tips]: This command is invalid. Please check the supported commands using ares -l");
            }
            done();
        });
    });
});
