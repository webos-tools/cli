/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Return a file name based on Date.
function createDateFileName(separator, extName) {
    return __getDate();
    
    function __getDate() {
        if (separator === null || separator === undefined) {
            separator = "";
        }

        const curDate = new Date();
        let dateFormat = __pad(curDate.getFullYear(), 2)
            +  __pad((curDate.getMonth()+1), 2)
            + __pad(curDate.getDate(), 2)
            + separator
            + __pad(curDate.getHours(), 2)
            + __pad(curDate.getMinutes(), 2)
            + __pad(curDate.getSeconds(), 2);

        if (extName) {
            dateFormat += "." + extName;
        }
        return dateFormat;
    }

    function __pad(number, length) {
        let str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
}

module.exports.createDateFileName = createDateFileName;
