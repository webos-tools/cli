/*!
 * ============================================================================
 *   ID SW PLATFORM TEAM, LG ELECTRONICS INC., SEOUL, KOREA                       
 *   Copyright(c) 2016 by LG Electronics Inc.                                  
 *                                                                             
 *   Release Version : 1.4.2.0
 * ============================================================================
 */
cordova.define("cordova/plugin/storage",function(c,b,d){var a;function e(h){}if(window.PalmSystem){e("Window.PalmSystem Available");a=c("cordova/plugin/webos/service")}else{a={Request:function(h,i){e(h+" invoked. But I am a dummy because PalmSystem is not available");if(typeof i.onFailure==="function"){i.onFailure({returnValue:false,errorText:"PalmSystem Not Available. Cordova is not installed?"})}}}}function g(h){if(h){if(h.indexOf("://")===-1){e("INVALID URI"+h);return false}else{e("GOOD URI");return true}}else{e("NO URI"+h);return false}}var f=function(){};Error.ERROR_CODE={IO_ERROR:"IO_ERROR",DEVICE_ERROR:"DEVICE_ERROR",BAD_PARAMETER:"BAD_PARAMETER",SERVER_ERROR:"SERVER_ERROR",NETWORK_ERROR:"NETWORK_ERROR",SYSTEM_ERROR:"SYSTEM_ERROR",};f.SCAP_URI="";f.MAX_BUFFER_LENGTH=1024*10;f.AppMode={USB:"usb",LOCAL:"local"};f.AppType={IPK:"ipk",ZIP:"zip"};f.prototype.downloadFirmware=function(h,i,j){a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"downloadFirmware",parameters:{uri:j.uri},onSuccess:function(k){if(k.returnValue===true){h()}else{i({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){i({errorCode:k.errorCode,errorText:k.errorText})}})};f.prototype.upgradeFirmware=function(h,i){a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"upgradeFirmware",parameters:{},onSuccess:function(j){if(j.returnValue===true){h()}else{i({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){i({errorCode:j.errorCode,errorText:j.errorText})}})};f.prototype.getFirmwareUpgradeStatus=function(h,i){a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"getFirmwareUpgradeStatus",parameters:{},onSuccess:function(j){if(j.returnValue===true){h({status:j.status,upgradeProgress:j.upgradeProgress,downloadProgress:j.downloadProgress})}else{i({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){i({errorCode:j.errorCode,errorText:j.errorText})}})};f.prototype.changeLogoImage=function(h,i,j){a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"changeLogoImage",parameters:{uri:j.uri},onSuccess:function(k){if(k.returnValue===true){h()}else{i({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){i({errorCode:k.errorCode,errorText:k.errorText})}})};f.prototype.upgradeApplication=function(h,i,j){var k={from:"remote",to:(j===undefined||j===null?f.AppMode.LOCAL:j.to),recovery:(j===undefined||j===null?false:j.recovery),};if(j.hasOwnProperty("type")===true&&j.type!==undefined){k.type=j.type}a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"upgradeApplication",parameters:k,onSuccess:function(l){if(l.returnValue===true){h()}else{i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){i({errorCode:l.errorCode,errorText:l.errorText})}})};f.prototype.removeApplication=function(h,i,j){a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"removeApplication",parameters:{to:j.to},onSuccess:function(k){if(k.returnValue===true){h()}else{i({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){i({errorCode:k.errorCode,errorText:k.errorText})}})};f.prototype.copyFile=function(h,i,j){e("Options: "+JSON.stringify(j,null,3));if(j.maxRedirection&&j.maxRedirection>5){e("Bad options TOO MANY REDIRECTION");i({errorCode:"BAD_PARAMETER",errorText:"Redirect cannot be more that 5"});return}if(j.headers&&JSON.stringify(j.headers).length>1024){e("header too long header too long");i({errorCode:"BAD_PARAMETER",errorText:"Header data cannot be bigger than 1K"});return}if(typeof j.httpOption==="undefined"){j.httpOption={}}if(j.httpOption.headers&&JSON.stringify(j.httpOption.headers).length>1024){e("header too long header too long");i({errorCode:"BAD_PARAMETER",errorText:"Header data cannot be bigger than 1K"});return}if(j.maxRedirection||j.headers){if(j.maxRedirection&&typeof j.httpOption.maxRedirection==="undefined"){j.httpOption.maxRedirection=j.maxRedirection}if(j.headers&&typeof j.httpOption.headers==="undefined"){j.httpOption.headers=j.headers}}if(typeof j.httpOption.maxRedirection!=="undefined"){if(typeof j.maxRedirection!=="undefined"){if(j.httpOption.maxRedirection!==j.maxRedirection){i({errorCode:"BAD_PARAMETER",errorText:"Both options.httpOption.maxRedirection and options.maxRedirection are exists,but different value. What value you want to use?"});return}}else{j.maxRedirection=j.httpOption.maxRedirection}}e(j);a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/copyFile",parameters:{dest:j.destination,src:j.source,ftpOption:j.ftpOption,httpOption:j.httpOption},onSuccess:function(k){if(k.returnValue===true){e("SUCCESS");h()}else{e("Err: "+k.errorText);i({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){e("Err: "+k.errorText);i({errorCode:k.errorCode,errorText:k.errorText})}})};f.prototype.removeFile=function(h,i,j){if(!(j&&g(j.file))){i({errorCode:"BAD_PARAMETER",errorText:"options.file is a mandatory parameter"});return}var k={file:j.file};if(j.recursive===true){k.recursive=true}a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/removeFile",parameters:k,onSuccess:function(l){e("onSuccess");if(l.returnValue===true){h()}else{i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){e("onFailure");i({errorCode:l.errorCode,errorText:l.errorText})}})};f.prototype.listFiles=function(h,i,j){var k={};if(j&&j.path){if(g(j.path)){k.pathURI=j.path}else{i({errorCode:"BAD_PARAMETER",errorText:"File URI is not valid."});return}}else{k.pathURI="file://internal/"}a.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"fs/listFiles",parameters:k,onSuccess:function(l){if(l.returnValue===true){var n=[];for(var m=0;m<l.files.length;++m){e(l.files[m]);var p={name:l.files[m].name,type:(l.files[m].type==="folder")?"folder":"file",size:l.files[m].size};n.push(p)}var o={files:n,totalCount:l.totalCount};h(o)}else{i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){i({errorCode:l.errorCode,errorText:l.errorText})}})};f.prototype.getStorageInfo=function(h,i){a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/storageInfo",parameters:{},onSuccess:function(j){e("returned : "+JSON.stringify(j,null,3));if(j.returnValue===true){e("returned : "+JSON.stringify(j,null,3));var k={free:j.spaceInfo.freeSize,total:j.spaceInfo.totalSize,used:j.spaceInfo.usedSize,externalMemory:j.externalStorage};h(k)}else{i({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){i({errorCode:j.errorCode,errorText:j.errorText})}})};f.prototype.mkdir=function(h,i,j){if(!(j&&g(j.path))){i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"});return}var k={pathURI:j.path};a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/mkdir",parameters:k,onSuccess:function(l){e("onSuccess");if(l.returnValue===true){h()}else{i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){e("onFailure");i({errorCode:l.errorCode,errorText:l.errorText})}})};f.prototype.exists=function(h,i,j){if(!(j&&g(j.path))){e("BAD_PARAMETER");i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"});return}var k={pathURI:j.path};a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/exists",parameters:k,onSuccess:function(l){e("onSuccess");if(l.returnValue===true){e("returned : "+JSON.stringify(l,null,3));var m={exists:l.exists};h(m)}else{i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){e("onFailure");i({errorCode:l.errorCode,errorText:l.errorText})}})};f.prototype.readFile=function(h,i,j){if(!j){i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!g(j.path)){i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(j.length&&(j.length>f.MAX_BUFFER_LENGTH||j.length<1)){i({errorCode:"BAD_PARAMETER",errorText:"length should be > 0 and < "+f.MAX_BUFFER_LENGTH})}else{if(j.position&&(j.position<0)){i({errorCode:"BAD_PARAMETER",errorText:"position should be > 0"})}else{var k={};k.path=j.path;k.length=j.length?j.length:f.MAX_BUFFER_LENGTH;k.position=j.position?j.position:0;k.encoding=j.encoding?j.encoding:"utf-8";a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/readFile",parameters:k,onSuccess:function(l){if(l.returnValue){if(k.encoding==="binary"){var m=l.data;var o=new Uint8Array(m.length);for(var n=0;n<m.length;++n){o[n]=m[n]}h({data:o.buffer})}else{h({data:l.data})}}else{i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){i({errorCode:l.errorCode,errorText:l.errorText})}})}}}}};f.prototype.writeFile=function(l,r,n){if(!n){r({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!g(n.path)){r({errorCode:"BAD_PARAMETER",errorText:"options.path is a is not valid"})}else{if(!n.data){r({errorCode:"BAD_PARAMETER",errorText:"options.data is a mandatory parameter"})}else{if(n.mode&&(n.mode!=="truncate"&&n.mode!=="append"&&n.mode!=="position")){r({errorCode:"BAD_PARAMETER",errorText:"mode should be 'truncate'|'append'|'position'"})}else{if(n.position&&(n.position<0)){r({errorCode:"BAD_PARAMETER",errorText:"position should be > 0"})}else{if(n.offset&&(n.offset<0)){r({errorCode:"BAD_PARAMETER",errorText:"offset should be > 0"})}else{if(n.length&&(n.length>f.MAX_BUFFER_LENGTH||n.length<1)){r({errorCode:"BAD_PARAMETER",errorText:"length should be > 0 and < "+f.MAX_BUFFER_LENGTH})}else{if(n.encoding&&(n.encoding!=="utf8"&&n.encoding!=="binary"&&n.encoding!=="base64")){r({errorCode:"BAD_PARAMETER",errorText:"Invalid encoding: "+n.encoding})}else{e("REQUEST");var z={};z.path=n.path;z.mode=n.mode?n.mode:"truncate";z.position=n.position?n.position:0;z.encoding=n.encoding?n.encoding:"utf8";var q=n.offset?n.offset:0;if(z.encoding==="binary"){e("binary, size is: "+n.data.byteLength);var m=new Uint8Array(n.data);e("uint8View: "+m);var p=n.length?n.length:f.MAX_BUFFER_LENGTH;var v=[];var t=0;for(var y=q;y<m.length&&t<p;++y,t++){v[t]=m[y]}e("array length: "+t);z.data=v;z.length=t;z.offset=0}else{if(z.encoding==="base64"){var u=n.length?n.length:f.MAX_BUFFER_LENGTH;e("base64, size is: "+n.data.length);var h=n.data;var k=window.atob(h);var w=k.substring(q,q+u);var B=new Uint8Array(w.length);var x;for(x=0;x<w.length;x++){B[x]=w.charCodeAt(x)}var A=[];for(x=0;x<B.length;++x){A[x]=B[x]}z.data=A;z.length=A.length;z.offset=0}else{var s=n.length?n.length:f.MAX_BUFFER_LENGTH;z.data=n.data.substring(q,q+s);z.length=z.data.length;z.offset=0}}try{a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/writeFile",parameters:z,onSuccess:function(i){e("onSuccess");if(i.returnValue){l({written:i.written})}else{e("FAILED: "+i.errorText);r({errorCode:i.errorCode,errorText:i.errorText})}},onFailure:function(i){e("onFailure");e("FAILED: "+i.errorText);r({errorCode:i.errorCode,errorText:i.errorText})}})}catch(o){e("EXCEPTION"+o);r({errorCode:"STWF",errorText:"Storage.writeFile() error is occured during operation."})}}}}}}}}}};f.prototype.statFile=function(h,i,j){if(!(j&&g(j.path))){i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!j.path){i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/statFile",parameters:{path:j.path},onSuccess:function(l){e("onSuccess");if(l.returnValue){h(l.stat)}else{e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){e("onFailure");e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}})}catch(k){e("EXCEPTION"+k);i({errorCode:"STSF",errorText:"Storage.statFile() error is occured during operation."})}}}};f.prototype.removeAll=function(h,i,j){if(!j){i({errorCode:"BAD_PARAMETER",errorText:"options.device is a mandatory parameter"})}else{if(!j.device){i({errorCode:"BAD_PARAMETER",errorText:"options.device is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/removeAll",parameters:{device:j.device},onSuccess:function(l){e("onSuccess");if(l.returnValue){h()}else{e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){e("onFailure");e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}})}catch(k){e("EXCEPTION"+k);i({errorCode:"STRA",errorText:"Storage.removeAll() error is occured during operation."})}}}};f.prototype.fsync=function(h,i,j){try{var l={};if(j&&j.path){if(g(j.path)){l.path=j.path}else{i({errorCode:"BAD_PARAMETER",errorText:"Invalid File URI"});return}}a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/fsyncFile",parameters:l,onSuccess:function(m){e("onSuccess");if(m.returnValue){h()}else{e("FAILED: "+m.errorText);i({errorCode:m.errorCode,errorText:m.errorText})}},onFailure:function(m){e("onFailure");e("FAILED: "+m.errorText);i({errorCode:m.errorCode,errorText:m.errorText})}})}catch(k){e("EXCEPTION"+k);i({errorCode:"STFS",errorText:"Storage.fsync() error is occured during operation."})}};f.prototype.moveFile=function(h,i,j){if(!j){i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!g(j.oldPath)){i({errorCode:"BAD_PARAMETER",errorText:"options.oldpath is a mandatory parameter"})}else{if(!g(j.newPath)){i({errorCode:"BAD_PARAMETER",errorText:"options.newPath is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/moveFile",parameters:{oldPath:j.oldPath,newPath:j.newPath},onSuccess:function(l){e("onSuccess");if(l.returnValue){h()}else{e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){e("onFailur");e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}})}catch(k){e("EXCEPTION"+k);i({errorCode:"STMF",errorText:"Storage.moveFile() error is occured during operation."})}}}}};f.prototype.unzipFile=function(h,i,j){if(!j){i({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!g(j.zipPath)){i({errorCode:"BAD_PARAMETER",errorText:"options.zipPath is a mandatory parameter"})}else{if(!g(j.targetPath)){i({errorCode:"BAD_PARAMETER",errorText:"options.targetPath is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"fs/unzip",parameters:{zipPath:j.zipPath,targetPath:j.targetPath},onSuccess:function(l){e("onSuccess");if(l.returnValue){h()}else{e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){e("onFailure");e("FAILED: "+l.errorText);i({errorCode:l.errorCode,errorText:l.errorText})}})}catch(k){e("EXCEPTION"+k);i({errorCode:"STUF",errorText:"Storage.unzipFile() error is occured during operation."})}}}}};d.exports=f});Storage=cordova.require("cordova/plugin/storage");