/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    fs = require('fs'),
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

commonSpec.getOptions = function() {
    return new Promise(function(resolve, reject) {
        // jasmine@5 rejects unknown CLI options, so test parameters are passed
        // via environment variables instead of command-line flags.
        //   e.g. ARES_PROFILE=ose ARES_DEVICE=webOSOSE ARES_IP=192.168.0.12 npm test
        const argv = {
            profile: process.env.ARES_PROFILE,
            device: process.env.ARES_DEVICE,
            ip: process.env.ARES_IP,
            port: process.env.ARES_PORT,
            timeInterval: process.env.ARES_TIMEINTERVAL,
            passPhrase: process.env.ARES_PASSPHRASE
        };

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
            jasmine.DEFAULT_TIMEOUT_INTERVAL = Number(argv.timeInterval);
        }
        //update options for signage profile
        if(options.profile === "signage"){
            options.ipkPath = "com.lg.app.signage.dev_0.0.1_all.ipk";
            options.ipkPath = path.join(__dirname, "..", "tempFiles",  "com.lg.app.signage.dev_0.0.1_all.ipk");
            options.pkgId = "com.lg.app.signage.dev";
            options.pkgService = "com.lg.app.signage.dev.service";
        }
        if ((options.profile === "tv" || options.profile === "signage") && !argv.passPhrase) {
            console.error(`[Tips] If you want to run a unit test with for ${options.profile} profile, need the Passphrase value of the device in use.`);
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
        const username = ["tv", "signage"].includes(options.profile) ? "prisoner" : "root";
        exec(cmd + ` -a ${options.device} -i port=${options.port} -i username=${username} -i host=${options.ip} -i default=true`,
        function(error, stdout, stderr) {
            if (stderr) {
                reject(stderr);
            } else {
                resolve(stdout);
                if (options.profile === "tv" || options.profile === "signage") {
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
