/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    common = require('./common-spec');

const aresCmd = 'ares-generate',
    outputPath = path.resolve(__dirname, "..", "tempFiles"),
    sampleAppPath = path.resolve(outputPath, "sampleApp"),
    sampleServicePath =  path.resolve(outputPath, "sampleService");

let cmd,
    options,
    expectedTemplate,
    expectedList;

beforeAll(function(done) {
    cmd = common.makeCmd(aresCmd);
    common.getOptions()
    .then(function(result) {
        options = result;
        return common.getExpectedResult(aresCmd);
    }).then(function(result) {
        expectedTemplate = result.template;
        expectedList = result.list;
        done();
    });
});

describe(aresCmd + ' -v', function() {
    it('Print help message with verbose log', function(done) {
        exec(cmd + ' -v', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain("verb argv");
            }
            expect(stdout).toContain("SYNOPSIS");
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd + ' --list', function() {
    it('List the available templates', function(done) {
        exec(cmd + ' --list', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            expectedList = expectedList.join('\n'); // multi string in array. need to join
            stdout = stdout.trim().replace(/\s+['\n']/g, '\n');
            expect(stdout).toContain(expectedList);
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd +' --property', function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });
    afterEach(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    it('Set the properties of appinfo.json', function(done) {
        const id = "com.sample.app";
        const version = "2.0.0";
        const title = "First App";

        exec(cmd + ` -t ${expectedTemplate.webapp} -p "id=${id}" -p "version=${version}" -p "title=${title}" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let text, outputObj;
            expect(fs.existsSync(path.join(sampleAppPath, "appinfo.json"))).toBe(true);
            try {
                text = fs.readFileSync(path.join(sampleAppPath, "appinfo.json"));
                outputObj = JSON.parse(text);
            } catch (err) {
                console.error(err);
            }

            expect(outputObj.id).toBe(id);
            expect(outputObj.version).toBe(version);
            expect(outputObj.title).toBe(title);
            expect(error).toBeNull();
            done();
        });
    });

    it('Set the properties of packageinfo.json', function(done) {
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

        const id = "com.sample.pkg";
        const version = "1.1.1";
        const test = "testData";

        exec(cmd + ` -t packageinfo -p "id=${id}" -p "version=${version}" -p "test=${test}" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let text, outputObj;
            expect(fs.existsSync(path.join(sampleAppPath, "packageinfo.json"))).toBe(true);
            try {
                text = fs.readFileSync(path.join(sampleAppPath, "packageinfo.json"));
                outputObj = JSON.parse(text);
            } catch (err) {
                console.error(err);
            }

            expect(outputObj.id).toBe(id);
            expect(outputObj.version).toBe(version);
            expect(outputObj.test).toBe(test);
            expect(error).toBeNull();
            done();
        });
    });

    it('Set the properties of services.json', function(done) {
        const id = "com.sample.app.service";
        const version = "1.1.1";

        exec(cmd + ` -t jsserviceinfo -p "id=${id}" -p "version=${version}" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let text, outputObj;
            expect(fs.existsSync(path.join(sampleAppPath, "services.json"))).toBe(true);
            try {
                text = fs.readFileSync(path.join(sampleAppPath, "services.json"));
                outputObj = JSON.parse(text);
            } catch (err) {
                console.error(err);
            }

            expect(outputObj.id).toBe(id);
            expect(outputObj.version).toBe(version);
            expect(outputObj.services[0].name).toBe(id);
            expect(error).toBeNull();
            done();
        });
    });

    it('Set the properties of qmlappinfo.json', function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }

        const id = "com.qml.app";
        const version = "2.0.0";
        const title = "First App";

        exec(cmd + ` -t ${expectedTemplate.qmlappinfo} -p "id=${id}" -p "version=${version}" -p "title=${title}" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let text, outputObj;
            expect(fs.existsSync(path.join(sampleAppPath, "appinfo.json"))).toBe(true);
            try {
                text = fs.readFileSync(path.join(sampleAppPath, "appinfo.json"));
                outputObj = JSON.parse(text);
            } catch (err) {
                console.error(err);
            }

            expect(outputObj.id).toBe(id);
            expect(outputObj.version).toBe(version);
            expect(outputObj.title).toBe(title);
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd + ' --template', function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });
    afterEach(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    it('webappinfo : appinfo.json for web app', function(done) {
        exec(cmd + ` -t webappinfo -p "id=com.domain.app" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            const fileList = [];

            expect(fs.existsSync(path.join(sampleAppPath))).toBe(true);
            try {
                fs.readdirSync(sampleAppPath).forEach(file => {
                    fileList.push(file);
                });
            } catch (err) {
                console.error(err);
            }

            expect(JSON.stringify(fileList)).toBe(JSON.stringify(expectedTemplate.webappinfo));
            expect(error).toBeNull();
            done();
        });
    });

    it('packageinfo : packageinfo.json for webOS package', function(done) {
        if (options.profile === "ose") {
            pending(options.skipTxt);
        }

        exec(cmd + ` -t packageinfo -p "id=com.domain" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            const  fileList= [];

            expect(fs.existsSync(path.join(sampleAppPath))).toBe(true);
            try {
                fs.readdirSync(sampleAppPath).forEach(file => {
                    fileList.push(file);
                });
            } catch(err) {
                console.error(err);
            }

            expect(JSON.stringify(fileList)).toContain(JSON.stringify(expectedTemplate.packageinfo));
            expect(error).toBeNull();
            done();
        });
    });

    it('hosted_webapp : generate hosted template app', function(done) {
        const url = "http://www.google.com";
        exec(cmd + ` -t hosted_webapp -p "url=${url}" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let text;
            expect(fs.existsSync(path.join(sampleAppPath, "index.html"))).toBe(true);
            try {
                text = fs.readFileSync(path.join(sampleAppPath,"index.html"));
            } catch (err) {
                console.error(err);
            }

            expect(text.toString()).toContain(url);
            expect(error).toBeNull();
            done();
        });
    });

    it('qmlapp : generate qml template app', function(done) {
        if (options.profile === "tv") {
            pending(options.skipTxt);
        }

        exec(cmd + ` -t qmlapp -p "id=com.qml.app" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let text;
            expect(fs.existsSync(path.join(sampleAppPath, "main.qml"))).toBe(true);
            try {
                text = fs.readFileSync(path.join(sampleAppPath,"main.qml"),'utf8');
            } catch (err) {
                console.error(err);
            }

            expect(text).toContain("com.qml.app");
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd + ' --overwrite(-f)', function() {
    beforeAll(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    afterAll(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });

    it('generate sample app', function(done) {
        exec(cmd + ` -t webappinfo -p "id=com.domain.app" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            const fileList = [];

            expect(fs.existsSync(path.join(sampleAppPath))).toBe(true);
            try {
                fs.readdirSync(sampleAppPath).forEach(file => {
                    fileList.push(file);
                });
            } catch (err) {
                console.error(err);
            }

            expect(JSON.stringify(fileList)).toBe(JSON.stringify(expectedTemplate.webappinfo));
            expect(error).toBeNull();
            done();
        });
    });

    it('Overwirte existing files', function(done) {
        exec(cmd + ` -f -t webappinfo -p "id=com.domain.app" ${sampleAppPath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            const fileList = [];

            expect(fs.existsSync(path.join(sampleAppPath))).toBe(true);
            try {
                fs.readdirSync(sampleAppPath).forEach(file => {
                    fileList.push(file);
                });
            } catch (err) {
                console.error(err);
            }

            expect(JSON.stringify(fileList)).toBe(JSON.stringify(expectedTemplate.webappinfo));
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd + ' --servicename', function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleServicePath);
        done();
    });
    afterEach(function(done) {
        common.removeOutDir(sampleServicePath);
        done();
    });

    it('Set the servicename for webOS service.', function(done) {
        const serviceid = "com.domain.app.service";
        exec(cmd + ` -t ${expectedTemplate.jsservice} -s ${serviceid} ${sampleServicePath}`, function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
            }

            let text, outputObj;
            expect(fs.existsSync(path.join(sampleServicePath, "services.json"))).toBe(true);
            try {
                text = fs.readFileSync(path.join(sampleServicePath, "services.json"));
                outputObj = JSON.parse(text);
            } catch (err) {
                console.error(err);
            }
            expect(outputObj.id).toBe(serviceid);
            expect(error).toBeNull();
            done();
        });
    });
});

describe(aresCmd + ' negative TC', function() {
    it("Set invalid template type", function(done) {
        exec(cmd + ' -t invalidType sampleApp', function(error, stdout, stderr) {
            if (stderr && stderr.length > 0) {
                common.detectNodeMessage(stderr);
                expect(stderr).toContain("ares-generate ERR! [Tips]: Invalid value <TEMPLATE> : invalidType", error);
            }
            done();
        });
    });
});
