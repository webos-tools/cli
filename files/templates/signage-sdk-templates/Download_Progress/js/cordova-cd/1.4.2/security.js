/*!
 * ============================================================================
 *   ID SW PLATFORM TEAM, LG ELECTRONICS INC., SEOUL, KOREA                       
 *   Copyright(c) 2016 by LG Electronics Inc.                                  
 *                                                                             
 *   Release Version : 1.4.2.0
 * ============================================================================
 */
cordova.define("cordova/plugin/security",function(d,c,e){function f(h){}var a;if(window.PalmSystem){f("Window.PalmSystem Available");a=d("cordova/plugin/webos/service")}else{a={Request:function(h,i){f(h+" invoked. But I am a dummy because PalmSystem is not available");if(typeof i.onFailure==="function"){i.onFailure({returnValue:false,errorText:"PalmSystem Not Available. Cordova is not installed?"})}}}}function b(i,j,h){if(i.errorCode===undefined||i.errorCode===null){i.errorCode=j}if(i.errorText===undefined||i.errorText===null){i.errorText=h}}var g=function(){};g.prototype.registerServerCertificate=function(i,j,k){f("registerServerCertificate: "+JSON.stringify(k));if(k.userName===undefined||typeof k.userName!=="string"||k.userName.length<4||k.userName.length>10||k.password===undefined||typeof k.password!=="string"||k.password.length<4||k.password.length>10||k.certificate===undefined||typeof k.certificate!=="string"){if(typeof j==="function"){var h={};b(h,"SRSC","Security.registerServerCertificate returns failure. invalid parameters or out of range.");j(h)}return}a.Request("luna://com.webos.service.commercial.signage.storageservice/security/",{method:"registerServerCertificate",parameters:{userName:k.userName,password:k.password,certificate:k.certificate},onSuccess:function(l){f("registerServerCertificate: On Success");if(l.returnValue===true){if(typeof i==="function"){i()}}},onFailure:function(l){f("registerServerCertificate: On Failure");delete l.returnValue;if(typeof j==="function"){b(l,"SRSC","Security.registerServerCertificate returns failure.");j(l)}}});f("Security.registerServerCertificate Done")};g.prototype.unregisterServerCertificate=function(i,j,k){f("unregisterServerCertificate: "+JSON.stringify(k));if(k.userName===undefined||typeof k.userName!=="string"||k.userName.length<4||k.userName.length>10||k.password===undefined||typeof k.password!=="string"||k.password.length<4||k.password.length>10){if(typeof j==="function"){var h={};b(h,"SUSC","Security.unregisterServerCertificate returns failure. invalid parameters or out of range.");j(h)}return}a.Request("luna://com.webos.service.commercial.signage.storageservice/security/",{method:"unregisterServerCertificate",parameters:{userName:k.userName,password:k.password},onSuccess:function(l){f("unregisterServerCertificate: On Success");if(l.returnValue===true){if(typeof i==="function"){i()}}},onFailure:function(l){f("unregisterServerCertificate: On Failure");delete l.returnValue;if(typeof j==="function"){b(l,"SUSC","Security.unregisterServerCertificate returns failure.");j(l)}}});f("Security.unregisterServerCertificate Done")};g.prototype.existServerCertificate=function(i,j,k){f("existServerCertificate: "+JSON.stringify(k));if(k.userName===undefined||typeof k.userName!=="string"||k.userName.length<4||k.userName.length>10||k.password===undefined||typeof k.password!=="string"||k.password.length<4||k.password.length>10){if(typeof j==="function"){var h={};b(h,"SESC","Security.existServerCertificate returns failure. invalid parameters or out of range.");j(h)}return}a.Request("luna://com.webos.service.commercial.signage.storageservice/security/",{method:"existServerCertificate",parameters:{userName:k.userName,password:k.password},onSuccess:function(l){f("existServerCertificate: On Success");if(l.returnValue===true){if(typeof i==="function"){var m={};m.userName=l.userName;m.exist=l.exist;i(m)}}},onFailure:function(l){f("existServerCertificate: On Failure");delete l.returnValue;if(typeof j==="function"){b(l,"SESC","Security.existServerCertificate returns failure.");j(l)}}});f("Security.existServerCertificate Done")};e.exports=g});Security=cordova.require("cordova/plugin/security");