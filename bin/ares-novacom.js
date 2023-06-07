const path = require('path'),
    log = require('npmlog'),
    nopt = require('nopt'),
    async = require('async'),
    novacom = require('./../lib/base/novacom'),
    commonTools = require('./../lib/base/common-tools');

const version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    setupDevice = commonTools.setupDevice,
    appdata = commonTools.appdata,
    errHndl = commonTools.errMsg;

const processName = path.basename(process.argv[1], '.js');

process.on('uncaughtException', function (err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

const knownOpts = {
    // generic options
    "help": Boolean,
    "hidden-help": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error'],
    "version": Boolean,
    // command-specific options
    "device-list": Boolean,
    "forward": Boolean,
    "port": [String, Array],
    "getkey": Boolean,
    "passphrase": [String, null],
    "device": [String, null],
    "run": [String, null],
    // no shortHands
    "put": [String, null],
    "get": [String, null]
};

const shortHands = {
    // generic aliases
    "h": ["--help"],
    "hh": ["--hidden-help"],
    "v": ["--level", "verbose"],
    "V": ["--version"],
    // command-specific aliases
    "D": ["--device-list"],
    "f": ["--forward"],
    "p": ["--port"],
    "k": ["--getkey"],
    "pass": ["--passphrase"],
    "d": ["--device"],
    "r": ["--run"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-*.js' */);

log.heading = processName;
log.level = argv.level || 'warn';
log.verbose("argv", argv);

const curConfigData = appdata.getConfig(true);
if (curConfigData.profile !== "tv") {
    return finish(errHndl.getErrMsg("NOT_SUPPORT_COMMOND", curConfigData.profile));
}

const options = {
    name: argv.device
};

let op;
if (argv['device-list']) {
    setupDevice.showDeviceList(finish);
} else if (argv.getkey) {
    op = getkey;
} else if (argv.run) {
    op = run;
} else if (argv.forward) {
    op = forward;
} else if (argv.version) {
    version.showVersionAndExit();
} else {
    if (argv['hidden-help']) {
        help.display(processName, appdata.getConfig(true).profile, true);
    } else {
        help.display(processName, appdata.getConfig(true).profile, false);
    }
    cliControl.end();
}

if (op) {
    version.checkNodeVersion(function () {
        async.series([
            op.bind(this)
        ], finish);
    });
}

function getkey(next) {
    const resolver = new novacom.Resolver();
    async.waterfall([
        resolver.load.bind(resolver),
        resolver.getSshPrvKey.bind(resolver, options),
        function (keyFileName, next) {
            if (keyFileName) {
                if (argv.passphrase) {
                    return next(null, keyFileName, argv.passphrase);
                }
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdout.write('input passphrase [default: webos]:');
                process.stdin.on('data', function (text) {
                    let passphrase = text.toString().trim();
                    if (passphrase === '') {
                        passphrase = 'webos';
                    }
                    log.info('registered passphrase is ', passphrase);
                    next(null, keyFileName, passphrase);
                });
            } else {
                return next(new Error("Error getting key file from the device"));
            }
        },
        function (keyFileName, passphrase, next) {
            const target = {};
            target.name = options.name;
            target.privateKey = {
                "openSsh": keyFileName
            };
            target.passphrase = passphrase;
            target.files = 'sftp';
            target.port = '9922';
            target.username = 'prisoner';
            target.password = '@DELETE@';
            next(null, target);
        },
        resolver.modifyDeviceFile.bind(resolver, 'modify')
    ], function (err) {
        if (err)
            return next(err);
        next(null, {
            "msg": "Success"
        });
    });
}

function run(next) {
    if (argv.run === 'true') {
        finish(errHndl.getErrMsg("EMPTY_VALUE", "DEVICE_COMMAND"));
    } else {
        const printTarget = true;
        options.session = new novacom.Session(options, printTarget, function (err) {
            if (err) {
                next(err);
                return;
            }
            options.session.run(argv.run, process.stdin, process.stdout, process.stderr, next);
        });
    }
}

function forward(next) {
    if (!argv.port || argv.port.toString() === 'true') {
        finish(errHndl.getErrMsg("EMPTY_VALUE", "DEVICE_PORT:HOST_PORT"));
    } else {
        const tasks = [
            function (next) {
                const printTarget = true;
                options.session = new novacom.Session(options, printTarget, next);
            }
        ];
        try {
            argv.port.forEach(function (portStr) {
                const portArr = portStr.split(':');
                const devicePort = parseInt(portArr[0], 10);
                const localPort = parseInt(portArr[1], 10) || devicePort;
                tasks.push(function (next) {
                    options.session.forward(devicePort, localPort, next);
                });
                tasks.push(function () {
                    console.log('forward', 'running...');
                });
            });
        } catch (err) {
            next(err);
            return;
        }
        async.series(tasks, next);
    }
}

function finish(err, value) {
    if (err) {
        // handle err from getErrMsg()
        if (Array.isArray(err) && err.length > 0) {
            for (const index in err) {
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
        log.info('finish():', value);
        if (value && value.msg) {
            console.log(value.msg);
        }
        cliControl.end();
    }
}
