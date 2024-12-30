Configuration=(function(){var a,g;function e(l){}function k(l){return typeof l==="number"&&isFinite(l)}if(typeof window==="object"){cordova.define("cordova/plugin/configuration",function(m,l,n){a=function(){};if(window.PalmSystem){e("Window.PalmSystem Available");g=m("cordova/plugin/webos/service")}else{g={Request:function(o,p){e(o+" invoked. But I am a dummy because PalmSystem is not available");if(typeof p.onFailure==="function"){p.onFailure({returnValue:false,errorText:"PalmSystem Not Available. Cordova is not installed?"})}}}}n.exports=a});a=cordova.require("cordova/plugin/configuration")}else{a=function(l){g=l;g.Request=function(m,o){var n=m+"/"+o.method;var p={};if(o.hasOwnProperty("parameters")===true){p=o.parameters}var q={};var r=function(s){console.log("res : "+JSON.stringify(s));if(s.payload.returnValue===true){q=s.payload;o.onSuccess(q)}else{q.returnValue=false;q.errorCode=s.payload.errorCode;q.errorText=s.payload.errorText;o.onFailure(q)}};if(g){g.call(n,p,r)}}};module.exports=a}function i(m,n,l){if(m.errorCode===undefined||m.errorCode===null){m.errorCode=n}if(m.errorText===undefined||m.errorText===null){m.errorText=l}}a.PictureMode={VIVID:"vivid",STANDARD:"normal",APS:"eco",CINEMA:"cinema",GAME:"game",SPORTS:"sports",EXPERT1:"expert1",EXPERT2:"expert2"};a.AppMode={LOCAL:"local",USB:"usb",REMOTE:"remote"};a.AppType={IPK:"ipk",ZIP:"zip"};a.LocaleList=[{language:"čeština",languageCode:"cs",countries:[{name:"",specifier:"cs-CZ"}]},{language:"dansk",languageCode:"da",countries:[{name:"",specifier:"da-DK"}]},{language:"Deutsch",languageCode:"de",countries:[{name:"",specifier:"de-DE"}]},{language:"English",languageCode:"en",countries:[{name:"",specifier:"en-US"}]},{language:"Español",languageCode:"es",countries:[{name:"",specifier:"es-ES"}]},{language:"ελληνική γλώσσα",languageCode:"el",countries:[{name:"",specifier:"el-GR"}]},{language:"Français",languageCode:"fr",countries:[{name:"",specifier:"fr-FR"}]},{language:"italiano",languageCode:"it",countries:[{name:"",specifier:"it-IT"}]},{language:"Nederlands",languageCode:"nl",countries:[{name:"",specifier:"nl-NL"}]},{language:"norsk",languageCode:"nb",countries:[{name:"",specifier:"nb-NO"}]},{language:"português",languageCode:"pt",countries:[{name:"Portugal",specifier:"pt-PT"},{name:"Brasil",specifier:"pt-BR"}]},{language:"русский",languageCode:"ru",countries:[{name:"",specifier:"ru-RU"}]},{language:"suomi",languageCode:"fi",countries:[{name:"",specifier:"fi-FI"}]},{language:"svenska",languageCode:"sv",countries:[{name:"",specifier:"sv-SE"}]},{language:"한국어",languageCode:"ko",countries:[{name:"",specifier:"ko-KR"}]},{language:"中文",languageCode:"zh-Hans",countries:[{name:"中国",specifier:"zh-Hans-CN"}]},{language:"日本語",languageCode:"ja",countries:[{name:"",specifier:"ja-JP"}]},{language:"中文",languageCode:"zh-Hant",countries:[{name:"香港",specifier:"zh-Hant-HK"}]}];function c(p){var l=a.LocaleList;for(var o=0;o<l.length;o++){var m=l[o].countries;for(var n=0;n<m.length;n++){if(m[n].specifier===p){return true}}}return false}function d(n){var l=a.LocaleList;for(var m=0;m<l.length;m++){if(l[m].languageCode===n){return true}}return false}var h=null;function j(l){if(h===null){g.Request("luna://com.webos.service.tv.systemproperty",{method:"getSystemInfo",parameters:{keys:["sdkVersion"]},onSuccess:function(m){e("getPlatformInfo: onSuccess");var n=m.sdkVersion.split(".");if(n.length>=1&&n[0]==="1"){h=1}else{if(n.length>=1&&n[0]==="2"){h=2}else{if(n.length>=1&&n[0]==="3"){h=3}else{h=0}}}delete m.returnValue;l(h)},onFailure:function(m){e("getPlatformInfo: onFailure");delete m.returnValue;h=0;l(h)}})}else{l(h)}}a.prototype.setPictureMode=function(l,m,n){e("setPictureMode: "+JSON.stringify(n));g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"picture",settings:{pictureMode:n.mode}},onSuccess:function(o){e("setPictureMode: On Success");if(o.returnValue===true){if(typeof l==="function"){l()}}},onFailure:function(o){e("setPictureMode: On Failure");delete o.returnValue;if(typeof m==="function"){i(o,"CSPM","Configuration.setPictureMode returns failure.");m(o)}}});e("Configuration.setPictureMode Done")};a.prototype.getPictureMode=function(l,m){e("getPictureMode: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"picture",keys:["pictureMode"]},onSuccess:function(n){e("getPictureMode: On Success");if(n.returnValue===true){if(typeof l==="function"){var o={};o.mode=n.settings.pictureMode;l(o)}}},onFailure:function(n){e("getPictureMode: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGPM","Configuration.getPictureMode returns failure.");m(n)}}});e("Configuration.getPictureMode Done")};a.prototype.setPictureProperty=function(l,m,n){e("setPictureProperty: "+JSON.stringify(n));j(function(p){var r={};if(!(k(n.backlight))){var o={};i(o,"CSPP","Configuration.setPictureProperty, backlight type is not number.");m(o);return}for(var q in n){if(q!==undefined&&q!==null){r[q]=n[q];if(q==="tint"||q==="colorTemperature"){r[q]-=50}else{if(q==="blackLevel"){r[q]={unknown:n[q]};if(n[q]!=="low"&&n[q]!=="high"){e("setPictureProperty: gamma value error "+JSON.stringify(n));var o={};i(o,"CSPP","Configuration.setPictureProperty, There is No matched item : blackLevel.");m(o);return}}else{if(q==="gamma"&&(p===2||p===3)&&n[q]==="high"){r[q]="high1"}}}}}e(JSON.stringify(r));g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"picture",settings:r},onSuccess:function(s){e("setPictureProperty: On Success");if(s.returnValue===true){if(typeof l==="function"){l()}}},onFailure:function(s){e("setPictureProperty: On Failure");delete s.returnValue;if(typeof m==="function"){i(s,"CSPP","Configuration.setPictureProperty returns failure.");m(s)}}});e("Configuration.setPictureProperty Done")})};a.prototype.getPictureProperty=function(l,m){e("getPictureProperty: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"picture",keys:["brightness","contrast","color","tint","backlight","sharpness","hSharpness","vSharpness","colorTemperature","dynamicContrast","superResolution","colorGamut","dynamicColor","noiseReduction","mpegNoiseReduction","blackLevel","gamma"]},onSuccess:function(n){e("getPictureProperty: On Success");if(n.returnValue===true){if(typeof l==="function"){var p={};for(var o in n.settings){if(o!==undefined&&o!==null){p[o]=(isNaN(n.settings[o])?n.settings[o]:Number(n.settings[o]));if(o==="tint"||o==="colorTemperature"){p[o]+=50}else{if(o==="blackLevel"){p[o]=n.settings[o].unknown}else{if(o==="gamma"&&n.settings[o]==="high1"){p[o]="high"}}}}}l(p)}}},onFailure:function(n){e("getPictureProperty: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGPP","Configuration.getPictureProperty returns failure.");m(n)}}});e("Configuration.getPictureProperty Done")};var b={alias:"signageName"};var f={key_delivery_to_simplink:"propertyKeyDeliveryToSimplink",cec_device_control:"propertyCecDeviceControl"};a.prototype.setProperty=function(l,m,o){e("setProperty: "+JSON.stringify(o));var n=JSON.parse(o);var p={};var r={};var q={};var s={};j(function(t){if(t===3){b.alias="deviceName";r.category="network"}else{b.alias="signageName";r.category="commercial"}for(var u in n){if(b[u]!==undefined){p[(b[u])]=n[u];s.category=r.category}else{if(f[u]!==undefined){p[f[u]]=n[u];s.category="commercial"}else{if(typeof m==="function"){i(q,"CSP","Configuration.setProperty returns failure.");m(q);return}}}}s.settings=p;g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:s,onSuccess:function(v){e("setProperty: On Success");if(v.returnValue===true){if(typeof l==="function"){l()}}},onFailure:function(v){e("setProperty: On Failure");delete v.returnValue;if(typeof m==="function"){i(v,"CSP","Configuration.setProperty returns failure.");m(v)}}})});e("Configuration.setProperty Done")};a.prototype.getProperty=function(l,o,v){e("getProperty: ");var q=JSON.parse(v);var t=q.keys;var p=Object.keys(t).length;var r=0;var n={};var s=[];var u={};var m={};if(v===null||typeof v==="undefined"||typeof v!=="string"){i(u,"CGP","Configuration.getProperty check Parameter.");o(u)}j(function(w){if(w===3){b.alias="deviceName";n.category="network"}else{b.alias="signageName";n.category="commercial"}e(s);var B=function(D){if(D){if(p===r){if(typeof l==="function"){l(JSON.stringify(m))}}}else{i(u,"CGP","Configuration.getProperty returns failure.");o(u)}};var A=function(D){for(var E in b){if(b[E]===D){return E}}for(var E in f){if(f[E]===D){return E}}return false};var C=function(D){g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:D,onSuccess:function(E){e("getProperty: On Success");if(E.returnValue===true){if(Object.prototype.hasOwnProperty.call(E,"settings")){for(var G in E.settings){var F=A(G);if(F!==false){m[F]=E.settings[G]}}r++;B(true)}else{B(false)}}else{B(false)}},onFailure:function(E){e("getProperty: On Failure");delete E.returnValue;B(false)}})};for(var z=0;z<t.length;z++){var y=t[z];if(y!==null&&y!==undefined){var x={};if(Object.prototype.hasOwnProperty.call(b,y)){x.category=n.category;x.keys=[];x.keys.push(b[y]);C(x)}else{if(Object.prototype.hasOwnProperty.call(f,y)){x.category="commercial";x.keys=[];x.keys.push(f[y]);C(x)}else{i(u,"CGP","Configuration.getProperty - wrong key!");o(u)}}}}});e("Configuration.getProperty Done")};a.prototype.setCurrentTime=function(n,p,q){e("setCurrentTime: "+JSON.stringify(q));var o=new Date(q.year,q.month-1,q.day,q.hour,q.minute,q.sec);if(q.year<2000||q.year>2037||q.month<1||q.month>12||q.day<1||q.day>31||q.hour<0||q.hour>23||q.minute<0||q.minute>59||q.sec<0||q.sec>59||o.getFullYear()!==q.year||o.getMonth()!==(q.month-1)||o.getDate()!==q.day||o.getHours()!==q.hour||o.getMinutes()!==q.minute||o.getSeconds()!==q.sec){if(typeof p==="function"){e("setCurrentTime: out of range or invalid parameter type");var m={};i(m,"CSCT","Configuration.setCurrentTime returns failure for out of range.");p(m);return}}e("setCurrentTime: "+JSON.stringify(q));var l={};var s={};s.year=q.year;s.month=q.month;s.day=q.day;s.hour=q.hour;s.minute=q.minute;s.sec=q.sec;l.time=s;l.ntp=(typeof q.ntp==="boolean")?q.ntp:false;var r=function(){g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"setSystemTime",parameters:l,onSuccess:function(){e("setCurrentTime: On Success");if(typeof n==="function"){n()}},onFailure:function(t){e("setCurrentTime: On Failure");delete t.returnValue;if(typeof p==="function"){i(t,"CSCT","Configuration.setCurrentTime returns failure.");p(t)}}})};g.Request("luna://com.webos.service.config",{method:"getConfigs",parameters:{configNames:["commercial.com.palm.app.settings.supportNtpServerSetting"]},onSuccess:function(t){var u=false;if(t.returnValue===true&&t.configs&&t.configs["commercial.com.palm.app.settings.supportNtpServerSetting"]){u=t.configs["commercial.com.palm.app.settings.supportNtpServerSetting"]===true}if(u){l.ntpServerAddress=q.ntpServerAddress}r()},onFailure:function(t){r()}});e("Configuration.setCurrentTime Done")};a.prototype.getCurrentTime=function(l,m){e("getCurrentTime: ");g.Request("luna://com.palm.systemservice/time/",{method:"getEffectiveBroadcastTime",onSuccess:function(n){e("getCurrentTime : On Success");if(n.returnValue===true){var o={};var p=new Date(n.adjustedUtc*1000);o.year=p.getFullYear();o.month=p.getMonth()+1;o.day=p.getDate();o.hour=p.getHours();o.minute=p.getMinutes();o.sec=p.getSeconds();g.Request("luna://com.palm.systemservice/",{method:"getPreferences",parameters:{keys:["useNetworkTime"]},onSuccess:function(q){e("getPreferences : On Success");if(q.returnValue===true){o.ntp=q.useNetworkTime;g.Request("luna://com.webos.service.config",{method:"getConfigs",parameters:{configNames:["commercial.com.palm.app.settings.supportNtpServerSetting"]},onSuccess:function(r){var s=false;if(r.returnValue===true&&r.configs&&r.configs["commercial.com.palm.app.settings.supportNtpServerSetting"]){s=r.configs["commercial.com.palm.app.settings.supportNtpServerSetting"]===true}if(!s){if(typeof l==="function"){l(o)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["ntpServerMode","ntpServerType","ntpServerIpv4","ntpServerIpv6","ntpServerUrl"]},onSuccess:function(t){if(t.returnValue===true){if(o.ntp===true&&t.settings.ntpServerMode==="manual"){var u=t.settings.ntpServerType;if(u==="ipv4"){o.ntpServerAddress=t.settings.ntpServerIpv4}else{if(u==="ipv6"){o.ntpServerAddress=t.settings.ntpServerIpv6}else{if(u==="url"){o.ntpServerAddress=t.settings.ntpServerUrl}}}}if(typeof l==="function"){l(o)}return}},onFailure:function(t){delete t.returnValue;if(typeof l==="function"){l(o)}return}})},onFailure:function(r){delete r.returnValue;if(typeof l==="function"){l(o)}return}})}else{if(typeof m==="function"){i(n,"CGCT","Configuration.getCurrentTime returns failure.");m(n)}}},onFailure:function(q){e("getCurrentTime: On Failure");delete q.returnValue;if(typeof m==="function"){i(q,"CGCT","Configuration.getCurrentTime returns failure.");m(q)}}})}else{if(typeof m==="function"){i(n,"CGCT","Configuration.getCurrentTime returns failure.");m(n)}}},onFailure:function(n){e("getCurrentTime: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGCT","Configuration.getCurrentTime returns failure.");m(n)}}});e("Configuration.getCurrentTime Done")};a.prototype.restartApplication=function(l,m){e("restartApp: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"restart_application",onSuccess:function(n){e("restartApp: On Success");if(typeof l==="function"){l(n)}},onFailure:function(n){e("restartApp: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CRA","Configuration.restartApp returns failure.");m(n)}}});e("Configuration.restartApp Done")};a.prototype.getServerProperty=function(l,m){e("getServerProperty: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["serverIpPort","siServerIp","secureConnection","appLaunchMode","fqdnAddr","fqdnMode","appType"]},onSuccess:function(n){e("getPictureProperty: On Success");if(n.returnValue===true){if(typeof l==="function"){var o={};o.serverIp=n.settings.siServerIp;o.serverPort=parseInt(n.settings.serverIpPort,10);o.secureConnection=(n.settings.secureConnection==="off"?false:true);o.appLaunchMode=n.settings.appLaunchMode;o.appType=n.settings.appType;o.fqdnMode=(n.settings.fqdnMode==="off"?false:true);o.fqdnAddr=n.settings.fqdnAddr;l(o)}}},onFailure:function(n){e("getServerProperty: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGSP","Configuration.getServerProperty returns failure.");m(n)}}});e("Configuration.getServerProperty Done")};a.prototype.setServerProperty=function(m,n,o){e("setServerProperty: "+JSON.stringify(o));if(o===undefined||typeof o.serverIp!=="string"||/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(o.serverIp)===false||isNaN(o.serverPort)||o.serverPort<0||o.serverPort>65535||typeof o.serverPort!=="number"||typeof o.secureConnection!=="boolean"||typeof o.appLaunchMode!=="string"||(o.appLaunchMode!==a.AppMode.USB&&o.appLaunchMode!==a.AppMode.LOCAL&&o.appLaunchMode!==a.AppMode.REMOTE)){if(typeof n==="function"){var l={};i(l,"CSSP","Configuration.setServerProperty, Invalid parameters.");n(l);return}}var p={};p.siServerIp=o.serverIp;p.serverIpPort=o.serverPort+"";p.secureConnection=(o.secureConnection===true?"on":"off");p.appLaunchMode=o.appLaunchMode;if(typeof o.fqdnMode==="boolean"){p.fqdnMode=(o.fqdnMode===true?"on":"off")}if(typeof o.fqdnAddr==="string"){p.fqdnAddr=o.fqdnAddr}if(typeof o.appType!=="undefined"){p.appType=o.appType}e(JSON.stringify(p));g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:p},onSuccess:function(q){e("setServerProperty: On Success");if(q.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(q){e("setServerProperty: On Failure");delete q.returnValue;if(typeof n==="function"){i(q,"CSSP","Configuration.setServerProperty returns failure.");n(q)}}});e("Configuration.setServerProperty Done")};a.prototype.clearCache=function(l,m){e("clearCache: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"clearCache",onSuccess:function(n){e("clearCache: On Success");if(typeof l==="function"){l()}},onFailure:function(n){e("clearCache: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CCC","Configuration.clearCache returns failure.");m(n)}}});e("Configuration.clearCache Done")};a.prototype.getTimeZoneList=function(l,m){e("getTimeZoneList: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"getTimeZoneList",onSuccess:function(n){e("getTimeZoneList: On Success");if(n.returnValue===true){if(typeof l==="function"){delete n.returnValue;l(n)}}},onFailure:function(n){e("getTimeZoneList: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGTL","Configuration.getTimeZoneList returns failure.");m(n)}}});e("Configuration.getTimeZoneList Done")};a.prototype.getTimeZone=function(l,m){e("getTimeZone: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"getTimeZone",onSuccess:function(n){e("getTimeZone: On Success");if(n.returnValue===true){if(typeof l==="function"){delete n.returnValue;l(n)}}},onFailure:function(n){e("getTimeZone: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGTZ","Configuration.getTimeZone returns failure.");m(n)}}});e("Configuration.getTimeZone Done")};a.prototype.setTimeZone=function(l,m,n){e("setTimeZone: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"time",keys:["autoClock"]},onSuccess:function(o){if(o.returnValue===true){if(typeof l==="function"){if(o.settings.autoClock==="off"){delete o.returnValue;if(typeof m==="function"){i(o,"CSTZ","Configuration.setTimeZone returns failure. autoClock is off");m(o)}}else{g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"setTimeZone",parameters:n,onSuccess:function(p){e("setTimeZone: On Success");if(p.returnValue===true){if(typeof l==="function"){delete p.returnValue;l(p)}}},onFailure:function(p){e("setTimeZone: On Failure");delete p.returnValue;if(typeof m==="function"){i(p,"CSTZ","Configuration.setTimeZone returns failure.");m(p)}}})}}}},onFailure:function(o){e("setTimeZone: On Failure");delete o.returnValue;if(typeof m==="function"){i(o,"CSTZ","Configuration.setTimeZone returns failure.");m(o)}}});e("Configuration.setTimeZone Done")};a.prototype.debug=function(l,m,n){e("debug: "+n.enabled);g.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"debug",parameters:{enabled:n.enabled},onSuccess:function(o){e("debug: On Success");if(typeof l==="function"){l(o)}},onFailure:function(o){e("debug: On Failure");delete o.returnValue;if(typeof m==="function"){i(o,"CD","Configuration.debug returns failure.");m(o)}}});e("Configuration.debug Done")};a.prototype.setUSBLock=function(m,n,o){e("setUSBLock: "+o.enabled);if(o.enabled===null&&typeof n==="function"){var l={};i(l,"CSUL","Configuration.setUSBLock returns failure. command was not defined.");n(l);e("Configuration.setUSBLock invalid ");return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{enableUsb:(o.enabled===true)?"off":"on"}},onSuccess:function(p){e("setUSBLock: On Success");if(p.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(p){e("setUSBLock: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"CSUL","Configuration.setUSBLock returns failure.");n(p)}}});e("Configuration.setUSBLock Done")};a.prototype.getUSBLock=function(l,m){e("getUSBLock: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["enableUsb"]},onSuccess:function(n){e("getUSBLock: On Success");if(n.returnValue===true){var o={};o.enabled=(n.settings.enableUsb==="off")?true:false;if(typeof l==="function"){l(o)}}},onFailure:function(n){e("getUSBLock: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGUL","Configuration.getUSBLock returns failure.");m(n)}}});e("Configuration.getUSBLock Done")};a.prototype.setOSDLock=function(m,n,o){e("setOSDLock: "+o.enabled);if(o.enabled===null&&typeof n==="function"){var l={};i(l,"CSOL","Configuration.setOSDLock returns failure. command was not defined.");n(l);e("Configuration.setOSDLock invalid ");return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"hotelMode",notifySelf:false,settings:{enableMrcu:(o.enabled===true)?"off":"on",enableOsdVisibility:(o.enabled===true)?"off":"on"}},onSuccess:function(p){e("setOSDLock: On Success");if(p.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(p){e("setOSDLock: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"CSOL","Configuration.setOSDLock returns failure.");n(p)}}});e("Configuration.setOSDLock Done")};a.prototype.getOSDLock=function(l,m){e("getOSDLock: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"hotelMode",keys:["enableMrcu","enableOsdVisibility"]},onSuccess:function(n){e("getOSDLock: On Success");if(n.returnValue===true){var o={};o.enabled=(n.settings.enableMrcu==="on"&&n.settings.enableOsdVisibility==="on")?false:true;if(typeof l==="function"){l(o)}}},onFailure:function(n){e("getOSDLock: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGOL","Configuration.getOSDLock returns failure.");m(n)}}});e("Configuration.getOSDLock Done")};a.prototype.getLocaleList=function(l,m){e("getLocaleList: ");var n={};n.localeList=a.LocaleList;if(typeof l==="function"){l(n)}e("Configuration.getLocaleList Done")};a.prototype.setOSDLanguage=function(m,n,o){e("setOSDLanguage: "+o.specifier);if((o.specifier===null||typeof o.specifier!=="string")&&typeof n==="function"){var l={};i(l,"CSOL","Configuration.setOSDLanguage returns failure. command was not defined.");n(l);e("Configuration.setOSDLanguage invalid ");return}if(c(o.specifier)===true){e("Specifier is valid");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{keys:["localeInfo"]},onSuccess:function(p){if(p.returnValue===true){var q={};q=p.settings.localeInfo;q.locales.UI=o.specifier;q.locales.FMT=o.specifier;q.locales.TV=o.specifier;e("localeInfo : "+JSON.stringify(q));g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{settings:{localeInfo:q}},onSuccess:function(r){e("setOSDLanguage: On Success");if(r.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(r){e("setOSDLanguage: On Failure");delete r.returnValue;if(typeof n==="function"){i(r,"CSOL","Configuration.setOSDLanguage returns failure.");n(r)}}})}},onFailure:function(p){delete p.returnValue;if(typeof n==="function"){i(p,"CSOL","Configuration.setOSDLanguage returns failure.");n(p)}}})}else{var l={};i(l,"CSOL","Configuration.setOSDLanguage returns failure. specifier is not valid.");n(l);e("Configuration.setOSDLanguage invalid ");return}e("Configuration.setOSDLanguage Done")};a.prototype.getOSDLanguage=function(l,m){e("getOSDLanguage: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{keys:["localeInfo"]},onSuccess:function(n){e("getOSDLanguage: On Success");if(n.returnValue===true){var o={};e("localeInfo : "+JSON.stringify(n.settings.localeInfo));o.specifier=n.settings.localeInfo.locales.UI;if(typeof l==="function"){l(o)}}},onFailure:function(n){e("getOSDLanguage: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGOL","Configuration.getOSDLanguage returns failure.");m(n)}}});e("Configuration.getOSDLanguage Done")};a.prototype.setVirtualKeyboardLanguage=function(m,n,o){e("setVirtualKeyboardLanguage: "+o.languageCodeList);if(o.languageCodeList===null&&typeof n==="function"){var l={};i(l,"CSKL","Configuration.setVirtualKeyboardLanguage returns failure. command was not defined.");n(l);e("Configuration.setVirtualKeyboardLanguage invalid ");return}for(var p=0;p<o.languageCodeList.length;p++){if(d(o.languageCodeList[p])===false){var l={};i(l,"CSKL","Configuration.setVirtualKeyboardLanguage returns failure. language code is not valid.");n(l);e("Configuration.setVirtualKeyboardLanguage invalid ");return}}e("languageCodeList is valid");g.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"setVirtualKeyboardLanguage",parameters:{languageCodeList:o.languageCodeList},onSuccess:function(q){e("setVirtualKeyboardLanguage: On Success");if(q.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(q){e("setVirtualKeyboardLanguage: On Failure");delete q.returnValue;if(typeof n==="function"){i(q,"CSKL","Configuration.setVirtualKeyboardLanguage returns failure.");n(q)}}});e("Configuration.setVirtualKeyboardLanguage Done")};a.prototype.getVirtualKeyboardLanguage=function(l,m){e("getVirtualKeyboardLanguage: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"getVirtualKeyboardLanguage",parameters:{},onSuccess:function(n){e("getVirtualKeyboardLanguage: On Success");if(n.returnValue===true){var o={};e("keyboards : "+JSON.stringify(n.languageCodeList));o.languageCodeList=n.languageCodeList;if(typeof l==="function"){l(o)}}},onFailure:function(n){e("getVirtualKeyboardLanguage: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"CGKL","Configuration.getVirtualKeyboardLanguage returns failure.");m(n)}}});e("Configuration.getVirtualKeyboardLanguage Done")};a.prototype.setProxyBypassList=function(m,n,o){if(typeof o.urlList==="undefined"&&typeof n==="function"){var l={};i(l,"CSPB","Configuration.setProxyBypassList returns failure. options.urlList is undefined.");n(l);return}g.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"setProxyBypassList",parameters:{urlList:o.urlList},onSuccess:function(p){e("setProxyBypassList: On Success");if(p.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(p){e("setProxyBypassList: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"CSPB","Configuration.setProxyBypassList returns failure.");n(p)}}})};a.prototype.getProxyBypassList=function(l,m){g.Request("luna://com.webos.service.commercial.signage.storageservice/configuration/",{method:"getProxyBypassList",parameters:{},onSuccess:function(n){if(n.returnValue===true){var o={};o.urlList=n.urlList;if(typeof l==="function"){l(o)}}},onFailure:function(n){delete n.returnValue;if(typeof m==="function"){i(n,"CGPB","Configuration.getProxyBypassList returns failure.");m(n)}}})};a.prototype.getMasterPinStatus=function(l,m){g.Request("luna://com.webos.service.commercial.signage.storageservice/configuration",{method:"getMasterPinStatus",parameters:{},onSuccess:function(n){delete n.returnValue;if(typeof l==="function"){l(n)}},onFailure:function(n){delete n.returnValue;if(typeof m==="function"){m(n)}}})};a.prototype.setMasterPinStatus=function(l,m,n){g.Request("luna://com.webos.service.commercial.signage.storageservice/configuration",{method:"setMasterPinStatus",parameters:n,onSuccess:function(o){delete o.returnValue;if(typeof l==="function"){l()}},onFailure:function(o){delete o.returnValue;if(typeof m==="function"){m(o)}}})};return a}());