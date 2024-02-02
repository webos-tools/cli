/*
 * Copyright (c) 2023-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const common = require('../common-spec'),
    installer = require('../../../lib/install');

const aresCmd = 'Installer',
    installOptions = {
        opkg: false
    };

let options;

beforeAll(function(done) {
    common.getOptions()
    .then(function(result) {
        options = result;
        done();
    });
});

describe("Test setting", function() {
    it("Add device with ares-setup-device", function(done) {
        common.resetDeviceList()
        .then(function() {
            return common.addDeviceInfo();
        }).then(function(result) {
            expect(result).toContain(options.device);
            done();
        }).catch(function(err) {
            expect(err).toContain("The specified value already exist");
            done();
        });
    });
});

describe(aresCmd + '.install()', function() {
    it('Install sample ipk to device', function(done) {
        installer.install(installOptions, `${options.ipkPath}`, function(err, value) {
            expect(value.msg).toContain("Success");
            done();
        }, function(data) {
            expect(data).toContain("Installing package");
        });
    });
});

describe(aresCmd + '.list()', function() {
    it('List the installed apps on device', function(done) {
        installer.list(installOptions, function(err, value) {
            expect(JSON.stringify(value)).toContain(`${options.pkgId}`);
            done();
        });
    });
});

describe(aresCmd + '.remove()', function() {
    it('Install sample ipk to device', function(done) {
        installer.remove(installOptions, `${options.pkgId}`, function(err, value) {
            expect(value.msg).toContain(`Removed package ${options.pkgId}`);
            done();
        });
    });
});
