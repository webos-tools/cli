/*!
 * ============================================================================
 *   ID SW PLATFORM TEAM, LG ELECTRONICS INC., SEOUL, KOREA                       
 *   Copyright(c) 2016 by LG Electronics Inc.                                  
 *                                                                             
 *   Release Version : 1.4.2.0
 * ============================================================================
 */
cordova.define("cordova/plugin/configuration",function(f,h,a){function g(m){}var i;if(window.PalmSystem){g("Window.PalmSystem Available");i=f("cordova/plugin/webos/service")}else{i={Request:function(m,n){g(m+" invoked. But I am a dummy because PalmSystem is not available");if(typeof n.onFailure==="function"){n.onFailure({returnValue:false,errorText:"PalmSystem Not Available. Cordova is not installed?"})}}}}var b=function(){};function k(n,o,m){if(n.errorCode===undefined||n.errorCode===null){n.errorCode=o}if(n.errorText===undefined||n.errorText===null){n.errorText=m}}b.PictureMode={VIVID:"vivid",STANDARD:"normal",APS:"eco",CINEMA:"cinema",GAME:"game",SPORTS:"sports",EXPERT1:"expert1",EXPERT2:"expert2"};b.AppMode={LOCAL:"local",USB:"usb",REMOTE:"remote"};b.AppType={IPK:"ipk",ZIP:"zip"};b.LocaleList=[{language:"čeština",languageCode:"cs",countries:[{name:"",specifier:"cs-CZ"}]},{language:"dansk",languageCode:"da",countries:[{name:"",specifier:"da-DK"}]},{language:"Deutsch",languageCode:"de",countries:[{name:"",specifier:"de-DE"}]},{language:"English",languageCode:"en",countries:[{name:"",specifier:"en-US"}]},{language:"Español",languageCode:"es",countries:[{name:"",specifier:"es-ES"}]},{language:"ελληνική γλώσσα",languageCode:"el",countries:[{name:"",specifier:"el-GR"}]},{language:"Français",languageCode:"fr",countries:[{name:"",specifier:"fr-FR"}]},{language:"italiano",languageCode:"it",countries:[{name:"",specifier:"it-IT"}]},{language:"Nederlands",languageCode:"nl",countries:[{name:"",specifier:"nl-NL"}]},{language:"norsk",languageCode:"nb",countries:[{name:"",specifier:"nb-NO"}]},{language:"português",languageCode:"pt",countries:[{name:"Portugal",specifier:"pt-PT"},{name:"Brasil",specifier:"pt-BR"}]},{language:"русский",languageCode:"ru",countries:[{name:"",specifier:"ru-RU"}]},{language:"suomi",languageCode:"fi",countries:[{name:"",specifier:"fi-FI"}]},{language:"svenska",languageCode:"sv",countries:[{name:"",specifier:"sv-SE"}]},{language:"한국어",languageCode:"ko",countries:[{name:"",specifier:"ko-KR"}]},{language:"中文",languageCode:"zh-Hans",countries:[{name:"中国",specifier:"zh-Hans-CN"}]},{language:"日本語",languageCode:"ja",countries:[{name:"",specifier:"ja-JP"}]},{language:"中文",languageCode:"zh",countries:[{name:"香港",specifier:"zh-Hant-HK"}]}];function e(q){var m=b.LocaleList;for(var p=0;p<m.length;p++){var n=m[p].countries;for(var o=0;o<n.length;o++){if(n[o].specifier===q){return true}}}return false}function d(o){var m=b.LocaleList;for(var n=0;n<m.length;n++){if(m[n].languageCode===o){return true}}return false}var j=null;function l(m){if(j===null){i.Request("luna://com.webos.service.tv.systemproperty",{method:"getSystemInfo",parameters:{keys:["sdkVersion"]},onSuccess:function(n){g("getPlatformInfo: onSuccess");var o=n.sdkVersion.split(".");if(o.length>=1&&o[0]==="1"){j=1}else{if(o.length>=1&&o[0]==="2"){j=2}else{if(o.length>=1&&o[0]==="3"){j=3}else{j=0}}}delete n.returnValue;m(j)},onFailure:function(n){g("getPlatformInfo: onFailure");delete n.returnValue;j=0;m(j)}})}else{m(j)}}b.prototype.setPictureMode=function(m,n,o){g("setPictureMode: "+JSON.stringify(o));i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"picture",settings:{pictureMode:o.mode}},onSuccess:function(p){g("setPictureMode: On Success");if(p.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(p){g("setPictureMode: On Failure");delete p.returnValue;if(typeof n==="function"){k(p,"CSPM","Configuration.setPictureMode returns failure.");n(p)}}});g("Configuration.setPictureMode Done")};b.prototype.getPictureMode=function(m,n){g("getPictureMode: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"picture",keys:["pictureMode"]},onSuccess:function(o){g("getPictureMode: On Success");if(o.returnValue===true){if(typeof m==="function"){var p={};p.mode=o.settings.pictureMode;m(p)}}},onFailure:function(o){g("getPictureMode: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGPM","Configuration.getPictureMode returns failure.");n(o)}}});g("Configuration.getPictureMode Done")};b.prototype.setPictureProperty=function(m,n,o){g("setPictureProperty: "+JSON.stringify(o));l(function(q){var s={};for(var r in o){if(r!==undefined&&r!==null){s[r]=o[r];if(r==="tint"||r==="colorTemperature"){s[r]-=50}else{if(r==="blackLevel"){s[r]={unknown:o[r]};if(o[r]!=="low"&&o[r]!=="high"){g("setPictureProperty: gamma value error "+JSON.stringify(o));var p={};k(p,"CSPP","Configuration.setPictureProperty, There is No matched item : blackLevel.");n(p);return}}else{if(r==="gamma"&&(q===2||q===3)&&o[r]==="high"){s[r]="high1"}}}}}g(JSON.stringify(s));i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"picture",settings:s},onSuccess:function(t){g("setPictureProperty: On Success");if(t.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(t){g("setPictureProperty: On Failure");delete t.returnValue;if(typeof n==="function"){k(t,"CSPP","Configuration.setPictureProperty returns failure.");n(t)}}});g("Configuration.setPictureProperty Done")})};b.prototype.getPictureProperty=function(m,n){g("getPictureProperty: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"picture",keys:["brightness","contrast","color","tint","backlight","sharpness","hSharpness","vSharpness","colorTemperature","dynamicContrast","superResolution","colorGamut","dynamicColor","noiseReduction","mpegNoiseReduction","blackLevel","gamma"]},onSuccess:function(o){g("getPictureProperty: On Success");if(o.returnValue===true){if(typeof m==="function"){var q={};for(var p in o.settings){if(p!==undefined&&p!==null){q[p]=(isNaN(o.settings[p])?o.settings[p]:Number(o.settings[p]));if(p==="tint"||p==="colorTemperature"){q[p]+=50}else{if(p==="blackLevel"){q[p]=o.settings[p].unknown}else{if(p==="gamma"&&o.settings[p]==="high1"){q[p]="high"}}}}}m(q)}}},onFailure:function(o){g("getPictureProperty: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGPP","Configuration.getPictureProperty returns failure.");n(o)}}});g("Configuration.getPictureProperty Done")};var c={alias:"signageName"};b.prototype.setProperty=function(m,n,p){g("setProperty: "+JSON.stringify(p));var o=JSON.parse(p);var q={};var r={};l(function(s){if(s===3){c.alias="deviceName";r.category="network"}else{c.alias="signageName";r.category="commercial"}for(var t in o){if(c[t]!==undefined){q[(c[t])]=o[t]}}r.settings=q;i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:r,onSuccess:function(u){g("setProperty: On Success");if(u.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(u){g("setProperty: On Failure");delete u.returnValue;if(typeof n==="function"){k(u,"CSP","Configuration.setProperty returns failure.");n(u)}}})});g("Configuration.setProperty Done")};b.prototype.getProperty=function(n,o,q){g("getProperty: ");var p=JSON.parse(q);var r=p.keys;var s={};var m=[];l(function(t){if(t===3){c.alias="deviceName";s.category="network"}else{c.alias="signageName";s.category="commercial"}for(var u in r){if(u!==null&&u!==undefined){g("key"+r[u]);m.push(c[r[u]])}}s.keys=m;g(m);i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:s,onSuccess:function(v){g("getProperty: On Success");if(v.returnValue===true){if(typeof n==="function"){var x={};for(var w in r){if(w!==null||w!==undefined){g("key"+r[w]);if(v.settings[c[r[w]]]!==undefined||v.settings[c[r[w]]]!==null){x[r[w]]=v.settings[c[r[w]]]}}}n(JSON.stringify(x))}}},onFailure:function(v){g("getProperty: On Failure");delete v.returnValue;if(typeof o==="function"){k(v,"CGP","Configuration.getProperty returns failure.");o(v)}}})});g("Configuration.getProperty Done")};b.prototype.setCurrentTime=function(n,p,q){g("setCurrentTime: "+JSON.stringify(q));var o=new Date(q.year,q.month-1,q.day,q.hour,q.minute,q.sec);if(q.year<2000||q.year>2037||q.month<1||q.month>12||q.day<1||q.day>31||q.hour<0||q.hour>23||q.minute<0||q.minute>59||q.sec<0||q.sec>59||o.getFullYear()!==q.year||o.getMonth()!==(q.month-1)||o.getDate()!==q.day||o.getHours()!==q.hour||o.getMinutes()!==q.minute||o.getSeconds()!==q.sec){if(typeof p==="function"){g("setCurrentTime: out of range or invalid parameter type");var m={};k(m,"CSCT","Configuration.setCurrentTime returns failure for out of range.");p(m);return}}g("setCurrentTime: "+JSON.stringify(q));var r={};r.year=q.year;r.month=q.month;r.day=q.day;r.hour=q.hour;r.minute=q.minute;r.sec=q.sec;i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"setSystemTime",parameters:{time:r,ntp:q.ntp},onSuccess:function(){g("setCurrentTime: On Success");if(typeof n==="function"){n()}},onFailure:function(s){g("setCurrentTime: On Failure");delete s.returnValue;if(typeof p==="function"){k(s,"CSCT","Configuration.setCurrentTime returns failure.");p(s)}}});g("Configuration.setCurrentTime Done")};b.prototype.getCurrentTime=function(m,n){g("getCurrentTime: ");i.Request("luna://com.palm.systemservice/time/",{method:"getEffectiveBroadcastTime",onSuccess:function(o){g("getCurrentTime : On Success");if(o.returnValue===true){var p={};var q=new Date(o.adjustedUtc*1000);p.year=q.getFullYear();p.month=q.getMonth()+1;p.day=q.getDate();p.hour=q.getHours();p.minute=q.getMinutes();p.sec=q.getSeconds();i.Request("luna://com.palm.systemservice/",{method:"getPreferences",parameters:{keys:["useNetworkTime"]},onSuccess:function(r){g("getPreferences : On Success");if(r.returnValue===true){p.ntp=r.useNetworkTime;if(typeof m==="function"){m(p)}}else{if(typeof n==="function"){k(o,"CGCT","Configuration.getCurrentTime returns failure.");n(o)}}},onFailure:function(r){g("getCurrentTime: On Failure");delete r.returnValue;if(typeof n==="function"){k(r,"CGCT","Configuration.getCurrentTime returns failure.");n(r)}}})}else{if(typeof n==="function"){k(o,"CGCT","Configuration.getCurrentTime returns failure.");n(o)}}},onFailure:function(o){g("getCurrentTime: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGCT","Configuration.getCurrentTime returns failure.");n(o)}}});g("Configuration.getCurrentTime Done")};b.prototype.restartApplication=function(m,n){g("restartApp: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"restart_application",onSuccess:function(o){g("restartApp: On Success");if(typeof m==="function"){m(o)}},onFailure:function(o){g("restartApp: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CRA","Configuration.restartApp returns failure.");n(o)}}});g("Configuration.restartApp Done")};b.prototype.getServerProperty=function(m,n){g("getServerProperty: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["serverIpPort","siServerIp","secureConnection","appLaunchMode","fqdnAddr","fqdnMode","appType"]},onSuccess:function(o){g("getPictureProperty: On Success");if(o.returnValue===true){if(typeof m==="function"){var p={};p.serverIp=o.settings.siServerIp;p.serverPort=parseInt(o.settings.serverIpPort,10);p.secureConnection=(o.settings.secureConnection==="off"?false:true);p.appLaunchMode=o.settings.appLaunchMode;p.appType=o.settings.appType;p.fqdnMode=(o.settings.fqdnMode==="off"?false:true);p.fqdnAddr=o.settings.fqdnAddr;m(p)}}},onFailure:function(o){g("getServerProperty: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGSP","Configuration.getServerProperty returns failure.");n(o)}}});g("Configuration.getServerProperty Done")};b.prototype.setServerProperty=function(n,o,p){g("setServerProperty: "+JSON.stringify(p));if(p===undefined||typeof p.serverIp!=="string"||/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(p.serverIp)===false||isNaN(p.serverPort)||p.serverPort<0||p.serverPort>65535||typeof p.serverPort!=="number"||typeof p.secureConnection!=="boolean"||typeof p.appLaunchMode!=="string"||(p.appLaunchMode!==b.AppMode.USB&&p.appLaunchMode!==b.AppMode.LOCAL&&p.appLaunchMode!==b.AppMode.REMOTE)||typeof p.fqdnMode!=="boolean"||typeof p.fqdnAddr!=="string"){if(typeof o==="function"){var m={};k(m,"CSSP","Configuration.setServerProperty, Invalid parameters.");g("options.serverIp : "+typeof p.serverIp+" options.serverPort : "+typeof p.serverPort+" options.secureConnection : "+typeof p.secureConnection+" options.appLaunchMode : "+typeof p.appLaunchMode+" options.fqdnMode : "+typeof p.fqdnMode+" options.fqdnAddr : "+p.fqdnAddr);o(m);return}}var q={};q.siServerIp=p.serverIp;q.serverIpPort=p.serverPort+"";q.secureConnection=(p.secureConnection===true?"on":"off");q.appLaunchMode=p.appLaunchMode;q.fqdnMode=(p.fqdnMode===true?"on":"off");q.fqdnAddr=p.fqdnAddr;if(typeof p.appType!=="undefined"){q.appType=p.appType}g(JSON.stringify(q));i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:q},onSuccess:function(r){g("setServerProperty: On Success");if(r.returnValue===true){if(typeof n==="function"){n()}}},onFailure:function(r){g("setServerProperty: On Failure");delete r.returnValue;if(typeof o==="function"){k(r,"CSSP","Configuration.setServerProperty returns failure.");o(r)}}});g("Configuration.setServerProperty Done")};b.prototype.clearCache=function(m,n){g("clearCache: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"clearCache",onSuccess:function(o){g("clearCache: On Success");if(typeof m==="function"){m()}},onFailure:function(o){g("clearCache: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CCC","Configuration.clearCache returns failure.");n(o)}}});g("Configuration.clearCache Done")};b.prototype.getTimeZoneList=function(m,n){g("getTimeZoneList: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"getTimeZoneList",onSuccess:function(o){g("getTimeZoneList: On Success");if(o.returnValue===true){if(typeof m==="function"){delete o.returnValue;m(o)}}},onFailure:function(o){g("getTimeZoneList: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGTL","Configuration.getTimeZoneList returns failure.");n(o)}}});g("Configuration.getTimeZoneList Done")};b.prototype.getTimeZone=function(m,n){g("getTimeZone: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"getTimeZone",onSuccess:function(o){g("getTimeZone: On Success");if(o.returnValue===true){if(typeof m==="function"){delete o.returnValue;m(o)}}},onFailure:function(o){g("getTimeZone: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGTZ","Configuration.getTimeZone returns failure.");n(o)}}});g("Configuration.getTimeZone Done")};b.prototype.setTimeZone=function(m,n,o){g("setTimeZone: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"time",keys:["autoClock"]},onSuccess:function(p){if(p.returnValue===true){if(typeof m==="function"){if(p.settings.autoClock==="off"){delete p.returnValue;if(typeof n==="function"){k(p,"CSTZ","Configuration.setTimeZone returns failure. autoClock is off");n(p)}}else{i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"setTimeZone",parameters:o,onSuccess:function(q){g("setTimeZone: On Success");if(q.returnValue===true){if(typeof m==="function"){delete q.returnValue;m(q)}}},onFailure:function(q){g("setTimeZone: On Failure");delete q.returnValue;if(typeof n==="function"){k(q,"CSTZ","Configuration.setTimeZone returns failure.");n(q)}}})}}}},onFailure:function(p){g("setTimeZone: On Failure");delete p.returnValue;if(typeof n==="function"){k(p,"CSTZ","Configuration.setTimeZone returns failure.");n(p)}}});g("Configuration.setTimeZone Done")};b.prototype.debug=function(m,n,o){g("debug: "+o.enabled);i.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"debug",parameters:{enabled:o.enabled},onSuccess:function(p){g("debug: On Success");if(typeof m==="function"){m(p)}},onFailure:function(p){g("debug: On Failure");delete p.returnValue;if(typeof n==="function"){k(p,"CD","Configuration.debug returns failure.");n(p)}}});g("Configuration.debug Done")};b.prototype.setUSBLock=function(n,o,p){g("setUSBLock: "+p.enabled);if(p.enabled===null&&typeof o==="function"){var m={};k(m,"CSUL","Configuration.setUSBLock returns failure. command was not defined.");o(m);g("Configuration.setUSBLock invalid ");return}i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{enableUsb:(p.enabled===true)?"off":"on"}},onSuccess:function(q){g("setUSBLock: On Success");if(q.returnValue===true){if(typeof n==="function"){n()}}},onFailure:function(q){g("setUSBLock: On Failure");delete q.returnValue;if(typeof o==="function"){k(q,"CSUL","Configuration.setUSBLock returns failure.");o(q)}}});g("Configuration.setUSBLock Done")};b.prototype.getUSBLock=function(m,n){g("getUSBLock: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["enableUsb"]},onSuccess:function(o){g("getUSBLock: On Success");if(o.returnValue===true){var p={};p.enabled=(o.settings.enableUsb==="off")?true:false;if(typeof m==="function"){m(p)}}},onFailure:function(o){g("getUSBLock: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGUL","Configuration.getUSBLock returns failure.");n(o)}}});g("Configuration.getUSBLock Done")};b.prototype.setOSDLock=function(n,o,p){g("setOSDLock: "+p.enabled);if(p.enabled===null&&typeof o==="function"){var m={};k(m,"CSOL","Configuration.setOSDLock returns failure. command was not defined.");o(m);g("Configuration.setOSDLock invalid ");return}i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"hotelMode",notifySelf:false,settings:{enableMrcu:(p.enabled===true)?"off":"on",enableOsdVisibility:(p.enabled===true)?"off":"on"}},onSuccess:function(q){g("setOSDLock: On Success");if(q.returnValue===true){if(typeof n==="function"){n()}}},onFailure:function(q){g("setOSDLock: On Failure");delete q.returnValue;if(typeof o==="function"){k(q,"CSOL","Configuration.setOSDLock returns failure.");o(q)}}});g("Configuration.setOSDLock Done")};b.prototype.getOSDLock=function(m,n){g("getOSDLock: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"hotelMode",keys:["enableMrcu","enableOsdVisibility"]},onSuccess:function(o){g("getOSDLock: On Success");if(o.returnValue===true){var p={};p.enabled=(o.settings.enableMrcu==="on"&&o.settings.enableOsdVisibility==="on")?false:true;if(typeof m==="function"){m(p)}}},onFailure:function(o){g("getOSDLock: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGOL","Configuration.getOSDLock returns failure.");n(o)}}});g("Configuration.getOSDLock Done")};b.prototype.getLocaleList=function(m,n){g("getLocaleList: ");var o={};o.localeList=b.LocaleList;if(typeof m==="function"){m(o)}g("Configuration.getLocaleList Done")};b.prototype.setOSDLanguage=function(n,o,p){g("setOSDLanguage: "+p.specifier);if((p.specifier===null||typeof p.specifier!=="string")&&typeof o==="function"){var m={};k(m,"CSOL","Configuration.setOSDLanguage returns failure. command was not defined.");o(m);g("Configuration.setOSDLanguage invalid ");return}if(e(p.specifier)===true){g("Specifier is valid");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{keys:["localeInfo"]},onSuccess:function(q){if(q.returnValue===true){var r={};r=q.settings.localeInfo;r.locales.UI=p.specifier;r.locales.FMT=p.specifier;r.locales.TV=p.specifier;g("localeInfo : "+JSON.stringify(r));i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{settings:{localeInfo:r}},onSuccess:function(s){g("setOSDLanguage: On Success");if(s.returnValue===true){if(typeof n==="function"){n()}}},onFailure:function(s){g("setOSDLanguage: On Failure");delete s.returnValue;if(typeof o==="function"){k(s,"CSOL","Configuration.setOSDLanguage returns failure.");o(s)}}})}},onFailure:function(q){delete q.returnValue;if(typeof o==="function"){k(q,"CSOL","Configuration.setOSDLanguage returns failure.");o(q)}}})}else{var m={};k(m,"CSOL","Configuration.setOSDLanguage returns failure. specifier is not valid.");o(m);g("Configuration.setOSDLanguage invalid ");return}g("Configuration.setOSDLanguage Done")};b.prototype.getOSDLanguage=function(m,n){g("getOSDLanguage: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{keys:["localeInfo"]},onSuccess:function(o){g("getOSDLanguage: On Success");if(o.returnValue===true){var p={};g("localeInfo : "+JSON.stringify(o.settings.localeInfo));p.specifier=o.settings.localeInfo.locales.UI;if(typeof m==="function"){m(p)}}},onFailure:function(o){g("getOSDLanguage: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGOL","Configuration.getOSDLanguage returns failure.");n(o)}}});g("Configuration.getOSDLanguage Done")};b.prototype.setVirtualKeyboardLanguage=function(n,o,p){g("setVirtualKeyboardLanguage: "+p.languageCodeList);if(p.languageCodeList===null&&typeof o==="function"){var m={};k(m,"CSKL","Configuration.setVirtualKeyboardLanguage returns failure. command was not defined.");o(m);g("Configuration.setVirtualKeyboardLanguage invalid ");return}for(var q=0;q<p.languageCodeList.length;q++){if(d(p.languageCodeList[q])===false){var m={};k(m,"CSKL","Configuration.setVirtualKeyboardLanguage returns failure. language code is not valid.");o(m);g("Configuration.setVirtualKeyboardLanguage invalid ");return}}g("languageCodeList is valid");i.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"setVirtualKeyboardLanguage",parameters:{languageCodeList:p.languageCodeList},onSuccess:function(r){g("setVirtualKeyboardLanguage: On Success");if(r.returnValue===true){if(typeof n==="function"){n()}}},onFailure:function(r){g("setVirtualKeyboardLanguage: On Failure");delete r.returnValue;if(typeof o==="function"){k(r,"CSKL","Configuration.setVirtualKeyboardLanguage returns failure.");o(r)}}});g("Configuration.setVirtualKeyboardLanguage Done")};b.prototype.getVirtualKeyboardLanguage=function(m,n){g("getVirtualKeyboardLanguage: ");i.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"getVirtualKeyboardLanguage",parameters:{},onSuccess:function(o){g("getVirtualKeyboardLanguage: On Success");if(o.returnValue===true){var p={};g("keyboards : "+JSON.stringify(o.languageCodeList));p.languageCodeList=o.languageCodeList;if(typeof m==="function"){m(p)}}},onFailure:function(o){g("getVirtualKeyboardLanguage: On Failure");delete o.returnValue;if(typeof n==="function"){k(o,"CGKL","Configuration.getVirtualKeyboardLanguage returns failure.");n(o)}}});g("Configuration.getVirtualKeyboardLanguage Done")};a.exports=b});Configuration=cordova.require("cordova/plugin/configuration");