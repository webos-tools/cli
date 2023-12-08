/*
 * Copyright (c) 2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
const path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    common = require('../common-spec'),
    Packager = require('../../../lib/package');

const packager = new Packager.Packager(),
    tempDirPath = path.join(__dirname, "../..", "tempFiles"),
    sampleAppPath = path.join(tempDirPath, "sampleApp"),
    sampleServicePath =  path.join(tempDirPath, "sampleService"),
    outputPath = path.join(tempDirPath, "output"),
    appPathByRom = path.join(outputPath, "usr/palm/applications"),
    appPkgPath = path.join(outputPath, "com.webos.sample.app_1.0.0_all.ipk"),
    ipkBasePath = path.join(tempDirPath, "ipks");

const aresCmd = 'Packager',
    sampleServicePaths = [],
    packageOptions = {};

let expectedTemplate;

beforeAll(function(done) {
    common.getExpectedResult("ares-generate")
    .then(function(result) {
        expectedTemplate = result.template;
        done();
    });
});

afterAll(function(done) {
    common.removeOutDir(sampleAppPath); // can be in afterAll
    common.removeOutDir(sampleServicePath); // can be in afterAll
    done();
});

describe("Test setting", function() {
    it('Generate a sample app for packaging', function(done) {
        common.removeOutDir(sampleAppPath);
        const generateCmd = common.makeCmd('ares-generate');
        exec(generateCmd + ` -t ${expectedTemplate.webapp} -p "id=com.webos.sample.app" -p "version=1.0.0" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Generating");
            expect(error).toBeNull();
            done();
        });
    });

    it('Generate two sample services for packaging', function(done) {
        common.removeOutDir(sampleServicePath);
        const serviceid = ["com.webos.sample.app.service", "com.webos.sample.service1", "com.webos.sample.service2"];
        serviceid.forEach(function(svcId) {
            const svcPath = path.join(sampleServicePath, svcId);
            sampleServicePaths.push(path.join(sampleServicePath, svcId));
            const generateCmd = common.makeCmd('ares-generate');
            exec(generateCmd + ` -t ${expectedTemplate.jsservice} -s ${svcId} ${svcPath}`, function(error, stdout, stderr) {
                if (stderr && stderr.length > 0) {
                    common.detectNodeMessage(stderr);
                }
                expect(stdout).toContain("Generating");
                done();
            });
        });
    });
});

describe(aresCmd + '.generatePackage()', function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });
    afterEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Package web app with -o(--outdir)', function(done) {
        packager.generatePackage([`${sampleAppPath}`], outputPath, packageOptions, function(data) {
            expect(data).toContain("Create");
        }, function(err, value) {
            expect(value.msg).toContain("Success");
            expect(fs.existsSync(appPkgPath)).toBe(true);
            setTimeout(function() {
                done();
            },3000);
        });
    });

    it('Package web app & service with -o(--outdir)', function(done) {
        const source = [sampleAppPath.toString(), sampleServicePaths[0].toString()];
        packager.generatePackage(source, outputPath, packageOptions, function(data) {
            expect(data).toContain("Create");
        }, function(err, value) {
            expect(value.msg).toContain("Success");
            expect(fs.existsSync(appPkgPath)).toBe(true);
            setTimeout(function() {
                done();
            },3000);
        });
    });

    it('Create output a directory structure with app', function(done) {
        const source = [sampleAppPath.toString(), sampleServicePaths[0].toString()];
        packageOptions.rom = true;
        packager.generatePackage(source, outputPath, packageOptions, function(data) {
            expect(data).toContain("Create output directory");
        }, function(err, value) {
            expect(value.msg).toContain("Success");
            setTimeout(function() {
                const createdSvcPath = path.join(outputPath, 'usr/palm/services');
                expect(fs.existsSync(appPathByRom)).toBe(true);
                expect(fs.existsSync(createdSvcPath)).toBe(true);
                done();
            },3000);
            delete packageOptions.rom;
        });
    });
});

describe(aresCmd + '.generatePackage()', function() {
    const tmpFilePath = path.join(sampleAppPath, "tmpFile");
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        fs.writeFileSync(tmpFilePath, "", 'utf8');
        done();
    });

    afterEach(function(done) {
        common.removeOutDir(tmpFilePath);
        common.removeOutDir(outputPath);
        done();
    });

    it('Check exclude file option', function(done) {
        let outputData="";
        packageOptions.rom = true;
        packageOptions.excludefiles = "tmpFile";
        packager.generatePackage([`${sampleAppPath}`], outputPath, packageOptions, function(data) {
            outputData += data;
        }, function(err, value) {
            expect(outputData).toContain("Create");
            expect(value.msg).toContain("Success");
            expect(fs.existsSync(path.join(appPathByRom, "com.webos.sample.app/tmpFile"))).toBe(false);
            done();
            delete packageOptions.excludefiles;
            delete packageOptions.rom;
        });
    });
});

describe(aresCmd + ".analyzeIPK()", function() { 
    it('Info of web app and service package with info', function(done) {
        const webIpk= path.join(ipkBasePath, "com.web.app_1.0.0_all.ipk");
        packageOptions.info = webIpk;
        packager.analyzeIPK(packageOptions, function(err, value) {
            expect(value.msg).toContain("< Package Information >");
            expect(value.msg).toContain("< Application Information >");
            expect(value.msg).toContain("< Service Information >");
            done();
            delete packageOptions.info;
        });
    });

    it('Info of web app and service package with infodetail', function(done) {
        const webIpk= path.join(ipkBasePath, "com.web.app_1.0.0_all.ipk");
        packageOptions.infodetail = webIpk;
        packager.analyzeIPK(packageOptions, function(err, value) {
            expect(value.msg).toContain("< packageinfo.json >");
            expect(value.msg).toContain("< appinfo.json >");
            expect(value.msg).toContain("< services.json >");
            expect(value.msg).toContain("< package.json >");
            done();
            delete packageOptions.infodetail;
        });
    });

    it('Info of external native app and service package', function(done) {
        const externalAppIpk= path.join(ipkBasePath, "com.sample.echo_0.0.1_all.ipk");
        packageOptions.info = externalAppIpk;
        packager.analyzeIPK(packageOptions, function(err, value) {
            expect(value.msg).toContain("< Package Information >");
            expect(value.msg).toContain("< Application Information >");
            expect(value.msg).toContain("< Service Information >");
            done();
            delete packageOptions.info;
        });
    });
});
