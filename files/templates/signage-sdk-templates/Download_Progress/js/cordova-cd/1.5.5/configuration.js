Configuration=function(){var i,u;function s(e,t,n){void 0!==e.errorCode&&null!==e.errorCode||(e.errorCode=t),void 0!==e.errorText&&null!==e.errorText||(e.errorText=n)}function a(e){for(var t=i.LocaleList,n=0;n<t.length;n++)if(t[n].languageCode===e)return!0;return!1}"object"==typeof window?(cordova.define("cordova/plugin/configuration",function(e,t,n){i=function(){},u=window.PalmSystem?e("cordova/plugin/webos/service"):{Request:function(e,t){"function"==typeof t.onFailure&&t.onFailure({returnValue:!1,errorText:"PalmSystem Not Available. Cordova is not installed?"})}},n.exports=i}),i=cordova.require("cordova/plugin/configuration")):(i=function(e){(u=e).Request=function(e,t){var n=e+"/"+t.method,r={};!0===t.hasOwnProperty("parameters")&&(r=t.parameters);var o={};u&&u.call(n,r,function(e){console.log("res : "+JSON.stringify(e)),!0===e.payload.returnValue?(o=e.payload,t.onSuccess(o)):(o.returnValue=!1,o.errorCode=e.payload.errorCode,o.errorText=e.payload.errorText,t.onFailure(o))})}},module.exports=i),i.PictureMode={VIVID:"vivid",STANDARD:"normal",APS:"eco",CINEMA:"cinema",GAME:"game",SPORTS:"sports",EXPERT1:"expert1",EXPERT2:"expert2"},i.AppMode={LOCAL:"local",USB:"usb",REMOTE:"remote"},i.AppType={IPK:"ipk",ZIP:"zip"},i.LocaleList=[{language:"čeština",languageCode:"cs",countries:[{name:"",specifier:"cs-CZ"}]},{language:"dansk",languageCode:"da",countries:[{name:"",specifier:"da-DK"}]},{language:"Deutsch",languageCode:"de",countries:[{name:"",specifier:"de-DE"}]},{language:"English",languageCode:"en",countries:[{name:"",specifier:"en-US"}]},{language:"Español",languageCode:"es",countries:[{name:"",specifier:"es-ES"}]},{language:"ελληνική γλώσσα",languageCode:"el",countries:[{name:"",specifier:"el-GR"}]},{language:"Français",languageCode:"fr",countries:[{name:"",specifier:"fr-FR"}]},{language:"italiano",languageCode:"it",countries:[{name:"",specifier:"it-IT"}]},{language:"Nederlands",languageCode:"nl",countries:[{name:"",specifier:"nl-NL"}]},{language:"norsk",languageCode:"nb",countries:[{name:"",specifier:"nb-NO"}]},{language:"português",languageCode:"pt",countries:[{name:"Portugal",specifier:"pt-PT"},{name:"Brasil",specifier:"pt-BR"}]},{language:"русский",languageCode:"ru",countries:[{name:"",specifier:"ru-RU"}]},{language:"suomi",languageCode:"fi",countries:[{name:"",specifier:"fi-FI"}]},{language:"svenska",languageCode:"sv",countries:[{name:"",specifier:"sv-SE"}]},{language:"한국어",languageCode:"ko",countries:[{name:"",specifier:"ko-KR"}]},{language:"中文",languageCode:"zh-Hans",countries:[{name:"中国",specifier:"zh-Hans-CN"}]},{language:"日本語",languageCode:"ja",countries:[{name:"",specifier:"ja-JP"}]},{language:"中文",languageCode:"zh-Hant",countries:[{name:"香港",specifier:"zh-Hant-HK"}]}];var r=null,o={};function t(n){null===r?u.Request("luna://com.webos.service.tv.systemproperty",{method:"getSystemInfo",parameters:{keys:["sdkVersion","boardType"]},onSuccess:function(e){var t=e.sdkVersion.split(".");o=1<=t.length&&"1"===t[0]?{webOSVer:1,chipset:e.boardType.split("_")[0]}:1<=t.length&&"2"===t[0]?{webOSVer:2,chipset:e.boardType.split("_")[0]}:1<=t.length&&"3"===t[0]?{webOSVer:3,chipset:e.boardType.split("_")[0]}:1<=t.length&&"4"===t[0]?{webOSVer:4,chipset:e.boardType.split("_")[0]}:{webOSVer:0,chipset:""},r=o.webOSVer,n(o)},onFailure:function(e){n(o={webOSVer:0,chipset:""})}}):n(o)}i.prototype.setPictureMode=function(t,n,e){JSON.stringify(e),u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"picture",settings:{pictureMode:e.mode}},onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&t()},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSPM","Configuration.setPictureMode returns failure."),n(e))}})},i.prototype.getPictureMode=function(n,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"picture",keys:["pictureMode"]},onSuccess:function(e){if(!0===e.returnValue&&"function"==typeof n){var t={};t.mode=e.settings.pictureMode,n(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGPM","Configuration.getPictureMode returns failure."),t(e))}})},i.prototype.setPictureProperty=function(o,i,a){JSON.stringify(a),t(function(e){var t={};if(!function(e){return"number"==typeof e&&isFinite(e)}(a.backlight))return s(r={},"CSPP","Configuration.setPictureProperty, backlight type is not number."),void i(r);for(var n in a)if(null!=n)if(t[n]=a[n],"tint"===n||"colorTemperature"===n)t[n]-=50;else if("blackLevel"===n){var r;if(t[n]={unknown:a[n]},"low"!==a[n]&&"high"!==a[n])return JSON.stringify(a),s(r={},"CSPP","Configuration.setPictureProperty, There is No matched item : blackLevel."),void i(r)}else"gamma"!==n||2!==e.webOSVer&&3!==e.webOSVer||"high"!==a[n]||(t[n]="high1");JSON.stringify(t),u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"picture",settings:t},onSuccess:function(e){!0===e.returnValue&&"function"==typeof o&&o()},onFailure:function(e){delete e.returnValue,"function"==typeof i&&(s(e,"CSPP","Configuration.setPictureProperty returns failure."),i(e))}})})},i.prototype.getPictureProperty=function(r,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"picture",keys:["brightness","contrast","color","tint","backlight","sharpness","hSharpness","vSharpness","colorTemperature","dynamicContrast","superResolution","colorGamut","dynamicColor","noiseReduction","mpegNoiseReduction","blackLevel","gamma"]},onSuccess:function(e){if(!0===e.returnValue&&"function"==typeof r){var t={};for(var n in e.settings)null!=n&&(t[n]=isNaN(e.settings[n])?e.settings[n]:Number(e.settings[n]),"tint"===n||"colorTemperature"===n?t[n]+=50:"blackLevel"===n?t[n]=e.settings[n].unknown:"gamma"===n&&"high1"===e.settings[n]&&(t[n]="high"));r(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGPP","Configuration.getPictureProperty returns failure."),t(e))}})};var c={alias:"signageName"};return i.prototype.setProperty=function(n,r,e){JSON.stringify(e);var o=JSON.parse(e),i={},a={};t(function(e){if(3===e.webOSVer||3<e.webOSVer?(c.alias="deviceName",a.category="network"):(c.alias="signageName",a.category="commercial"),4===e.webOSVer||4<e.webOSVer){for(var t in o)void 0!==c[t]&&(i[c[t]]=o[t]);a.settings=i,u.Request("luna://com.webos.service.commercial.scapadapter/settings/",{method:"set",parameters:a,onSuccess:function(e){!0===e.returnValue&&"function"==typeof n&&n()},onFailure:function(e){delete e.returnValue,"function"==typeof r&&(s(e,"CSP","Configuration.setProperty returns failure."),r(e))}})}else{for(var t in o)void 0!==c[t]&&(i[c[t]]=o[t]);a.settings=i,u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:a,onSuccess:function(e){!0===e.returnValue&&"function"==typeof n&&n()},onFailure:function(e){delete e.returnValue,"function"==typeof r&&(s(e,"CSP","Configuration.setProperty returns failure."),r(e))}})}})},i.prototype.getProperty=function(r,n,e){var o=JSON.parse(e).keys,i={},a=[];t(function(e){if(3===e.webOSVer||3<e.webOSVer?(c.alias="deviceName",i.category="network"):(c.alias="signageName",i.category="commercial"),4===e.webOSVer||4<e.webOSVer){for(var t in o)null!=t&&(o[t],a.push(c[o[t]]));i.keys=a,u.Request("luna://com.webos.service.commercial.scapadapter/settings/",{method:"get",parameters:i,onSuccess:function(e){if(!0===e.returnValue&&"function"==typeof r){var t={};for(var n in o)null===n&&void 0===n||(o[n],void 0===e.settings[c[o[n]]]&&null===e.settings[c[o[n]]]||(t[o[n]]=e.settings[c[o[n]]]));r(JSON.stringify(t))}},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CGP","Configuration.getProperty returns failure."),n(e))}})}else{for(var t in o)null!=t&&(o[t],a.push(c[o[t]]));i.keys=a,u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:i,onSuccess:function(e){if(!0===e.returnValue&&"function"==typeof r){var t={};for(var n in o)null===n&&void 0===n||(o[n],void 0===e.settings[c[o[n]]]&&null===e.settings[c[o[n]]]||(t[o[n]]=e.settings[c[o[n]]]));r(JSON.stringify(t))}},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CGP","Configuration.getProperty returns failure."),n(e))}})}})},i.prototype.setCurrentTime=function(e,t,n){JSON.stringify(n);var r=new Date(n.year,n.month-1,n.day,n.hour,n.minute,n.sec);if((n.year<2e3||2037<n.year||n.month<1||12<n.month||n.day<1||31<n.day||n.hour<0||23<n.hour||n.minute<0||59<n.minute||n.sec<0||59<n.sec||r.getFullYear()!==n.year||r.getMonth()!==n.month-1||r.getDate()!==n.day||r.getHours()!==n.hour||r.getMinutes()!==n.minute||r.getSeconds()!==n.sec)&&"function"==typeof t){var o={};return s(o,"CSCT","Configuration.setCurrentTime returns failure for out of range."),void t(o)}JSON.stringify(n);var i={};i.year=n.year,i.month=n.month,i.day=n.day,i.hour=n.hour,i.minute=n.minute,i.sec=n.sec,u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"setSystemTime",parameters:{time:i,ntp:n.ntp,ntpServerAddress:n.ntpServerAddress},onSuccess:function(){"function"==typeof e&&e()},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CSCT","Configuration.setCurrentTime returns failure."),t(e))}})},i.prototype.getCurrentTime=function(r,o){u.Request("luna://com.palm.systemservice/time/",{method:"getEffectiveBroadcastTime",onSuccess:function(t){if(!0===t.returnValue){var n={},e=new Date(1e3*t.adjustedUtc);n.year=e.getFullYear(),n.month=e.getMonth()+1,n.day=e.getDate(),n.hour=e.getHours(),n.minute=e.getMinutes(),n.sec=e.getSeconds(),u.Request("luna://com.palm.systemservice/",{method:"getPreferences",parameters:{keys:["useNetworkTime"]},onSuccess:function(e){!0===e.returnValue?(n.ntp=e.useNetworkTime,u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["ntpServerMode","ntpServerType","ntpServerIpv4","ntpServerIpv6","ntpServerUrl"]},onSuccess:function(e){if(!0===e.returnValue){if(!0===n.ntp&&"manual"===e.settings.ntpServerMode){var t=e.settings.ntpServerType;"ipv4"===t?n.ntpServerAddress=e.settings.ntpServerIpv4:"ipv6"===t?n.ntpServerAddress=e.settings.ntpServerIpv6:"url"===t&&(n.ntpServerAddress=e.settings.ntpServerUrl)}"function"==typeof r&&r(n)}},onFailure:function(e){delete e.returnValue,"function"==typeof o&&(s(e,"CGCT","Configuration.getCurrentTime returns failure."),o(e))}})):"function"==typeof o&&(s(t,"CGCT","Configuration.getCurrentTime returns failure."),o(t))},onFailure:function(e){delete e.returnValue,"function"==typeof o&&(s(e,"CGCT","Configuration.getCurrentTime returns failure."),o(e))}})}else"function"==typeof o&&(s(t,"CGCT","Configuration.getCurrentTime returns failure."),o(t))},onFailure:function(e){delete e.returnValue,"function"==typeof o&&(s(e,"CGCT","Configuration.getCurrentTime returns failure."),o(e))}})},i.prototype.restartApplication=function(t,n){u.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"restart_application",onSuccess:function(e){"function"==typeof t&&t(e)},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CRA","Configuration.restartApp returns failure."),n(e))}})},i.prototype.getServerProperty=function(n,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["serverIpPort","siServerIp","secureConnection","appLaunchMode","fqdnAddr","fqdnMode","appType"]},onSuccess:function(e){if(!0===e.returnValue&&"function"==typeof n){var t={};t.serverIp=e.settings.siServerIp,t.serverPort=parseInt(e.settings.serverIpPort,10),t.secureConnection="off"!==e.settings.secureConnection,t.appLaunchMode=e.settings.appLaunchMode,t.appType=e.settings.appType,t.fqdnMode="off"!==e.settings.fqdnMode,t.fqdnAddr=e.settings.fqdnAddr,n(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGSP","Configuration.getServerProperty returns failure."),t(e))}})},i.prototype.setServerProperty=function(t,n,e){if(JSON.stringify(e),(void 0===e||"string"!=typeof e.serverIp||!1===/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(e.serverIp)||isNaN(e.serverPort)||e.serverPort<0||65535<e.serverPort||"number"!=typeof e.serverPort||"boolean"!=typeof e.secureConnection||"string"!=typeof e.appLaunchMode||e.appLaunchMode!==i.AppMode.USB&&e.appLaunchMode!==i.AppMode.LOCAL&&e.appLaunchMode!==i.AppMode.REMOTE)&&"function"==typeof n){var r={};return s(r,"CSSP","Configuration.setServerProperty, Invalid parameters."),void n(r)}var o={};o.siServerIp=e.serverIp,o.serverIpPort=e.serverPort+"",o.secureConnection=!0===e.secureConnection?"on":"off",o.appLaunchMode=e.appLaunchMode,"boolean"==typeof e.fqdnMode&&(o.fqdnMode=!0===e.fqdnMode?"on":"off"),"string"==typeof e.fqdnAddr&&(o.fqdnAddr=e.fqdnAddr),void 0!==e.appType&&(o.appType=e.appType),JSON.stringify(o),u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:o},onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&t()},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSSP","Configuration.setServerProperty returns failure."),n(e))}})},i.prototype.clearCache=function(t,n){u.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"clearCache",onSuccess:function(e){"function"==typeof t&&t()},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CCC","Configuration.clearCache returns failure."),n(e))}})},i.prototype.getTimeZoneList=function(t,n){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"getTimeZoneList",onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&(delete e.returnValue,t(e))},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CGTL","Configuration.getTimeZoneList returns failure."),n(e))}})},i.prototype.getTimeZone=function(t,n){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"getTimeZone",onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&(delete e.returnValue,t(e))},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CGTZ","Configuration.getTimeZone returns failure."),n(e))}})},i.prototype.setTimeZone=function(t,n,r){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"time",keys:["autoClock"]},onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&("off"===e.settings.autoClock?(delete e.returnValue,"function"==typeof n&&(s(e,"CSTZ","Configuration.setTimeZone returns failure. autoClock is off"),n(e))):u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"setTimeZone",parameters:r,onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&(delete e.returnValue,t(e))},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSTZ","Configuration.setTimeZone returns failure."),n(e))}}))},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSTZ","Configuration.setTimeZone returns failure."),n(e))}})},i.prototype.debug=function(t,n,e){e.enabled,u.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"debug",parameters:{enabled:e.enabled},onSuccess:function(e){"function"==typeof t&&t(e)},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CD","Configuration.debug returns failure."),n(e))}})},i.prototype.setUSBLock=function(t,n,e){if(e.enabled,null===e.enabled&&"function"==typeof n){var r={};return s(r,"CSUL","Configuration.setUSBLock returns failure. command was not defined."),void n(r)}u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{enableUsb:!0===e.enabled?"off":"on"}},onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&t()},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSUL","Configuration.setUSBLock returns failure."),n(e))}})},i.prototype.getUSBLock=function(n,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["enableUsb"]},onSuccess:function(e){if(!0===e.returnValue){var t={};t.enabled="off"===e.settings.enableUsb,"function"==typeof n&&n(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGUL","Configuration.getUSBLock returns failure."),t(e))}})},i.prototype.setOSDLock=function(t,n,e){if(e.enabled,null===e.enabled&&"function"==typeof n){var r={};return s(r,"CSOL","Configuration.setOSDLock returns failure. command was not defined."),void n(r)}u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"hotelMode",notifySelf:!1,settings:{enableMrcu:!0===e.enabled?"off":"on",enableOsdVisibility:!0===e.enabled?"off":"on"}},onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&t()},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSOL","Configuration.setOSDLock returns failure."),n(e))}})},i.prototype.getOSDLock=function(n,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"hotelMode",keys:["enableMrcu","enableOsdVisibility"]},onSuccess:function(e){if(!0===e.returnValue){var t={};t.enabled="on"!==e.settings.enableMrcu||"on"!==e.settings.enableOsdVisibility,"function"==typeof n&&n(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGOL","Configuration.getOSDLock returns failure."),t(e))}})},i.prototype.getLocaleList=function(e,t){var n={};n.localeList=i.LocaleList,"function"==typeof e&&e(n)},i.prototype.setOSDLanguage=function(n,r,o){var e;return o.specifier,null!==o.specifier&&"string"==typeof o.specifier||"function"!=typeof r?!0!==function(e){for(var t=i.LocaleList,n=0;n<t.length;n++)for(var r=t[n].countries,o=0;o<r.length;o++)if(r[o].specifier===e)return!0;return!1}(o.specifier)?(s(e={},"CSOL","Configuration.setOSDLanguage returns failure. specifier is not valid."),void r(e)):void u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{keys:["localeInfo"]},onSuccess:function(e){if(!0===e.returnValue){var t={};(t=e.settings.localeInfo).locales.UI=o.specifier,t.locales.FMT=o.specifier,t.locales.TV=o.specifier,JSON.stringify(t),u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{settings:{localeInfo:t}},onSuccess:function(e){!0===e.returnValue&&"function"==typeof n&&n()},onFailure:function(e){delete e.returnValue,"function"==typeof r&&(s(e,"CSOL","Configuration.setOSDLanguage returns failure."),r(e))}})}},onFailure:function(e){delete e.returnValue,"function"==typeof r&&(s(e,"CSOL","Configuration.setOSDLanguage returns failure."),r(e))}}):(s(e={},"CSOL","Configuration.setOSDLanguage returns failure. command was not defined."),void r(e))},i.prototype.getOSDLanguage=function(n,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{keys:["localeInfo"]},onSuccess:function(e){if(!0===e.returnValue){var t={};JSON.stringify(e.settings.localeInfo),t.specifier=e.settings.localeInfo.locales.UI,"function"==typeof n&&n(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGOL","Configuration.getOSDLanguage returns failure."),t(e))}})},i.prototype.setVirtualKeyboardLanguage=function(t,n,e){if(e.languageCodeList,null===e.languageCodeList&&"function"==typeof n)return s(o={},"CSKL","Configuration.setVirtualKeyboardLanguage returns failure. command was not defined."),void n(o);for(var r=0;r<e.languageCodeList.length;r++){var o;if(!1===a(e.languageCodeList[r]))return s(o={},"CSKL","Configuration.setVirtualKeyboardLanguage returns failure. language code is not valid."),void n(o)}u.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"setVirtualKeyboardLanguage",parameters:{languageCodeList:e.languageCodeList},onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&t()},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSKL","Configuration.setVirtualKeyboardLanguage returns failure."),n(e))}})},i.prototype.getVirtualKeyboardLanguage=function(n,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"getVirtualKeyboardLanguage",parameters:{},onSuccess:function(e){if(!0===e.returnValue){var t={};JSON.stringify(e.languageCodeList),t.languageCodeList=e.languageCodeList,"function"==typeof n&&n(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGKL","Configuration.getVirtualKeyboardLanguage returns failure."),t(e))}})},i.prototype.setProxyBypassList=function(t,n,e){if(void 0===e.urlList&&"function"==typeof n){var r={};return s(r,"CSPB","Configuration.setProxyBypassList returns failure. options.urlList is undefined."),void n(r)}u.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"setProxyBypassList",parameters:{urlList:e.urlList},onSuccess:function(e){!0===e.returnValue&&"function"==typeof t&&t()},onFailure:function(e){delete e.returnValue,"function"==typeof n&&(s(e,"CSPB","Configuration.setProxyBypassList returns failure."),n(e))}})},i.prototype.getProxyBypassList=function(n,t){u.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"getProxyBypassList",parameters:{},onSuccess:function(e){if(!0===e.returnValue){var t={};t.urlList=e.urlList,"function"==typeof n&&n(t)}},onFailure:function(e){delete e.returnValue,"function"==typeof t&&(s(e,"CGPB","Configuration.getProxyBypassList returns failure."),t(e))}})},i}();