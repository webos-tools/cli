/*
 * ============================================================================
 *   ID ENGINEERING R&D TEAM, LG ELECTRONICS INC., PYEONGTAEK, KOREA                       
 *   Copyright(c) 2018 by LG Electronics Inc.                                  
 *                              
 *   Author          : signagesupport@lge.com
 *   Modified Date   : 2018-09-05
 *   Release Version : 1.2180905
 * 
 *   See ./doc/index.html for more detail
 * ============================================================================
 */

cordova.define("cordova/plugin/custom",function(e,a,l){var n;n=window.PalmSystem?e("cordova/plugin/webos/service"):{Request:function(e,a){"function"==typeof a.onFailure&&a.onFailure({returnValue:!1,errorCode:"NOT_WEBOS",errorText:"PalmSystem Not Available. Cordova is not installed?"})}};var t=function(){},r={"1.0":["getPowerOnOffHistory","changePassword","getwebOSVersion","disableApplication","setPowerOnStatus","getPowerOnStatus","setWhiteBalanceRGB","getWhiteBalanceRGB"],"2.0":["getKAM","setKAM","getApplicationInfo","switchApplication","setMaster","setSlave","setAvSync","setAvSyncSpeaker","setAvSyncBypass","getAvSync","getAvSyncSpeaker","getAvSyncBypass","addUSBAttachEventListener","removeUSBAttachEventListener"],"3.0":["getWoWLAN","setWoWLAN","getNativePortraitMode","setNativePortraitMode","setNoSignalImageStatus","getNoSignalImageStatus","clearBrowsingData"],3.2:["setEnterpriseCode","getPortControl","setPortControl"],"4.0":[]},i={USBAttachEventListener:null},c={webOSVersion:-2},o={COMMERCIAL:"commercial",HOTELMODE:"hotelMode",NETWORK:"network",OPTION:"option",SOUND:"sound",PICTURE:"picture",LOCK:"lock"},s="enableKAM",R="password",O="siAppOrientation",u="screenRotation",C="wolwowlOnOff",d="powerOnStatus",E="powerOnOffHistory",b="avSync",p="avSyncSpeaker",f="avSyncBypassInput",A="noSignalImage",M="pictureMode",k="systemPin",N="blockedPortList";t.ERROR_CODE={COMMON:{OLD_WEBOS_VERSION:"OLD_WEBOS_VERSION",UNSUPPORTED_API:"UNSUPPORTED_API",BAD_PARAMETERS:"BAD_PARAMETERS",INTERNAL_ERROR:"INTERNAL_ERROR",NOT_MONITORING:"NOT_MONITORING",MEDIA_ERROR:"MEDIA_ERROR"},CONFIGURATION:{INVALID_PASSWORD_FORMAT:"BAD_PARAMETERS",ACCESS_DENIED:"ACCESS_DENIED",INVALID_CONFIG:"INVALID_CONFIGURATION"},APPLICATION:{SETTINGS_ERROR:"SETTINGS_ERROR",NOT_INSTALLED:"NOT_INSTALLED"}},t.CLEARBROWSINGDATATYPES={ALL:"all",APPCACHE:"appcache",CACHE:"cache",CHANNELIDS:"channelIDs",COOKIES:"cookies",FILESYSTEMS:"filesystems",INDEXEDDB:"indexedDB",LOCALSTORAGE:"localstorage",SERVICEWORKERS:"serviceworkers",WEBSQL:"webSQL"},t.AVSYNC={ON:"on",OFF:"off"},t.AVSYNCBYPASS={ON:"on",OFF:"off"},t.NOSIGNALIMAGE={ON:"on",OFF:"off"},t.POWERONSTATUS={POWERON:"power_on",STANDBY:"stand_by",LASTSTATUS:"lst"},t.APPLICATION={ZIP_TYPE:"commercial.signage.signageapplauncher",IPK_TYPE:"com.lg.app.signage",EXTERNAL_HDMI:"com.webos.app.hdmi1",EXTERNAL_HDMI1:"com.webos.app.hdmi1",EXTERNAL_HDMI2:"com.webos.app.hdmi2",EXTERNAL_HDMI3:"com.webos.app.hdmi3",EXTERNAL_HDMI4:"com.webos.app.hdmi4",EXTERNAL_RGB:"com.webos.app.externalinput.rgb",EXTERNAL_DVI:"com.webos.app.hdmi2",EXTERNAL_DP:"com.webos.app.hdmi3",EXTERNAL_OPS:"com.webos.app.hdmi4"},t.NATIVEPORTRAIT={OFF:"off",DEGREE_90:"90",DEGREE_180:"180",DEGREE_270:"270"};var S={Common:{isPropertyExists:function(e){return void 0!==e&&void 0!==e&&null!==e}},PlatformChecker:{checkPlatformSupportedThisAPI:function(e){for(var a in r)for(var l in r[a])if(r[a][l]===e)return parseFloat(a)<=c.webOSVersion||parseFloat(a);return!1}},SubscriptionChecker:{checkCurrentStatusSubscribed:function(e){return"object"==typeof e&&"string"==typeof e.uri&&"object"==typeof e.params}},ParameterChecker:{checkParametersValidation:function(e,a,l){if("object"!=typeof e||"object"!=typeof a||"string"!=typeof l)return null;for(var n in e)if(a[l]===e[n])return!0;return!1},checkMulltiParametersValidation:function(e,a,l){if("object"!=typeof e||"object"!=typeof a||"string"!=typeof l||"object"!=typeof a[l])return null;for(var n in a[l].length,a[l])for(var t=0;t<e.length;t++)if(a[l][n]!==e[t])return!1;return!0},checkMissingParameters:function(e,a){if("object"!=typeof e||null===e||void 0===e)return!1;for(var l=0;l<a.length;l++)if(!1===e.hasOwnProperty(a[l])||void 0===e[a[l]]||null===e[a[l]])return!1;return!0}},CallbackHandler:{callSuccessCallback:function(e,a){"function"==typeof e&&("object"==typeof a?(a.returnValue&&delete a.returnValue,e(a)):e())},callFailureCallback:function(e,a,l,n){"function"==typeof e&&(a.returnValue&&delete a.returnValue,-1===a.errorCode?a.errorText.indexOf("Unknown method")>-1?a.errorCode=t.ERROR_CODE.COMMON.UNSUPPORTED_API:a.errorText.indexOf("Service does not exist")>-1&&(a.errorCode=t.ERROR_CODE.COMMON.UNSUPPORTED_API):(void 0!==a.errorCode&&null!==a.errorCode||(a.errorCode=l),void 0!==a.errorText&&null!==a.errorText||(a.errorText=n)),e(a))}},PreferencesHandler:{setPreferences:function(e,a,l,t){var r={};r[e]=a,n.Request("palm://com.palm.systemservice/",{method:"setPreferences",parameters:r,onSuccess:function(e){"function"==typeof l&&(delete e.returnValue,l(e))},onFailure:function(e){"function"==typeof t&&(delete e.returnValue,t(e))}})},getPreferences:function(e,a,l){n.Request("palm://com.palm.systemservice/",{method:"getPreferences",parameters:{keys:e},onSuccess:function(e){"function"==typeof a&&(delete e.returnValue,a(e))},onFailure:function(e){"function"==typeof l&&(delete e.returnValue,l(e))}})}},DBHandler:{setValue:function(e,a,l,t){n.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:e,settings:a},onSuccess:function(e){"function"==typeof l&&(delete e.returnValue,l(e))},onFailure:function(e){"function"==typeof t&&(delete e.returnValue,t(e))}})},setValueBySettingsService:function(e,a,l,t){n.Request("palm://com.webos.settingsservice",{method:"setSystemSettings",parameters:{category:e,settings:a},onSuccess:function(e){"function"==typeof l&&(delete e.returnValue,l(e))},onFailure:function(e){"function"==typeof t&&(delete e.returnValue,t(e))}})},getValue:function(e,a,l,t){n.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:e,keys:a},onSuccess:function(e){"function"==typeof l&&(delete e.returnValue,l(e.settings))},onFailure:function(e){"function"==typeof t&&(delete e.returnValue,t(e))}})},getValueBySettingsService:function(e,a,l,t){n.Request("palm://com.webos.settingsservice",{method:"getSystemSettings",parameters:{category:e,keys:a},onSuccess:function(e){"function"==typeof l&&(delete e.returnValue,l(e.settings))},onFailure:function(e){"function"==typeof t&&(delete e.returnValue,t(e))}})}}};function m(e,a,l){var r;r=function(){var n=S.PlatformChecker.checkPlatformSupportedThisAPI(e);-1!==c.webOSVersion?!1!==n?!0===n||"number"!=typeof n?l(!0):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.OLD_WEBOS_VERSION,"webOS Signage "+c.webOSVersion.toFixed(1)+" doesn't support "+e+" API. webOS Signage version should be later than "+n.toFixed(1)+"."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Cannot found called API in CustomJS."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Unknown webOS Signage version.")},-2===c.webOSVersion?n.Request("luna://com.webos.service.systemservice/osInfo/",{method:"query",parameters:{parameters:["webos_release_codename"]},onSuccess:function(e){delete e.returnValue,-1!==(c=e).webos_release_codename.indexOf("deua")||-1!==c.webos_release_codename.indexOf("denali")||-1!==c.webos_release_codename.indexOf("dreadlocks")?n.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"getOnOffTimeSchedule",parameters:{},onComplete:function(e){e.settings&&e.settings.hasOwnProperty("onOffTimeSchedule")?(c.webOSVersion=3.2,r()):(c.webOSVersion=3,r())}}):-1!==c.webos_release_codename.indexOf("goldilocks")?(c.webOSVersion=4,r()):(c.webOSVersion=-1,r())},onFailure:function(e){function a(e,a){return-1!==e.indexOf(a)}!0===a(navigator.userAgent,"Web0S")||!0===a(navigator.userAgent,"WebAppManager")?a(navigator.userAgent,"AppleWebKit/537.41")?(c.webOSVersion=1,r()):a(navigator.userAgent,"AppleWebKit/538.2")&&(c.webOSVersion=2,r()):(c.webOSVersion=-1,r())}}):r()}function g(e,a,l){l.videoEl&&"object"==typeof l.videoEl?l.videoEl.readyState>3?l.videoEl.mediaId&&"string"==typeof l.videoEl.mediaId?e(l.videoEl.mediaId):a({errorCode:t.ERROR_CODE.COMMON.INTERNAL_ERROR,errorText:"Cannot found video element."}):a({returnValue:!1,errorCode:t.ERROR_CODE.COMMON.INTERNAL_ERROR,errorText:"Video is not loaded yet. Try again after video is loaded."}):n.Request("luna://com.webos.service.commercial.signage.storageservice/video/",{method:"getMediaID",onSuccess:function(l){l.hasOwnProperty("id")?e(l.id):a({returnValue:!1,errorCode:t.ERROR_CODE.COMMON.INTERNAL_ERROR,errorText:"Failed to check media id value."})},onFailure:function(l){var n=document.getElementsByTagName("video")[0];n&&e(n.mediaId),a(l)}})}t.prototype.Configuration={getPortControl:function(e,a,l){m("getPortControl",a,function(){S.DBHandler.getValue(o.COMMERCIAL,[N],function(a){"string"==typeof a.blockedPortList&&(a.blockedPortList=parseInt(a.blockedPortList)),S.CallbackHandler.callSuccessCallback(e,{blockedPortList:a.blockedPortList})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get AvSync Bypass status.")})})},setPortControl:function(e,a,l){m("setPortControl",a,function(){if(!1!==S.ParameterChecker.checkMissingParameters(l,["blockedPortList"])){for(var n=0;n<l.blockedPortList.length;n++)l.blockedPortList[n].blockedPort=l.blockedPortList[n].blockedPort.toString();S.DBHandler.setValue(o.COMMERCIAL,l,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set white balance settings.")})}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},setEnterpriseCode:function(e,a,l){m("setEnterpriseCode",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["enterpriseCode"])?S.DBHandler.setValue(o.COMMERCIAL,l,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set white balance settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},clearBrowsingData:function(e,a,l){m("clearBrowsingData",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["types"])?!1!==S.ParameterChecker.checkMulltiParametersValidation(t.CLEARBROWSINGDATATYPES,l,"types")?n.Request("palm://com.palm.webappmanager/",{method:"clearBrowsingData",parameters:l,onSuccess:function(a){S.CallbackHandler.callSuccessCallback(e)},onFailure:function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to clear browsing data.")}}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},setWhiteBalanceRGB:function(e,a,l){m("setWhiteBalanceRGB",a,function(){!1!==l.hasOwnProperty("rGain")||!1!==l.hasOwnProperty("gGain")||!1!==l.hasOwnProperty("bGain")?!0===l.hasOwnProperty("rGain")&&"number"!=typeof l.rGain||!0===l.hasOwnProperty("gGain")&&"number"!=typeof l.gGain||!0===l.hasOwnProperty("bGain")&&"number"!=typeof l.bGain?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters. r/g/bGain value type must be number."):c.webOSVersion<=3?S.DBHandler.getValue(o.PICTURE,[M],function(n){var r={};switch(n.pictureMode){case"normal":"number"==typeof l.rGain&&(r.rSubGainMedium=l.rGain),"number"==typeof l.gGain&&(r.gSubGainMedium=l.gGain),"number"==typeof l.bGain&&(r.bSubGainMedium=l.bGain);break;case"vivid":"number"==typeof l.rGain&&(r.rSubGainCool=l.rGain),"number"==typeof l.gGain&&(r.gSubGainCool=l.gGain),"number"==typeof l.bGain&&(r.bSubGainCool=l.bGain);break;case"cinema":"number"==typeof l.rGain&&(r.rSubGainWarm=l.rGain),"number"==typeof l.gGain&&(r.gSubGainWarm=l.gGain),"number"==typeof l.bGain&&(r.bSubGainWarm=l.bGain);break;default:return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.CONFIGURATION.INVALID_CONFIG,"This API supports only if picture mode is Vivid, Standard or Cinema.")}S.DBHandler.setValue(o.COMMERCIAL,r,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set white balance settings.")})},function(e){S.CallbackHandler.callFailureCallback(a,errorObject,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set white balance settings.")}):S.DBHandler.getValue(o.PICTURE,[M],function(n){var r={};switch(n.pictureMode){case"normal":case"vivid":case"sports":case"game":case"govCorp":case"eco":"number"==typeof l.rGain&&(r.redOffset=l.rGain),"number"==typeof l.gGain&&(r.greenOffset=l.gGain),"number"==typeof l.bGain&&(r.blueOffset=l.bGain);break;default:return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.CONFIGURATION.INVALID_CONFIG,"This API is not supports when picture mode is Calibration.")}S.DBHandler.setValue(o.PICTURE,r,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set white balance settings.")})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set white balance settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters. At least one of rGain, gGain or bGain parameter should be used.")})},getWhiteBalanceRGB:function(e,a){m("getWhiteBalanceRGB",a,function(){c.webOSVersion<=3?S.DBHandler.getValue(o.PICTURE,[M],function(l){S.DBHandler.getValue(o.COMMERCIAL,["rSubGainMedium","gSubGainMedium","bSubGainMedium","rSubGainCool","gSubGainCool","bSubGainCool","rSubGainWarm","gSubGainWarm","bSubGainWarm"],function(n){var r={};switch(l.pictureMode){case"normal":r.rGain=n.rSubGainMedium,r.gGain=n.gSubGainMedium,r.bGain=n.bSubGainMedium;break;case"vivid":r.rGain=n.rSubGainCool,r.gGain=n.gSubGainCool,r.bGain=n.bSubGainCool;break;case"cinema":r.rGain=n.rSubGainWarm,r.gGain=n.gSubGainWarm,r.bGain=n.bSubGainWarm;break;default:return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.CONFIGURATION.INVALID_CONFIG,"This API supports only if picture mode is Vivid, Standard or Cinema.")}"string"==typeof r.rGain&&(r.rGain=parseInt(r.rGain)),"string"==typeof r.gGain&&(r.gGain=parseInt(r.gGain)),"string"==typeof r.bGain&&(r.bGain=parseInt(r.bGain)),S.CallbackHandler.callSuccessCallback(e,r)},function(e){S.CallbackHandler.callFailureCallback(a,errorObject,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get white balance settings.")})}):S.DBHandler.getValue(o.PICTURE,[M,"redOffset","greenOffset","blueOffset"],function(l){var n={};switch(l.pictureMode){case"normal":case"vivid":case"sports":case"game":case"govCorp":case"eco":n.rGain=l.redOffset,n.gGain=l.greenOffset,n.bGain=l.blueOffset;break;default:return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.CONFIGURATION.INVALID_CONFIG,"This API is not supports when picture mode is Calibration.")}"string"==typeof n.rGain&&(n.rGain=parseInt(n.rGain)),"string"==typeof n.gGain&&(n.gGain=parseInt(n.gGain)),"string"==typeof n.bGain&&(n.bGain=parseInt(n.bGain)),S.CallbackHandler.callSuccessCallback(e,n)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get white balance settings.")})})},setAvSync:function(e,a,l){m("setAvSync",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["avSync"])?!1!==S.ParameterChecker.checkParametersValidation(t.AVSYNC,l,"avSync")?S.DBHandler.setValue(o.SOUND,l,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set AvSync settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getAvSync:function(e,a){m("getAvSync",a,function(){S.DBHandler.getValue(o.SOUND,[b],function(a){S.CallbackHandler.callSuccessCallback(e,{avSync:a.avSync})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get AvSync status.")})})},setAvSyncSpeaker:function(e,a,l){m("setAvSyncSpeaker",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["avSyncSpeaker"])?!1!==S.ParameterChecker.checkParametersValidation(t.AVSYNCSPEAKER,l,"avSyncSpeaker")?S.DBHandler.setValue(o.SOUND,l,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set AvSync Speaker settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getAvSyncSpeaker:function(e,a){m("getAvSyncSpeaker",a,function(){S.DBHandler.getValue(o.SOUND,[p],function(a){"string"==typeof a.avSyncSpeaker&&(a.avSyncSpeaker=parseInt(a.avSyncSpeaker)),S.CallbackHandler.callSuccessCallback(e,{avSyncSpeaker:a.avSyncSpeaker})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get AvSync Speaker status.")})})},setAvSyncBypass:function(e,a,l){m("setAvSyncBypass",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["avSyncBypassInput"])?!1!==S.ParameterChecker.checkParametersValidation(t.AVSYNCBYPASS,l,"avSyncBypassInput")?S.DBHandler.setValue(o.SOUND,l,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set AvSync Bypass settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getAvSyncBypass:function(e,a){m("getAvSyncBypass",a,function(){S.DBHandler.getValue(o.SOUND,[f],function(a){S.CallbackHandler.callSuccessCallback(e,{avSyncBypassInput:a.avSyncBypassInput})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get AvSync Bypass status.")})})},setNoSignalImageStatus:function(e,a,l){m("setNoSignalImageStatus",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["noSignalImage"])?!1!==S.ParameterChecker.checkParametersValidation(t.NOSIGNALIMAGE,l,"noSignalImage")?S.DBHandler.setValue(o.COMMERCIAL,l,function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set NoSignalImage status.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getNoSignalImageStatus:function(e,a){m("getNoSignalImageStatus",a,function(){S.DBHandler.getValue(o.COMMERCIAL,[A],function(a){S.CallbackHandler.callSuccessCallback(e,{noSignalImage:a.noSignalImage})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get NoSignalImage status.")})})},getPowerOnOffHistory:function(e,a){m("getPowerOnOffHistory",a,function(){S.DBHandler.getValue(o.COMMERCIAL,[E],function(a){var l=a.powerOnOffHistory;for("string"==typeof a.powerOnOffHistory&&(l=JSON.parse(a.powerOnOffHistory));;){var n=l.indexOf(" ");if(-1===n)break;l.splice(n,1)}S.CallbackHandler.callSuccessCallback(e,{powerOnOffHistory:l})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get Power On/Off history.")})})},setPowerOnStatus:function(e,a,l){m("getwebOSVersion",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["mode"])?!1!==S.ParameterChecker.checkParametersValidation(t.POWERONSTATUS,l,"mode")?S.DBHandler.setValue(o.HOTELMODE,{powerOnStatus:l.mode},function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set Power On status.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getPowerOnStatus:function(e,a){m("getPowerOnStatus",a,function(){S.DBHandler.getValue(o.HOTELMODE,[d],function(a){S.CallbackHandler.callSuccessCallback(e,{powerOnStatus:a.powerOnStatus})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get Power On status.")})})},setKAM:function(e,a,l){m("setKAM",a,function(){var n;if(!1!==S.ParameterChecker.checkMissingParameters(l,["keepAliveMode"])){if(!0===l.keepAliveMode)n="enable";else{if(!1!==l.keepAliveMode)return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameter. parameters.enable should be true or false.");n="disable"}S.DBHandler.setValue(o.COMMERCIAL,{enableKAM:n},function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set Keep Alive Mode settings.")})}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getKAM:function(e,a){m("getKAM",a,function(){S.DBHandler.getValue(o.COMMERCIAL,[s],function(a){var l="enable"===a[s];S.CallbackHandler.callSuccessCallback(e,{keepAliveMode:l})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get Keep Alive Mode settings.")})})},changePassword:function(e,a,l){m("changePassword",a,function(){var n,r,i=4,s=9999;!1!==S.ParameterChecker.checkMissingParameters(l,["currentPassword","newPassword"])?(n=l.currentPassword,r=l.newPassword,"string"==typeof n&&"string"==typeof r||S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameter type."),c.webOSVersion>=4&&(i=6,s=999999),n.length!==i||r.length!==i||parseInt(r)<0||parseInt(r)>s?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid password format."):n!==r?c.webOSVersion>=3.2?S.DBHandler.getValueBySettingsService(o.LOCK,[k],function(l){l[k]!==n?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Incorrect password. Access denied."):S.DBHandler.setValueBySettingsService(o.LOCK,{systemPin:r},function(){S.CallbackHandler.callSuccessCallback(e)},function(e){"function"==typeof a&&S.CallbackHandler.callFailureCallback(a,errorObject,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set new password.")})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get current password from platform.")}):S.DBHandler.getValue(o.HOTELMODE,[R],function(l){l[R]!==n?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Incorrect password. Access denied."):S.DBHandler.setValue(o.HOTELMODE,{password:r},function(){if(c.webOSVersion>=3.2)S.CallbackHandler.callSuccessCallback(e);else{var a="";if("0000"===r)a="8080";else{var l=parseInt(r);a=("0000"+parseInt((l/10).toString())+((l+1)%10).toString()).substr(-4)}S.CallbackHandler.callSuccessCallback(e,{serverUIPassword:a})}},function(e){"function"==typeof a&&S.CallbackHandler.callFailureCallback(a,errorObject,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set new password.")})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get current password from platform.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Current and new password are same.")):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getNativePortraitMode:function(e,a){m("getNativePortraitMode",a,function(){3===c.webOSVersion?S.DBHandler.getValue(o.COMMERCIAL,[O],function(a){S.CallbackHandler.callSuccessCallback(e,{nativePortrait:a[O]})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get Native Portrait Mode settings.")}):c.webOSVersion>=3.2?S.DBHandler.getValue(o.OPTION,[u],function(a){S.CallbackHandler.callSuccessCallback(e,{nativePortrait:a[u]})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get Native Portrait Mode settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Cannot get platform information yet. Try again later.")})},setNativePortraitMode:function(e,a,l){m("setNativePortraitMode",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["nativePortrait"])?!1!==S.ParameterChecker.checkParametersValidation(t.NATIVEPORTRAIT,l,"nativePortrait")?3===c.webOSVersion?S.DBHandler.setValue(o.COMMERCIAL,{siAppOrientation:l.nativePortrait},function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set Native Portrait Mode settings.")}):c.webOSVersion>=3.2?S.DBHandler.setValue(o.OPTION,{screenRotation:l.nativePortrait},function(a){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set Native Portrait Mode settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Cannot get platform information yet. Try again later."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},getWoWLAN:function(e,a){m("getWoWLAN",a,function(){S.DBHandler.getValue(o.NETWORK,[C],function(a){var l;l="true"===a[C],S.CallbackHandler.callSuccessCallback(e,{enableWoWLAN:l})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get WoWLAN settings.")})})},setWoWLAN:function(e,a,l){m("setWoWLAN",a,function(){!1!==S.ParameterChecker.checkMissingParameters(l,["enableWoWLAN"])?"boolean"==typeof l.enableWoWLAN?S.DBHandler.setValue(o.NETWORK,{wolwowlOnOff:l.enableWoWLAN.toString()},function(){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set WoWLAN settings.")}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"enableWoWLAN property value must be true or false boolean value."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})}},t.prototype.Signage={addUSBAttachEventListener:function(e,a){m("addUSBAttachEventListener",a,function(){i.USBAttachEventListener=n.Request("luna://com.webos.service.attachedstoragemanager",{method:"listDevices",parameters:{subscribe:!0},onSuccess:function(a){var l=[];if(a.devices)for(var n=0;n<a.devices.length;n++){var t=a.devices[n];"usb"!==t.deviceType&&"sdcard"!==t.deviceType||l.push({type:t.deviceType,vendor:t.vendorName,device:t.deviceName})}S.CallbackHandler.callSuccessCallback(e,{deviceList:l})},onFailure:function(){S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Cannot get USB device information.")}})})},removeUSBAttachEventListener:function(e,a){m("removeUSBAttachEventListener",a,function(){null===i.USBAttachEventListener?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Event listener is not set. Use addUSBAttachEventListener() first."):(i.USBAttachEventListener.cancel(),S.CallbackHandler.callSuccessCallback(e))})},getwebOSVersion:function(e,a){m("getwebOSVersion",a,function(){-2===c.webOSVersion?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Cannot get platform information yet. Please try later."):-1===c.webOSVersion?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Cannot get platform information."):"number"==typeof c.webOSVersion?S.CallbackHandler.callSuccessCallback(e,{webOSVersion:c.webOSVersion.toFixed(1)}):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Cannot get platform information.")})},getApplicationInfo:function(e,a){m("getApplicationInfo",a,function(){if(function(){if(window.PalmSystem)return PalmSystem.identifier.split(" ")[0];var e=location.href;return-1!==e.indexOf(t.APPLICATION.IPK_TYPE)?t.APPLICATION.IPK_TYPE:-1!==e.indexOf(t.APPLICATION.ZIP_TYPE+".debug")?t.APPLICATION.ZIP_TYPE+".debug":-1!==e.indexOf(t.APPLICATION.ZIP_TYPE)?t.APPLICATION.ZIP_TYPE:"__UNKNOWN__"}()===t.APPLICATION.IPK_TYPE){var l=new XMLHttpRequest;l.onreadystatechange=function(){if(4==this.readyState)try{var l=JSON.parse(this.responseText);S.CallbackHandler.callSuccessCallback(e,l)}catch(e){S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get application information.")}},l.onerror=function(e){S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get application information.")},l.open("GET","appinfo.json",!0),l.send()}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.INTERNAL_ERROR,"This application is not IPK type.")})},switchApplication:function(e,a,l){m("switchApplication",a,function(){var r,i;!1!==S.ParameterChecker.checkMissingParameters(l,["application"])?"string"==typeof l.application&&!1!==S.ParameterChecker.checkParametersValidation(t.APPLICATION,l,"application")?(r=function(r){var i,c;i=function(i){!0===i&&(t.APPLICATION.ZIP_TYPE+=".debug"),n.Request("luna://com.webos.applicationManager",{method:"launch",parameters:{id:l.application,params:{path:r}},onSuccess:function(){S.CallbackHandler.callSuccessCallback(e)},onFailure:function(e){-101===e.errorCode?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.APPLICATION.NOT_INSTALLED,"Application is not installed."):S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to launch target application.")}})},c=function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get application information.")},n.Request("palm://com.palm.service.devmode",{method:"getDevMode",parameters:{},onSuccess:function(e){i(e.enabled)},onFailure:function(e){c(e)}})},i=function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to get application launch settings.")},S.DBHandler.getValue(o.COMMERCIAL,["serverIpPort","siServerIp","secureConnection","appLaunchMode","fqdnAddr","fqdnMode"],function(e){var a="";"none"===e.appLaunchMode?i({errorCode:t.ERROR_CODE.APPLICATION.SETTINGS_ERROR,errorText:"Application launch mode is NONE. Set SI Server settings first."}):"local"===e.appLaunchMode?a="file:////mnt/lg/appstore/scap/procentric/scap/application/app/index.html":"usb"===e.appLaunchMode?a="file:////tmp/usb/sda/sda/index.html":"remote"===e.appLaunchMode?"on"===e.fqdnMode?a=e.fqdnAddr:"off"===e.fqdnMode?"on"===e.secureConnection?a+="http://"+e.siServerIp+":"+e.serverIpPort+"/procentric/scap/application/index.html":"on"===e.secureConnection?a+="https://"+e.siServerIp+":"+e.serverIpPort+"/procentric/scap/application/index.html":i({errorCode:t.ERROR_CODE.COMMON.INTERNAL_ERROR,errorText:"Failed to get application installation settings."}):i({errorCode:t.ERROR_CODE.COMMON.INTERNAL_ERROR,errorText:"Failed to get application installation settings."}):i({errorCode:t.ERROR_CODE.COMMON.INTERNAL_ERROR,errorText:"Failed to get application installation settings."}),r(a)},function(e){i(e)})):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid application."):S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},disableApplication:function(e,a,l){m("disableApplication",a,function(){var n={appLaunchMode:"none"};if(!0===S.ParameterChecker.checkMissingParameters(l,["reset"])){if("boolean"!=typeof l.reset)return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"reset property value must be true or false boolean value, if use this property.");!0===l.reset&&(n.siServerIp="0.0.0.0",n.serverIpPort="0",n.secureConnection="off",n.appType="zip",n.fqdnMode="off",n.fqdnAddr="http://")}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Application will be disabled after reboot only if reset property is true.");S.DBHandler.setValue(o.COMMERCIAL,n,function(){S.CallbackHandler.callSuccessCallback(e)},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to disable application.")})})}},t.prototype.VideoSync={setMaster:function(e,a,l){m("setMaster",a,function(){if(!1!==S.ParameterChecker.checkMissingParameters(l,["ip","port"]))if("object"!=typeof l||"string"!=typeof l.ip||"number"!=typeof l.port||isNaN(l.port))S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters.");else{var r=l.ip.split(".");if(4===r.length){for(var i=0;i<4;i++){var c=parseInt(r[i]);if(c<0||c>255)return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid IP format.")}l.port<0||l.port>65535?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid port value."):g(function(r){n.Request("luna://com.webos.media",{method:"setMaster",parameters:{mediaId:r,ip:l.ip,port:l.port},onSuccess:function(a){S.CallbackHandler.callSuccessCallback(e,{basetime:a.basetime})},onFailure:function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set master.")}})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.MEDIA_ERROR,"Failed to get loaded media information.")},{videoEl:l.videoElement})}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid IP format.")}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})},setSlave:function(e,a,l){m("setSlave",a,function(){if(!1!==S.ParameterChecker.checkMissingParameters(l,["ip","port","basetime"]))if("object"!=typeof l||"string"!=typeof l.ip||"number"!=typeof l.port||isNaN(l.port))S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid parameters.");else{var r=l.ip.split(".");if(4===r.length){for(var i=0;i<4;i++){var c=parseInt(r[i]);if(c<0||c>255)return void S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid IP format.")}l.port<0||l.port>65535?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid port value."):parseInt(l.basetime<0)?S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid basetime value."):g(function(r){n.Request("luna://com.webos.media",{method:"setSlave",parameters:{mediaId:r,ip:l.ip,port:l.port,basetime:l.basetime},onSuccess:function(){S.CallbackHandler.callSuccessCallback(e)},onFailure:function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.INTERNAL_ERROR,"Failed to set slave.")}})},function(e){S.CallbackHandler.callFailureCallback(a,e,t.ERROR_CODE.COMMON.MEDIA_ERROR,"Failed to get loaded media information.")},{videoEl:l.videoElement})}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Invalid IP format.")}else S.CallbackHandler.callFailureCallback(a,{},t.ERROR_CODE.COMMON.BAD_PARAMETERS,"Missing required parameters.")})}},l.exports=t}),Custom=cordova.require("cordova/plugin/custom");