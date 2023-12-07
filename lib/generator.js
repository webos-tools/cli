#!/usr/bin/env node

/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const promise = require('bluebird'),
    Table = require('easy-table'),
    fs = promise.promisifyAll(require('fs-extra')),
    log = require('npmlog'),
    path = require('path'),
    errHndl = require('./base/error-handler'),
    copyToDirAsync = require('./util/copy').copyToDirAsync,
    readJsonSync = require('./util/json').readJsonSync,
    merge = require('./util/merge');

const templatePath = path.join(__dirname, '/../files/conf/', 'template.json');
let templates;

log.heading = 'generator';
log.level = 'warn';

function Generator() {
    if (templatePath) {
        const cliPath = path.join(__dirname, '..');
        let contents = fs.readFileSync(templatePath);
        contents = contents.toString().replace(/\$cli-root/gi, cliPath).replace(/\\/g,'/');
        templates = JSON.parse(contents);
    } else {
        templates = null;
    }
}

Generator.prototype.showTemplates = function(listType, next) {
    const templateList = this.getTmpl(),
        table = new Table(),
        _displayType = {
            "webapp": "Web App",
            "nativeapp": "Native App",
            "webappinfo": "Web App Info",
            "nativeappinfo": "Native App Info",
            "jsservice": "JS Service",
            "nativeservice": "Native Service",
            "jsserviceinfo": "JS Service Info",
            "nativeserviceinfo": "Native Service Info",
            "icon": "Icon",
            "library": "Library",
            "packageinfo": "Package Info",
            "qmlapp": "QML App",
            "qmlappinfo": "QML App Info"
        };

    for (const name in templateList) {
        if (templateList[name].hide === true || !templateList[name].type) {
            continue;
        }
        const isDefault = (templateList[name].default) ? "(default) " : "",
            type = _displayType[templateList[name].type] || templateList[name].type;

        if (listType && ["true", "false", true, false].indexOf(listType) === -1) {
            if (templateList[name].type &&
                (templateList[name].type.match(new RegExp(listType+"$","gi")) === null)) {
                continue;
            }
        }
        table.cell('ID', name);
        table.cell('Project Type', type);
        table.cell('Description', isDefault + templateList[name].description);
        table.newRow();
    }
    return next(null, {msg: table.toString()});
};

Generator.prototype.generate = function(options, next) {
    // For API
    if (!options.tmplName) {
        return next(errHndl.getErrMsg("EMPTY_VALUE", "TEMPLATE"));
    }
    if (!options.out) {
        return next(errHndl.getErrMsg("EMPTY_VALUE", "APP_DIR"));
    }

    const tmplName = options.tmplName,
        pkginfo = options.pkginfo || {},
        svcinfo = options.svcinfo || {},
        svcName = options.svcName,
        out = options.out,
        dest = path.resolve(out),
        existDir = this.existOutDir(dest),
        templateList = this.getTmpl(),
        template = templateList[tmplName];
    let appinfo = options.appinfo || {};

    // For API
    if (!template) {
        return next(errHndl.getErrMsg("INVALID_VALUE", "TEMPLATE", options.tmplName));
    }
    if (!options.overwrite && existDir) {
        return next(errHndl.getErrMsg("NOT_OVERWRITE_DIR", dest));
    }

    if (template.metadata && template.metadata.data && typeof template.metadata.data === 'object') {
        appinfo = merge(appinfo, template.metadata.data);
    }

    promise.resolve()
        .then(function() {
            // If props is not exist, this input from query-mode
            // If props is exist, this input from props
            // Check argv.query, argv["no-query"], options.props and conditional statement.
            if (template.type.match(/(app$|appinfo$)/)) {
                parsePropArgs(options.props, appinfo);
            } else if (template.type.match(/(service$|serviceinfo$)/)) {
                parsePropArgs(options.props, svcinfo);
            } else if (template.type.match(/(package$|packageinfo$)/)) {
                parsePropArgs(options.props, pkginfo);
            }
        })
        .then(function() {
            if (svcName) {
                svcinfo.id = svcName;
                svcinfo.services = [{
                    "name": svcName
                }];
            } else if (!svcName && svcinfo && !!svcinfo.id) {
                svcinfo.services = [{
                    "name": svcinfo.id
                }];
            }
        });

    return promise.resolve()
        .then(function() {
            log.info("generator#generate()", "template name:" + tmplName);
            next(null, {msg: "Generating " + tmplName + " in " + dest});

            let srcs;
            if (tmplName.match(/(^hosted)/)) {
                srcs = [].concat(template.path);
                return promise.all(srcs.map(function(src) {
                    return copyToDirAsync(src, dest);
                })).then(function() {
                    let metaTmpl;
                    let url;
                    if (template.metadata && template.metadata.id) {
                        metaTmpl = templateList[template.metadata.id];
                    }
                    if (metaTmpl) {
                        if (appinfo.url) {
                            url = appinfo.url;
                            delete appinfo.url;
                            const urlTmpl = {"path":path.join(srcs[0],'index.html')};
                            _writeURLdata(urlTmpl, url);
                        }
                        return _writeMetadata(metaTmpl, appinfo, svcinfo, pkginfo);
                    } else {
                        return;
                    }
                });
            } else if (tmplName.match(/(^qmlapp$)/)) {
                srcs = [].concat(template.path);
                return promise.all(srcs.map(function(src) {
                    return copyToDirAsync(src, dest);
                })).then(function() {
                    let metaTmpl;
                    if (template.metadata && template.metadata.id) {
                        metaTmpl = templateList[template.metadata.id];
                    }
                    if (metaTmpl) {
                        if (appinfo.id) {
                            const qmlTmpl = {"path":path.join(srcs[0],'main.qml')};
                            _writeAppIDdata(qmlTmpl, appinfo.id);
                        }
                        return _writeMetadata(metaTmpl, appinfo, svcinfo, pkginfo);
                    } else {
                        return;
                    }
                });
            } else if (template.type.match(/info$/)) {
                return _writeMetadata(template, appinfo, svcinfo, pkginfo);
            } else {
                srcs = [].concat(template.path);
                return promise.all(srcs.map(function(src) {
                    log.info("generator#generate()", "template src:" + src);
                    return copyToDirAsync(src, dest);
                })).then(function() {
                    let metaTmpl;
                    if (template.metadata && template.metadata.id) {
                        metaTmpl = templateList[template.metadata.id];
                    }
                    if (metaTmpl) {
                        return _writeMetadata(metaTmpl, appinfo, svcinfo, pkginfo);
                    } else {
                        return;
                    }
                });
            }
        })
        .then(function() {
            const deps = templateList[tmplName].deps || [];
            return promise.all(deps.map(function(dep) {
                if (!templateList[dep]) {
                    log.warn("generator#generate()", "Invalid template id:" + dep);
                    return;
                } else if (!templateList[dep].path) {
                    log.warn("generator#generate()", "Invalid template path:" + dep);
                    return;
                }
                return copyToDirAsync(templateList[dep].path, dest);
            }));
        })
        .then(function() {
            log.info("generator#generate()", "done");
            return next(null, {
                msg: "Success"
            });
        })
        .catch(function(err) {
            log.silly("generator#generate()", "err:", err);
            throw err;
        });

    function _writeAppIDdata(qmlTmpl, appId) {
        const filePaths = [].concat(qmlTmpl.path);
        return promise.all(filePaths.map(function(file) {
            return fs.lstatAsync(file)
                .then(function(stats) {
                    if (!stats.isFile()) {
                        throw errHndl.getErrMsg("INVALID_PATH", "meta template", file);
                    }
                    // eslint-disable-next-line no-useless-escape
                    const exp = /appId\s*:\s*[\'\"][\w.]*[\'\"]/g;
                    const destFile = path.join(dest, path.basename(file));
                    let qmlFile = fs.readFileSync(file, 'utf8');
                    qmlFile = qmlFile.replace(exp, "appId: \"" + appId + "\"");

                    fs.writeFileSync(destFile, qmlFile, {encoding: 'utf8'});
                });
        }))
        .then(function() {
            log.info("generator#generate()#_writeAppIDdata()", "done");
            return;
        })
        .catch(function(err) {
            log.silly("generator#generate()#_writeAppIDdata()", "err:", err);
            throw err;
        });
    }

    function _writeURLdata(urlTmpl, url) {
        const filePaths = [].concat(urlTmpl.path);
        return promise.all(filePaths.map(function(file) {
            return fs.lstatAsync(file)
                .then(function(stats) {
                    if (!stats.isFile()) {
                        throw errHndl.getErrMsg("INVALID_PATH", "meta template", file);
                    }
                    let html = fs.readFileSync(file, 'utf8');
                    // eslint-disable-next-line no-useless-escape
                    const exp = new RegExp("(?:[\'\"])([\:/.A-z?<_&\s=>0-9;-]+\')");
                    // eslint-disable-next-line no-useless-escape
                    html = html.replace(exp, "\'" + url + "\'");
                    const destFile = path.join(dest, path.basename(file));

                    fs.writeFileSync(destFile, html, {encoding: 'utf8'});
                });
        }))
        .then(function() {
            log.info("generator#generate()#_writeURLdata()", "done");
            return;
        })
        .catch(function(err) {
            log.silly("generator#generate()#_writeURLdata()", "err:", err);
            throw err;
        });
    }

    function _writeMetadata(metaTmpl, _appinfo, _svcinfo, _pkginfo) {
        const metaPaths = [].concat(metaTmpl.path),
            appInfo = _appinfo || {},
            svcInfo = _svcinfo || {},
            pkgInfo = _pkginfo || {};

        return promise.all(metaPaths.map(function(file) {
            return fs.lstatAsync(file)
                .then(function(stats) {
                    if (!stats.isFile()) {
                        throw errHndl.getErrMsg("INVALID_PATH", "meta template", file);
                    }
                    const fileName = path.basename(file);
                    let info = readJsonSync(file);

                    if (fileName === 'appinfo.json') {
                        info = merge(info, appInfo);
                    } else if (fileName === "services.json") {
                        info = merge(info, svcInfo);
                    } else if (fileName === "package.json" &&
                            (metaTmpl.type === "jsserviceinfo" || metaTmpl.type === "nativeserviceinfo")) {
                        info.name = svcInfo.id || info.name;
                    } else if (fileName === "packageinfo.json") {
                        info = merge(info, pkgInfo);
                    }
                    return info;
                })
                .then(function(info) {
                    const destFile = path.join(dest, path.basename(file));
                    return fs.mkdirsAsync(dest)
                        .then(function() {
                            return fs.writeFileSync(destFile, JSON.stringify(info, null, 2), {
                                encoding: 'utf8'
                            });
                        });
                });
        }))
        .then(function() {
            log.info("generator#generate()#_writeMetadata()", "done");
            return;
        })
        .catch(function(err) {
            log.silly("generator#generate()#_writeMetadata()", "err:", err);
            throw err;
        });
    }
};

Generator.prototype.getTmpl = function() {
    return templates;
};

Generator.prototype.existOutDir = function(outDir) {
    log.verbose("generator#existOutDir()", outDir);
    try {
        const files = fs.readdirSync(outDir);
        if (files.length > 0)
            return true;
    } catch (err) {
        if (err && err.code === 'ENOTDIR') {
            throw errHndl.getErrMsg("NOT_DIRTYPE_PATH", outDir);
        }
        if (err && err.code === 'ENOENT') {
            log.verbose("generator#generate()", "The directory does not exist.");
            return false;
        }
        throw err;
    }
};

// Internal functions
function parsePropArgs(property, targetInfo) {
    const props = property || [],
        info = targetInfo || {};
    if (props.length === 1 && props[0].indexOf('{') !== -1 && props[0].indexOf('}') !== -1 &&
        ((props[0].split("'").length - 1) % 2) === 0)
    {
        // eslint-disable-next-line no-useless-escape
        props[0] = props[0].replace(/\'/g,'"');
    }
    props.forEach(function(prop) {
        try {
            const data = JSON.parse(prop);
            for (const k in data) {
                info[k] = data[k];
            }
        } catch (err) {
            const tokens = prop.split('=');
            if (tokens.length === 2) {
                info[tokens[0]] = tokens[1];
            } else {
                log.warn('Ignoring invalid arguments:', prop);
            }
        }
    });
}

module.exports = Generator;
