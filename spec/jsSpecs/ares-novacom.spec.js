/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs'),
    exec = require('child_process').exec,
    common = require('./common-spec');

const aresCmd = 'ares-novacom';

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
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

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
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

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
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

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

describe(aresCmd + ' --getKey', function() {
    it('Get a ssh key from the running Developer Mode app on the DEVICE', function(done) {
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

        exec(cmd + ` -k -pass ${options.passPhrase} -d ${options.device}`, function(error, stdout, stderr) {
            let tmpstd="",
                expectedFilePath="";

            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            
            tmpstd=stdout.split(": ");
            expectedFilePath=tmpstd[1].split("\n");
            expect(fs.existsSync(expectedFilePath[0])).toBe(true);            
            done();
        });
    });
});

describe(aresCmd + ' --run', function() {
    it('Run ps -aux command on the DEVICE', function(done) {
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

        exec(cmd + ` --run "ps -aux" -d ${options.device}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            const keys = ["USER","PID","%CPU","%MEM","VSZ","RSS","TTY","STAT","START","TIME","COMMAND"];
            keys.forEach(function(key) {
                expect(stdout).toContain(key);
            });
            done();
        });
    });
});

describe(aresCmd + ' --forwrad', function() {
    it('Forward the DEVICE tcp port to the host tcp port', function(done) {
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

        const hostPort = Math.floor((Math.random()*(50000 - 10000 + 1)) + 10000),
            child = exec(cmd + ` --forward --port 22:${hostPort}`);
        let stdoutData ="";

        child.stdout.on('data',function(data) {
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
            expect(stdoutData).toContain("forward running");         
            child.kill();
            done();  
        }, 10000);
    });
});
