/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    exec = require('child_process').exec,
    common = require('./common-spec');

const aresCmd = 'ares-launch',
    sampleAppPath = path.join(__dirname, "..", "tempFiles/sampleApp");

let cmd, 
    options,
    expectedTemplate;

beforeAll(function(done) {
    cmd = common.makeCmd(aresCmd);
    common.getOptions()
    .then(function(result) {
        options = result;
        return common.getExpectedResult("ares-generate");
    }).then(function(result) {
        expectedTemplate = result.template;
        done();
    });
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

describe(aresCmd + ' --device-list(-D)', function() {
    it('Show available device list', function(done) {
        exec(cmd + ' -D', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(options.device);
            expect(stdout).toContain(options.profile);
            done();
        });
    });
});

describe(aresCmd, function() {
    it('Install sample ipk to device with ares-install', function(done) {
        const installCmd = common.makeCmd('ares-install');
        exec(installCmd + ` ${options.ipkPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Success", stderr);
            setTimeout(function() {
                done();
            },3000);
        });
    });
});

describe(aresCmd, function() {
    it('Launch sample App', function(done) {
        exec(cmd + ` ${options.pkgId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("[Info] Set target device : " + options.device);
            expect(stdout).toContain(`Launched application ${options.pkgId}`, error);
            setTimeout(function() {
                done();
            },3000);
        });
    });
});

describe(aresCmd + ' --running(-r)', function() {
    it('Check sample app in running list', function(done) {
        exec(cmd + ' -r', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`${options.pkgId}`);
            done();
        });
    });
});

describe(aresCmd + ' --close(-c)', function() {
    it('Close sample app', function(done) {
        exec(cmd + ` -c ${options.pkgId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`${options.pkgId}`);
            setTimeout(function() {
                done();
            },1000);
        });
    });
});

describe(aresCmd + ' with --display(-dp) option', function() {
    it('Launch sample App', function(done) {
        exec(cmd + ` -dp 1 ${options.pkgId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            if (options.profile === "ose") {
                expect(stdout).toContain("on display 1");
            }
            expect(stdout).toContain(`Launched application ${options.pkgId}`, error);
            setTimeout(function() {
                done();
            },3000);
        });
    });
});

describe(aresCmd + ' --running(-r) with --display(-dp) option', function() {
    it('Check sample app in running list', function(done) {
        exec(cmd + ' -r -dp 1', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            if (options.profile === "ose") {
                expect(stdout).toContain("- display 1");
            }
            expect(stdout).toContain(`${options.pkgId}`);
            done();
        });
    });
});

describe(aresCmd + ' --close(-c) with --display(-dp) option', function() {
    it('Close sample app', function(done) {
        exec(cmd + ` -c -dp 1 ${options.pkgId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            if (options.profile === "ose") {
                expect(stdout).toContain("on display 1");
            }
            expect(stdout).toContain(`${options.pkgId}`);
            setTimeout(function() {
                done();
            },1000);
        });
    });
});

describe(aresCmd + ' with -p "{\'displayAffinity\':1}" option', function() {
    it('Launch sample App', function(done) {
        exec(cmd + ` -p "{'displayAffinity':0}" ${options.pkgId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            if (options.profile === "ose") {
                expect(stdout).toContain("on display 0");
            }
            expect(stdout).toContain(`Launched application ${options.pkgId}`, error);
            setTimeout(function() {
                done();
            },3000);
        });
    });
});

describe(aresCmd + ' --close(-c) p "{\'displayAffinity\':1}" option', function() {
    it('Close sample app', function(done) {
        exec(cmd + ` -c -p "{'displayAffinity':0}" ${options.pkgId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            if (options.profile === "ose") {
                expect(stdout).toContain("on display 0");
            }
            expect(stdout).toContain(`${options.pkgId}`);
            setTimeout(function() {
                done();
            },1000);
        });
    });
});

describe(aresCmd, function() {
    it('Remove installed sample app with ares-install', function(done) {
        const installCmd = common.makeCmd('ares-install');
        exec(installCmd + ` -r ${options.pkgId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Removed package ${options.pkgId}`, stderr);
            done();
        });
    });
});

describe(aresCmd +' --hosted(-H)', function() {
    beforeAll(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });
    afterAll(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    it('Generate SampleApp', function(done) {
        const generateCmd = common.makeCmd('ares-generate');
        const appId = options.profile === "signage" ? "com.lg.app.signage.dev" : "com.sample.app";
        exec(generateCmd + ` -t ${expectedTemplate.webapp} -p id=${appId} ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Generating ${expectedTemplate.webapp}`);
            expect(error).toBeNull();
            done();
        });
    });

    it('Launch -H SampleApp', function(done) {
        let stdoutData = "";
        const child = exec(cmd + ` -H ${sampleAppPath}`);
        
        child.stdout.on('data', function(data) {
            process.stdout.write(data);
            stdoutData += data;
        });

        child.stderr.on('data', function(data) {
            if (data && data.length > 0) {
                common.detectNodeMessage(data);
            }
        });

        setTimeout(() => {
            child.kill();
            expect(stdoutData).toContain('Ares Hosted App is now running');
            done();
        }, 3000);
    });


    it('Remove installed ares-hosted app with ares-install', function(done) {
        const installCmd = common.makeCmd('ares-install');
        const appId = options.profile === "signage" ? "com.lg.app.signage.dev" : "com.sdk.ares.hostedapp";
        exec(installCmd + ` -r ${appId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Removed package ${appId}`, stderr);
            done();
        });
    });
});

describe(aresCmd + ' negative TC', function() {
    it("Close a invalid app ipk which is not running", function(done) {
        exec(cmd + ' -c com.invalid.app', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.profile === "ose") {
                    expect(stderr).toContain("ares-launch ERR! [com.webos.applicationManager failure]: luna-send command failed <com.invalid.app is not running>");
                    expect(stderr).toContain("ares-launch ERR! [Tips]: Please check the list of running apps using ares-launch -r");
                } else if (options.profile === "tv") {
                    expect(stderr).toContain("ares-launch ERR! [com.webos.applicationManager failure]: luna-send command failed <Invalid appId specified: com.invalid.app>");
                }
            }
            done();
        });
    });
});
