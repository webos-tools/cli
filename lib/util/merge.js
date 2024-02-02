/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function merge(srcObj, extendObj) {
    for (const key in extendObj) {
        if (Object.prototype.hasOwnProperty.call(extendObj, key)) srcObj[key] = extendObj[key];
    }
    return srcObj;
}

module.exports = merge;
