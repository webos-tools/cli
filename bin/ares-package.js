#!/usr/bin/env node

/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    packageLib = require('../lib/package'),
    commonTools = require('./../lib/base/common-tools'),
    errHndl = require('./../lib/base/error-handler');

const cliControl = commonTools.cliControl,
    version = commonTools.version,
    help = commonTools.help,
    appdata = commonTools.appdata;

const processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function(err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

if (process.argv.length === 2) {
    process.argv.splice(2, 0, '--help');
}

function PalmPackage() {
    this.destination = '.';
    this.options = {};
    this.appCnt = 0;
    this.dirCounts = {};

    const knownOpts = {
        "help": Boolean,
        "hidden-help": Boolean,
        "version": Boolean,
        "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error'],
        "outdir": path,
        "check": Boolean,
        "no-minify": Boolean,
        "app-exclude": [String, Array],
        "rom": Boolean,
        "encrypt": Boolean,
        "sign": String,
        "certificate": String,
        "force": Boolean,
        "pkgid": String,
        "pkgversion": String,
        "pkginfofile": String,
        "info": String,
        "info-detail": String
    };

    const shortHands = {
        "h": "--help",
        "hh": "--hidden-help",
        "V": "--version",
        "o": "--outdir",
        "c": "--check",
        "n": "--no-minify",
        "e": "--app-exclude",
        "r": "--rom",
        "enc": "--encrypt",
        "s": "--sign",
        "crt": "--certificate",
        "f": "--force",
        "pi": "--pkgid",
        "pv": "--pkgversion",
        "pf": "--pkginfofile",
        "i": "--info",
        "I": "--info-detail",
        "v": ["--level", "verbose"]
    };

    this.argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & basename*/);

    this.hiddenhelpString = [
        "",
        "EXTRA-OPTION",
        help.format("-f, --force", "Make .ipk package forcibly with same file structure in APP_DIR"),
        help.format("","If file/directories in APP_DIR consists of the following structure"),
        help.format("\t (ex) APP_DIR/"),
        help.format("\t           +-- usr/"),
        help.format("\t           +-- usr/bin"),
        help.format("\t           +-- usr/bin/foo"),
        help.format("\t           +-- etc/"),
        help.format("\t           +-- etc/boo.conf"),
        help.format("","'-f, --force' option will keep this structure in .ipk"),
        "",
        help.format("-pn, --pkgname <NAME>", "Set package name"),
        help.format("-pv, --pkgversion <VERSION>", "Set package version"),
        "EXAMPLES",
        "",
        "# Create a package although directory has no appinfo.json and no services.json",
        "  make a ipk file which of package name is 'foopkg' and package version is '1.0.1'",
        "  the following command should generate a foopkg_1.0.1.ipk",
        processName+" APP_DIR -f -pn foopkg -pv 1.0.1",
        ""
    ];

    log.heading = processName;
    log.level = this.argv.level || 'warn';
    log.verbose("argv", this.argv);

    /**
     * For consistent of "$command -v", argv is used.
     * By nopt, argv is parsed and set key-value in argv object.
     * If -v or --level option is input with command, it is set key-value in argv.
     * After it is deleted, If remained key is only one in argv object
     * (If any other are remained, it's mean another options is input)
     * and there is no remaining after parsing the input command by nopt
     * (If any other are remained, it's mean another parameters ares input),
     * each command of webOS CLI print help message with log message.
     */
    if (this.argv.level) {
        delete this.argv.level;
        if (this.argv.argv.remain.length === 0 && (Object.keys(this.argv)).length === 1) {
            this.argv.help=true;
        }
    }
}

PalmPackage.prototype = {
    unsupportedOptions: {
        "noclean": 1, // Do not cleanup temporary directories - For debug only
        "force": 1
    },

    showUsage: function(hiddenFlag, exitCode) {
        if (exitCode === undefined) {
            exitCode = 0;
        }
        if (hiddenFlag) {
            help.display(processName, appdata.getConfig(true).profile, hiddenFlag);
        } else {
            help.display(processName, appdata.getConfig(true).profile);
        }
        cliControl.end(exitCode);
    },

    checkAndShowHelp: function() {
        if (this.argv.help) {
            this.showUsage(false, 0);
        } else if (this.argv["hidden-help"]) {
            this.showUsage(true, 0);
        }
    },

    handleOptions: function() {
        this.options.level = log.level;

        // Pass unsupported options verbatim thru the options Object -- TODO: TBR
        for(const key in this.argv) {
            if (this.unsupportedOptions[key]) {
                this.options[key] = this.argv[key];
            }
        }

        if (Object.hasOwnProperty.call(this.argv, 'minify')) {
            this.options.minify = this.argv.minify;
        } else {
            this.options.minify = true;
        }

        if (Object.hasOwnProperty.call(this.argv, 'app-exclude')) {
            this.options.excludefiles = this.argv['app-exclude'];
        }

        if (Object.hasOwnProperty.call(this.argv, 'rom')) {
            this.options.rom = this.argv.rom;
        } else {
            this.options.rom = false;
        }

        if (Object.hasOwnProperty.call(this.argv, 'encrypt')) {
            this.options.encrypt = this.argv.encrypt;
        } else {
            this.options.encrypt = false;
        }

        if (Object.hasOwnProperty.call(this.argv, 'sign')) {
            this.options.sign = this.argv.sign;
        }

        if (Object.hasOwnProperty.call(this.argv, 'certificate')) {
            this.options.certificate = this.argv.certificate;
        }

        if (Object.hasOwnProperty.call(this.argv, 'pkgid')) {
            this.options.pkgid = this.argv.pkgid;
        }

        if (Object.hasOwnProperty.call(this.argv, 'pkgversion')) {
            this.options.pkgversion = this.argv.pkgversion;
        }

        if (Object.hasOwnProperty.call(this.argv, 'pkginfofile')) {
            this.options.pkginfofile = this.argv.pkginfofile;
        }

        if (Object.hasOwnProperty.call(this.argv, 'info-detail')) {
            this.options.infodetail = this.argv['info-detail'];
        }

        if (Object.hasOwnProperty.call(this.argv, 'info')) {
            this.options.info = this.argv.info;
        }
    },
    
    setOutputDir: function(next) {
        log.info("setOutputDir()");
        if (this.argv.outdir) {
            this.destination = this.argv.outdir;
        }

        if (this.destination === '.') {
            this.destination = process.cwd();
        }
        next();
    },

    checkInputDir: function(next) {
        log.info("checkInputDir()");
        const packager = new packageLib.Packager();
        this.dirCounts = packager.checkInputDirectories(this.argv.argv.remain, this.options, next);
    },

    packageApp: function(next) {
        log.info("packageApp()");
        const packager = new packageLib.Packager();
        if (this.dirCounts.app === 0) { // packaging without app
            if (Object.prototype.hasOwnProperty.call(this.options, 'pkginfofile') && Object.prototype.hasOwnProperty.call(this.options, 'pkgid')) {
                this.finish(errHndl.getErrMsg("NOT_USE_WITH_OPTIONS", "pkginfofile, pkgid"));
                cliControl.end(-1);
            } else if (Object.prototype.hasOwnProperty.call(this.options, 'pkgid') || Object.prototype.hasOwnProperty.call(this.options, 'pkginfofile')) {
                if (this.dirCounts.resource > 0) {
                    packager.resourcePackaging(this.argv.argv.remain, this.destination, this.options,this.outputTxt, next);
                } else {
                    packager.servicePackaging(this.argv.argv.remain, this.destination, this.options, this.outputTxt, next);
                }
            } else {
                this.finish(errHndl.getErrMsg("USE_PKGID_PKGINFO"));
                cliControl.end(-1);
            }
        } else { // packaging with app
            if (Object.prototype.hasOwnProperty.call(this.options, 'pkgid') || Object.prototype.hasOwnProperty.call(this.options, 'pkgversion')) {
                this.finish(errHndl.getErrMsg("NOT_USE_WITH_OPTIONS", "pkgid, pkgversion"));
            }
            packager.generatePackage(this.argv.argv.remain, this.destination, this.options, this.outputTxt, next);
        }
    },

    packageProject: function() {
        async.series([
            version.checkNodeVersion,
            this.setOutputDir.bind(this),
            this.checkInputDir.bind(this),
            this.packageApp.bind(this)
        ], this.finish.bind(this));
    },

    checkApplication: function() {
        async.series([
            version.checkNodeVersion,
            this.checkInputDir.bind(this)
        ], function(err) {
            if (err) {
                return this.finish(err);
            }
            return this.finish(null, {msg : "no problems detected"});
        }.bind(this));
    },

    showPkgInfo: function() {
        log.info("showPkgInfo()");
        const packager = new packageLib.Packager();
        packager.analyzeIPK(this.options, this.finish);
    },

    finish: function(err, value) {
        log.info("finish()");
        if (err) {
            // handle err from getErrMsg()
            if (Array.isArray(err) && err.length > 0) {
                for(const index in err) {
                    log.error(err[index].heading, err[index].message);
                }
                log.verbose(err[0].stack);
            } else {
                // handle general err (string & object)
                log.error(err.toString());
                log.verbose(err.stack);
            }
            cliControl.end(-1);
        } else {
            log.verbose("finish()", "value:", value);
            if (value && value[value.length-1] && value[value.length-1].msg) {
                console.log(value[value.length-1].msg);
            } else if (value && value.msg) {
                console.log(value.msg);
            }
            cliControl.end();
        }
    },

    outputTxt: function(value) {
        log.info("outputTxt()");
        console.log(value);
    },

    exec: function() {
        this.handleOptions();
        this.checkAndShowHelp();

        if (this.argv.check) {
            this.checkApplication();
        } else if (this.argv.version) {
            version.showVersionAndExit();
        } else if (this.argv.info || this.argv['info-detail']) {
            this.showPkgInfo();
        } else {
            this.packageProject();
        }
    }
};

// Main
const cmd = new PalmPackage();
cmd.exec();
