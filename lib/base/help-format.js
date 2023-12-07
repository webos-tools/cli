/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs'),
    path = require('path'),
    sprintf = require('sprintf-js').sprintf;

(function() {
    const helpFormat = {};

    helpFormat.display = function(processName, profile, hiddenFlag) {
        const helpFile = path.join(__dirname, '../../files/help', processName + '.help');
        let helpString = [];
        this.profile = profile;

        try {
            const data = JSON.parse(fs.readFileSync(helpFile, 'utf8'));
            data.display.forEach(function(prop) {
                helpString.push("");
                if (!data.notitle || data.notitle.indexOf(prop) === -1) {
                    helpString.push(prop.toUpperCase());
                }

                if (data.notab && data.notab.indexOf(prop) !== -1) {
                    helpString = helpString.concat(helpFormat.stringFormat(data[prop], false, hiddenFlag));
                } else {
                    helpString = helpString.concat(helpFormat.stringFormat(data[prop], true, hiddenFlag));
                }
            });
            helpFormat.print(helpString);
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    helpFormat.string = function(data, tab) {
        let helpString = "";
        if (data === undefined) return [];

        data = data.split("@TAB@");
        for (const index in data) {
            if (index !== 0 || tab) {
                helpString += sprintf("\t%-32s", data[index]);
            } else {
                helpString += sprintf(data[index]);
            }
        }
        return [helpString];
    };

    helpFormat.stringArray = function(data, tab) {
        let helpString = [];
        for (const index in data) {
            helpString = helpString.concat(helpFormat.stringFormat(data[index], tab));
        }
        return helpString;
    };

    helpFormat.optionObject = function(data, tab) {
        let helpString = [],
            optionList = [].concat(data.default||[]).concat(data.default-process||[]);
        optionList = optionList.concat(data[this.profile]||[]).concat(data[process.platform]||[]);
        for (const index in optionList) {
            helpString = helpString.concat(helpFormat.stringFormat(data[optionList[index]], tab));
        }
        return helpString;
    };

    helpFormat.stringObject = function(data, tab) {
        const defaultData = [].concat(data.default||[]).concat(data.default-process||[]),
            currentData = [].concat(data[this.profile]||[]).concat(data[process.platform]||[]);
        let helpString = [];
        helpString = helpString.concat(helpFormat.stringFormat(defaultData.concat(currentData), tab));
        return helpString;
    };

    helpFormat.hiddenObject = function(data, tab, hiddenFlag) {
        return (hiddenFlag) ? helpFormat.stringObject(data, tab) : [];
    };

    helpFormat.stringFormat = function(data, tab, hiddenFlag) {
        let helpString = [];
        if (Array.isArray(data)) {
            helpString = helpString.concat(helpFormat.stringArray(data, tab));
        } else if (typeof data === 'object') {
            if (data.cmdOpt && data.cmdOpt === 'option') {
                helpString = helpString.concat(helpFormat.optionObject(data, tab));
            }
            else if (data.cmdOpt && data.cmdOpt === 'hidden') {
                helpString = helpString.concat(helpFormat.hiddenObject(data, tab, hiddenFlag));
            } else {
                helpString = helpString.concat(helpFormat.stringObject(data, tab));
            }
        } else {
            helpString = helpString.concat(helpFormat.string(data, tab));
        }
        return helpString;
    };

    helpFormat.format =  function(msg) {
        let helpString = "",
            dependOnPlatform = false,
            accept = false;
        msg = [].concat(msg);

        msg.forEach(function(platform) {
            if (["win32", "linux", "darwin"].indexOf(platform) !== -1) {
                dependOnPlatform = true;
                if (platform === process.platform) {
                    accept = true;
                }
            }
        });

        let idx = 0;
        if (dependOnPlatform === true) {
            if (accept === true) {
                idx = 1;
            } else {
                return null;
            }
        }

        for (; idx < arguments.length; idx++) {
            helpString = helpString.concat(sprintf('\t%-30s', arguments[idx]));
        }
        return helpString;
    };

    helpFormat.print = function(arrayStrHelp) {
        arrayStrHelp = [].concat(arrayStrHelp);

        arrayStrHelp.forEach(function(line) {
            if (typeof line === 'string') {
                console.log(line);
            }
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = helpFormat;
    }
}());
