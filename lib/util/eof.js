/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const stream = require('stream'),
    util = require('util');

(function() {
    function Eof() {
        stream.Stream.call(this);
    }

    util.inherits(Eof, stream.Stream);

    // Readable stream interface
    Eof.prototype.pause = function() {};

    Eof.prototype.resume = function() {};

    Eof.prototype.destroy = function() {
        this.emit('end');
        this.emit('close');
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Eof;
    }
}());
