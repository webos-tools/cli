/*!
 * ============================================================================
 *   ID SW PLATFORM TEAM, LG ELECTRONICS INC., SEOUL, KOREA                       
 *   Copyright(c) 2016 by LG Electronics Inc.                                  
 *                                                                             
 *   Release Version : 1.4.0
 * ============================================================================
 */
cordova.define("cordova/plugin/power",function(c,e,b){function d(l){}var g;if(window.PalmSystem){d("Window.PalmSystem Available");g=c("cordova/plugin/webos/service")}else{g={Request:function(l,m){d(l+" invoked. But I am a dummy because PalmSystem is not available");if(typeof m.onFailure==="function"){m.onFailure({returnValue:false,errorText:"PalmSystem Not Available. Cordova is not installed?"})}}}}var j=function(){};function i(m,n,l){if(m.errorCode===undefined||m.errorCode===null){m.errorCode=n}if(m.errorText===undefined||m.errorText===null){m.errorText=l}}var h=null;var a={};function k(l){if(h===null){g.Request("luna://com.webos.service.tv.systemproperty",{method:"getSystemInfo",parameters:{keys:["sdkVersion","boardType"]},onSuccess:function(m){d("getPlatformInfo: onSuccess");d("version : "+m.sdkVersion);var n=m.sdkVersion.split(".");if(n.length>=1&&n[0]==="1"){a={webOSVer:1,chipset:m.boardType.split("_")[0]}}else{if(n.length>=1&&n[0]==="2"){a={webOSVer:2,chipset:m.boardType.split("_")[0]}}else{if(n.length>=1&&n[0]==="3"){a={webOSVer:3,chipset:m.boardType.split("_")[0]}}else{a={webOSVer:0,chipset:""}}}}h=a.webOSVer;delete m.returnValue;l(a)},onFailure:function(m){d("getPlatformInfo: onFailure");delete m.returnValue;a={webOSVer:0,chipset:""};l(a)}})}else{l(a)}}function f(l){if(a.chipset=="H15"){switch(l){case"ext://hdmi:1":return"HDMI1";case"ext://hdmi:2":return"HDMI2";case"ext://hdmi:3":return"OPS/HDMI3/DVI";case"ext://dvi:1":return"OPS/HDMI3/DVI";case"ext://dp:1":return"DISPLAYPORT";case"ext://rgb:1":return"RGB";case"ext://ops:1":return"OPS/HDMI3/DVI";case"HDMI1":return"ext://hdmi:1";case"HDMI2":return"ext://hdmi:2";case"HDMI3":return"ext://hdmi:3";case"DVI":return"ext://dvi:1";case"DISPLAYPORT":return"ext://dp:1";case"RGB":return"ext://rgb:1";case"OPS":return"ext://ops:1";case"OPS/HDMI3/DVI":return"ext://hdmi:3"}}else{switch(l){case"ext://hdmi:1":if(a.webOSVer===1){return"HDMI1"}else{return"HDMI"}case"ext://hdmi:2":return"HDMI2";case"ext://hdmi:3":return"HDMI3";case"ext://dvi:1":return"DVI";case"ext://dp:1":return"DISPLAYPORT";case"ext://rgb:1":return"RGB";case"ext://ops:1":return"OPS";case"HDMI1":return"ext://hdmi:1";case"HDMI":return"ext://hdmi:1";case"HDMI2":return"ext://hdmi:2";case"HDMI3":return"ext://hdmi:3";case"DVI":return"ext://dvi:1";case"DISPLAYPORT":return"ext://dp:1";case"RGB":return"ext://rgb:1";case"OPS":return"ext://ops:1";case"OPS/HDMI3/DVI":return"ext://hdmi:3"}}return null}j.PowerCommand={SHUTDOWN:"powerOff",REBOOT:"reboot"};j.DisplayMode={DISPLAY_OFF:"Screen Off",DISPLAY_ON:"Active"};j.TimerWeek={MONDAY:1,TUESDAY:2,WEDNESDAY:4,THURSDAY:8,FRIDAY:16,SATURDAY:32,SUNDAY:64,EVERYDAY:127};j.DPMSignalType={CLOCK:"clock",CLOCK_WITH_DATA:"clockAndData"};j.PMMode={PowerOff:"powerOff",SustainAspectRatio:"sustainAspectRatio",ScreenOff:"screenOff",ScreenOffAlways:"screenOffAlways"};j.prototype.getPowerStatus=function(l,m){d("getPowerStatus: ");g.Request("luna://com.webos.service.tv.signage/",{method:"getPowerState",onSuccess:function(n){d("getPowerStatus: On Success");var o={};if(n.returnValue===true){o.displayMode=n.state}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["wolEnable"]},onSuccess:function(p){d("getPowerStatus: On Success 2");if(p.returnValue===true){o.wakeOnLan=(p.settings.wolEnable==="1"?true:false)}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"time",keys:["onTimerEnable","offTimerEnable"]},onSuccess:function(q){d("getPowerStatus: On Success 3");if(q.returnValue===true){o.allOnTimer=(q.settings.onTimerEnable==="on"?true:false);o.allOffTimer=(q.settings.offTimerEnable==="on"?true:false);if(typeof l==="function"){l(o)}}},onFailure:function(q){d("getPowerStatus: On Failure 3");delete q.returnValue;if(typeof m==="function"){i(q,"PGPS","Power.getPowerStatus returns failure.");m(q)}}})},onFailure:function(p){d("getPowerStatus: On Failure 2");delete p.returnValue;if(typeof m==="function"){i(p,"PGPS","Power.getPowerStatus returns failure.");m(p)}}})},onFailure:function(n){d("getPowerStatus: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"PGPS","Power.getPowerStatus returns failure.");m(n)}}});d("Power.getPowerStatus Done")};j.prototype.enableAllOnTimer=function(m,n,o){d("enableAllOnTimer: "+JSON.stringify(o));var p=null;switch(o.allOnTimer){case true:p="on";break;case false:p="off";break;default:if(typeof n==="function"){var l={};i(l,"PEAOT","Power.enableAllOnTimer returns failure. Invalid option value.");n(l)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"time",settings:{onTimerEnable:p}},onSuccess:function(){if(o.clearOnTimer===true){var t=0;var q=["0","0","0","0","0","0","0"],s=["0","0","0","0","0","0","0"],r=["0","0","0","0","0","0","0"],u=["0","0","0","0","0","0","0"],v=[];g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{multiOnTimerHour:q,multiOnTimerMinute:s,multiOnTimerWeekday:r,multiOnTimerSource:u,onTimerCount:t,onTimerSchedule:v}},onSuccess:function(){d("enableAllOnTimer: On Success 2");if(typeof m==="function"){m()}},onFailure:function(w){d("enableAllOnTimer: On Failure 2");delete w.returnValue;if(typeof n==="function"){i(w,"PEAOT","Power.enableAllOnTimer returns failure. / clearOnTimer");n(w)}}})}else{if(typeof m==="function"){d("enableAllOnTimer: On Success");m()}}},onFailure:function(q){delete q.returnValue;if(typeof n==="function"){d("enableAllOnTimer: On Failure");i(q,"PEAOT","Power.enableAllOnTimer returns failure.");n(q)}}});d("Power.enableAllOnTimer Done")};j.prototype.enableAllOffTimer=function(m,n,o){d("enableAllOffTimer: "+JSON.stringify(o));var p=null;switch(o.allOffTimer){case true:p="on";break;case false:p="off";break;default:if(typeof n==="function"){var l={};i(l,"PEAOT","Power.enableAllOffTimer returns failure. Invalid option value.");n(l)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"time",settings:{offTimerEnable:p}},onSuccess:function(){if(o.clearOffTimer===true){var t=0;var q=["0","0","0","0","0","0","0"],s=["0","0","0","0","0","0","0"],r=["0","0","0","0","0","0","0"],u=[];g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{multiOffTimerHour:q,multiOffTimerMinute:s,multiOffTimerWeekday:r,offTimerCount:t,offTimerSchedule:u}},onSuccess:function(){d("enableAllOffTimer: On Success 2");if(typeof m==="function"){m()}},onFailure:function(v){d("enableAllOffTimer: On Failure 2");delete v.returnValue;if(typeof n==="function"){i(v,"PEAOT","Power.enableAllOffTimer returns failure. / clearOffTimer");n(v)}}})}else{if(typeof m==="function"){d("enableAllOffTimer: On Success");m()}}},onFailure:function(q){delete q.returnValue;if(typeof n==="function"){d("enableAllOffTimer: On Failure");i(q,"PEAOT","Power.enableAllOffTimer returns failure.");n(q)}}});d("Power.enableAllOffTimer Done")};j.prototype.enableWakeOnLan=function(m,n,o){d("enableWakeOnLan: "+JSON.stringify(o));var p=null;switch(o.wakeOnLan){case true:p="1";break;case false:p="0";break;default:if(typeof n==="function"){var l={};i(l,"PSWOL","Power.enableWakeOnLan returns failure. Invalid option value.");n(l)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{wolEnable:p}},onSuccess:function(){if(typeof m==="function"){d("enableWakeOnLan: On Success");m()}},onFailure:function(q){delete q.returnValue;if(typeof n==="function"){d("enableWakeOnLan: On Failure");i(q,"PSWOL","Power.enableWakeOnLan returns failure.");n(q)}}});d("Power.enableWakeOnLan Done")};j.prototype.addOnTimer=function(m,n,o){d("addOnTimer: "+JSON.stringify(o));if(o.hour===undefined||isNaN(o.hour)||typeof o.hour!=="number"||o.hour<0||o.hour>23||o.minute===undefined||isNaN(o.minute)||typeof o.minute!=="number"||o.minute<0||o.minute>59||o.week===undefined||isNaN(o.week)||typeof o.week!=="number"||o.week<0||o.week>127||o.inputSource===undefined||typeof o.inputSource!=="string"||o.inputSource.indexOf("ext://")!==0){if(typeof n==="function"){var l={};i(l,"PAOT","Power.addOnTimer returns failure. invalid parameters or out of range.");n(l)}return}k(function(p){g.Request("luna://com.webos.service.eim/",{method:"getAllInputStatus",onSuccess:function(q){d("getInputSourceStatus: On Success");if(q.returnValue===true){var v=false;for(var u=0;u<q.totalCount;u++){var t=q.devices[u].deviceName.toLowerCase();var r=o.inputSource.substring(6).split(":");var s="1";if(isNaN(t.substring(t.length-1,t.length))===false){t=t.substring(0,t.length-1);s=q.devices[u].id.split("_")[1]}if(t==="displayport"){t="dp"}if(t.toLowerCase().indexOf(r[0].toLowerCase())>=0&&s===r[1]){v=true;break}}if(v===false){d("addOnTimer: On Failure");delete q.returnValue;if(typeof n==="function"){i(q,"PAOT","Power.addOnTimer returns failure.");n(q)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["multiOnTimerHour","multiOnTimerMinute","multiOnTimerWeekday","multiOnTimerSource","onTimerSchedule","onTimerCount"]},onSuccess:function(w){if(w.returnValue===true){d("version : "+p.webOSVer);if(typeof w.settings.multiOnTimerHour==="string"){w.settings.multiOnTimerHour=JSON.parse(w.settings.multiOnTimerHour)}if(typeof w.settings.multiOnTimerMinute==="string"){w.settings.multiOnTimerMinute=JSON.parse(w.settings.multiOnTimerMinute)}if(typeof w.settings.multiOnTimerWeekday==="string"){w.settings.multiOnTimerWeekday=JSON.parse(w.settings.multiOnTimerWeekday)}if(typeof w.settings.multiOnTimerSource==="string"){w.settings.multiOnTimerSource=JSON.parse(w.settings.multiOnTimerSource)}if(typeof w.settings.onTimerSchedule==="string"){w.settings.onTimerSchedule=JSON.parse(w.settings.onTimerSchedule)}var y=(w.settings.onTimerSchedule===null||w.settings.onTimerSchedule===undefined?0:w.settings.onTimerSchedule.length);if(w.settings.multiOnTimerHour.length<=y){if(typeof n==="function"){i(w,"PSOT","Power.addOnTimer returns failure. No space to add timer.");n(w)}return}if(p.webOSVer===3){if(o.week>=64){o.week=1+(o.week-64)*2}else{o.week=o.week*2}}w.settings.multiOnTimerHour[y]=o.hour;w.settings.multiOnTimerMinute[y]=o.minute;w.settings.multiOnTimerWeekday[y]=o.week;w.settings.multiOnTimerSource[y]=f(o.inputSource);var x=360;w.settings.onTimerSchedule[y]={_id:""+x++,hour:o.hour,input:f(o.inputSource),minute:o.minute,weekday:o.week};g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{multiOnTimerHour:w.settings.multiOnTimerHour,multiOnTimerMinute:w.settings.multiOnTimerMinute,multiOnTimerWeekday:w.settings.multiOnTimerWeekday,multiOnTimerSource:w.settings.multiOnTimerSource,onTimerCount:y+1,onTimerSchedule:w.settings.onTimerSchedule}},onSuccess:function(){d("addOnTimer: On Success 2");if(typeof m==="function"){m()}},onFailure:function(z){d("addOnTimer: On Failure 2");delete z.returnValue;if(typeof n==="function"){i(z,"PAOT","Power.addOnTimer returns failure.");n(z)}return}})}},onFailure:function(w){d("addOnTimer: On Failure");delete w.returnValue;if(typeof n==="function"){i(w,"PAOT","Power.addOnTimer returns failure.");n(w)}return}})}},onFailure:function(q){d("getInputSourceStatus: On Failure");delete q.returnValue;if(typeof n==="function"){i(q,"PAOT","Power.addOnTimer returns failure on gathering input list.");n(q)}return}})});d("Power.addOnTimer Done")};j.prototype.deleteOnTimer=function(m,n,o){d("deleteOnTimer: "+JSON.stringify(o));if(o.hour===undefined||isNaN(o.hour)||typeof o.hour!=="number"||o.hour<0||o.hour>23||o.minute===undefined||isNaN(o.minute)||typeof o.minute!=="number"||o.minute<0||o.minute>59||o.week===undefined||isNaN(o.week)||typeof o.week!=="number"||o.week<0||o.week>127||o.inputSource===undefined||typeof o.inputSource!=="string"||o.inputSource.indexOf("ext://")!==0){if(typeof n==="function"){var l={};i(l,"PDOT","Power.deleteOnTimer returns failure. invalid parameters or out of range.");n(l)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["multiOnTimerHour","multiOnTimerMinute","multiOnTimerWeekday","multiOnTimerSource","onTimerSchedule","onTimerCount"]},onSuccess:function(p){if(p.returnValue===true){k(function(u){d("version : "+u.webOSVer);if(typeof p.settings.multiOnTimerHour==="string"){p.settings.multiOnTimerHour=JSON.parse(p.settings.multiOnTimerHour)}if(typeof p.settings.multiOnTimerMinute==="string"){p.settings.multiOnTimerMinute=JSON.parse(p.settings.multiOnTimerMinute)}if(typeof p.settings.multiOnTimerWeekday==="string"){p.settings.multiOnTimerWeekday=JSON.parse(p.settings.multiOnTimerWeekday)}if(typeof p.settings.multiOnTimerSource==="string"){p.settings.multiOnTimerSource=JSON.parse(p.settings.multiOnTimerSource)}if(typeof p.settings.onTimerSchedule==="string"){p.settings.onTimerSchedule=JSON.parse(p.settings.onTimerSchedule)}var A=0,z=(p.settings.onTimerSchedule===null||p.settings.onTimerSchedule===undefined?0:p.settings.onTimerSchedule.length);var v=["0","0","0","0","0","0","0"],w=["0","0","0","0","0","0","0"],r=["0","0","0","0","0","0","0"],q=["0","0","0","0","0","0","0"],y=[];var t=f(o.inputSource);var s=false;if(u.webOSVer===3){if(o.week>=64){o.week=1+(o.week-64)*2}else{o.week=o.week*2}}for(var x=0;x<z;x++){d("deleteOnTimer: "+t);if(p.settings.onTimerSchedule[x]===null){continue}d("options.week : "+o.week+" result.settings.onTimerSchedule["+x+"].weekday : "+p.settings.onTimerSchedule[x].weekday);if(s===false&&o.hour===p.settings.onTimerSchedule[x].hour&&o.minute===p.settings.onTimerSchedule[x].minute&&o.week===p.settings.onTimerSchedule[x].weekday&&t===p.settings.onTimerSchedule[x].input){d("deleteOnTimer: index "+x);s=true}else{v[A]=p.settings.multiOnTimerHour[x];w[A]=p.settings.multiOnTimerMinute[x];r[A]=p.settings.multiOnTimerWeekday[x];q[A]=p.settings.multiOnTimerSource[x];y[A]=p.settings.onTimerSchedule[x];A++}}if(s===true){z--}if(z===0){y=[]}if(p.settings.onTimerSchedule.length===z){if(typeof n==="function"){i(p,"PDOT","Power.deleteOnTimer returns failure. There is no 'on timer' matched in the list.");n(p)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{multiOnTimerHour:v,multiOnTimerMinute:w,multiOnTimerWeekday:r,multiOnTimerSource:q,onTimerCount:z,onTimerSchedule:y}},onSuccess:function(){d("deleteOnTimer: On Success 2");if(typeof m==="function"){m()}},onFailure:function(B){d("deleteOnTimer: On Failure 2");delete B.returnValue;if(typeof n==="function"){i(B,"PDOT","Power.deleteOnTimer returns failure.");n(B)}}})})}},onFailure:function(p){d("deleteOnTimer: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"PDOT","Power.deleteOnTimer returns failure.");n(p)}}});d("Power.deleteOnTimer Done")};j.prototype.addOffTimer=function(m,n,o){d("addOffTimer: "+JSON.stringify(o));if(o.hour===undefined||isNaN(o.hour)||typeof o.hour!=="number"||o.hour<0||o.hour>23||o.minute===undefined||isNaN(o.minute)||typeof o.minute!=="number"||o.minute<0||o.minute>59||o.week===undefined||isNaN(o.week)||typeof o.week!=="number"||o.week<0||o.week>127){if(typeof n==="function"){var l={};i(l,"PAOT","Power.addOffTimer returns failure. Invalid parameter.");n(l)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["multiOffTimerHour","multiOffTimerMinute","multiOffTimerWeekday","offTimerSchedule","offTimerCount"]},onSuccess:function(p){if(p.returnValue===true){if(typeof p.settings.multiOffTimerHour==="string"){p.settings.multiOffTimerHour=JSON.parse(p.settings.multiOffTimerHour)}if(typeof p.settings.multiOffTimerMinute==="string"){p.settings.multiOffTimerMinute=JSON.parse(p.settings.multiOffTimerMinute)}if(typeof p.settings.multiOffTimerWeekday==="string"){p.settings.multiOffTimerWeekday=JSON.parse(p.settings.multiOffTimerWeekday)}if(typeof p.settings.offTimerSchedule==="string"){p.settings.offTimerSchedule=JSON.parse(p.settings.offTimerSchedule)}var q=(p.settings.offTimerSchedule===null||p.settings.offTimerSchedule===undefined?0:p.settings.offTimerSchedule.length);if(p.settings.multiOffTimerHour.length<=q){if(typeof n==="function"){i(p,"PAOT","Power.addOffTimer returns failure. No space to add timer.");n(p)}return}k(function(s){d("version : "+s.webOSVer);if(s.webOSVer===3){if(o.week>=64){o.week=1+(o.week-64)*2}else{o.week=o.week*2}}p.settings.multiOffTimerHour[q]=o.hour;p.settings.multiOffTimerMinute[q]=o.minute;p.settings.multiOffTimerWeekday[q]=o.week;d("add hour: "+o.hour+", min : "+o.minute+", week : "+o.week);var r=360;p.settings.offTimerSchedule[q]={_id:""+r++,hour:o.hour,minute:o.minute,weekday:o.week};g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{multiOffTimerHour:p.settings.multiOffTimerHour,multiOffTimerMinute:p.settings.multiOffTimerMinute,multiOffTimerWeekday:p.settings.multiOffTimerWeekday,offTimerCount:q+1,offTimerSchedule:p.settings.offTimerSchedule}},onSuccess:function(){d("addOffTimer: On Success 2");if(typeof m==="function"){m()}},onFailure:function(t){d("addOffTimer: On Failure 2");delete t.returnValue;if(typeof n==="function"){i(t,"PAOT","Power.addOffTimer returns failure.");n(t)}}})})}},onFailure:function(p){d("addOffTimer: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"PAOT","Power.addOffTimer returns failure.");n(p)}}});d("Power.addOffTimer Done")};j.prototype.deleteOffTimer=function(m,n,o){d("deleteOffTimer: "+JSON.stringify(o));if(o.hour===undefined||isNaN(o.hour)||typeof o.hour!=="number"||o.hour<0||o.hour>23||o.minute===undefined||isNaN(o.minute)||typeof o.minute!=="number"||o.minute<0||o.minute>59||o.week===undefined||isNaN(o.week)||typeof o.week!=="number"||o.week<0||o.week>127){if(typeof n==="function"){var l={};i(l,"PDOT","Power.deleteOffTimer returns failure. invalid parameters or out of range.");n(l)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["multiOffTimerHour","multiOffTimerMinute","multiOffTimerWeekday","offTimerSchedule","offTimerCount"]},onSuccess:function(x){if(x.returnValue===true){if(typeof x.settings.multiOffTimerHour==="string"){x.settings.multiOffTimerHour=JSON.parse(x.settings.multiOffTimerHour)}if(typeof x.settings.multiOffTimerMinute==="string"){x.settings.multiOffTimerMinute=JSON.parse(x.settings.multiOffTimerMinute)}if(typeof x.settings.multiOffTimerWeekday==="string"){x.settings.multiOffTimerWeekday=JSON.parse(x.settings.multiOffTimerWeekday)}if(typeof x.settings.offTimerSchedule==="string"){x.settings.offTimerSchedule=JSON.parse(x.settings.offTimerSchedule)}var w=0,v=(x.settings.offTimerSchedule===null||x.settings.offTimerSchedule===undefined?0:x.settings.offTimerSchedule.length);var r=["0","0","0","0","0","0","0"],s=["0","0","0","0","0","0","0"],p=["0","0","0","0","0","0","0"],u=[];var q=false;k(function(y){d("version : "+y.webOSVer);if(y.webOSVer===3){if(o.week>=64){o.week=1+(o.week-64)*2}else{o.week=o.week*2}}});for(var t=0;t<v;t++){if(x.settings.offTimerSchedule[t]===null){continue}d("options.week : "+o.week+" result.settings.offTimerSchedule["+t+"].weekday : "+x.settings.offTimerSchedule[t].weekday);if(q===false&&o.hour===x.settings.offTimerSchedule[t].hour&&o.minute===x.settings.offTimerSchedule[t].minute&&o.week===x.settings.offTimerSchedule[t].weekday){q=true}else{r[w]=x.settings.multiOffTimerHour[t];s[w]=x.settings.multiOffTimerMinute[t];p[w]=x.settings.multiOffTimerWeekday[t];u[w]=x.settings.offTimerSchedule[t];w++}}if(q===true){v--}if(v===0){u=[]}if(x.settings.offTimerSchedule.length===v){if(typeof n==="function"){i(x,"PDOT","Power.deleteOffTimer returns failure. There is no 'off timer' matched in the list.");n(x)}return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{multiOffTimerHour:r,multiOffTimerMinute:s,multiOffTimerWeekday:p,offTimerCount:v,offTimerSchedule:u}},onSuccess:function(){d("deleteOffTimer: On Success 2");if(typeof m==="function"){m()}},onFailure:function(y){d("deleteOffTimer: On Failure 2");delete y.returnValue;if(typeof n==="function"){i(y,"PDOT","Power.deleteOffTimer returns failure.");n(y)}}})}},onFailure:function(p){d("deleteOffTimer: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"PDOT","Power.deleteOffTimer returns failure.");n(p)}}});d("Power.deleteOffTimer Done")};j.prototype.getOnTimerList=function(l,m){d("getOnTimerList: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["onTimerSchedule"]},onSuccess:function(n){if(n.returnValue===true){k(function(t){d("version : "+t.webOSVer);var s={};if(typeof n.settings.onTimerSchedule==="string"){n.settings.onTimerSchedule=JSON.parse(n.settings.onTimerSchedule)}var u=new Array(n.settings.onTimerSchedule===null||n.settings.onTimerSchedule===undefined?0:n.settings.onTimerSchedule.length);for(var o=0,p=0;p<u.length;p++){if(n.settings.onTimerSchedule[p]===null||n.settings.onTimerSchedule[p]===undefined){continue}u[o]={hour:0,minute:0,week:0,inputSource:0};if(t.webOSVer===3){var q=n.settings.onTimerSchedule[p].weekday;if(q%2){var r=q%2;q=64+((q-r)/2)}else{q=q/2}}else{n.settings.onTimerSchedule[p].weekday}u[o].hour=n.settings.onTimerSchedule[p].hour;u[o].minute=n.settings.onTimerSchedule[p].minute;u[o].week=q;u[o++].inputSource=f(n.settings.onTimerSchedule[p].input)}s.timerList=u;if(typeof l==="function"){l(s)}})}},onFailure:function(n){d("getOnTimerList: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"PGOTL","Power.getOnTimerList returns failure.");m(n)}}});d("Power.getOnTimerList Done")};j.prototype.getOffTimerList=function(l,m){d("getOffTimerList: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["offTimerSchedule"]},onSuccess:function(n){d("getOffTimerList: On Success");k(function(t){d("version : "+t.webOSVer);if(n.returnValue===true){var s={};if(typeof n.settings.offTimerSchedule==="string"){n.settings.offTimerSchedule=JSON.parse(n.settings.offTimerSchedule)}var u=new Array(n.settings.offTimerSchedule===null||n.settings.offTimerSchedule===undefined?0:n.settings.offTimerSchedule.length);for(var o=0,p=0;p<u.length;p++){if(n.settings.offTimerSchedule[p]===null||n.settings.offTimerSchedule[p]===undefined){continue}u[o]={hour:0,minute:0,week:0};if(t.webOSVer===3){var q=n.settings.offTimerSchedule[p].weekday;if(q%2){var r=q%2;q=64+((q-r)/2)}else{q=q/2}}else{q=n.settings.offTimerSchedule[p].weekday}u[o].hour=n.settings.offTimerSchedule[p].hour;u[o].minute=n.settings.offTimerSchedule[p].minute;u[o++].week=q}s.timerList=u;if(typeof l==="function"){l(s)}}})},onFailure:function(n){d("getOffTimerList: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"PGOTL","Power.getOffTimerList returns failure.");m(n)}}});d("Power.getOffTimerList Done")};j.prototype.setDisplayMode=function(m,n,o){d("setDisplayMode: "+JSON.stringify(o));var p=null;switch(o.displayMode){case j.DisplayMode.DISPLAY_OFF:p="turnOffScreen";break;case j.DisplayMode.DISPLAY_ON:p="turnOnScreen";break;default:if(typeof n==="function"){var l={};i(l,"PSDM","Power.setDisplayMode returns failure. Invalid option value.");n(l)}return}d("setDisplayMode: "+p);if(p===null&&typeof n==="function"){var l={};i(l,"PSDM","Power.setDisplayMode returns failure. command was not defined.");n(l);d("Power.setDisplayMode invalid ");return}g.Request("luna://com.webos.service.tv.signage/",{method:"getPowerState",onSuccess:function(q){d("setDisplayMode: On Success");if(q.returnValue===true&&q.state===o.displayMode){if(typeof m==="function"){d("setDisplayMode: no need to do any action.");m()}return}g.Request("luna://com.webos.service.tv.signage/",{method:p,onSuccess:function(r){d("setDisplayMode: On Success");if(r.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(r){d("setDisplayMode: On Failure");delete r.returnValue;if(typeof n==="function"){i(r,"PSDM","Power.setDisplayMode returns failure.");n(r)}}})},onFailure:function(q){d("setDisplayMode: On Failure 2");delete q.returnValue;if(typeof n==="function"){i(q,"PSDM","Power.setDisplayMode returns failure.");n(q)}}});d("Power.setDisplayMode Done")};j.prototype.executePowerCommand=function(m,n,o){d("executePowerCommand: "+JSON.stringify(o));if(o.powerCommand===undefined||typeof o.powerCommand!=="string"||o.powerCommand===null||o.powerCommand.length<=0){if(typeof n==="function"){var l={};i(l,"PEPM","Power.executePowerCommand returns failure. invalid argument or out of range. ");n(l)}return}if((o.powerCommand!==j.PowerCommand.REBOOT)&&(o.powerCommand!==j.PowerCommand.SHUTDOWN)){var l={};i(l,"PEPM","Power.executePowerCommand returns failure. invalid argument.");n(l);return}g.Request("luna://com.webos.service.tv.signage/",{method:o.powerCommand,parameters:{reason:"unknown"},onSuccess:function(p){d("executePowerCommand: On Success");if(p.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(p){d("executePowerCommand: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"PEPM","Power.executePowerCommand returns failure.");n(p)}}});d("Power.executePowerCommand Done")};j.prototype.setDPMWakeup=function(m,o,p){var n=null;switch(p.dpmSignalType){case j.DPMSignalType.CLOCK:n="clock";break;case j.DPMSignalType.CLOCK_WITH_DATA:n="clockAndData";break}d("setDPMWakeup: "+n);if(n===null&&typeof o==="function"){var l={};i(l,"PSDW","Power.setDPMWakeup returns failure. command was not defined.");o(l);d("Power.setDPMWakeup invalid ");return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{dpmWakeUpControl:n}},onSuccess:function(q){d("setDPMWakeup: On Success");if(q.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(q){d("setDPMWakeup: On Failure");delete q.returnValue;if(typeof o==="function"){i(q,"PSDW","Power.setDPMWakeup returns failure.");o(q)}}});d("Power.setDPMWakeup Done")};j.prototype.getDPMWakeup=function(l,m){d("getDPMWakeup: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["dpmWakeUpControl"]},onSuccess:function(n){d("getDPMWakeup: On Success");if(n.returnValue===true){var o={};o.dpmSignalType=n.settings.dpmWakeUpControl;if(typeof l==="function"){l(o)}}},onFailure:function(n){d("getDPMWakeup: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"PGDW","Power.getDPMWakeup returns failure.");m(n)}}});d("Power.getDPMWakeup Done")};j.prototype.setPMMode=function(m,n,o){var p=null;switch(o.mode){case j.PMMode.PowerOff:p="powerOff";break;case j.PMMode.SustainAspectRatio:p="sustainAspectRatio";break;case j.PMMode.ScreenOff:p="screenOff";break;case j.PMMode.ScreenOffAlways:p="screenOffAlways";break}d("setPMMode: "+p);if(p===null&&typeof n==="function"){var l={};i(l,"PSPM","Power.setPMMode returns failure. command was not defined.");n(l);d("Power.setPMMode invalid ");return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{pmMode:p}},onSuccess:function(q){d("setPMMode: On Success");if(q.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(q){d("setPMMode: On Failure");delete q.returnValue;if(typeof n==="function"){i(q,"PSPM","Power.setPMMode returns failure.");n(q)}}});d("Power.setPMMode Done")};j.prototype.getPMMode=function(l,m){d("getPMMode: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["pmMode"]},onSuccess:function(n){d("getPMMode: On Success");if(n.returnValue===true){var o={};o.mode=n.settings.pmMode;if(typeof l==="function"){l(o)}}},onFailure:function(n){d("getPMMode: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"PGPM","Power.getPMMode returns failure.");m(n)}}});d("Power.getPMMode Done")};j.prototype.setPowerOnDelay=function(m,n,o){d("setPowerOnDelay: "+o.delayTime);if(o.delayTime===null&&typeof n==="function"){var l={};i(l,"PSPD","Power.setPowerOnDelay returns failure. command was not defined.");n(l);d("Power.setPowerOnDelay invalid ");return}if(typeof o.delayTime!=="number"){var l={};i(l,"PSPD","Power.setPowerOnDelay returns failure. delayTime is not a number.");n(l);d("Power.setPowerOnDelay invalid type");return}if((o.delayTime<0)||(o.delayTime>250)){var l={};i(l,"PSPD","Power.setPowerOnDelay returns failure. Out of range.");n(l);d("Power.setPowerOnDelay invalid range");return}g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{powerOnDelay:o.delayTime}},onSuccess:function(p){d("setPowerOnDelay: On Success");if(p.returnValue===true){if(typeof m==="function"){m()}}},onFailure:function(p){d("setPowerOnDelay: On Failure");delete p.returnValue;if(typeof n==="function"){i(p,"PSPD","Power.setPowerOnDelay returns failure.");n(p)}}});d("Power.setPowerOnDelay Done")};j.prototype.getPowerOnDelay=function(l,m){d("getPowerOnDelay: ");g.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["powerOnDelay"]},onSuccess:function(n){d("getPowerOnDelay: On Success");if(n.returnValue===true){var o={};o.delayTime=n.settings.powerOnDelay;if(typeof l==="function"){l(o)}}},onFailure:function(n){d("getPowerOnDelay: On Failure");delete n.returnValue;if(typeof m==="function"){i(n,"PGPD","Power.getPowerOnDelay returns failure.");m(n)}}});d("Power.getPowerOnDelay Done")};b.exports=j});Power=cordova.require("cordova/plugin/power");