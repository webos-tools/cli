/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const promise = require('bluebird'),
    log = require('npmlog');

const fs = promise.promisifyAll(require('fs'));

function readJsonSync(file) {
    let result;
    try {
        const contents = fs.readFileSync(file, 'utf8');
        result = JSON.parse(contents.toString().replace(/^\ufeff/g, '')); // Removing BOM
    } catch (err) {
        log.warn("json#readJsonSync()", "error:", err);
        throw err;
    }
    return result;
}

function readJsonAsync(file) {
    return fs.readFileAsync(file, 'utf8')
        .then(function(contents) {
            return JSON.parse(contents.toString().replace(/^\ufeff/g, '')); // Removing BOM
        })
        .catch(function(err) {
            log.warn("json#readJsonAsync()", "error:", err);
            throw err;
        });
}

function convertJsonToList(orgJson, level) {
    let returnText = "", prefix = "";

    for (let i = 0; i < level; i++) {
        prefix += "-";
    }

    if (typeof orgJson === "string") {
        return returnText += prefix + orgJson + '\n';
    } else if (Array.isArray(orgJson) && orgJson.length > 0) {
        for (let index = 0; index < orgJson.length; index++) {
            returnText += convertJsonToList(orgJson[index], level);
        }
    } else {
        // handle object type
        for (const key in orgJson) {
            if (typeof orgJson[key] === "object") {
                returnText += prefix + key + '\n' +  convertJsonToList(orgJson[key], level + 1);
            } else {
                returnText += prefix + key + " : " + orgJson[key] + '\n';
            }
        }
    }
    return returnText;
}

module.exports.readJsonSync = readJsonSync;
module.exports.readJsonAsync = readJsonAsync;
module.exports.convertJsonToList = convertJsonToList;
