
/********************************
 * Variable declaration
 ********************************/


var webOSVersion = '';

var CORDOVA_PATH = './js/cordova/2.7.0/cordova.webos.js';
var CUSTOMJS_PATH = './js/custom1.4.js';

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

function init() {
    checkOS();
}


/********************************
 * Select SCAP API version
 ********************************/
// Depending on the device platform, the Cordova and CustomJS library are automatically loaded.
function checkOS() {
    if (!window.PalmServiceBridge) {
        console.error("PalmServiceBridge not found.");
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
    return idcap;
}

// Depending on the webOS platform, the SCAP library is automatically loaded.
function createScript(webOSVersion) {

    console.log(SCAP_FILES_INDEX)

    for (var i = 0; i <= SCAP_FILES_INDEX[webOSVersion]; i++) {
        var jsPath = SCAP_PATH[webOSVersion] + SCAP_FILES[i];
        var script = document.createElement('script');

        script.src = jsPath;
        document.head.appendChild(script);

        console.log('addSCAP---------' + jsPath);

        if (i === SCAP_FILES_INDEX[webOSVersion]) {
            script.onload = function () {
                enableDebug();
                initVideoPlayer();
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
