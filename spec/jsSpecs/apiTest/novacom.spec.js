/*
 * Copyright (c) 2026 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const net = require('net'),
    novacom = require('../../../lib/base/novacom');

const aresCmd = 'Session',
    target = {host: '127.0.0.1', port: 9922},
    originalConnect = net.Socket.prototype.connect,
    originalEnd = net.Socket.prototype.end;

// Make the probe socket emit the given events instead of opening a real connection
function fakeSocketEvents(events) {
    net.Socket.prototype.connect = function() {
        setImmediate(() => {
            events.forEach(([name, arg]) => this.emit(name, arg));
        });
        return this;
    };
    net.Socket.prototype.end = function() {};
}

function makeError(code) {
    const err = new Error(code);
    err.code = code;
    return err;
}

describe(aresCmd + '.checkConnection()', function() {
    afterEach(function() {
        net.Socket.prototype.connect = originalConnect;
        net.Socket.prototype.end = originalEnd;
    });

    it('Should call back once when the socket errors after connecting', function(done) {
        // On macOS, end() right after connect makes the socket emit ENOTCONN
        fakeSocketEvents([['connect'], ['error', makeError('ENOTCONN')]]);
        const next = jasmine.createSpy('next');
        novacom.Session.prototype.checkConnection(target, next);
        setTimeout(function() {
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(null, target);
            done();
        }, 100);
    });

    it('Should call back with an error when the connection fails', function(done) {
        fakeSocketEvents([['error', makeError('ECONNREFUSED')]]);
        const next = jasmine.createSpy('next');
        novacom.Session.prototype.checkConnection(target, next);
        setTimeout(function() {
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.calls.argsFor(0)[0]).toBeTruthy();
            done();
        }, 100);
    });
});
