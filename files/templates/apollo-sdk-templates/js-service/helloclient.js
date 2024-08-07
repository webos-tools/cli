/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// helloclient.js
// Subscribe & cancel subscription to helloService's heartbeat method
const Service = require('webos-service');

const service = new Service("com.example.helloclient"); // Register com.example.helloworld

console.log("simple call");
// Change @SERVICE-NAME@ to real service name
service.call("luna://@SERVICE-NAME@/hello", {}, function(message) {
    console.log("call @SERVICE-NAME@/hello");
    console.log("message payload: " + JSON.stringify(message.payload));
    const sub = service.subscribe("luna://@SERVICE-NAME@/heartbeat", {subscribe: true});
    const max = 10;
    let count = 0;
    sub.addListener("response", function(msg) {
        console.log(JSON.stringify(msg.payload));
        if (++count >= max) {
            sub.cancel();
            setTimeout(function() {
                console.log(max+" responses received, exiting...");
                process.exit(0);
            }, 1000);
        }
    });
});
