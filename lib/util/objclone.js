/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function deepCopy(obj) {
    if (obj === null || typeof(obj) !== 'object') {
        return obj;
    }

    const copy = new obj.constructor();
    Object.setPrototypeOf(copy, obj);

    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        copy[attr] = deepCopy(obj[attr]);
      }
    }
    return copy;
}

function shallowCopy(obj) {
    if (obj === null || typeof(obj) !== 'object') {
        return obj;
    }

    const copy = new obj.constructor();
    Object.setPrototypeOf(copy, obj);

    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        copy[attr] = obj(obj[attr]);
      }
    }
    return copy;
}

module.exports.shallowCopy = shallowCopy;
module.exports.deepCopy = deepCopy;
