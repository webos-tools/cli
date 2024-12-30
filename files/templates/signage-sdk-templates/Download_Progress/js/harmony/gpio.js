/*
* ============================================================================
*   
*   ID ENGINEERING R&D TEAM, LG ELECTRONICS INC., PYEONGTAEK, KOREA
*   Copyright(c) 2018 by LG Electronics Inc.. All rights reserved.
*   
*   Harmony API, for handling external device on webOS Signage platform
*   
*   Author          : signagesupport@lge.com
*   Homepage        : http://webossignage.developer.lge.com
*   Modified Date   : 2018-11-29
*   Release Version : 1.30.2018-11-29
*   
* ============================================================================
*/
"use strict";var GPIO=function(){function e(){if(!window.PalmServiceBridge)throw": This platform is not webOS Signage."}var a,l,u,i={HARMONY_0000:"This external device is not supported on current platform (or firmware).",GPIO_0000:"Unknown event.",GPIO_0001:"Unable to get status.",GPIO_0100:"Unknown event.",GPIO_0101:"Unable to get value.",GPIO_0102:"Parameter is required.",GPIO_0103:"'samplingRate' must be number, and unit is millisecond.",GPIO_0104:"'type' must be 'analog' or 'digital'.",GPIO_0105:"This function does not working in this firmware, please check the guide.",GPIO_0106:"'pin' must be number, and pin >= 0",GPIO_0107:"Pin 4 and 5 does not support analog value.",GPIO_0108:"Event handler is already set. Before set event handler, please remove current event handler.",GPIO_0109:"Callback as used for parameter is not a function.",GPIO_0200:"GPIO event handler is not registered yet."};function o(e,r){e&&"function"==typeof e&&(r.returnValue&&delete r.returnValue,r.subscribed&&delete r.subscribed,e(r))}function s(e,r,n){e&&"function"==typeof e&&(void 0===i[r]?e({errorCode:"UNKNOWN_ERROR",errorText:"Unknown error."}):"string"==typeof errorText?e({errorCode:r,errorText:i[r]+": "+n}):e({errorCode:r,errorText:i[r]}))}function f(e){return!(-1===e.errorCode&&-1<e.errorText.indexOf("Unknown method")&&-1<e.errorText.indexOf("for category"))}var c,d={},p={},v={};function O(e){if("string"!=typeof e&&u&&"function"==typeof u)s(u,"GPIO_0100");else{var r=JSON.parse(e);if(!1!==f(r)){if(!0===r.returnValue){if(void 0===r.pinValues)return void s(u,"GPIO_0101");var n={},i=r.pinValues,t=[1&i?0:1,i>>1&1?0:1,i>>2&1?0:1,i>>3&1?0:1,i>>4&1?0:1,i>>5&1?0:1,i>>6&1?0:1,i>>7&1?0:1];return n.value=t,void o(l,n)}s(u,"GPIO_0101")}else s(u,"HARMONY_0000")}}function P(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==f(r))if(!0===r.returnValue){var n={};n.value=r.value,3<r.pin?n.pin=r.pin+2:n.pin=r.pin,o(p[r.pin],n)}else s(v[c],"GPIO_0101");else s(v,"HARMONY_0000")}else s(v,"GPIO_0100")}return e.prototype.setEventHandler=function(e,r,n){if(n&&void 0!==n){if("digital"===n.type){if(a&&"undefined"!==a)return void s(r,"GPIO_0108");if("function"!=typeof e||"function"!=typeof r)return void s(r,"GPIO_0109");l=e,u=r;var i="luna://com.webos.service.externaldevice/gpio/readAll",t='{"subscribe":true}';return(a=new PalmServiceBridge).url=i,a.onservicecallback=O,a.call(i,t)}if("analog"===n.type){if("number"!=typeof n.pin)return void(r&&"function"==typeof r&&s(r,"GPIO_0106"));if("number"!=typeof n.samplingRate)return void s(r,"GPIO_0103");if(4===n.pin||5===n.pin)return void s(r,"GPIO_0107");var o=n.pin;if(5<o&&(o-=2),d[o]&&"undefined"!==d[o])return void s(r,"GPIO_0108");if("function"!=typeof e||"function"!=typeof r)return void s(r,"GPIO_0109");p[o]=e,v[o]=r;i="luna://com.webos.service.externaldevice/gpio/readADC",t='{"subscribe":true, "pin": '+(c=o)+', "samplingRate": '+n.samplingRate+"}";return d[o]=new PalmServiceBridge,d[o].url=i,d[o].onservicecallback=P,d[o].call(i,t)}s(r,"GPIO_0104")}else s(r,"GPIO_0100")},e.prototype.removeEventHandler=function(e,r,n){if(e&&"object"==typeof e)if("digital"===e.type)a&&void 0!==a&&(a.cancel(),a=null);else{if("analog"!==e.type)return void s(n,"GPIO_0104");if("number"!=typeof e.pin)return void s(n,"GPIO_0106");if(!(0<=e.pin))return void s(n,"GPIO_0106");if(4===e.pin||5===e.pin)return void s(n,"GPIO_0107");var i=e.pin;if(5<i&&(i-=2),d[i]&&void 0!==d[i]){d[i].cancel(),d[i]=null,url="luna://com.webos.service.externaldevice/gpio/readADC",params='{"subscribe":false, "pin":'+i+"}";var t=new PalmServiceBridge;t.url=url,t.onservicecallback=null,t.call(url,params)}}else s(n,"GPIO_0102")},e.prototype.getStatus=function(n,i){var e=new PalmServiceBridge,r="luna://com.webos.service.externaldevice/gpio/getState";return e.url=r,e.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==f(r))return!0===r.returnValue?void o(n,{attached:r.attached}):void s(i,"GPIO_0001");s(i,"HARMONY_0000")}else s(i,"GPIO_0000")},e.call(r,"{}")},e}();