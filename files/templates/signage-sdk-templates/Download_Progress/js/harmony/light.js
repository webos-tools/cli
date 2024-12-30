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
"use strict";var Light=function(){function e(){if(!window.PalmServiceBridge)throw": This platform is not webOS Signage."}var n,o,i,a={HARMONY_0000:"This external device is not supported on current platform (or firmware).",LIGHT_0000:"Unknown event.",LIGHT_0001:"Unable to get status.",LIGHT_0100:"Unknown event.",LIGHT_0101:"Unable to get value.",LIGHT_0102:"Event handler is already set. Before set event handler, please remove current event handler.",LIGHT_0103:"Callback as used for parameter is not a function.",LIGHT_0200:"Light event handler is not registered yet."};function l(e,r){e&&"function"==typeof e&&(r.returnValue&&delete r.returnValue,r.subscribed&&delete r.subscribed,e(r))}function u(e,r,t){e&&"function"==typeof e&&(void 0===a[r]?e({errorCode:"UNKNOWN_ERROR",errorText:"Unknown error."}):"string"==typeof errorText?e({errorCode:r,errorText:a[r]+": "+t}):e({errorCode:r,errorText:a[r]}))}function c(e){return!(-1===e.errorCode&&-1<e.errorText.indexOf("Unknown method")&&-1<e.errorText.indexOf("for category"))}return e.prototype.setEventHandler=function(e,r){if(n&&"undefined"!=n)u(i,"LIGHT_0102");else{if("function"==typeof e&&"function"==typeof r){o=e,i=r;var t="luna://com.webos.service.externaldevice/light/read";return(n=new PalmServiceBridge).url=t,n.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==c(r))return!0===r.returnValue?void l(o,{value:r.value}):void u(i,"LIGHT_0101");u(i,"HARMONY_0000")}else u(i,"LIGHT_0100")},n.call(t,'{"subscribe":true}')}u(r,"LIGHT_0103")}},e.prototype.removeEventHandler=function(e,r){return n&&"undefined"!=n?(n.cancel(),n=null,void l(e)):void u(r,"LIGHT_0200")},e.prototype.getValue=function(t,n){var e=new PalmServiceBridge,r="luna://com.webos.service.externaldevice/light/read";return e.url=r,e.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==c(r))return!0===r.returnValue?void t({value:r.value}):void u(n,"LIGHT_0101");u(n,"HARMONY_0000")}else u(n,"LIGHT_0100")},e.call(r,"{}")},e.prototype.getStatus=function(t,n){var e=new PalmServiceBridge,r="luna://com.webos.service.externaldevice/light/getStatus";return e.url=r,e.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==c(r))return!0===r.returnValue?void l(t,{attached:r.attached}):void u(n,"LIGHT_0001");u(n,"HARMONY_0000")}else u(n,"LIGHT_0000")},e.call(r,"{}")},e}();