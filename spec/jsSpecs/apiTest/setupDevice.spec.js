/*
 * Copyright (c) 2023-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const setupDevice = require('../../../lib/base/setup-device');

const aresCmd = 'SetupDevice',
    device = 'testDevice',
    setupDeviceOptions = {};

describe(aresCmd + '.resetDeviceList()', function() {
    it('Should List all device information', function(done) {
        setupDevice.resetDeviceList(function(err, value) {
            expect(value.msg).toContain("developer");
            done();
        });
    });
});

describe(aresCmd + '.modifyDeviceInfo()', function() {
    it('Add a device information', function(done) {
        const host = "192.168.0.5",
            port = '1234',
            username = 'developer';
        setupDeviceOptions.add = device;
        setupDeviceOptions.info = [`username=${username}`, `host=${host}`, `port=${port}`];
        setupDevice.modifyDeviceInfo(setupDeviceOptions, function(err, value) {
            expect(value.msg).toContain(device);
            expect(value.msg).toContain(host);
            expect(value.msg).toContain(port);
            expect(value.msg).toContain(username);
            expect(value.msg).toContain("emulator");
            done();
            delete setupDeviceOptions.add;
        });
    });
    it('Modify a device information', function(done) {
        const username = 'developer',
            host = '192.168.0.1',
            port = '4321';
        setupDeviceOptions.modify = device;
        setupDeviceOptions.info = [`username=${username}`, `host=${host}`, `port=${port}`];
        setupDevice.modifyDeviceInfo(setupDeviceOptions, function(err, value) {
            expect(value.msg).toContain(username);
            expect(value.msg).toContain(host);
            expect(value.msg).toContain(port);
            done();
            delete setupDeviceOptions.modify;
        });
    });
});

describe(aresCmd + '.setDefaultDevice()', function() {
    it('Should List all device information', function(done) {
        setupDevice.setDefaultDevice(device, function(err, value) {
            expect(value.msg).toContain(device + "\x1B[32m (default)");
            done();
        });
    });
});

describe(aresCmd + '.showDeviceList()', function() {
    it('Should List all device information', function(done) {
        setupDevice.showDeviceList(function(err, value) {
            expect(value.msg).toContain(device);
            expect(value.msg).toContain("emulator");
            done();
        });
    });
});

describe(aresCmd + '.removeDevice()', function() {
    it('Remove a device information', function(done) {
        setupDeviceOptions.remove = device;
        setupDevice.removeDeviceInfo(setupDeviceOptions, function(err, value) {
            expect(value.msg).not.toContain(device);
            done();
            delete setupDeviceOptions.remove;
        });
    });
});

describe(aresCmd + '.showDeviceListFull()', function() {
    it('Should List all device information', function(done) {
        setupDevice.showDeviceListFull(function(err, value) {
            expect(value.msg).toContain("description");
            expect(value.msg).toContain("emulator");
            done();
        });
    });
});
