/*
 * Copyright (c) 2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    exec = require('child_process').exec,
    common = require('../common-spec'),
    launcher = require('../../../lib/launch');

const aresCmd = 'Launcher',
    sampleAppPath = path.join(__dirname, "../..", "tempFiles/sampleApp"),
    launchOptions = {
        display: 0
    };

let options,
    expectedTemplate;

beforeAll(function(done) {
    common.getOptions()
    .then(function(result){
        options = result;
        return common.getExpectedResult("ares-generate");
    }).then(function(result){
        expectedTemplate = result.template;
        done();
    });
});

describe("Test setting", function() {
    it("Add device with ares-setup-device", function(done) {
        common.resetDeviceList()
        .then(function(){
            return common.addDeviceInfo();
        }).then(function(result) {
            expect(result).toContain(options.device);
            done();
        }).catch(function(err) {
            expect(err).toContain("The specified value already exist");
            done();
        });
    });

    it('Install sample ipk to device with ares-install', function(done) {
        const installCmd = common.makeCmd('ares-install');
        exec(installCmd + ` ${options.ipkPath}`, function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Success");
            setTimeout(function(){
                done();
            },3000);
        });
    });
});


describe(aresCmd + '.launch()', function() {
    it('Launch sample App', function(done) {
        launcher.launch(launchOptions, options.pkgId, {}, function(err, value){
            expect(value.msg).toContain(`Launched application ${options.pkgId}`);
            setTimeout(function(){
                done();
            },1000);
        });
       
    });
});

describe(aresCmd + '.listRunningApp()', function() {
    it('List up sample app', function(done) {
        launcher.listRunningApp(launchOptions, function(err, value){
            expect(JSON.stringify(value)).toContain(`${options.pkgId}`);
            done();
        });
    });
});

describe(aresCmd + '.close()', function() {
    it('Close sample app', function(done) {
        launcher.close(launchOptions, options.pkgId, {}, function(err, value){
            expect(value.msg).toContain(`${options.pkgId}`);
            done();
        });
    });
});

describe("Test setting", function() {
    it('Remove installed sample app with ares-install', function(done) {
        const installCmd = common.makeCmd('ares-install');
        exec(installCmd + ` -r ${options.pkgId}`, function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Removed package ${options.pkgId}`);
            done();
        });
    });
});

describe(aresCmd + '.launch() with hosted option', function() {
    beforeAll(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });
    afterAll(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    it('Test setting: Generate SampleApp', function(done) {
        const generateCmd = common.makeCmd('ares-generate');
        exec(generateCmd + ` -t ${expectedTemplate.webapp} -p "id=com.sample.app" ${sampleAppPath}`, function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Generating ${expectedTemplate.webapp}`);
            expect(error).toBeNull();
            done();
        });
    });

    it(aresCmd + '.launch() with hosted option', function(done) {
        let outputData="";
        launchOptions.installMode = "Hosted";
        launchOptions.hostedurl = `${sampleAppPath}`;
        launcher.launch(launchOptions, "com.sdk.ares.hostedapp", {}, function(){
        }, function(output){
            outputData += output;
            setTimeout(function(){
                expect(outputData).toContain('Ares Hosted App is now running');
                done();
            },5000);
        });
    });

    it('Test setting: Remove installed ares-hosted app with ares-install', function(done) {
        const installCmd = common.makeCmd('ares-install');
        exec(installCmd + ' -r com.sdk.ares.hostedapp', function (error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Removed package com.sdk.ares.hostedapp`);
            done();
        });
    });
});
