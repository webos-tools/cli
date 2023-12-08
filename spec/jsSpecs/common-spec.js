/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    fs = require('fs'),
    nopt = require('nopt'),
    exec = require('child_process').exec,
    shelljs = require('shelljs');

const commonSpec = {};
const options = {
    profile: "ose",
    device: "emulator",
    ip: "127.0.0.1",
    port: 6622,
    pkgId: "com.jasmine.web.app",
    pkgService: "com.jasmine.web.app.service",
    ipkFile: "com.jasmine.web.app_0.0.1_all.ipk",
    ipkPath: path.join(__dirname, "..", "tempFiles",  "com.jasmine.web.app_0.0.1_all.ipk"),
    passPhrase: ""
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = commonSpec;
}

const knownOpts = {
    "profile": String,
    "device": String,
    "ip": String,
    "port": String,
    "timeInterval": Number,
    "passPhrase": String
};
const shortHands = {
    "p": ["--profile"],
    "d": ["--device"],
    "ip": ["--ip"],
    "port": ["--port"],
    "ti": ["--timeInterval"],
    "pp": ["--passPhrase"]
};

commonSpec.getOptions = function() {
    return new Promise(function(resolve, reject) {
        const argv = nopt(knownOpts, shortHands, process.argv, 2);

        if (argv.profile) {
            options.profile = argv.profile;
        }
        if (argv.device) {
            options.device = argv.device;
        }
        if (argv.ip) {
            options.ip = argv.ip;
        }
        if (options.device !== "emulator") {
            options.port = argv.port ? argv.port : 22;
        }
        if (argv.timeInterval) {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = argv.timeInterval;
        }
        if (argv.profile === "tv" && !argv.passPhrase) {
            console.error("[Tips] If you want to run a unit test with for tv profile, need the Passphrase value of the device in use.");
            process.exit(1);
        }
        options.passPhrase = argv.passPhrase;
        console.info(`profile : ${options.profile}, device : ${options.device}, ip : ${options.ip}, port : ${options.port}, timeInterval : ${jasmine.DEFAULT_TIMEOUT_INTERVAL}, passPhrase : ${options.passPhrase}`);

        // set profile
        const cmd = commonSpec.makeCmd('ares-config');
        exec(cmd + ` -p ${options.profile}`, function(error, stdout) {
            if (error) {
                console.error("set config error " +  error);
                reject(stdout);
            }
            resolve(options);
        });

        options.skipTxt = `In case of ${options.profile}, skip this test case`;
    });
};

commonSpec.getExpectedResult = function(aresCmd) {
    return new Promise(function(resolve) {
        try {
            const text = fs.readFileSync(path.join(__dirname, "../test_data", aresCmd + '.json'), 'utf8');
            const resultJson = JSON.parse(text);
            resolve(resultJson[options.profile]);
        } catch(err) {
            console.error(err);
            process.exit(1);
        }
    });
};

commonSpec.resetDeviceList = function() {
    return new Promise(function(resolve, reject) {
        const cmd = commonSpec.makeCmd('ares-setup-device');
        exec(cmd + ' -R', function(error, stdout, stderr) {
            if (!stderr) {
                resolve(true);
            } else {
                reject(error);
            }
        });
    });
};

commonSpec.addDeviceInfo = function() {
    return new Promise(function(resolve, reject) {
        const cmd = commonSpec.makeCmd('ares-setup-device');
        exec(cmd + ` -a ${options.device} -i port=${options.port} -i username=root -i host=${options.ip} -i default=true`,
        function(error, stdout, stderr) {
            if (stderr) {
                reject(stderr);
            } else {
                resolve(stdout);
                if (options.profile === "tv") {
                    commonSpec.getKey(options.passPhrase);
                }
            }
        });
    });
};

commonSpec.makeCmd = function(cmd) {
    return `node ${path.join('bin', cmd + '.js')}`;
};

commonSpec.createOutDir = function(filePath, mode) {
    if (!fs.existsSync(filePath)) {
        shelljs.mkdir(filePath);
    }

    if (mode) {
        fs.chmodSync(filePath, mode);
    }
};

commonSpec.removeOutDir = function(filePath) {
    if (fs.existsSync(filePath)) {
        shelljs.rm('-rf', filePath);
    }
};

commonSpec.detectNodeMessage = function(stderr) {
    if (stderr.includes("node:")) {
        return fail(stderr);
    }
};

// get ssh private key
commonSpec.getKey = function(passPhrase) {
    return new Promise(function(resolve, reject) {
        const cmd = commonSpec.makeCmd('ares-novacom');
        exec(cmd + ` -k -pass ${passPhrase} -d ${options.device}`,
        function(error, stdout, stderr) {
            if (stderr) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
};
