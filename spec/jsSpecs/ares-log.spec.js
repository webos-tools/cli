/*
 * Copyright (c) 2021-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-useless-escape */

const exec = require('child_process').exec,
    path = require('path'),
    fs = require('fs'),
    common = require('./common-spec');

const aresCmd = 'ares-log',
    savedlogPath = path.join(__dirname, "..", "tempFiles", "savedlog.log"),
    journalLogRegExp = /\w+ \d+ \d\d:\d\d:\d\d [\w\d\-]+ [\w\d\.\-]+\[\d+]:/g,
    pmLogRegExp = /\d*-\d*-\d*T\d*:\d*:\d*.\d*Z \[\d*.\d*\] \w*.\w* \w*/g,
    savedFileExp = /\d+_\d+.log/g,
    testAppId = "com.logtest.web.app",
    testAppFileName = "com.logtest.web.app_1.0.0_all.ipk",
    testAppPath = path.join(__dirname, "..", "tempFiles", testAppFileName);

let cmd,
    options,
    hasSession = false,
    targetLogDaemon;

beforeAll(function(done) {
    cmd = common.makeCmd(aresCmd);
    common.removeOutDir(savedlogPath);
    common.getOptions()
    .then(function(result) {
        options = result;
        done();
    });
});

afterAll(function(done) {
    common.removeOutDir(savedlogPath);
    done();
});

describe(aresCmd + " -h -v", function() {
    it("Print help message with verbose log", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + " -h -v", function(error, stdout, stderr) {
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
        if (options.profile === "tv") {
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

describe(aresCmd + " --device-list(-D)", function() {
    it("Show available device list", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + " -D", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(options.device);
            expect(stdout).toContain(options.profile);
            done();
        });
    });
});

describe(aresCmd + " -cd", function() {
    it("Print current logging daemon", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + " -cd", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`CLI's current logging daemon :`);

            const splitedStr = stdout.split(":");
            targetLogDaemon = splitedStr[splitedStr.length - 1].trim();

            if (!stdout.includes("The target's current logging daemon")) {
                targetLogDaemon = targetLogDaemon === "journald" ? "pmlogd" : "journald";
            }
            done();
        });
    });
});

describe(aresCmd + " -sd", function() {
    it("Print switch logging daemon", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + ` -sd ${targetLogDaemon}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }
            expect(stdout).toContain(`CLI's current logging daemon : ${targetLogDaemon}`);
            done();
        });
    });
});

describe('Set and check configuration for this test', function() {
    it('Check if there are sessions on the device', function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        const deviceCmd = common.makeCmd('ares-device');
        exec(deviceCmd + ` -s ${options.device}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            if (stdout.includes("sessionId")) {
                hasSession = true;
            }
            done();
        });
    });

    it("Install sample app to device with ares-install", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        const installCmd = common.makeCmd("ares-install");
        exec(installCmd + ` ${testAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            } else {
                expect(stdout).toContain("Success", stderr);
            }
            done();
        });
    });
});

describe(aresCmd + " -n 2", function() {
    it('Show log with --lines option', function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + " -n 2", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else if (targetLogDaemon === "journald") {
                expect(stdout).not.toContain("[Info] Set target device : " + options.device);
                expect(stdout.match(journalLogRegExp).length).toBe(2);
            } else if (targetLogDaemon === "pmlogd") {
                expect(stdout).not.toContain("[Info] Set target device : " + options.device);
                expect(stdout.match(pmLogRegExp).length).toBe(2);
            }
            done();
        });
    });
});

describe(aresCmd + "save option cases", function() {
    it("Save log to specific name file", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + ` -n 2 -s ${savedlogPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(fs.existsSync(savedlogPath)).toBe(true);
                expect(stdout).toContain("Created");
            }
            done();
        });
    });

    it("Save log to default file name format", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + ` -n 2 -s`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                const generatedFile = path.join(path.resolve('.'), stdout.match(savedFileExp)[0]);
                expect(fs.existsSync(generatedFile)).toBe(true);
                expect(stdout).toContain("Created");
                common.removeOutDir(generatedFile);
            }
            done();
        });
    });
});

describe(aresCmd + " -cl", function() {
    it("Launch sample App", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "journald") {
            pending("In case of pmlogd, skip this test case");
        }
        const launchCmd = common.makeCmd("ares-launch");
        exec(launchCmd + ` ${testAppId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            } else {
                expect(stdout).toContain(`Launched application ${testAppId}`, error);
            }
            setTimeout(function() {
                done();
            }, 1000);
        });
    });

    it("Print context list", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "journald") {
            pending("In case of journald, skip this test case");
        }
        exec(cmd + " -cl", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout).toContain(`${testAppId} = `);
            }
            done();
        });
    });
});

describe(aresCmd + ` -id ${testAppId}`, function() {
    it(`Show logs from ${testAppId}`, function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "journald") {
            pending("In case of journald, skip this test case");
        }
        exec(cmd + `-id ${testAppId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout.match(pmLogRegExp).length).toBeGreaterThan(3);
            }
            done();
        });
    });
});

describe(aresCmd + ` -sl ${testAppId} debug`, function() {
    it("Change specific context log level", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "journald") {
            pending("In case of journald, skip this test case");
        }
        exec(cmd + ` -sl ${testAppId} debug`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout).toContain(`Setting context level for \'${testAppId}\'`);
            }
            done();
        });
    });

    it("Print context list", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "journald") {
            pending("In case of journald, skip this test case");
        }
        exec(cmd + " -cl", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout).toContain(`${testAppId} = debug`);
            }
            done();
        });
    });
});

describe(aresCmd + " -fl", function() {
    it("Print .journal log file list", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -fl", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout).toContain("system.journal");
            }
            done();
        });
    });
});

describe(aresCmd + " --file", function() {
    it("Show log with --file option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " --file system.journal", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout.match(journalLogRegExp).length > 0).toBeTrue();
            }
            done();
        });
    });

    it("Show log with --file and --output option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " --file system.journal --output json", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(typeof JSON.parse(stdout.split("\n")[0])).toBe('object');
            }
            done();
        });
    });
});

describe(aresCmd + " -ul", function() {
    it("Print unit list", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -ul", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout).toContain("bootd.service");
            }
            done();
        });
    });
});

describe(aresCmd + " -ul -dp 1", function() {
    it("Print unit list with dp option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -ul -dp 1", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                } else if (options.device !== "emulator" && !hasSession) {
                    expect(stderr).toContain("ares-log ERR! [Tips]: This device does not support multiple sessions");
                }
            } else {
                expect(stdout).toContain("sam.service");
            }
            done();
        });
    });
});

describe(aresCmd + " -n 1 -o json", function() {
    it("Show log with output option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -n 1 -o json", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(typeof JSON.parse(stdout)).toBe('object');
            }
            done();
        });
    });
});

describe(aresCmd + " -k", function() {
    it("Show kenel log with --kernel option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -k", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout).toContain("kernel:");
            }
            done();
        });
    });
});

describe(aresCmd + " -b", function() {
    it("Show boot log with --boot option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -b", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout.length).not.toBe(0);
            }
            done();
        });
    });
});

describe(aresCmd + " --pid", function() {
    let pid;
    it("Get a pid from log", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        const pidExp = /\w+ \d+ \d\d:\d\d:\d\d [\w\d\-]+ [\w\d\.\-]+\[(\d+)]:/;
            exec(cmd + " -n 1", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout.match(pidExp).length > 0).toBeTrue();
                pid = stdout.match(pidExp)[1];
            }
            done();
        });        
    });
    it("Show log with --pid option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + ` --pid ${pid} -n 3`, function(error, stdout, stderr) {
            const expectedPid = `[${pid}]`;
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout.match(expectedPid).length > 0).toBeTrue();
            }
            done();
        });
    });
});

describe(aresCmd + " --unit memorymanager", function() {
    it("Launch sample App", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        const launchCmd = common.makeCmd("ares-launch");
        exec(launchCmd + ` ${testAppId}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            } else {
                expect(stdout).toContain(`Launched application ${testAppId}`, error);
            }
            setTimeout(function() {
                done();
            }, 1000);
        });
    });

    it("Show log with --unit option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " --unit memorymanager", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                const unitExp = /\w+ \d+ \d\d:\d\d:\d\d [\w\d\-]+ memorymanager/g;
                expect(stdout.match(unitExp).length > 0).toBeTrue();
            }
            done();
        });
    });
});

describe(aresCmd +" -u sam -dp 1", function() {
    it("Show log with unit and dp option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -u sam -dp 1", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                } else if (options.device !== "emulator" && !hasSession) {
                    expect(stderr).toContain("ares-log ERR! [Tips]: This device does not support multiple sessions");
                }
            } else {
                const unitExp = /\w+ \d+ \d\d:\d\d:\d\d [\w|\d]+ sam/g;
                expect(stdout.match(unitExp).length > 0).toBeTrue();
            }
            done();
        });
    });
});

describe(aresCmd + " -S today", function() {
    it("Show log with --since option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -S today", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout.length).not.toBe(0);
            }
            done();
        });
    });
});

describe(aresCmd + " -U yesterday", function() {
    it("Show log with --until option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "pmlogd") {
            pending("In case of pmlogd, skip this test case");
        }
        exec(cmd + " -U yesterday", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                }
            } else {
                expect(stdout.length).not.toBe(0);
            }
            done();
        });
    });
});

describe(aresCmd + " negative tc", function() {
    it("Not support option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + " -aaa", function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain(`ares-log ERR! [Tips]: ${targetLogDaemon} does not support the option <aaa>`);
            }
            done();
        });
    });

    it("Invalid save path", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        exec(cmd + ` -n 2 -s invalid/aaa.log`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain("ares-log ERR! [syscall failure]: ENOENT: no such file or directory");
                expect(stderr).toContain("ares-log ERR! [Tips]: Please check if the path is valid");
            }
            done();
        });
    });

    it("Not exist id value", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "journald") {
            pending("In case of journald, skip this test case");
        }
        exec(cmd + ` -id`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                } else {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Please specify a value <id-filter>");
                }
            } else {
                expect(stdout.match(pmLogRegExp).length).toBeGreaterThan(3);
            }
            done();
        });
    });

    it("Not exist filtered logs by id", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        if (targetLogDaemon === "journald") {
            pending("In case of journald, skip this test case");
        }
        exec(cmd + ` -id com.domain.app`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                if (options.device === "emulator") {
                    expect(stderr).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
                } else {
                    expect(stderr).toContain("ares-log ERR! [Tips]: There are no logs from the ID");
                    expect(stderr).toContain("ares-log ERR! [Tips]: Please check if the combination of options or the ID are valid");
                }
            } else {
                expect(stdout.match(pmLogRegExp).length).toBeGreaterThan(3);
            }
            done();
        });
    });
});

describe(aresCmd + " -f", function() {
    it("Show log with --follow option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        const child = exec(cmd + " -f");
        let result = "";

        child.stdout.on("data", function(data) {
            result += data;
        });

        child.stderr.on("data", function(data) {
            if (data && data.length > 0) {
                common.detectNodeMessage(data);
            }
            result += data;
        });

        setTimeout(() => {
            child.kill();
            if (options.device === "emulator") {
                expect(result).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
            } else if (targetLogDaemon === "journald") {
                expect(result.match(journalLogRegExp).length > 0).toBeTrue();
            } else if (targetLogDaemon === "pmlogd") {
                expect(result.match(pmLogRegExp).length > 0).toBeTrue();
            }
            done();
        }, 1000);
    });
});

describe(aresCmd + " -r", function() {
    it("Show log with --reverse option", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        const child = exec(cmd + " -r");
        let result = "";

        child.stdout.on('data', function(data) {
            result += data;
        });

        child.stderr.on('data', function(data) {
            if (data && data.length > 0) {
                common.detectNodeMessage(data);
            }
            result += data;
        });

        setTimeout(() => {
            child.kill();
            if (options.device === "emulator") {
                expect(result).toContain("ares-log ERR! [Tips]: Unable to connect to the target device. root access required");
            } else if (targetLogDaemon === "journald") {
                expect(result.match(journalLogRegExp).length > 0).toBeTrue();
            }
            done();
        }, 1000);
    });
});

describe('Set default configuration', function() {
    it("Install sample app to device with ares-install", function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }
        const installCmd = common.makeCmd("ares-install");
        exec(installCmd + ` -r ${testAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            } else {
                expect(stdout).toContain(`Removed package ${testAppId}`, stderr);
            }
            done();
        });
    });
});
