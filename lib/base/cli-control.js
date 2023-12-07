/*
 * Copyright (c) 2020-2023 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

(function() {
    const cliControl = {};

    cliControl.end =  function(exitCode) {
        let draining = 0;
        const streams = [process.stdout, process.stderr],
            exit = function() {
                if (!(draining--)) {
                    process.exit(exitCode || 0);
                }
            };

        streams.forEach(function(stream) {
                draining += 1;
                stream.write('', exit);
        });
        exit();
    };

    if (process.stdin) {
        const reqExit = "@ARES-CLOSE@";
        process.stdin.on("data", function(data) {
            let str;
            if (Buffer.isBuffer(data)) {
                str = data.toString();
            } else {
                str = data;
            }
            if (str.trim() === reqExit) {
                cliControl.end(0);
            }
        });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = cliControl;
    }
}());
