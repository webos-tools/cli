/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs'),
    path = require('path'),
    semver = require('semver');

(function() {
    const vtools = {};
    let pkgInfo = null;

    vtools.showVersionAndExit = function() {
        getPackageVersion(function(err, version) {
            console.log("Version: " + version);
            process.exit(0);
        });
    };

    vtools.checkNodeVersion = function(next) {
        getAllowedNodeVersion(function(err, range) {
            const expectedRange = semver.validRange(range);
            if (expectedRange) {
                if (semver.satisfies(process.version, expectedRange)) {
                    next();
                } else {
                    console.error("This command only works on Node.js version: " + expectedRange);
                    process.exit(1);
                }
            } else {
                console.error("Invalid Node.js version range: " + range);
                process.exit(1);
            }
        });
    };

    // Private methods
    function getAllowedNodeVersion(next) {
        if (pkgInfo) {
            next(null, (pkgInfo && pkgInfo.engines && pkgInfo.engines.node) || "");
        } else {
            loadPackageJson(function(err) {
                next(err, (pkgInfo && pkgInfo.engines && pkgInfo.engines.node) || "");
            });
        }
    }

    function loadPackageJson(next) {
        const filename = path.resolve(__dirname, "../..", "package.json");
        fs.readFile(filename, function(err, data) {
            if (err) {
                return next("loadPackageJson_error");
            }

            try {
                pkgInfo = JSON.parse(data);
                next();
            } catch(error) {
                next(error);
            }
        });
    }

    function getPackageVersion(next) {
        if (pkgInfo) {
            next(null, pkgInfo.version);
        } else {
            loadPackageJson(function(err) {
                next(err, (pkgInfo && pkgInfo.version) || "unknown");
            });
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = vtools;
    }
}());
