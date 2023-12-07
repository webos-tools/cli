#!/usr/bin/env node

/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const async = require('async'),
    inquirer = require('inquirer'),
    nopt = require('nopt'),
    log = require('npmlog'),
    path = require('path'),
    GeneratorLib = require('./../lib/generator'),
    commonTools = require('./../lib/base/common-tools'),
    readJsonSync = require('./../lib/util/json').readJsonSync;

const cliControl = commonTools.cliControl,
    version = commonTools.version,
    help = commonTools.help,
    appdata = commonTools.appdata,
    errHndl = commonTools.errMsg;

const processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function(err) {
    log.error('uncaughtException', err.toString());
    log.verbose('uncaughtException', err.stack);
    cliControl.end(-1);
});

if (process.argv.length === 2) {
    process.argv.splice(2, 0, '--help');
}

let idx;
if ((idx = process.argv.indexOf('--list')) !== -1 || (idx = process.argv.indexOf('-l')) !== -1) {
    if (process.argv[idx+1] && process.argv[idx+1].toString().match(/^-/)) {
        process.argv.splice(idx+1, 0, 'true');
    }
}

const knownOpts = {
    "help": Boolean,
    "version": Boolean,
    "list": String,
    "overwrite": Boolean,
    "servicename": String,
    "template": String,
    "property": [String, Array],
    "no-query": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

const shortHands = {
    "h": "--help",
    "V": "--version",
    "l": "--list",
    "f": "--overwrite",
    "t": "--template",
    "p": "--property",
    "s": "--servicename",
    "nq": "--no-query",
    "v": ["--level", "verbose"]
};

const argv = nopt(knownOpts, shortHands, process.argv, 2 /* drop 'node' & 'ares-*.js' */);

log.heading = processName;
log.level = argv.level || 'warn';
log.verbose("argv", argv);

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
if (argv.level) {
    delete argv.level;
    if (argv.argv.remain.length === 0 && (Object.keys(argv)).length === 1) {
        argv.help = true;
    }
}

const config = appdata.getConfig(true),
    options = {
        tmplFile: path.join(__dirname, '/../files/conf/', 'template.json'),
        overwrite: argv.overwrite,
        tmplName: argv.template,
        listType: argv.list,
        props: argv.property || [],
        appinfo: {},
        pkginfo: {},
        svcinfo: {},
        svcName: argv.servicename,
        query: ((Object.hasOwnProperty.call(argv, 'query')) ? argv.query : true),
        out: argv.argv.remain[0]
    };

let op,
    generator;
if (argv.help) {
    showUsage();
    cliControl.end();
} else if (argv.version) {
    version.showVersionAndExit();
} else if (argv.list) {
    op = list;
} else {
    op = generate;
}

if (op) {
    version.checkNodeVersion(function() {
        async.series([
            op.bind(this)
        ],finish);
    });
}

function showUsage(hiddenFlag) {
    if (hiddenFlag) {
        help.display(processName, appdata.getConfig(true).profile, hiddenFlag);
    } else {
        help.display(processName, appdata.getConfig(true).profile);
    }
}

function getGenerator() {
    if (!generator) {
        generator = new GeneratorLib();
    }
    return generator;
}

function list() {
    const gen = getGenerator();
    gen.showTemplates(options.listType, finish);
    cliControl.end();
}

function getQueryFile(profile, type) {
    const fileName = "query-"+ type + ".json";
    const queryFile = path.join(__dirname, "../files/conf/query", fileName);
    return queryFile;
}

function queryInfo(queryFile) {
    const queries = readJsonSync(queryFile);
    const questions = [];
    for (const q in queries) {
        const question = {};
        question.type = "input";
        question.name = q;
        question.message = queries[q].query;
        question.default = queries[q].default;
        questions.push(question);
    }
    return inquirer.prompt(questions, function(answers) {
        return answers;
    });
}

function generate() {
    const gen = getGenerator();
    const templates = gen.getTmpl();

    if (options.tmplName === "true") {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "TEMPLATE"));
    }
    if (!options.out) {
        return finish(errHndl.getErrMsg("EMPTY_VALUE", "APP_DIR"));
    }

    Promise.resolve()
        .then(function() {
            const overwrite = !!options.overwrite,
                useInquirer = !!options.query,
                dest = path.resolve(options.out),
                existDir = gen.existOutDir(dest);

            const questions = [{
                type: "confirm",
                name: "overwrite",
                message: "The directory already exists. The template files in the directory will be replaced. Continue?",
                default: false,
                when: function() {
                    return !overwrite && useInquirer && existDir;
                }
            }];
            return inquirer.prompt(questions).then(function(answers) {
                options.overwrite = answers.overwrite || options.overwrite;
                if (existDir && !options.overwrite) {
                    throw errHndl.getErrMsg("NOT_OVERWRITE_DIR", dest);
                }
            });
        })
        .then(function() {
            const template = templates[options.tmplName];
            if (!template) throw errHndl.getErrMsg("INVALID_VALUE", "TEMPLATE", options.tmplName);
            if (!template.type) {
                return;
            }
            // query mode, only CLI can approach. API only use props
            if (!options.props.length) {
                if (options.query && options.tmplName.match(/(^hosted)/)) {
                    const queryConfigFile = getQueryFile(config.profile, 'hosted');
                    return queryInfo(queryConfigFile).then(function(info) {
                        for (const i in info) {
                            options.appinfo[i] = info[i];
                        }
                    });
                } else if (options.query && template.type.match(/(app$|appinfo$)/)) {
                    const queryConfigFile = getQueryFile(config.profile, 'app');
                    return queryInfo(queryConfigFile).then(function(info) {
                        for (const i in info) {
                            options.appinfo[i] = info[i];
                        }
                    });
                } else if (options.query && !options.svcName &&
                    template.type.match(/(service$|serviceinfo$)/)) {
                    const queryConfigFile = getQueryFile(config.profile, 'service');
                    return queryInfo(queryConfigFile).then(function(info) {
                        // FIXME: hard-coded considering info.id is servicename
                        if (info.id) options.svcName = info.id;
                    });
                } else if (options.query && template.type.match(/(package$|packageinfo$)/)) {
                    const queryConfigFile = getQueryFile(config.profile, 'package');
                    return queryInfo(queryConfigFile).then(function(info) {
                        for (const i in info) {
                            options.pkginfo[i] = info[i];
                        }
                    });
                }
            }})
        .then(function() {
            gen.generate(options, finish);
        })
        .catch(function(err) {
            finish(err);
        });
}

function finish(err, value) {
    log.info("finish()");
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
        log.verbose("finish()", "value:", value);
        if (value && value.msg) {
            console.log(value.msg);
        }
    }
}
