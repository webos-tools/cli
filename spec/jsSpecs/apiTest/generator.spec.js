/*
 * Copyright (c) 2023-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const path = require('path'),
    fs = require('fs'),
    common = require('../common-spec'),
    Generator = require('../../../lib/generator');

const generator = new Generator(),
    aresCmd = 'Generator',
    outputPath = path.resolve(__dirname, "../..", "tempFiles"),
    sampleAppPath = path.resolve(outputPath, "sampleApp"),
    sampleServicePath =  path.resolve(outputPath, "sampleService");

let expectedTemplate,
    expectedList;

beforeAll(function(done) {
    common.getOptions()
    .then(function() {
        return common.getExpectedResult("ares-generate");
    }).then(function(result) {
        expectedTemplate = result.template;
        expectedList = result.list;
        done();
    });
});

afterAll(function(done) {
    common.removeOutDir(sampleAppPath); // can be in afterAll
    common.removeOutDir(sampleServicePath); // can be in afterAll
    done();
});

describe(aresCmd + ' --list', function() {
    it('List the available templates', function(done) {
        generator.showTemplates(false, function(err, value) {
            expectedList = expectedList.join('\n'); // multi string in array. need to join
            value.msg = value.msg.trim().replace(/\s+['\n']/g, '\n');
            expect(value.msg).toContain(expectedList);
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
        setTimeout(() => {
            common.removeOutDir(sampleAppPath);
            done();
        }, 3000);
    });

    it('Set the properties of appinfo.json', function(done) {
        const id = "com.sample.app",
            version = "2.0.0",
            title = "First App",
            options = {
                tmplName: "webappinfo",
                props: ['id='+`${id}`, 'version='+`${version}` , 'title='+`${title}`],
                out:sampleAppPath
            };
            
        let outputTxt = "", text, outputObj;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating webappinfo");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath, "appinfo.json"))).toBe(true);
                try {
                    text = fs.readFileSync(path.join(sampleAppPath, "appinfo.json"));
                    outputObj = JSON.parse(text);
                } catch (error) {
                    console.error(error);
                }    
                expect(outputObj.id).toBe(id);
                expect(outputObj.version).toBe(version);
                expect(outputObj.title).toBe(title);
                done();
            }, 5000);
        });
    });

    it('Set the properties of services.json', function(done) {
        const id = "com.sample.app.service",
            version = "1.1.1",
            options = {
                tmplName :"jsserviceinfo",
                props: ['id='+`${id}`, 'version='+`${version}`],
                out:sampleAppPath
            };
            
        let outputTxt = "", text, outputObj;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating jsserviceinfo");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath, "services.json"))).toBe(true);
                try {
                    text = fs.readFileSync(path.join(sampleAppPath, "services.json"));
                    outputObj = JSON.parse(text);
                } catch (error) {
                    console.error(error);
                }    
                expect(outputObj.id).toBe(id);
                done();
            }, 5000);
        });
    });

    it('Set the properties of qmlappinfo.json', function(done) {
        const id = "com.qml.app",
            version = "2.0.0",
            options = {
                tmplName :"qmlappinfo",
                props: ['id='+`${id}`, 'version='+`${version}`],
                out:sampleAppPath
            };
            
        let outputTxt = "", text, outputObj;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating qmlappinfo");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath, "appinfo.json"))).toBe(true);
                try {
                    text = fs.readFileSync(path.join(sampleAppPath, "appinfo.json"));
                    outputObj = JSON.parse(text);
                } catch (error) {
                    console.error(error);
                }    
                expect(outputObj.id).toBe(id);
                done();
            }, 5000);
        });
    });
});

describe(aresCmd + ' --template', function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleAppPath);
        done();
    });
    afterEach(function(done) {
        setTimeout(() => {
            common.removeOutDir(sampleAppPath);
            done();
        }, 5000);
    });

    
    it('webapp : appinfo.json for web app', function(done) {
        const options = {
            tmplName: "webapp",
            out:sampleAppPath
        };
            
        let outputTxt = "", fileList;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating webapp");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath))).toBe(true);
                try {
                    fileList = fs.readdirSync(sampleAppPath);
                } catch (error) {
                    console.error(error);
                }
                expect(fileList.toString()).toContain(expectedTemplate.webappinfo.toString());
                done();
            }, 5000);
        });
    });
    
    it('hosted_webapp : generate hosted template app', function(done) {
        const url = "http://www.google.com",
            options = {
                tmplName: "hosted_webapp",
                props: ['url='+`${url}`],
                out:sampleAppPath
            };
            
        let outputTxt = "", text;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating hosted_webapp");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath, "index.html"))).toBe(true);
                try {
                    text = fs.readFileSync(path.join(sampleAppPath,"index.html"));
                } catch (error) {
                    console.error(error);
                }
                expect(text.toString()).toContain(url);
                done();
            }, 5000);
        });
    });

    it('qmlapp : generate qml template app', function(done) {
        const id = "com.qml.app",
            title = "First App",
            options = {
                tmplName: "qmlapp",
                props: ['id='+`${id}`, 'title='+`${title}`],
                out:sampleAppPath
            };
            
        let outputTxt = "", text;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating qmlapp");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath, "main.qml"))).toBe(true);
                try {
                    text = fs.readFileSync(path.join(sampleAppPath,"main.qml"), 'utf8');
                } catch (error) {
                    console.error(error);
                }
                expect(text).toContain("com.qml.app");
                done();
            }, 5000);
        });
    });

    it('js_service : generate js_service template', function(done) {
        const id = "com.sample.app.service'",
            options = {
                tmplName: "js_service",
                svcinfo: {id:`${id}`},
                out:sampleAppPath
            };
            
        let outputTxt = "", text;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating js_service");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath, "services.json"))).toBe(true);
                try {
                    text = fs.readFileSync(path.join(sampleAppPath,"services.json"));
                } catch (error) {
                    console.error(error);
                }
                expect(text.toString()).toContain(id);
                done();
            }, 5000);
        });
    });
});

describe(aresCmd + ' --overwrite(-f)', function() {
    afterEach(function(done) {
        setTimeout(() => {
            common.removeOutDir(sampleAppPath);
            done();
        }, 5000);
    });

    it('webappinfo : appinfo.json for web app', function(done) {
        const options = {
            tmplName: "webappinfo",
            out:sampleAppPath
        };
            
        let outputTxt = "", fileList;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating webappinfo");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath))).toBe(true);

                try {
                    fileList = fs.readdirSync(sampleAppPath);
                } catch (error) {
                    console.error(error);
                }
                expect(JSON.stringify(fileList)).toBe(JSON.stringify(expectedTemplate.webappinfo));
                done();
            }, 3000);
        });
    });

    it('Overwirte existing files', function(done) {
        const id = "com.domain.app",
            version = "2.0.0",
            title = "First App",
            options = {
                tmplName: "webappinfo",
                props: ['id='+`${id}`, 'version='+`${version}`, 'title='+`${title}`],
                out:sampleAppPath,
                overwrite:true
            };
            
        let outputTxt = "", text, outputObj;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating webapp");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleAppPath, "appinfo.json"))).toBe(true);

                try {
                    text = fs.readFileSync(path.join(sampleAppPath, "appinfo.json"));
                    outputObj = JSON.parse(text);
                } catch (error) {
                    console.error(error);
                }    
                expect(outputObj.id).toBe(id);
                expect(outputObj.version).toBe(version);
                expect(outputObj.title).toBe(title);
                done();
            }, 3000);
        });
    });
});

describe(aresCmd + ' --servicename', function() {
    beforeEach(function(done) {
        common.removeOutDir(sampleServicePath);
        done();
    });
    afterEach(function(done) {
        setTimeout(() => {
            common.removeOutDir(sampleServicePath);
            done();
        }, 5000);
    });

    it('Set the servicename for webOS service.', function(done) {
        const id = "com.test.app.service",
            options = {
                tmplName: "jsserviceinfo",
                svcName: id,
                out:sampleServicePath
            };
            
        let outputTxt = "", text, outputObj;
        generator.generate(options, function(err, value) {
            outputTxt += value.msg;
            setTimeout(() => {
                expect(outputTxt).toContain("Generating jsserviceinfo");
                expect(outputTxt).toContain("Success");
                expect(fs.existsSync(path.join(sampleServicePath, "services.json"))).toBe(true);

                try {
                    text = fs.readFileSync(path.join(sampleServicePath, "services.json"));
                    outputObj = JSON.parse(text);
                } catch (error) {
                    console.error(error);
                }    
                expect(outputObj.id).toBe(id);
                done();
            }, 3000);
        });
    });
});
