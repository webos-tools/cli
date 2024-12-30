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
"use strict";var GPS=function(){function e(){if(!window.PalmServiceBridge)throw": This platform is not webOS Signage."}var n={HARMONY_0000:"This external device is not supported on current platform (or firmware).",GPS_0000:"Unknown event.",GPS_0001:"Unable to get status.",GPS_0100:"Unknown event.",GPS_0101:"Unable to get value.",GPS_0102:"Event handler is already set. Before set event handler, please remove current event handler.",GPS_0103:"Callback as used for parameter is not a function.",GPS_0200:"GPS event handler is not registered yet."};function o(e,r){e&&"function"==typeof e&&(r.returnValue&&delete r.returnValue,r.subscribed&&delete r.subscribed,e(r))}function i(e,r,t){e&&"function"==typeof e&&(void 0===n[r]?e({errorCode:"UNKNOWN_ERROR",errorText:"Unknown error."}):"string"==typeof errorText?e({errorCode:r,errorText:n[r]+": "+t}):e({errorCode:r,errorText:n[r]}))}function a(e){return!(-1===e.errorCode&&-1<e.errorText.indexOf("Unknown method")&&-1<e.errorText.indexOf("for category"))}var l,u,c=null;return e.prototype.setEventHandler=function(e,r){if(c&&null!==c)i(u,"GPS_0102");else{if("function"==typeof e&&"function"==typeof r){l=e,u=r;var t="luna://com.webos.service.externaldevice/gps/getData";return(c=new PalmServiceBridge).url=t,c.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==a(r))return!0===r.returnValue?void o(l,r):void i(u,"GPS_0101");i(u,"HARMONY_0000")}else i(u,"GPS_0100")},c.call(t,'{"subscribe":true}')}i(r,"GPS_0103")}},e.prototype.removeEventHandler=function(e,r){return c&&"undefined"!==c?(c.cancel(),c=null,void o(e)):void i(r,"GPS_0200")},e.prototype.getValue=function(t,n){var e=new PalmServiceBridge,r="luna://com.webos.service.externaldevice/gps/getData";return e.url=r,e.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==a(r))return!0===r.returnValue?void o(t,r):void i(n,"GPS_0101");i(n,"HARMONY_0000")}else i(n,"GPS_0100")},e.call(r,"{}")},e.prototype.getStatus=function(t,n){var e=new PalmServiceBridge,r="luna://com.webos.service.externaldevice/gps/getStatus";return e.url=r,e.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==a(r))return!0===r.returnValue?void o(t,{attached:r.attached}):void i(n,"GPS_0001");i(n,"HARMONY_0000")}else i(n,"GPS_0000")},e.call(r,"{}")},e}();