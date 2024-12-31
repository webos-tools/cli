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
"use strict";var NFC=function(){function e(){if(!window.PalmServiceBridge)throw": This platform is not webOS Signage."}var a,i={HARMONY_0000:"This external device is not supported on current platform (or firmware).",NFC_0000:"Unknown event.",NFC_0001:"Unable to get status.",NFC_0200:"Failed to write tag.",NFC_0201:"Parameter is required.",NFC_0202:"'url' type must be string.",NFC_0100:"URL does not exist. Use setURL() to store URL value.",NFC_0300:"unknown event.",NFC_0301:"Unable to set TagVisibility.",NFC_0302:"'tagVisibility' type must be boolean.",NFC_0303:"Parameter is required."};function u(e,r){e&&"function"==typeof e&&(r.returnValue&&delete r.returnValue,r.subscribed&&delete r.subscribed,e(r))}function s(e,r,t){e&&"function"==typeof e&&(void 0===i[r]?e({errorCode:"UNKNOWN_ERROR",errorText:"Unknown error."}):"string"==typeof errorText?e({errorCode:r,errorText:i[r]+": "+t}):e({errorCode:r,errorText:i[r]}))}function l(e){return!(-1===e.errorCode&&-1<e.errorText.indexOf("Unknown method")&&-1<e.errorText.indexOf("for category"))}return e.prototype.setURL=function(t,i,o){if(o&&void 0!==o){if("string"==typeof o.url){var e=new PalmServiceBridge,r="luna://com.webos.service.nfc/tag/writeTag",n='{"url": "'+o.url+'"}';return e.url=r,e.onservicecallback=function(e){var r=JSON.parse(e);if(!1!==l(r))return!0===r.returnValue?(a=o.url,void u(t,{state:!0})):void s(i,"NFC_0200");s(i,"HARMONY_0000")},e.call(r,n)}s(i,"NFC_0202")}else s(i,"NFC_0201")},e.prototype.getURL=function(e,r){return void 0===a?void s(r,"NFC_0100"):void s(e,{URL:a})},e.prototype.setTagVisibility=function(t,i,e){if(e&&void 0!==e){if("boolean"==typeof e.tagVisibility){var r=new PalmServiceBridge,o="luna://com.webos.service.nfc/adapter/setState",n='{"powered":'+e.tagVisibility+"}";return r.url=o,r.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==l(r))return!0===r.returnValue?void u(t,{state:r.returnValue}):void s(i,"NFC_0301");s(i,"HARMONY_0000")}else s(i,"NFC_0300")},r.call(o,n)}s(i,"NFC_0302")}else s(i,"NFC_0303")},e.prototype.getStatus=function(t,i){var e=new PalmServiceBridge,r="luna://com.webos.service.nfc/adapter/getState";return e.url=r,e.onservicecallback=function(e){if("string"==typeof e){var r=JSON.parse(e);if(!1!==l(r))return!0===r.returnValue?void u(t,{tagType:r.tagType,tagVisibility:r.attached}):void s(i,"NFC_0001");s(i,"HARMONY_0000")}else s(i,"NFC_0000")},e.call(r,"{}")},e}();