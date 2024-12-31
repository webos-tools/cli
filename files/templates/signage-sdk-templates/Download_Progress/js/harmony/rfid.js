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
"use strict";var RFID=function(){function e(){if(!window.PalmServiceBridge)throw": This platform is not webOS Signage."}var n,o,i,a={HARMONY_0000:"This external device is not supported on current platform (or firmware).",RFID_0000:"Unknown event.",RFID_0001:"Unable to get status.",RFID_0100:"Unknown event.",RFID_0101:"Unable to get value.",RFID_0102:"Event handler is already set. Before set event handler, please remove current event handler.",RFID_0103:"Callback as used for parameter is not a function.",RFID_0200:"RFID event handler is not registered yet."};function l(e,r){e&&"function"==typeof e&&(r.returnValue&&delete r.returnValue,r.subscribed&&delete r.subscribed,e(r))}function s(e,r,t){e&&"function"==typeof e&&(void 0===a[r]?e({errorCode:"UNKNOWN_ERROR",errorText:"Unknown error."}):"string"==typeof errorText?e({errorCode:r,errorText:a[r]+": "+t}):e({errorCode:r,errorText:a[r]}))}function u(e){return!(-1===e.errorCode&&-1<e.errorText.indexOf("Unknown method")&&-1<e.errorText.indexOf("for category"))}var d=[];return e.prototype.setEventHandler=function(e,r){if(n&&"undefined"!=n)s(i,"RFID_0102");else{if("function"==typeof e&&"function"==typeof r){o=e,i=r;var t="luna://com.webos.service.externaldevice/rfid/readTag";return(n=new PalmServiceBridge).url=t,n.onservicecallback=function(e){var r={};if("string"==typeof e){var t=JSON.parse(e);if(!1!==u(t)){if(!0===t.returnValue){if(t.taglist&&0<t.taglist.length)r.taglist=t.taglist;else if(d&&0<d.length){for(var n=0;n<d.length;n++)d[n].event="Removed";r.taglist=d}else r.taglist=t.taglist;return d=t.taglist,void l(o,r)}s(i,"RFID_0101")}else s(i,"HARMONY_0000")}else s(i,"RFID_0100")},n.call(t,'{"subscribe":true}')}s(r,"RFID_0103")}},e.prototype.removeEventHandler=function(e,r){return n&&"undefined"!=n?(n.cancel(),n=null,void l(e)):void s(r,"RFID_0200")},e.prototype.getStatus=function(t,n){var e=new PalmServiceBridge,r="luna://com.webos.service.externaldevice/rfid/getState";return e.url=r,e.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==u(r))return!0===r.returnValue?void l(t,{attached:r.attached,readerIds:r.readerIds}):void s(n,"RFID_0001");s(n,"HARMONY_0000")}else s(n,"RFID_0000")},e.call(r,"{}")},e}();