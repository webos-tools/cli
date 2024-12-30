const internalPath = 'file://internal/',
    intervalTime = 100;

/********************************
 * Variable declaration
 ********************************/
 var webOSVersion = '';

 var CORDOVA_PATH = './js/cordova/2.7.0/cordova.webos.js';
 var CUSTOMJS_PATH = './js/custom/custom1.4.js';
 
 var SCAP_PATH = {
     '1.0': './js/cordova-cd/1.2/',
     '2.0': './js/cordova-cd/1.3/',
     '3.0': './js/cordova-cd/1.4.5/',
     '3.2': './js/cordova-cd/1.5.12/',
     '4.0': './js/cordova-cd/1.6.8/',
     '4.1': './js/cordova-cd/1.7.6/',
     '5.0': './js/cordova-cd/1.7.6/',
     '6.0': './js/cordova-cd/1.8.1/',
 }
 
 var SCAP_FILES = [
     // SCAP v1.2 & v1.3
     'configuration.js',
     'deviceInfo.js',
     'inputSource.js',
     'power.js',
     'signage.js',
     'sound.js',
     'storage.js',
     'video.js',
     // SCAP v1.4 & v1.5 & v1.6
     'security.js',
     'time.js',
     'utility.js',
     // SCAP v1.7, 1.8
     'iot.js'
 ]
 
 var SCAP_FILES_INDEX = {
     '1.0': 7,
     '2.0': 7,
     '3.0': 10,
     '3.2': 10,
     '4.0': 10,
     '4.1': 11,
     '5.0': 11, 
     '6.0': 11
 }
 
 
 /********************************
  * Select SCAP API version
  ********************************/
 // Depending on the device platform, the Cordova and CustomJS library are automatically loaded.
 
 function checkOS() {
     if(!window.PalmServiceBridge) {
         console.log('PalmServiceBridge not found.');
         console.log('Please run it on webOS Signage device.');
         return;
     }
     
     var script1 = document.createElement('script');
     script1.src = CORDOVA_PATH;
     document.head.appendChild(script1);
     
     console.log('addLibrary---------' + CORDOVA_PATH);
     
     script1.onload = function () {
         var script2 = document.createElement('script');
         script2.src = CUSTOMJS_PATH;
         document.head.appendChild(script2);
         
         console.log('addLibrary---------' + CUSTOMJS_PATH);
         
         script2.onload = function () {
             getwebOSVersion();
         }
     }
 }
 
 // Gets webOS Signage version
 function getwebOSVersion() {
     var custom = new Custom();
     custom.Signage.getwebOSVersion(
         function successCallback(successObject) {
             webOSVersion = successObject.webOSVersion;
             
             console.log('webOS Signage version: ' + webOSVersion);
             
             switch(webOSVersion) {
                 case '1.0':
                 case '2.0':
                 case '3.0':
                 case '3.2':
                 case '4.0':
                 case '4.1':
                 case '5.0':
                 case '6.0':
                     createScript(webOSVersion);
                     break;
                 default:
                     console.log('Unknown webOS Version!!');
             }
         },
         function failureCallback(failureObject) {
             console.log('[' + failureObject.errorCode + ']' + failureObject.errorText + ' by CustomJS');
             console.log("CALL idcap://configuration/property/get to get webos_version");
             // IDCAP is called on webOS 6.0 in case customJS is lower than v1.4 or webOS vsersion is higher than webOS 6.0            
             idcap.request( "idcap://configuration/property/get" , {                        
                "parameters": {                            
                     "key" : "webos_version"                        
                 },
                 "onSuccess": function (cbObject) {                            
                      console.log("onSuccess cbObject = " + JSON.stringify(cbObject));
                      webOSVersion = cbObject.value;
                      if(webOSVersion === '6.0.0') webOSVersion = '6.0';
                      createScript(webOSVersion);
                 },
                 "onFailure": function (err) {
                     console.log("onFailure : errorMessage = " + err.errorMessage);
                 }
              });
         }
     )
 }

 function IDCAP_webOSVersion() {
    var idcap;
    var custom = new Custom();
    custom.Signage.getwebOSVersion(
        function successCallback(successObject) {
            webOSVersion = successObject.webOSVersion;
            
            //console.log('IDCAP_webOSVersion webOS Signage version: ' + webOSVersion);
            
            switch(webOSVersion) {
                case '1.0':
                case '2.0':
                case '3.0':
                case '3.2':
                case '4.0':
                case '4.1':
                case '5.0':
                    return idcap = false;
                    break;
                case '6.0':
                    //console.log("IDCAP_webOSVersion");
                    return idcap = true;
                    break;
                default:
                    console.log('Unknown webOS Version!!');
                    return idcap = false;
            }
        },
        function failureCallback(failureObject) {
            console.log('[' + failureObject.errorCode + ']' + failureObject.errorText + ' by CustomJS');
            console.log("CALL idcap://configuration/property/get to get webos_version");
            // IDCAP is called on webOS 6.0 in case customJS is lower than v1.4 or webOS vsersion is higher than webOS 6.0            
            idcap.request( "idcap://configuration/property/get" , {                        
               "parameters": {                            
                    "key" : "webos_version"                        
                },
                "onSuccess": function (cbObject) {                            
                     console.log("onSuccess cbObject = " + JSON.stringify(cbObject));
                     webOSVersion = cbObject.value;
                     if(webOSVersion === '6.0.0') webOSVersion = '6.0';
                     return idcap = true;
                },
                "onFailure": function (err) {
                    console.log("onFailure : errorMessage = " + err.errorMessage);
                }
             });
        }
    )
    //console.log("IDCAP_webOSVersion" + idcap);
    return idcap;
}

 // Depending on the webOS platform, the SCAP library is automatically loaded.
 function createScript(webOSVersion) {
    for (var i = 0; i <= SCAP_FILES_INDEX[webOSVersion]; i++) {
        var jsPath = SCAP_PATH[webOSVersion] + SCAP_FILES[i];
        var script = document.createElement('script');
        
        script.src = jsPath;
        document.head.appendChild(script);
        
        console.log('SCAP API "' + jsPath + '" added!!');
        
        if (i === SCAP_FILES_INDEX[webOSVersion]) {
            script.onload = function () {
                enableDebug();
            }
        }
    }
}

function enableDebug() {
 
    var configuration = new Configuration();
        var options = {};
    
        options.enabled = true; //enabling debug mode
    
        configuration.debug(
            function successCb() {
                console.log('Succeeded to enable the debug mode');
            },
            function failureCb() {
                idcap.request( "idcap://configuration/property/set" , {
                    "parameters": {
                        "key" : "browser_debug_mode",
                        "value" : "1"
                    },
                    "onSuccess": function () {
                        console.log("set browser_debug_mode onSuccess");
                    },
                    "onFailure": function (err) {
                        console.log('Failed to enable the debug mode');
                    }
                });
            },
            options
        );
}

var intervalHandler = [];
var g_storage;
var timeCount,
    totalFileSize = 0;

// parse bytes to kBytes
function parseBytes(byte) {
    if (typeof byte === 'number') {
        if (byte < 1024) {
            return byte + 'B';
        } else if (byte < 1024*1024) {
            return +(byte/1024).toFixed(2) + 'kB';
        } else {
            return +(byte/(1024*1024)).toFixed(2) + 'MB';
        }
    }
    else return -1;
}

// get the file size using HEAD request to server
function getFileSize(file_url) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == xhr.DONE) {
            if (xhr.status === 200 || xhr.status === 201) {
                console.log(xhr.getAllResponseHeaders());
                totalFileSize = parseInt(xhr.getResponseHeader('Content-Length'));
                console.log('Total File Size : ' + totalFileSize);

                document.querySelector('span#cs-totalSize').innerText = parseBytes(totalFileSize);
            } else {
                console.error(xhr.status);
            }
        }
    };
    // HEAD request is much lighter than GET request to get content-length
    xhr.open('HEAD', file_url);
    xhr.send();
}


// update progressConsole data
async function updateProgress(file_path) {

    function addZero(num) {
        if (typeof num === 'number')
            return('00' +  Math.floor(num)).slice(-2);
    }

    var seconds = addZero(timeCount%60);
    var minutes = addZero(timeCount/60);
    var hours = addZero(timeCount/(60*60));

    document.querySelector('#elapsedTime #value').innerText = hours + ':' + minutes + ':' + seconds

    function checkProgress(cbObject) {
        var currentSize = cbObject.size;
        document.querySelector('span#cs-size').innerText = parseBytes(currentSize);
        // console.log('currentSize: ' + currentSize);

        (function calculatePercentage() {
            var percentage = Math.floor((currentSize / totalFileSize) * 100);
            document.querySelector('span#cs-percent').innerText = percentage;
            document.querySelector('progress#progressBar').value = percentage;
        })();
        (function calculateSpeedAndTime() {
            if (timeCount === 0) return;
            var speed = (currentSize / timeCount);

            var eta = (totalFileSize - currentSize) / speed;
            var etaSeconds = addZero(eta%60);
            var etaMinutes = addZero(eta/60);
            var etaHours = addZero(eta/(60*60));

            document.querySelector('span#cs-speed').innerText = parseBytes(speed);
            document.querySelector('#remainTime #value').innerText = etaHours + ':' + etaMinutes + ':' + etaSeconds;
        })();;

        // clear all the interval functions
        if (currentSize === totalFileSize) {
            while (intervalHandler.length !== 0) {
                var temp = intervalHandler.pop();
                clearInterval(temp);
            }
        }
    }

    //console.log('file_path==>' + file_path); //"file://internal/15.ts"

    if(IDCAP_webOSVersion())
    {
        
        try {
            var cbObject = await idcap.request( "idcap://storage/file/stat" , {
                "parameters": {
                  "path" : file_path
                }
              });
              checkProgress(cbObject);
            
        } catch (cbObject) {
            var errorCode = cbObject.errorCode;
            var errorText = cbObject.errorText;
            console.log(" Error Code [" + errorCode + "]: " + errorText);
        }
    }
    else
    {
        var successCb = checkProgress;

        var failureCb = function (cbObject) {
            var errorCode = cbObject.errorCode;
            var errorText = cbObject.errorText;
            console.log(" Error Code [" + errorCode + "]: " + errorText);
        };

        var options = {
            path: file_path,
        };

        if (g_storage === undefined) g_storage = new Storage();
        g_storage.statFile(successCb, failureCb, options);
    }
    
}

// download a file from url input
function downloadFile(file_url) {
    timeCount = 0;
    getFileSize(file_url);

    var fileName = file_url.split('/')[file_url.split('/').length - 1];
    console.log(file_url + fileName);
    
    
    
    var successCb = function () {
        console.log("Copying File done.");
        document.querySelector('#progressConsole #progressStatus').innerText = 'Completed';
    };
    var failureCb = function (cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        console.log(" Error Code [" + errorCode + "]: " + errorText);
        document.querySelector('#progressConsole #progressStatus').innerText = 'Failed';
    };
    var options = {
        source : file_url,
        destination : internalPath + fileName
    };

    if (g_storage === undefined) g_storage = new Storage();
    g_storage.copyFile(successCb, failureCb, options);
    

    document.querySelector('#progressConsole #progressStatus').innerText = 'Downloading...';

    if (intervalHandler.length === 0) {
        intervalHandler.push(setInterval(updateProgress, intervalTime, internalPath + fileName));
        intervalHandler.push(setInterval(function() {
            timeCount++;
        }, 1000));
    }
    
}

// initial function
function init() {
    checkOS();

    document.getElementById('downloadBtn').onclick = function () {
        var file_url = document.getElementById('file-url').value;
        downloadFile(file_url);
    }
}

window.onload = init;