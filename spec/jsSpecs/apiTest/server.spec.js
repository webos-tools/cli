/*
 * Copyright (c) 2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    common = require('../common-spec'),
    server = require('../../../lib/base/server'),
    async = require('async');

const aresCmd = 'Server',
    sampleAppPath = path.join(__dirname, "../..", "tempFiles/sampleApp"),
    serverOption = {
        path: undefined
    };

let expectedTemplate,
    killTimer,
    serverUrl;

function _reqHandler(code, res) {
    if (code === "@@ARES_CLOSE@@") {
        res.status(200).send();
        killTimer = setTimeout(function() {
        }, 2 * 1000);
    } else if (code === "@@GET_URL@@") {
        clearTimeout(killTimer);
        res.status(200).send(serverUrl);
    }
}

beforeAll(function(done) {
    common.getExpectedResult("ares-generate")
    .then(function(result) {
        expectedTemplate = result.template;
        done();
    });
});

afterAll(function(done) {
    common.removeOutDir(sampleAppPath);
    done();
});

describe("Test setting", function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    it('Generate sample app', function(done) {
        const generateCmd = common.makeCmd('ares-generate');
        exec(generateCmd + ` -t ${expectedTemplate.webapp} -p "id=com.domain.app" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let outputObj;
            try {
                const text = fs.readFileSync(path.join(sampleAppPath, "appinfo.json"));
                outputObj = JSON.parse(text);
            } catch (err) {
                console.error(err);
            }
            expect(outputObj.id).toBe("com.domain.app");
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd + ".runServer() and " + aresCmd + ".stop()", function() {
    it('Run a local web server', function(done) {
        async.waterfall([
            server.runServer.bind(server, `${sampleAppPath}`, 0, _reqHandler),
            function(serverInfo, next) {
                expect(serverInfo.msg).toContain('Local server running on http://localhost:');
                serverUrl = serverInfo.url;
                server.openBrowser(serverInfo.openBrowserUrl, serverOption.path, next);
            },
            function(returnObj, next) {
                expect(returnObj.msg).toContain('Browser opened');
                setTimeout(() => {
                    server.stop(next);
                }, 3000);
            }
        ], function(err, results) {
                expect(results.msg).toContain('Local server is stopped');
                done();
        });
    });

    it('Run a local web server with port option', function(done) {
        async.waterfall([
            server.runServer.bind(server, `${sampleAppPath}`, 1234, _reqHandler),
            function(serverInfo, next) {
                expect(serverInfo.msg).toContain('Local server running on http://localhost:');
                serverUrl = serverInfo.url;
                server.openBrowser(serverInfo.openBrowserUrl, serverOption.path, next);
            },
            function(returnObj, next) {
                expect(returnObj.msg).toContain('Browser opened');
                setTimeout(() => {
                    server.stop(next);
                }, 3000);
            }
        ], function(err, results) {
                expect(results.msg).toContain('Local server is stopped');
                done();
        });
    });
});
