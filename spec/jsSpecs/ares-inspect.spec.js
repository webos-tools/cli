/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const exec = require('child_process').exec,
    common = require('./common-spec');

const aresCmd = 'ares-inspect';

let cmd, 
    options;

beforeAll(function(done) {
    cmd = common.makeCmd(aresCmd);
    common.getOptions()
    .then(function(result) {
        options = result;
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
            expect(stdout).toContain(options.device, error);
            expect(stdout).toContain(options.profile);
            done();
        });
    });
});

describe(aresCmd, function() {
    it('Install sample ipk to device', function(done) {
        const installCmd = common.makeCmd('ares-install');
        exec(installCmd + ` ${options.ipkPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain("Success", stderr);
            setTimeout(() => {
                done();
            }, 2000);
        });
    });
});

describe(aresCmd, function() {
    it('Run web inspector for sample app', function(done) {
        const child = exec(cmd + ` -a ${options.pkgId} -dp 0`);
        let stdoutData = "";

        child.stdout.on('data', function(data) {
            process.stdout.write(data);
            stdoutData += data;
        });

        child.stderr.on('data', function(data) {
            if (data && data.length > 0) {
                common.detectNodeMessage(data);
            }
            expect(data).toBeNull();
        });

        setTimeout(() => {
            child.kill();
            expect(stdoutData).toContain('Application Debugging - http://localhost');
            done();
        }, 7000);
    });

    it('Close sample App', function(done) {
        const launchCmd = common.makeCmd('ares-launch');
        exec(launchCmd + ` -c ${options.pkgId} -dp 0`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Closed application ${options.pkgId}`, error);
            setTimeout(function() {
                done();
            }, 3000);
        });
    });
});

describe(aresCmd +' --open(-o)', function() {
    it('Open web inspector for sample app', function(done) {
        const child = exec(cmd + ` -a ${options.pkgId} -o -dp 1`);
        let stdoutData = "";

        child.stdout.on('data', function(data) {
            process.stdout.write(data);
            stdoutData += data;
        });

        child.stderr.on('data', function(data) {
            if (data && data.length > 0) {
                common.detectNodeMessage(data);
            }
            expect(data).toBeNull();
        });

        setTimeout(() => {
            child.kill();
            expect(stdoutData).toContain('Application Debugging - http://localhost');
            done();
        }, 3000);
    });

    it('Close sample App', function(done) {
        const launchCmd = common.makeCmd('ares-launch');
        exec(launchCmd + ` -c ${options.pkgId} -dp 1`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`Closed application ${options.pkgId}`, error);
            setTimeout(function() {
                done();
            }, 3000);
        });
    });
});

describe(aresCmd, function() {
    let stdoutData = "";

    it('Run Node\'s Inspector for sample Service', function(done) {
        const child = exec(cmd + ` -s ${options.pkgService} -dp 1`);

        child.stdout.on('data', function(data) {
            process.stdout.write(data);
            stdoutData += data;
        });

        child.stderr.on('data', function(data) {
            if (data && data.length > 0) {
                common.detectNodeMessage(data);
            }
            expect(data).toBeNull();
        });

        setTimeout(() => {
            child.kill();
            expect(stdoutData).toContain("[Info] Set target device : " + options.device);
            expect(stdoutData).toContain("Processing");
            expect(stdoutData).not.toContain("null");
            expect(stdoutData).toContain("To debug your service, set ");
            done();
        }, 10000);
    });
});

describe(aresCmd +' --open(-o)', function() {
    let stdoutData = "";

    it('Open Node\'s Inspector for sample Service', function(done) {
        const child = exec(cmd + ` -s ${options.pkgService} -dp 0 -o`);

        child.stdout.on('data', function(data) {
            process.stdout.write(data);
            stdoutData += data;
        });

        child.stderr.on('data', function(data) {
            if (data && data.length > 0) {
                common.detectNodeMessage(data);
            }
            expect(data).toBeNull();
        });

        setTimeout(() => {
            child.kill();
            expect(stdoutData).toContain("To debug your service, set ");
            expect(stdoutData).toContain("Cannot support \"--open option\" on platform node version 8 and later");
            done();
        }, 7000);
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

describe(aresCmd + ' negative TC', function() {
    it("Set invalid app which is not installed", function(done) {
        exec(cmd + ' com.invalid.app', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.profile === "ose") {
                    expect(stderr).toContain("ares-inspect ERR! [com.webos.applicationManager failure]:" +
                                            " luna-send command failed <Cannot find proper launchPoint>");
                    expect(stderr).toContain("ares-inspect ERR! [Tips]: The app is not installed app. Please check the list by ares-install -l");
                } else if (options.profile === "tv") {
                    expect(stderr).toContain("ares-inspect ERR! [com.webos.applicationManager failure]: luna-send command failed <not exist>");
                }
            }
            done();
        });
    });

    it("Set invalid service which is not installed", function(done) {
        exec(cmd + ' -s com.invalid.service', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain("ares-inspect ERR! [Tips]: Failed to get service installation path <com.invalid.service>");
            }
            done();
        });
    });
});
