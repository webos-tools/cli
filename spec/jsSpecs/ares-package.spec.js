/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    common = require('./common-spec');

const tempDirPath = path.join(__dirname, "..", "tempFiles"),
    sampleAppPath = path.join(tempDirPath, "sampleApp"),
    sampleServicePath = path.join(tempDirPath, "sampleService"),
    sampleResourcePath = path.join(tempDirPath, "sampleResource"),
    nativeDirPath = path.join(tempDirPath, "nativeApp"),
    pkgInfoPath = path.join(tempDirPath, "packageinfo.json"),
    outputPath = path.join(tempDirPath, "output"),
    appPathByRom = path.join(outputPath, "usr/palm/applications"),
    appPkgPath = path.join(outputPath, "com.webos.sample.app_1.0.0_all.ipk"),
    svcPkgPath = path.join(outputPath, "com.webos.sample_1.0.0_all.ipk"),
    appinfoPath = path.join(sampleAppPath, "appinfo.json"),
    signKeyPath = path.join(tempDirPath, "sign/signPriv.key"),
    crtPath = path.join(tempDirPath,"sign/sign.crt"),
    ipkBasePath = path.join(tempDirPath, "ipks"),
    pkgDirPath = path.join(tempDirPath, "pkgDir");

const aresCmd = 'ares-package',
    sampleServicePaths = [];

let cmd,
    expectedTemplate;

beforeAll(function(done) {
    cmd = common.makeCmd(aresCmd);
    common.getExpectedResult("ares-generate")
    .then(function(result) {
        expectedTemplate = result.template;
        done();
    });
});

afterAll(function(done) {
    common.removeOutDir(sampleAppPath); // can be in afterAll
    common.removeOutDir(sampleServicePath); // can be in afterAll
    common.removeOutDir(pkgInfoPath);
    common.removeOutDir(pkgDirPath);
    done();
});

describe(aresCmd + ' -v', function() {
    it('Print help message with verbose log', function(done) {
        exec(cmd + ' -v', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain("verb argv");
            }
            expect(stdout).toContain("SYNOPSIS");
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd, function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    it('Generate a sample app for packaging', function(done) {
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
});

describe(aresCmd, function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleServicePath);
        done();
    });

    it('Generate two sample services for packaging', function(done) {
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

describe(aresCmd, function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });
    afterEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Package web app with -o(--outdir)', function(done) {
        exec(cmd + ` ${sampleAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(appPkgPath)).toBe(true);
            done();
        });
    });
});

describe(aresCmd, function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Package web app & service with -o(--outdir)', function(done) {
        exec(cmd + ` ${sampleAppPath} ${sampleServicePaths[0]} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(outputPath);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(appPkgPath)).toBe(true);
            done();
        });
    });
});

describe(aresCmd, function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);

        const appinfo = {
            "id": "com.webos.sample.app",
            "vendor": "My Company",
            "type": "web",
            "main": "index.html",
            "title": "new app",
            "icon": "icon.png"
        };
        fs.writeFileSync(appinfoPath, JSON.stringify(appinfo), 'utf8');
        done();
    });

    it('App version does not exist', function(done) {
        exec(cmd + ` ${sampleAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(appPkgPath)).toBe(true);
            done();
        });
    });
});

describe(aresCmd, function() {
    const expectedFilePath = path.join(outputPath, "com.webos.sample_1.0.0_all.ipk");
    beforeAll(function(done) {
        common.removeOutDir(pkgInfoPath);
        const pkgInfo = {
            "id": "com.webos.sample",
            "version": "1.0.0"
        };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');
        done();
    });

    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);
        done();
    });

    it('Package web app with -pi option', function(done) {
        exec(cmd + ` ${sampleAppPath} -pi com.webos.sample -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(expectedFilePath)).toBe(true);
            done();
        });
    });

    it('Package web app with -pf option', function(done) {
        exec(cmd + ` ${sampleAppPath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(expectedFilePath)).toBe(true);
            done();
        });
    });
});

describe(aresCmd + ' --pkginfofile(-pf)', function() {
    const pkgPath = path.join(outputPath, "com_1.0.0_all.ipk");
    beforeAll(function(done) {
        common.removeOutDir(pkgInfoPath);
        common.removeOutDir(outputPath);
        const pkginfo = {
            "id":"com",
            "version":"1.0.0"
        };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkginfo), 'utf8');
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(pkgInfoPath);
        common.removeOutDir(outputPath);
        done();
    });

    it('Package web app by packageinfo.json and -o(--outdir)', function(done) {
        exec(cmd + ` ${sampleAppPath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(outputPath);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(pkgPath)).toBe(true);
            done();
        });
    });

    it('Check to exist app field in packageinfo.json', function(done) {
        exec(cmd + ` -I ${pkgPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain('"app": "com.webos.sample.app"');
            done();
        });
    });
});

describe(aresCmd, function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Package ose native app with -o(--outdir)', function(done) {
        const nativeAppPath = path.join(nativeDirPath, "ose/pkg_arm");
        const expectIpkName = "com.ose.target.native_1.0.0_arm.ipk";
        const expectIpkPath = path.join(outputPath, expectIpkName);

        exec(cmd + ` ${nativeAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(stdout).toContain(expectIpkName, error);
            expect(fs.existsSync(expectIpkPath)).toBe(true, error);
            done();
        });
    });

    // emulator
    it('Package ose emulator native app with -o(--outdir)', function(done) {
        const nativeAppPath = path.join(nativeDirPath, "oseEmul/pkg_x86");
        const expectIpkName = "com.ose.emul.native_1.0.0_x86.ipk";
        const expectIpkPath = path.join(outputPath, expectIpkName);

        exec(cmd + ` ${nativeAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(stdout).toContain(expectIpkName, error);
            expect(fs.existsSync(expectIpkPath)).toBe(true, error);
            done();
        });
    });

    // arm64 target
    it('Package auto native app with -o(--outdir)', function(done) {
        const nativeAppPath = path.join(nativeDirPath, "auto/pkg_arm64");
        const expectIpkName = "com.sample.gles2_1.0.0_aarch64.ipk";
        const expectIpkPath = path.join(outputPath, expectIpkName);

        exec(cmd + ` ${nativeAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(stdout).toContain(expectIpkName, error);
            expect(fs.existsSync(expectIpkPath)).toBe(true, error);
            done();
        });
    });

    // rsi target
    it('Package rsi native app with -o(--outdir)', function(done) {
        const nativeAppPath = path.join(nativeDirPath, "rsi/pkg_x86");
        const expectIpkName = "com.sample.gles2_1.0.0_x86_64.ipk";
        const expectIpkPath = path.join(outputPath, expectIpkName);

        exec(cmd + ` ${nativeAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(stdout).toContain(expectIpkName, error);
            expect(fs.existsSync(expectIpkPath)).toBe(true, error);
            done();
        });
    });
});

describe(aresCmd, function() {
    beforeAll(function(done) {
        common.removeOutDir(pkgInfoPath);

        const pkginfo = {
            "id": "com.webos.sample",
            "version": "1.0.0"
        };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkginfo), 'utf8');
        done();
    });

    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);
        done();
    });

    it('Package only service with -pi and -o(--outdir)', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${sampleServicePaths[2]} -pi com.webos.sample -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(outputPath);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(svcPkgPath)).toBe(true);
            done();
        });
    });

    it('Package only service with -pf and -o(--outdir)', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${sampleServicePaths[2]} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(outputPath);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(svcPkgPath)).toBe(true);
            done();
        });
    });

    it('Package service with -pf and -pv', function(done) {
        const expectedTmpFile = path.join(outputPath,"com.webos.sample_1.1.1_all.ipk");
        exec(cmd + ` ${sampleServicePaths[0]} -pf ${pkgInfoPath} -pv 1.1.1 -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(outputPath);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(expectedTmpFile)).toBe(true);
            done();
        });
    });
});

describe(aresCmd + ' --check(-c)', function() {
    it('Check the application but do not pacakge', function(done) {
        exec(cmd + ` -c ${sampleAppPath} ${sampleServicePaths[0]}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("no problems detected");
            done();
        });
    });
    it('Check the services but do not pacakge', function(done) {
        exec(cmd + ` -c ${sampleServicePaths[1]} ${sampleServicePaths[2]} -pi com.webos.sample`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("no problems detected");
            done();
        });
    });
});

describe(aresCmd + ' --rom(-r)', function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Create output a directory structure with app', function(done) {
        exec(cmd + ` -r ${sampleAppPath} ${sampleServicePaths[0]} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            const createdSvcPath = path.join(outputPath, 'usr/palm/services');
            expect(stdout).toContain('Create output directory');
            expect(fs.existsSync(appPathByRom)).toBe(true);
            expect(fs.existsSync(createdSvcPath)).toBe(true);
            done();
        });
    });

    it('Create output a directory structure without app', function(done) {
        exec(cmd + ` -r ${sampleServicePaths[1]} ${sampleServicePaths[2]} -pi com.webos.sample -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            const createdSvcPath = path.join(outputPath, 'usr/palm/services');
            expect(stdout).toContain('Create output directory');
            expect(fs.existsSync(createdSvcPath)).toBe(true);
            done();
        });
    });
});

describe(aresCmd + ' --encrypt(-enc)', function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Encrypted ipk', function(done) {
        exec(cmd + ` -enc ${sampleAppPath} ${sampleServicePaths[0]} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain("ares-package ERR! [syscall failure]: ENOENT: no such file or directory, open", error);
                expect(stderr).toContain("ares-package ERR! [Tips]: Please check if the path is valid", error);
            }
            expect(fs.existsSync(appPkgPath)).toBe(false);
            done();
        });
    });
});

describe(aresCmd + ' --sign(-s) & --certificate(-crt)', function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Sign ipk', function(done) {
        exec(cmd +` -s ${signKeyPath} -crt ${crtPath} ${sampleAppPath} ${sampleServicePaths[0]} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain('Create signed', error);
            expect(fs.existsSync(appPkgPath)).toBe(true);
            done();
        });
    });
});

describe(aresCmd + ' --app-exclude(-e)', function() {
    const tmpFilePath = path.join(sampleAppPath,"tmpFile");

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

    it('Check the application but do not pacakge', function(done) {
        exec(cmd + ` -e tmpFile ${sampleAppPath} -r -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Success");
            expect(fs.existsSync(path.join(appPathByRom, "com.webos.sample.app/tmpFile"))).toBe(false);
            done();
        });
    });
});

describe(aresCmd, function() {
    const pkgInfo = {
        "id": "com",
        "version": "2.2.2"
    };

    beforeAll(function(done) {
        common.createOutDir(sampleResourcePath);

        const rscInfoDirPath = path.join(sampleResourcePath, "resourceinfo.json"),
            rscInfo = {
                "id": "com.domain.app.resource",
                "bindmountPath": "abcd"
            };
        fs.writeFileSync(rscInfoDirPath, JSON.stringify(rscInfo), 'utf8');
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');
        done();
    });

    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);
        common.removeOutDir(sampleResourcePath);
        done();
    });

    it('Package resource with -pi and -o(--outdir)', function(done) {
        const expectedPiPkgPath = path.join(outputPath, "com_1.0.0_all.ipk");

        exec(cmd + ` ${sampleResourcePath} -pi com -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(expectedPiPkgPath)).toBe(true);
            done();
        });
    });

    it('Package resource with -pf and -o(--outdir)', function(done) {
        const expectedPfPkgPath = path.join(outputPath, "com_2.2.2_all.ipk");

        exec(cmd + ` ${sampleResourcePath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(expectedPfPkgPath)).toBe(true);
            done();
        });
    });

    it('Package resource with -pf(App version does not exist in packageinfo.json) and -o(--outdir)', function(done) {
        const expectedPfPkgPath = path.join(outputPath, "com_1.0.0_all.ipk");
        common.removeOutDir(pkgInfoPath);
        delete pkgInfo.version;
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');

        exec(cmd + ` ${sampleResourcePath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Create", error);
            expect(stdout).toContain("Success", error);
            expect(fs.existsSync(expectedPfPkgPath)).toBe(true);
            done();
        });
    });
});

describe(aresCmd + ' negative TC for app packaging', function() {
    beforeEach(function(done) {
        const appinfo = {
            "version": "1.0.0",
            "vendor": "My Company",
            "type": "web",
            "main": "index.html",
            "title": "new app",
            "icon": "icon.png"
        };
        fs.writeFileSync(appinfoPath, JSON.stringify(appinfo), 'utf8');
        done();
    });

    it('Check to exist app id', function(done) {
        exec(cmd + ` ${sampleAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr = stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Please input required field <id>", error);
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for app packaging', function() {
    beforeEach(function(done) {
        const appinfo = {
            "id": "com.domain.app",
            "version": "1.0.0",
            "vendor": "My Company"
        };
        fs.writeFileSync(appinfoPath, JSON.stringify(appinfo), 'utf8');
        done();
    });

    it('Check to exist required fields in app meta file', function(done) {
        exec(cmd + ` ${sampleAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr = stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Invalid file <appinfo.json> :");
                expect(stderr).toContain("ares-package ERR! [Tips]: main is required");
                expect(stderr).toContain("ares-package ERR! [Tips]: title is required");
                expect(stderr).toContain("ares-package ERR! [Tips]: icon is required");
                expect(stderr).toContain("ares-package ERR! [Tips]: type is required");
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for app packaging', function() {
    beforeEach(function(done) {
        const appinfo = {
            "id": "com.domain.app",
            "version": "1.0.0",
            "vendor": "My Company",
            "type": "invalidType",
            "main": "index.html",
            "title": "new app",
            "icon": "icon.png"
        };
        fs.writeFileSync(appinfoPath, JSON.stringify(appinfo), 'utf8');
        done();
    });

    it('Check to invalid app type', function(done) {
        exec(cmd + ` ${sampleAppPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr = stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Invalid file <appinfo.json> :");
                expect(stderr).toContain("ares-package ERR! [Tips]: type is not one of enum values: " +
                                         "web,stub,native,native_builtin,native_appshell,qml", error);
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for app packaging', function() {
    beforeAll(function(done) {
        common.removeOutDir(pkgInfoPath);
        common.createOutDir(pkgDirPath);

        const pkgDirInfoPath = path.join(pkgDirPath, "packageinfo.json"),
            pkgInfo = {
                "id": "com.test",
                "version": "1.0.0"
            };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');
        fs.writeFileSync(pkgDirInfoPath, JSON.stringify(pkgInfo), 'utf8');
        done();
    });

    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);
        common.removeOutDir(pkgDirPath);
        done();
    });

    it('Check to invalid app id with -pi option', function(done) {
        exec(cmd + ` ${sampleAppPath} -pi com.test -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! Error: Invalid value <id> : com.domain.app", error);
                expect(stderr).toContain("ares-package ERR! [Tips]: App ID must start with package ID <com.test>", error);
            }
            done();
        });
    });

    it('Check to invalid app id with -pf option', function(done) {
        exec(cmd + ` ${sampleAppPath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! Error: Invalid value <id> : com.domain.app", error);
                expect(stderr).toContain("ares-package ERR! [Tips]: App ID must start with package ID <com.test>", error);
            }
            done();
        });
    });

    it('Check to do not support with -pi and -pf options together', function(done) {
        exec(cmd + ` ${sampleAppPath} -pf ${pkgInfoPath} -pi com.webos.sample -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Do not use together with options <pkginfofile, pkgid>", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir', function(done) {
        exec(cmd + ` ${sampleAppPath} ${pkgDirPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir and -pi options together', function(done) {
        exec(cmd + ` ${sampleAppPath} ${pkgDirPath} -pi com -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir and -pf options together', function(done) {
        exec(cmd + ` ${sampleAppPath} ${pkgDirPath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });
 });

describe(aresCmd + ' negative TC for services packaging', function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    it('Check to exist pi option', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${sampleServicePaths[2]} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: packageId must be provided by using either the '--pkgid' or the '--pkginfofile' option", error);
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for services packaging', function() {
    beforeEach(function(done) {
        common.removeOutDir(outputPath);

        const pkgInfo = {
            "id": "com.webos.sample",
            "version": "1.0.0"
        };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');
        done();
    });

    afterEach(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);
        done();
    });

    it('Check to do not support -pi and -pf options together', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${sampleServicePaths[2]} -pf ${pkgInfoPath} -pi com.webos.sample -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Do not use together with options <pkginfofile, pkgid>", error);
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for services packaging', function() {
    const tmpPath = path.join(tempDirPath, "pkg.json");

    beforeEach(function(done) {
        common.removeOutDir(outputPath);

        const pkginfo = {
            "id": "com.webos.sample",
            "version": "1.0.0"
        };
        fs.writeFileSync(tmpPath, JSON.stringify(pkginfo), 'utf8');
        done();
    });

    afterEach(function(done) {
        common.removeOutDir(tmpPath);
        done();
    });

    it('Check to file name of package meta file', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${sampleServicePaths[2]} -pf ${tmpPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Invalid file <packageinfo.json>", error);
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for services packaging', function() {
    const tmpPath = path.join(tempDirPath, "pkg.json");

    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);

        const pkginfo = {
            "version": "1.0.0"
        };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkginfo), 'utf8');
        done();
    });

    afterEach(function(done) {
        common.removeOutDir(tmpPath);
        done();
    });

    it('Check to exist id fields in pkg meta file', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${sampleServicePaths[2]} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Please input required field <id>", error);
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for services packaging', function() {
    beforeAll(function(done) {
        common.createOutDir(pkgDirPath);

        const pkgDirInfoPath = path.join(pkgDirPath, "packageinfo.json"),
            pkgInfo = {
                "id": "com.test"
            };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');
        fs.writeFileSync(pkgDirInfoPath, JSON.stringify(pkgInfo), 'utf8');
        done();
    });

    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);
        common.removeOutDir(pkgDirPath);
        done();
    });

    it('Check to invalid service id with -pi option', function(done) {
        exec(cmd + ` ${sampleServicePaths[0]} -pi com.test -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: ServiceID must start with package id <com.test>", error);
            }
            done();
        });
    });

    it('Check to invalid service id with -pf option', function(done) {
        exec(cmd + ` ${sampleServicePaths[0]} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: ServiceID must start with package id <com.test>", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${pkgDirPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir and -pi options together', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${pkgDirPath} -pi com -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir and -pf options together', function(done) {
        exec(cmd + ` ${sampleServicePaths[1]} ${pkgDirPath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });
});

describe(aresCmd + ' negative TC for resource packaging', function() {
    const pkgInfo = {
        "id": "com.test",
        "version": "2.2.2"
    };

    beforeAll(function(done) {
        common.removeOutDir(pkgInfoPath);
        common.createOutDir(pkgDirPath);
        common.createOutDir(sampleResourcePath);

        const pkgDirInfoPath = path.join(pkgDirPath, "packageinfo.json"),
            rscInfoDirPath = path.join(sampleResourcePath, "resourceinfo.json"),
            pkgDirInfo = {
                "id": "com.domain"
            },
            rscInfo = {
                "id": "com.domain.app.resource",
                "bindmountPath": "abcd"
            };
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');
        fs.writeFileSync(pkgDirInfoPath, JSON.stringify(pkgDirInfo), 'utf8');
        fs.writeFileSync(rscInfoDirPath, JSON.stringify(rscInfo), 'utf8');
        done();
    });

    beforeEach(function(done) {
        common.removeOutDir(outputPath);
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(outputPath);
        common.removeOutDir(pkgInfoPath);
        common.removeOutDir(pkgDirPath);
        common.removeOutDir(sampleResourcePath);
        done();
    });

    it('Check to exist pi option', function(done) {
        exec(cmd + ` ${sampleResourcePath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: packageId must be provided by using either the '--pkgid' or the '--pkginfofile' option", error);
            }
            done();
        });
    });

    it('Check to invalid resource id with -pi option', function(done) {
        exec(cmd + ` ${sampleResourcePath} -pi com.test -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Resource ID must start with package ID <com.test>", error);
            }
            done();
        });
    });

    it('Check to invalid resource id with -pf option', function(done) {
        exec(cmd + ` ${sampleResourcePath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Resource ID must start with package ID <com.test>", error);
            }
            done();
        });
    });

    it('Check to do not support with -pi and -pf options together', function(done) {
        exec(cmd + ` ${sampleResourcePath} -pi com -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Do not use together with options <pkginfofile, pkgid>", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir', function(done) {
        exec(cmd + ` ${sampleResourcePath} ${pkgDirPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir and -pi options together', function(done) {
        exec(cmd + ` ${sampleResourcePath} ${pkgDirPath} -pi com -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });

    it('Check to do not support with pkgdir and -pf options together', function(done) {
        exec(cmd + ` ${sampleResourcePath} ${pkgDirPath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package the directory with pkgdir", error);
            }
            done();
        });
    });

    it('Check to cannot package with app', function(done) {
        exec(cmd + ` ${sampleAppPath} ${sampleResourcePath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package app/service with resource", error);
            }
            done();
        });
    });

    it('Check to cannot package with service', function(done) {
        exec(cmd + ` ${sampleServicePaths[0]} ${sampleResourcePath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package app/service with resource", error);
            }
            done();
        });
    });

    it('Check to cannot package with app and service', function(done) {
        exec(cmd + ` ${sampleAppPath} ${sampleServicePaths[0]} ${sampleResourcePath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Cannot package app/service with resource", error);
            }
            done();
        });
    });

    it('Check to exist id fields in pkg meta file', function(done) {
        common.removeOutDir(pkgInfoPath);
        delete pkgInfo.id;
        fs.writeFileSync(pkgInfoPath, JSON.stringify(pkgInfo), 'utf8');

        exec(cmd + ` ${sampleResourcePath} -pf ${pkgInfoPath} -o ${outputPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                stderr = stderr.trim().replace(/\s+['\n']/g, '\n');
                expect(stderr).toContain("ares-package ERR! [Tips]: Please input required field <id>", error);
            }
            done();
        });
    });
});

describe(aresCmd + " info/info-detail options", function() {
    it('Info of web app and service package', function(done) {
        const webIpk = path.join(ipkBasePath, "com.web.app_1.0.0_all.ipk");

        exec(cmd + ` -I ${webIpk}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("< packageinfo.json >");
            expect(stdout).toContain("< appinfo.json >");
            expect(stdout).toContain("< services.json >");
            expect(stdout).toContain("< package.json >");
            done();
        });
    });

    it('Info of external native app and service package', function(done) {
        const externalAppIpk = path.join(ipkBasePath, "com.sample.echo_0.0.1_all.ipk");

        exec(cmd + ` -i ${externalAppIpk}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("< Package Information >");
            expect(stdout).toContain("< Application Information >");
            expect(stdout).toContain("< Service Information >");
            done();
        });
    });

    it('nagetive TC for not support file extension', function(done) {
        exec(cmd + ` -i aaa`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stderr).toContain("ares-package ERR! [Tips]: Only .ipk file is supported. Please check the file extension <aaa>");
            done();
        });
    });

    it('nagetive TC for not exist ipk file', function(done) {
        exec(cmd + ` -i aaa.ipk`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stderr).toContain("ares-package ERR! [Tips]: The specified path does not exist <aaa.ipk>");
            done();
        });
    });

    it('nagetive TC for not exist parameter', function(done) {
        exec(cmd + ` -i`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stderr).toContain("ares-package ERR! [Tips]: Please specify a value <info>");
            done();
        });
    });
});
