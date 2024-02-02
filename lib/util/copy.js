/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const promise = require('bluebird'),
    path = require('path'),
    fs = promise.promisifyAll(require('fs-extra'));

function copyToDirAsync(src, destDir) {
    return fs.lstatAsync(src).then(function(stats) {
        if (stats.isFile()) {
            return fs.copyAsync(src, path.join(destDir, path.basename(src)));
        } else {
            return fs.copyAsync(src, destDir);
        }
    });
}

function copyToDirSync(src, destDir) {
    const stats = fs.lstatSync(src);
    if (stats.isFile()) {
        fs.copySync(src, path.join(destDir, path.basename(src)));
    } else {
        fs.copySync(src, destDir);
    }
}

module.exports.copyToDirAsync = copyToDirAsync;
module.exports.copyToDirSync = copyToDirSync;
