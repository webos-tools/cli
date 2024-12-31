Storage=(function(){var e,a;function d(g){}if(typeof window==="object"){cordova.define("cordova/plugin/storage",function(h,g,i){e=function(){};if(window.PalmSystem){d("Window.PalmSystem Available");a=h("cordova/plugin/webos/service")}else{a={Request:function(j,k){d(j+" invoked. But I am a dummy because PalmSystem is not available");if(typeof k.onFailure==="function"){k.onFailure({returnValue:false,errorText:"PalmSystem Not Available. Cordova is not installed?"})}}}}i.exports=e});e=cordova.require("cordova/plugin/storage")}else{e=function(g){a=g;a.Request=function(h,j){var i=h;if(i.charAt(i.length-1)!="/"){i+="/"}i+=j.method;var k={};if(j.hasOwnProperty("parameters")===true){k=j.parameters}var l={};var m=function(n){console.log("res : "+JSON.stringify(n));if(n.payload.returnValue===true){l=n.payload;j.onSuccess(l)}else{l.returnValue=false;l.errorCode=n.payload.errorCode;l.errorText=n.payload.errorText;j.onFailure(l)}};if(a){a.call(i,k,m)}}};module.exports=e}function c(h,i,g){if(h.errorCode===undefined||h.errorCode===null){h.errorCode=i}if(h.errorText===undefined||h.errorText===null){h.errorText=g}}function f(g){if(g){if(g.indexOf("://")===-1){d("INVALID URI"+g);return false}else{d("GOOD URI");return true}}else{d("NO URI"+g);return false}}Error.ERROR_CODE={IO_ERROR:"IO_ERROR",DEVICE_ERROR:"DEVICE_ERROR",BAD_PARAMETER:"BAD_PARAMETER",SERVER_ERROR:"SERVER_ERROR",NETWORK_ERROR:"NETWORK_ERROR",SYSTEM_ERROR:"SYSTEM_ERROR",};e.SCAP_URI="";e.MAX_BUFFER_LENGTH=1024*10;e.AppMode={USB:"usb",LOCAL:"local"};e.AppType={IPK:"ipk",ZIP:"zip"};e.FileSystem={FAT32:"tfat",NTFS:"tntfs"};e.prototype.downloadFirmware=function(g,h,i){a.Request("luna://com.webos.service.commercial.scapadapter",{method:"downloadFirmware",parameters:{uri:i.uri},onSuccess:function(j){if(j.returnValue===true){g()}else{h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){h({errorCode:j.errorCode,errorText:j.errorText})}})};e.prototype.upgradeFirmware=function(g,h,i){var j={};if(i!==null&&typeof i!=="undefined"){j.path=i.path}a.Request("luna://com.webos.service.commercial.scapadapter",{method:"upgradeFirmware",parameters:j,onSuccess:function(k){if(k.returnValue===true){g()}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){h({errorCode:k.errorCode,errorText:k.errorText})}})};e.prototype.getFirmwareUpgradeStatus=function(g,h){a.Request("luna://com.webos.service.commercial.scapadapter",{method:"getFirmwareUpgradeStatus",parameters:{},onSuccess:function(i){if(i.returnValue===true){g({status:i.status,upgradeProgress:i.upgradeProgress,downloadProgress:i.downloadProgress})}else{h({errorCode:i.errorCode,errorText:i.errorText})}},onFailure:function(i){h({errorCode:i.errorCode,errorText:i.errorText})}})};e.prototype.changeLogoImage=function(g,h,i){a.Request("luna://com.webos.service.commercial.scapadapter",{method:"changeLogoImage",parameters:{uri:i.uri},onSuccess:function(j){if(j.returnValue===true){g()}else{h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){h({errorCode:j.errorCode,errorText:j.errorText})}})};e.prototype.upgradeApplication=function(g,h,i){if(!i){h({errorCode:"BAD_PARAMETER",errorText:"Invalid options"})}else{var j={from:"remote",to:i.to?i.to:e.AppMode.LOCAL,recovery:i.recovery?i.recovery:false};if(i.hasOwnProperty("type")===true&&i.type!==undefined){j.type=i.type}a.Request("luna://com.webos.service.commercial.scapadapter",{method:"upgradeApplication",parameters:j,onSuccess:function(k){if(k.returnValue===true){g()}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){h({errorCode:k.errorCode,errorText:k.errorText})}})}};e.prototype.removeApplication=function(g,h,i){a.Request("luna://com.webos.service.commercial.scapadapter",{method:"removeApplication",parameters:{to:i.to},onSuccess:function(j){if(j.returnValue===true){g()}else{h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){h({errorCode:j.errorCode,errorText:j.errorText})}})};e.prototype.copyFile=function(g,h,i){d("Options: "+JSON.stringify(i,null,3));if(i.maxRedirection&&i.maxRedirection>5){d("Bad options TOO MANY REDIRECTION");h({errorCode:"BAD_PARAMETER",errorText:"Redirect cannot be more that 5"});return}if(i.headers&&JSON.stringify(i.headers).length>1024){d("header too long header too long");h({errorCode:"BAD_PARAMETER",errorText:"Header data cannot be bigger than 1K"});return}if(typeof i.httpOption==="undefined"){i.httpOption={}}if(i.httpOption.headers&&JSON.stringify(i.httpOption.headers).length>1024){d("header too long header too long");h({errorCode:"BAD_PARAMETER",errorText:"Header data cannot be bigger than 1K"});return}if(i.maxRedirection||i.headers){if(i.maxRedirection&&typeof i.httpOption.maxRedirection==="undefined"){i.httpOption.maxRedirection=i.maxRedirection}if(i.headers&&typeof i.httpOption.headers==="undefined"){i.httpOption.headers=i.headers}}if(typeof i.httpOption.maxRedirection!=="undefined"){if(typeof i.maxRedirection!=="undefined"){if(i.httpOption.maxRedirection!==i.maxRedirection){h({errorCode:"BAD_PARAMETER",errorText:"Both options.httpOption.maxRedirection and options.maxRedirection are exists,but different value. What value you want to use?"});return}}else{i.maxRedirection=i.httpOption.maxRedirection}}d(i);a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/copyFile",parameters:{dest:i.destination,src:i.source,ftpOption:i.ftpOption,httpOption:i.httpOption},onSuccess:function(j){if(j.returnValue===true){d("SUCCESS");g()}else{d("Err: "+j.errorText);h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){d("Err: "+j.errorText);h({errorCode:j.errorCode,errorText:j.errorText})}})};e.prototype.removeFile=function(g,h,i){if(!(i&&f(i.file))){h({errorCode:"BAD_PARAMETER",errorText:"options.file is a mandatory parameter"});return}var j={file:i.file};if(i.recursive===true){j.recursive=true}a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/removeFile",parameters:j,onSuccess:function(k){d("onSuccess");if(k.returnValue===true){g()}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){d("onFailure");h({errorCode:k.errorCode,errorText:k.errorText})}})};e.prototype.listFiles=function(g,h,i){var j={};if(i&&i.path){if(f(i.path)){j.pathURI=i.path}else{h({errorCode:"BAD_PARAMETER",errorText:"File URI is not valid."});return}}else{j.pathURI="file://internal/"}a.Request("luna://com.webos.service.commercial.scapadapter/",{method:"fs/listFiles",parameters:j,onSuccess:function(k){if(k.returnValue===true){var m=[];for(var l=0;l<k.files.length;++l){d(k.files[l]);var o={name:k.files[l].name,type:(k.files[l].type==="folder")?"folder":"file",size:k.files[l].size};m.push(o)}var n={files:m,totalCount:k.totalCount};g(n)}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){h({errorCode:k.errorCode,errorText:k.errorText})}})};e.prototype.getStorageInfo=function(g,h){a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/storageInfo",parameters:{},onSuccess:function(i){d("returned : "+JSON.stringify(i,null,3));if(i.returnValue===true){d("returned : "+JSON.stringify(i,null,3));var j={free:i.spaceInfo.freeSize,total:i.spaceInfo.totalSize,used:i.spaceInfo.usedSize,externalMemory:i.externalStorage};g(j)}else{h({errorCode:i.errorCode,errorText:i.errorText})}},onFailure:function(i){h({errorCode:i.errorCode,errorText:i.errorText})}})};e.prototype.mkdir=function(g,h,i){if(!(i&&f(i.path))){h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"});return}var j={pathURI:i.path};a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/mkdir",parameters:j,onSuccess:function(k){d("onSuccess");if(k.returnValue===true){g()}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){d("onFailure");h({errorCode:k.errorCode,errorText:k.errorText})}})};e.prototype.exists=function(g,h,i){if(!(i&&f(i.path))){d("BAD_PARAMETER");h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"});return}var j={pathURI:i.path};a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/exists",parameters:j,onSuccess:function(k){d("onSuccess");if(k.returnValue===true){d("returned : "+JSON.stringify(k,null,3));var l={exists:k.exists};g(l)}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){d("onFailure");h({errorCode:k.errorCode,errorText:k.errorText})}})};e.prototype.readFile=function(g,h,i){if(!i){h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!f(i.path)){h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(i.length&&(i.length>e.MAX_BUFFER_LENGTH||i.length<1)){h({errorCode:"BAD_PARAMETER",errorText:"length should be > 0 and < "+e.MAX_BUFFER_LENGTH})}else{if(i.position&&(i.position<0)){h({errorCode:"BAD_PARAMETER",errorText:"position should be > 0"})}else{var j={};j.path=i.path;j.length=i.length?i.length:e.MAX_BUFFER_LENGTH;j.position=i.position?i.position:0;j.encoding=i.encoding?i.encoding:"utf-8";a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/readFile",parameters:j,onSuccess:function(k){if(k.returnValue){if(j.encoding==="binary"){var l=k.data;var n=new Uint8Array(l.length);for(var m=0;m<l.length;++m){n[m]=l[m]}g({data:n.buffer})}else{g({data:k.data})}}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){h({errorCode:k.errorCode,errorText:k.errorText})}})}}}}};e.prototype.writeFile=function(k,q,m){if(!m){q({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!f(m.path)){q({errorCode:"BAD_PARAMETER",errorText:"options.path is a is not valid"})}else{if(!m.data){q({errorCode:"BAD_PARAMETER",errorText:"options.data is a mandatory parameter"})}else{if(m.mode&&(m.mode!=="truncate"&&m.mode!=="append"&&m.mode!=="position")){q({errorCode:"BAD_PARAMETER",errorText:"mode should be 'truncate'|'append'|'position'"})}else{if(m.position&&(m.position<0)){q({errorCode:"BAD_PARAMETER",errorText:"position should be > 0"})}else{if(m.offset&&(m.offset<0)){q({errorCode:"BAD_PARAMETER",errorText:"offset should be > 0"})}else{if(m.length&&(m.length>e.MAX_BUFFER_LENGTH||m.length<1)){q({errorCode:"BAD_PARAMETER",errorText:"length should be > 0 and < "+e.MAX_BUFFER_LENGTH})}else{if(m.encoding&&(m.encoding!=="utf8"&&m.encoding!=="binary"&&m.encoding!=="base64")){q({errorCode:"BAD_PARAMETER",errorText:"Invalid encoding: "+m.encoding})}else{d("REQUEST");var y={};y.path=m.path;y.mode=m.mode?m.mode:"truncate";y.position=m.position?m.position:0;y.encoding=m.encoding?m.encoding:"utf8";var p=m.offset?m.offset:0;if(y.encoding==="binary"){d("binary, size is: "+m.data.byteLength);var l=new Uint8Array(m.data);d("uint8View: "+l);var o=m.length?m.length:e.MAX_BUFFER_LENGTH;var u=[];var s=0;for(var x=p;x<l.length&&s<o;++x,s++){u[s]=l[x]}d("array length: "+s);y.data=u;y.length=s;y.offset=0}else{if(y.encoding==="base64"){var t=m.length?m.length:e.MAX_BUFFER_LENGTH;d("base64, size is: "+m.data.length);var g=m.data;var h=window.atob(g);var v=h.substring(p,p+t);var A=new Uint8Array(v.length);var w;for(w=0;w<v.length;w++){A[w]=v.charCodeAt(w)}var z=[];for(w=0;w<A.length;++w){z[w]=A[w]}y.data=z;y.length=z.length;y.offset=0}else{var r=m.length?m.length:e.MAX_BUFFER_LENGTH;y.data=m.data.substring(p,p+r);y.length=y.data.length;y.offset=0}}try{a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/writeFile",parameters:y,onSuccess:function(i){d("onSuccess");if(i.returnValue){k({written:i.written})}else{d("FAILED: "+i.errorText);q({errorCode:i.errorCode,errorText:i.errorText})}},onFailure:function(i){d("onFailure");d("FAILED: "+i.errorText);q({errorCode:i.errorCode,errorText:i.errorText})}})}catch(n){d("EXCEPTION"+n);q({errorCode:"STWF",errorText:"Storage.writeFile() error is occured during operation."})}}}}}}}}}};e.prototype.statFile=function(g,h,i){if(!(i&&f(i.path))){h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!i.path){h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/statFile",parameters:{path:i.path},onSuccess:function(k){d("onSuccess");if(k.returnValue){g(k.stat)}else{d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){d("onFailure");d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}})}catch(j){d("EXCEPTION"+j);h({errorCode:"STSF",errorText:"Storage.statFile() error is occured during operation."})}}}};e.prototype.removeAll=function(g,h,i){if(!i){h({errorCode:"BAD_PARAMETER",errorText:"options.device is a mandatory parameter"})}else{if(!i.device){h({errorCode:"BAD_PARAMETER",errorText:"options.device is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/removeAll",parameters:{device:i.device},onSuccess:function(k){d("onSuccess");if(k.returnValue){g()}else{d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){d("onFailure");d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}})}catch(j){d("EXCEPTION"+j);h({errorCode:"STRA",errorText:"Storage.removeAll() error is occured during operation."})}}}};e.prototype.fsync=function(g,h,i){try{var k={};if(i&&i.path){if(f(i.path)){k.path=i.path}else{h({errorCode:"BAD_PARAMETER",errorText:"Invalid File URI"});return}}a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/fsyncFile",parameters:k,onSuccess:function(l){d("onSuccess");if(l.returnValue){g()}else{d("FAILED: "+l.errorText);h({errorCode:l.errorCode,errorText:l.errorText})}},onFailure:function(l){d("onFailure");d("FAILED: "+l.errorText);h({errorCode:l.errorCode,errorText:l.errorText})}})}catch(j){d("EXCEPTION"+j);h({errorCode:"STFS",errorText:"Storage.fsync() error is occured during operation."})}};e.prototype.moveFile=function(g,h,i){if(!i){h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!f(i.oldPath)){h({errorCode:"BAD_PARAMETER",errorText:"options.oldpath is a mandatory parameter"})}else{if(!f(i.newPath)){h({errorCode:"BAD_PARAMETER",errorText:"options.newPath is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/moveFile",parameters:{oldPath:i.oldPath,newPath:i.newPath},onSuccess:function(k){d("onSuccess");if(k.returnValue){g()}else{d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){d("onFailur");d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}})}catch(j){d("EXCEPTION"+j);h({errorCode:"STMF",errorText:"Storage.moveFile() error is occured during operation."})}}}}};e.prototype.unzipFile=function(g,h,i){if(!i){h({errorCode:"BAD_PARAMETER",errorText:"options.path is a mandatory parameter"})}else{if(!f(i.zipPath)){h({errorCode:"BAD_PARAMETER",errorText:"options.zipPath is a mandatory parameter"})}else{if(!f(i.targetPath)){h({errorCode:"BAD_PARAMETER",errorText:"options.targetPath is a mandatory parameter"})}else{try{a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/unzip",parameters:{zipPath:i.zipPath,targetPath:i.targetPath},onSuccess:function(k){d("onSuccess");if(k.returnValue){g()}else{d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){d("onFailure");d("FAILED: "+k.errorText);h({errorCode:k.errorCode,errorText:k.errorText})}})}catch(j){d("EXCEPTION"+j);h({errorCode:"STUF",errorText:"Storage.unzipFile() error is occured during operation."})}}}}};e.prototype.getMD5Hash=function(g,h,i){d("getMD5Hash: ");if(!(i&&f(i.filePath))){h({errorCode:"BAD_PARAMETER",errorText:"options.filePath is a mandatory parameter"});return}a.Request("luna://com.webos.service.commercial.scapadapter/",{method:"fs/getMD5Hash",parameters:{filePath:i.filePath},onSuccess:function(j){if(typeof g==="function"){delete j.returnValue;g(j)}},onFailure:function(j){d("getMD5Hash: onFailure");delete j.returnValue;if(typeof h==="function"){h(j)}}});d("Storage.getMD5Hash Done")};e.prototype.decryptFile=function(g,h,i){d("decryptFile: ");a.Request("luna://com.webos.service.commercial.scapadapter/",{method:"fs/decryptFile",parameters:{cipher_mode:i.cipher_mode,password:i.password,inputPath:i.inputPath,outputFileName:i.outputFileName},onSuccess:function(j){if(typeof g==="function"){delete j.returnValue;g(j)}},onFailure:function(j){d("decryptFile: onFailure");delete j.returnValue;if(typeof h==="function"){h(j)}}});d("Storage.decryptFile Done")};e.prototype.formatUSB=function(g,h,i){i.fsType=e.FileSystem.FAT32;a.Request("luna://com.webos.service.commercial.scapadapter/",{method:"fs/formatUSB",parameters:i,onSuccess:function(j){if(j.returnValue===true){g()}else{h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){h({errorCode:j.errorCode,errorText:j.errorText})}})};e.prototype.getUSBInfo=function(g,h){a.Request("luna://com.webos.service.commercial.scapadapter/",{method:"fs/getUSBInfo",parameters:{},onSuccess:function(i){if(i.returnValue===true){g({usbList:i.usbList})}else{h({errorCode:i.errorCode,errorText:i.errorText})}},onFailure:function(i){h({errorCode:i.errorCode,errorText:i.errorText})}})};e.prototype.importSettingData=function(g,h,i){a.Request("luna://com.webos.service.commercial.scapadapter/",{method:"fs/importSettingData",parameters:i,onSuccess:function(j){if(j.returnValue===true){g()}else{h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){h({errorCode:j.errorCode,errorText:j.errorText})}})};e.prototype.exportSettingData=function(g,h,i){a.Request("luna://com.webos.service.commercial.scapadapter/",{method:"fs/exportSettingData",parameters:i,onSuccess:function(j){if(j.returnValue===true){g()}else{h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){h({errorCode:j.errorCode,errorText:j.errorText})}})};e.prototype.downloadFile=function(g,h,i){if(i.httpOption===null||typeof i.httpOption==="undefined"){i.httpOption={}}if(i.ftpOption===null||typeof i.ftpOption==="undefined"){i.ftpOption={}}a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/downloadFile",parameters:i,onSuccess:function(j){if(j.returnValue===true){d("SUCCESS");delete j.returnValue;g(j)}else{d("Err: "+j.errorText);h({errorCode:j.errorCode,errorText:j.errorText})}},onFailure:function(j){d("Err: "+j.errorText);h({errorCode:j.errorCode,errorText:j.errorText})}})};var b=function(g,h,i){var j=a.Request("luna://com.webos.service.commercial.scapadapter",{method:"fs/getDownloadFileStatus",parameters:i,onSuccess:function(k){if(k.returnValue===true){delete k.returnValue;g(k);if(k.status==="completed"||k.status==="cancelled"||k.status==="failed"){j.cancel()}}else{h({errorCode:k.errorCode,errorText:k.errorText})}},onFailure:function(k){h({errorCode:k.errorCode,errorText:k.errorText})}})};e.prototype.getDownloadFileStatus=function(g,h,i){b(g,h,i)};return e}());