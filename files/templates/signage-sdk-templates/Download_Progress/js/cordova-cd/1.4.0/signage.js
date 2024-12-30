/*!
 * ============================================================================
 *   ID SW PLATFORM TEAM, LG ELECTRONICS INC., SEOUL, KOREA                       
 *   Copyright(c) 2016 by LG Electronics Inc.                                  
 *                                                                             
 *   Release Version : 1.4.0
 * ============================================================================
 */
cordova.define("cordova/plugin/signage",function(l,A,c){var B;function j(C){}if(window.PalmSystem){j("Window.PalmSystem Available");B=l("cordova/plugin/webos/service")}else{j("Window.PalmSystem is NOT Available");B={Request:function(C,D){j(C+" invoked. But I am a dummy because PalmSystem is not available");if(typeof D.onFailure==="function"){D.onFailure({returnValue:false,errorCode:"CORDOVA_ERR",errorText:"PalmSystem Not Available. Cordova is not installed?"})}}}}var f=null;var g={};function d(C){if(f===null){B.Request("luna://com.webos.service.tv.systemproperty",{method:"getSystemInfo",parameters:{keys:["sdkVersion","boardType"]},onSuccess:function(D){j("getPlatformInfo: onSuccess");j("version : "+D.sdkVersion);var E=D.sdkVersion.split(".");if(E.length>=1&&E[0]==="1"){g={webOSVer:1,chipset:D.boardType.split("_")[0]}}else{if(E.length>=1&&E[0]==="2"){g={webOSVer:2,chipset:D.boardType.split("_")[0]}}else{if(E.length>=1&&E[0]==="3"){g={webOSVer:3,chipset:D.boardType.split("_")[0]}}else{g={webOSVer:0,chipset:""}}}}f=g.webOSVer;C(g)},onFailure:function(D){j("getPlatformInfo: onFailure");g={webOSVer:0,chipset:""};C(g)}})}else{C(g)}}var w=function(C){var D=m[C];j(JSON.stringify(D,null,3));if(D&&D.getEvent===true){if(m[C].listenerObj){m[C].listenerObj.cancel();m[C].getEvent=false;m[C].listenerObj=null}}};var o=function(D,C){var E=m[D];if(E&&typeof E.createListener==="function"){E.listenerObj=E.createListener(C);E.getEvent=true}};function e(D){if(D.substring(0,"ext://".length)!=="ext://"){j("Bad prefix: "+D);return false}var C=D.substring("ext://".length);j("body is: "+C);var E=C.split(":");if(E.length===2){return E[0]+E[1]}else{if(E.length===1){return E[0]}else{j("Bad Syntax: "+D);return false}}}function u(C,E){for(var D in C){if(C[D]===E){return true}}return false}var r={FAILOVER_MODE:"failover",FAILOVER_PRIORITY:"failoverPriority",IR_OPERATION_MODE:"enableIrRemote",LOCALKEY_OPERATION_MODE:"enableLocalKey",OSD_PORTRAIT_MODE:"osdPortraitMode",TILE_MODE:"tileMode",TILE_ID:"tileId",TILE_ROW:"tileRow",TILE_COLUME:"tileCol",TILE_NATURALMODE:"naturalMode",DPM_MODE:"dpmMode",AUTOMATIC_STANDBY_MODE:"autoSB",ISM_METHOD:"ismmethod",SES_MODE:"smartEnergy",DO_15OFF_MODE:"15off",MONITOR_FAN:"monitorFan",MONITOR_SIGNAL:"monitorSignal",MONITOR_LAMP:"monitorLamp",MONITOR_SCREEN:"monitorScreen",MONITOR_AUDIO:"monitorAudio",AUDIO_SOURCE_HDMI1:"audioSourceHdmi1",AUDIO_SOURCE_HDMI2:"audioSourceHdmi2",AUDIO_SOURCE_DP:"audioSourceDp"};var s=function(C){j("Create Listener for monitorTemperature");var D=B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"systemMonitor/getTemperature",parameters:{subscribe:true},onSuccess:function(E){j("temperature : "+JSON.stringify(E,null,3));if(E.returnValue===true){var F={source:a.MonitoringSource.THERMOMETER,type:a.EventType.CURRENT_TEMPERATURE,data:{temperature:E.temperature}};if(typeof C==="function"){C(F)}}},onFailure:function(E){j("monitor_temperature : FAIL "+JSON.stringify(E,null,3))}});return D};var i=function(C){j("Create Listener for monitorFan");var D=B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"systemMonitor/getFanEvent",parameters:{subscribe:true},onSuccess:function(E){j("monitor_fan : "+JSON.stringify(E,null,3));if(E.returnValue===true){var F={source:a.MonitoringSource.FAN,type:a.EventType.FAN_STATUS,data:{status:E.fanFault}};if(typeof C==="function"){C(F)}}},onFailure:function(E){j("monitor_fan : FAIL "+JSON.stringify(E,null,3))}});return D};var k=function(C){j("Create Listener for monitorLamp");var D=B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"systemMonitor/getLampEvent",parameters:{subscribe:true},onSuccess:function(E){j("monitor_lamp : "+JSON.stringify(E,null,3));if(E.returnValue===true){var F={source:a.MonitoringSource.LAMP,type:a.EventType.LAMP_STATUS,data:{status:E.lampFault}};if(typeof C==="function"){C(F)}}},onFailure:function(E){j("monitor_lamp : FAIL "+JSON.stringify(E,null,3))}});return D};var q=function(C){j("Create Listener for monitorSignal");var D=B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"systemMonitor/getSignalEvent",parameters:{subscribe:true},onSuccess:function(E){j("monitor_signal : "+JSON.stringify(E,null,3));if(E.returnValue===true){var F={type:a.EventType.SIGNAL_STATUS,source:a.MonitoringSource.SIGNAL,data:{}};if(E.noSignal===true){F.data.status="no_signal"}else{F.data.status="signal_available"}if(typeof C==="function"){C(F)}}},onFailure:function(E){j("monitor_signal : FAIL "+JSON.stringify(E,null,3))}});return D};var x=function(C){j("Create Listener for monitorScreen");var D=B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"systemMonitor/getScreenEvent",parameters:{subscribe:true},onSuccess:function(E){j("monitor_screen : "+JSON.stringify(E,null,3));if(E.returnValue===true){var F={source:a.MonitoringSource.SCREEN,type:a.EventType.SCREEN_STATUS,data:{status:E.screen}};if(typeof C==="function"){C(F)}}},onFailure:function(E){j("monitor_screen FAIL : "+JSON.stringify(E,null,3))}});return D};var m={fan:{getEvent:false,listenerObj:null,createListener:i},screen:{getEvent:false,listenerObj:null,createListener:x},temperature:{getEvent:false,listenerObj:null,createListener:s},signal:{getEvent:false,listenerObj:null,createListener:q},lamp:{getEvent:false,listenerObj:null,createListener:k}};var t={row:0,col:0};var a=function(){};a.UNDEFINED="___undefined___";a.OsdPortraitMode={ON:"90",OFF:"off"};a.ImgResolution={HD:"HD",FHD:"FHD",};a.AutomaticStandbyMode={OFF:"off",STANDBY_4HOURS:"4hours"};a.IsmMethod={NORMAL:"NORMAL",ORBITER:"ORBITER",INVERSION:"INVERSION",COLORWASH:"COLORWASH",WHITEWASH:"WHITEWASH",WASHING_BAR:"WASHINGBAR",USER_IMAGE:"USERIMAGE",USER_VIDEO:"USERVIDEO"};a.FailoverMode={OFF:"off",AUTO:"auto",MANUAL:"manual"};a.DigitalAudioInput={HDMI_DP:"hdmi",AUDIO_IN:"audioIn"};a.DpmMode={OFF:"off",POWER_OFF_5SECOND:"5sec",POWER_OFF_10SECOND:"10sec",POWER_OFF_15SECOND:"15sec",POWER_OFF_1MINUTE:"1min",POWER_OFF_3MINUTE:"3min",POWER_OFF_5MINUTE:"5min",POWER_OFF_10MINUTE:"10min"};a.KeyOperationMode={ALLOW_ALL:"normal",POWER_ONLY:"usePwrOnly",BLOCK_ALL:"blockAll"};a.EventType={CURRENT_TEMPERATURE:"CURRENT_TEMPERATURE",FAN_STATUS:"FAN_STATUS",LAMP_STATUS:"LAMP_STATUS",SCREEN_STATUS:"SCREEN_STATUS",SIGNAL_STATUS:"SIGNAL_STATUS"};a.MonitoringSource={FAN:"FAN",LAMP:"LAMP",SIGNAL:"SIGNAL",SCREEN:"SCREEN",THERMOMETER:"THERMOMETER"};function n(D,E,C){if(D.errorCode===undefined||D.errorCode===null){D.errorCode=E}if(D.errorText===undefined||D.errorText===null){D.errorText=C}}function v(F,E,G,C,D){var H={category:F,keys:E};B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:H,onSuccess:function(I){j("On Success");if(I.returnValue===true){var J=G(I.settings);if(J===false){if(typeof D==="function"){D({errorText:"Invalid DB value",errorCode:"DB_ERROR"})}}else{if(typeof C==="function"){j("successCallback");C(J)}else{j("successCallback not registered or is not a function: "+C)}}}else{j("Settings Failed:  "+JSON.stringify(I,null,3));if(typeof D==="function"){D({errorText:"Invalid DB value : "+I.errorText,errorCode:"DB_ERROR"})}}},onFailure:function(I){j("On Failure");delete I.returnValue;if(I.settings){j("settings = "+JSON.stringify(I.settings,null,3));var K=G(I.settings);j("errorKey = "+JSON.stringify(I.errorKey,null,3));for(var J=0;J<I.errorKey.length;++J){K[I.errorKey[J]]=a.UNDEFINED}j("cbObj = "+JSON.stringify(K,null,3));if(typeof C==="function"){j("successCallback");C(K)}}else{if(typeof D==="function"){D({errorText:((typeof I.errorText==="undefined")?"DB Failure":I.errorText),errorCode:"DB_ERROR"})}}}});j("Requested Service: luna://com.webos.service.commercial.signage.storageservice/settings/");j("params : "+JSON.stringify(H))}function h(H,G,C,D){var I={category:H,settings:G};j("settings : "+JSON.stringify(G,null,3));var E=false;for(var F in G){if(F){j("has key : "+F);E=true;break}}if(E===false){j("Nothing to set");C();return}B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:I,onSuccess:function(){j("On Success");if(typeof C==="function"){j("SUCCEES CALLBACK");C()}},onFailure:function(J){j("On Failure");delete J.returnValue;if(typeof D==="function"){j("ERROR CALLBACK");D(J)}}});j("Requested Service: luna://com.webos.service.commercial.signage.storageservice/settings/");j("params : "+JSON.stringify(I))}a.prototype.setPortraitMode=function(C,E,H){var I={};var G;function F(J){if(J.portraitMode){for(var K in a.OsdPortraitMode){if(J.portraitMode===a.OsdPortraitMode[K]){return true}}G="Signage.setPortraitMode: Unrecognized OsdPortraintMode : "+J.portraitMode;return false}else{G="Signage.setPortraitMode: portraitMode does not exist.";return false}}if(F(H)){var D=H.portraitMode;I[r.OSD_PORTRAIT_MODE]=D;B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"setOsdPortraitMode",parameters:{osdPortraitMode:H.portraitMode},onSuccess:function(J){C()},onFailure:function(J){if(J.errorText.indexOf("Unknown method")!==-1){h("commercial",I,C,E)}else{E({errorCode:J.errorCode,errorText:J.errorText})}}});j("setPortraitMode Done")}else{E({errorCode:"BAD_PARAMETER",errorText:G})}};a.prototype.setFailoverMode=function(D,F,L){var E={};var G;function C(M){j("options:"+JSON.stringify(M,null,3));var P=M.failoverMode;if(P){if(P.mode){if(P.mode===a.FailoverMode.MANUAL){if(P.priority){if(P.priority.length===0||typeof P.priority.length==="undefined"){return false}else{return true}}else{G="priority should be present when mode is MANUAL.";return false}}else{if(P.priority){G="This priority is available only if mode is : Signage.FailoverMode.MANUAL";return false}else{var O=false;j("Mode is: "+P.mode);for(var N in a.FailoverMode){if(P.mode===a.FailoverMode[N]){j("Matched with: "+a.FailoverMode[N]);O=true}}if(!O){j("Unrecognized failoverMode : "+P.mode);G="Unrecognized failoverMode : "+P.mode;return false}else{return true}}}}else{if(!P.priority){return true}else{j("Unrecognized failoverMode : "+P.mode);G="Unrecognized failoverMode : "+P.mode;return false}}}else{G="Fail over mode not set : ";return false}}if(C(L)){var I=L.failoverMode;if(!I.mode&&!I.priority){D()}else{if(I.mode===a.FailoverMode.MANUAL){B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"setManualFailoverPrioirty",parameters:{priority:I.priority},onSuccess:function(M){j("onSuccess");if(M.returnValue){D()}else{j("FAILED: "+M.errorText);F({errorCode:M.errorCode,errorText:M.errorText})}},onFailure:function(M){j("onFailure");j("FAILED: "+M.errorText);F({errorCode:M.errorCode,errorText:M.errorText})}})}else{if(I.mode){var J=I.mode;j("mode: "+I.mode);E[r.FAILOVER_MODE]=J;j("Set: "+JSON.stringify(E,null,3));h("commercial",E,D,F);j("setFailoverMode Done")}else{var H={errorCode:"BAD_PARAMETER",errorText:"Mode should be set."};F(H)}}}}else{var K={errorCode:"BAD_PARAMETER",errorText:G};F(K)}};a.prototype.getFailoverMode=function(C,D){try{B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"getFailoverPrioirty",parameters:{},onSuccess:function(F){j("onSuccess");if(F.returnValue){C({priority:F.priority,mode:F.mode})}else{j("FAILED: "+F.errorText);D({errorCode:F.errorCode,errorText:F.errorText})}},onFailure:function(F){j("onFailure");j("FAILED: "+F.errorText);D({errorCode:F.errorCode,errorText:F.errorText})}})}catch(E){j("EXCEPTION"+E);D({errorCode:"SGFO",errorText:"Signage.getFailoverMode occur error during operaation."})}};function y(E,C){var D=typeof E;j("mytype: "+D);j("type: "+C);if(D==="undefined"){return true}else{if(D===C){return E}else{return false}}}a.prototype.setTileInfo=function(C,D,G){var F;var E=function(R,N,S){var J=typeof R.tileInfo.enabled;j("enabledType:"+J);if(J!=="undefined"&&J!=="boolean"){F="enabled should be a boolean";return false}var P=function(U){var T=new RegExp(/^[0-9]+$/g).exec(U);if(T){return false}else{return true}};if(R.tileInfo){var Q=R.tileInfo.row;if(typeof Q!=="undefined"){if(P(Q)){F="row should be a natural number :"+Q;return false}else{if(Q>N||Q<1){F="row should be 0<n<"+(N+1)+" but :"+Q;return false}}}else{return true}var L=R.tileInfo.column;if(typeof L!=="undefined"){if(P(L)){F="column should be a natural number :"+L;return false}else{if(L>S||L<1){F="column should be 0<n<"+(S+1)+" but :"+L;return false}}}else{return true}var K=R.tileInfo.tileId;if(typeof K!=="undefined"){if(P(K)){F="id should be a natural number :"+K;return false}else{if(K<1){F="id should be bigger than 0 but :"+K;return false}else{var M=t.row;if(Q){M=Q}var O=t.column;if(L){O=L}j("curRow : "+M);j("curCol : "+O);j("id : "+K);if(K>O*M){F="ID should be less than curRow*curCol";return false}}}}else{return true}}else{F="Tile info is mandatory";return false}return true};var H=15;var I=15;B.Request("luna://com.webos.service.config",{method:"getConfigs",parameters:{configNames:["commercial.video.tileRowMax","commercial.video.tileColMax"]},onSuccess:function(K){j("onSuccess");if(K.returnValue){H=K.configs["commercial.video.tileRowMax"];I=K.configs["commercial.video.tileColMax"];if(E(G,H,I)===true){var J=G.tileInfo;var M={};if(typeof J.enabled==="boolean"){if(J.enabled){M[r.TILE_MODE]="on"}else{M[r.TILE_MODE]="off"}}if(J.row){M[r.TILE_ROW]=J.row.toString()}if(J.column){M[r.TILE_COLUME]=J.column.toString()}if(J.tileId){M[r.TILE_ID]=J.tileId.toString()}if(typeof J.naturalMode==="boolean"){if(J.naturalMode){M[r.TILE_NATURALMODE]="on"}else{M[r.TILE_NATURALMODE]="off"}}j("Set: "+JSON.stringify(M,null,3));var L=function(){j("Do callback");if(J.row){t.row=J.row}if(J.column){t.column=J.column}if(typeof C==="function"){j("Invoke successCallback");C();j("Invoked successCallback")}};h("commercial",M,L,D);j("setTileInfo Done")}else{var N={errorCode:"BAD_PARAM",errorText:F};D(N)}}else{j("FAILED: "+K.errorText);D({errorCode:K.errorCode,errorText:K.errorText})}},onFailure:function(J){j("onFailure");j("FAILED: "+J.errorText);D({errorCode:J.errorCode,errorText:J.errorText})}})};function p(C){if(C==="on"){return true}else{return false}}a.prototype.getTileInfo=function(C,D){var F=function(G){var H={};j("settings Value: "+JSON.stringify(G,null,3));H.enabled=p(G[r.TILE_MODE]);H.row=parseInt(G[r.TILE_ROW],10);H.column=parseInt(G[r.TILE_COLUME],10);H.tileId=parseInt(G[r.TILE_ID],10);H.naturalMode=p(G[r.TILE_NATURALMODE]);j("Return Value: "+JSON.stringify(H,null,3));return H};var E=[r.TILE_MODE,r.TILE_ROW,r.TILE_COLUME,r.TILE_ID,r.TILE_NATURALMODE];v("commercial",E,F,C,D)};a.prototype.getSignageInfo=function(C,D){B.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"getSignageInformation",parameters:{},onSuccess:function(E){if(typeof C==="function"){j(E.signageInfo);C(E.signageInfo)}},onFailure:function(E){delete E.returnValue;if(typeof D==="function"){D(E)}}})};a.prototype.enableCheckScreen=function(C,D,G){var F;var E=function(J){if(typeof J.checkScreen!=="undefined"||J.checkScreen!==null){return true}else{F="need options.checkScreen.";return false}};if(E(G)){var H={checkScreen:(G.checkScreen===true?"on":"off")};j("Set: "+JSON.stringify(H,null,3));h("commercial",H,C,D);j("enableCheckScreen Done")}else{var I={errorCode:"BAD_PARAMETER",errorText:F};D(I)}};a.prototype.setIsmMethod=function(C,D,G){var H={};var F;function E(I,L,K){if(I.ismMethod){if((L===false&&I.ismMethod===a.IsmMethod.USER_IMAGE)||(K===false&&(I.ismMethod===a.IsmMethod.USER_IMAGE||I.ismMethod===a.IsmMethod.USER_VIDEO))){F="no supported ismMethod  : "+I.ismMethod;return false}for(var J in a.IsmMethod){if(I.ismMethod===a.IsmMethod[J]){return true}}F="Unrecognized ismMethod  : "+I.ismMethod;return false}else{F="ismMethod  does not exist.";return false}}B.Request("luna://com.webos.service.config/",{method:"getConfigs",parameters:{configNames:["commercial.applist.disablePhoto","commercial.unsupportedFeatures"]},onSuccess:function(Q){if(typeof C==="function"&&Q.returnValue===true){var O=true;var N=true;var I=Q.configs["commercial.applist.disablePhoto"];for(var M=0;M<I.length;M++){if(I[M].toLowerCase()==="com.webos.app.ism"){O=false;break}}var P=Q.configs["commercial.unsupportedFeatures"];for(var L=0;L<P.length;L++){if(P[L].toLowerCase()==="usb"){O=false;N=false;break}}if(E(G,O,N)){if(G.ismMethod){var J=G.ismMethod;j("ismMethod : "+J);H[r.ISM_METHOD]=J}j("Set: "+JSON.stringify(H,null,3));h("commercial",H,C,D);j("setIsmMethod Done")}else{var K={errorCode:"BAD_PARAMETER",errorText:F};D(K)}}},onFailure:function(I){delete I.returnValue;if(typeof D==="function"){D(I)}}})};a.prototype.setDigitalAudioInputMode=function(C,D,G){var F;function E(I){if(I.digitalAudioInputList){for(var J in I.digitalAudioInputList){if(J){var M=I.digitalAudioInputList[J];var L=false;for(var K in a.DigitalAudioInput){if(M===a.DigitalAudioInput[K]){L=true}}if(!L){F="Invalid Audio Input  : "+M;return false}}}return true}else{F="digitalAudioInputList  does not exist.";return false}}if(E(G)){B.Request("luna://com.webos.service.commercial.signage.storageservice/",{method:"setDigitalAudioInputList",parameters:{digitalAudioInputList:G.digitalAudioInputList},onSuccess:function(){if(typeof C==="function"){C()}},onFailure:function(I){delete I.returnValue;if(typeof D==="function"){D(I)}}})}else{var H={errorCode:"BAD_PARAMETER",errorText:F};D(H)}};var z=false;a.prototype.registerSystemMonitor=function(D,H,L){var K=["fan","signal","lamp","screen","temperature"];var I;var J="BAD_PARAMETER";j("Listeners are: "+JSON.stringify(m,null,3));function C(M){if(z===true){I="Not ready to register monitor now.";J="SYSTEM_ERROR";return false}j("options are: "+JSON.stringify(M,null,3));if(typeof M.eventHandler!=="function"){I="No event handler was given or event hadnler is not a function";return false}if(M.monitorConfiguration){for(var O in M.monitorConfiguration){if(O){var Q=false;for(var N=0;N<K.length;++N){if(O===K[N]){j("Found key: "+K[N]);Q=true}}if(!Q){I="Invalid Monitoring source  : "+O;return false}var P=M.monitorConfiguration[O];j("value: "+P);if(typeof P!=="boolean"){I="Invalid value  : "+P;return false}}}return true}else{I="monitorConfiguration  does not exist.";return false}}if(C(L)){var F=function(){j("Canceled all previous message subscriptions");var N=L.eventHandler;for(var M in L.monitorConfiguration){if(M){var O=L.monitorConfiguration[M];if(O===true){j("Add listener for : "+M);o(M,N)}}}j("Monitoring Setup : "+JSON.stringify(m,null,3));j("Start Polling : ");B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"systemMonitor/startMonitor",parameters:{},onSuccess:function(P){j("On Success");if(P.returnValue===true){if(typeof D==="function"){D()}}else{if(typeof H==="function"){H(P)}}z=false},onFailure:function(P){j("On Failure");delete P.returnValue;if(typeof H==="function"){H(P)}z=false}})};var E=function(M){H(M)};j("Cancel all previous message subscriptions");z=true;b(F,E)}else{var G={errorCode:J,errorText:I};H(G)}};a.prototype.unregisterSystemMonitor=function(C,D){b(C,D);j("After unregister, _gSystemMonitoringSetup are: "+JSON.stringify(m,null,3))};function b(C,D){j("cancelAllSubscription> setup are: "+JSON.stringify(m,null,3));for(var E in m){if(E){w(E)}}j("Stop Polling");B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"systemMonitor/stopMonitor",parameters:{},onSuccess:function(F){j("On Success");if(F.returnValue===true){if(typeof C==="function"){C()}}else{if(typeof D==="function"){D(F)}}},onFailure:function(F){j("On Failure");delete F.returnValue;if(typeof D==="function"){D(F)}}})}a.prototype.getSystemMonitoringInfo=function(C,D){if(m){C({fan:m.fan.getEvent,signal:m.signal.getEvent,lamp:m.lamp.getEvent,screen:m.screen.getEvent,temperature:m.temperature.getEvent})}else{var E={errorCode:"ERROR",errorText:"Failed to get system monitoring setup"};D(E)}};a.prototype.setPowerSaveMode=function(C,D,G){var F;function E(I){if(I.powerSaveMode){for(var J in I.powerSaveMode){if(J){var K=I.powerSaveMode[J];if(J==="ses"||J==="do15MinOff"){if(typeof K!=="boolean"){F="Invalid value  : "+K;return false}}else{if(J==="automaticStandby"){if(!u(a.AutomaticStandbyMode,K)){F="Invalid automaticStandby value  : "+K;return false}}else{if(J==="dpmMode"){if(!u(a.DpmMode,K)){F="Invalid dpmMode value  : "+K;return false}}else{F="Unknown value  : "+J;return false}}}}}return true}else{F="powerSaveMode  does not exist.";return false}}if(E(G)){j(G.powerSaveMode);B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"setPowerSaveMode",parameters:{mode:G.powerSaveMode},onSuccess:function(I){j("onSuccess");if(I.returnValue){C(I.mode)}else{j("FAILED: "+I.errorText);D({errorCode:I.errorCode,errorText:I.errorText})}},onFailure:function(I){j("onFailure");j("FAILED: "+I.errorText);D({errorCode:I.errorCode,errorText:I.errorText})}})}else{var H={errorCode:"BAD_PARAMETER",errorText:F};D(H)}};a.prototype.getPowerSaveMode=function(C,D){B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"getPowerSaveMode",parameters:{},onSuccess:function(E){j("onSuccess");if(E.returnValue){C(E.mode)}else{j("FAILED: "+E.errorText);D({errorCode:E.errorCode,errorText:E.errorText})}},onFailure:function(E){j("onFailure");j("FAILED: "+E.errorText);D({errorCode:E.errorCode,errorText:E.errorText})}})};a.prototype.setUsagePermission=function(D,G,K){var F={};var H;function C(L){if(L.policy){for(var M in L.policy){if(M){var N=L.policy[M];if(M==="remoteKeyOperationMode"||M==="localKeyOperationMode"){if(!u(a.KeyOperationMode,N)){H="Invalid  KeyOperationMode value  : "+N;return false}}else{H="Unknown value  : "+M;return false}}}return true}else{H="policy  does not exist.";return false}}if(C(K)){if(K.policy.localKeyOperationMode){var J=K.policy.localKeyOperationMode;j("portraitMode: "+J);F[r.LOCALKEY_OPERATION_MODE]=J}if(K.policy.remoteKeyOperationMode){var I=K.policy.remoteKeyOperationMode;j("portraitMode: "+I);F[r.IR_OPERATION_MODE]=I}j("Set: "+JSON.stringify(F,null,3));h("hotelMode",F,D,G);j("setPolicy Done")}else{var E={errorCode:"BAD_PARAMETER",errorText:H};G(E)}};a.prototype.getUsagePermission=function(C,D){var F=function(G){j("settings: "+JSON.stringify(G,null,3));var H={};H.remoteKeyOperationMode=G[r.IR_OPERATION_MODE];H.localKeyOperationMode=G[r.LOCALKEY_OPERATION_MODE];j("cbObj: "+JSON.stringify(H,null,3));return H};var E=[r.IR_OPERATION_MODE,r.LOCALKEY_OPERATION_MODE];v("hotelMode",E,F,C,D)};a.prototype.getUsageData=function(C,D){var E=false;var F=false;var H={uptime:false,totalUsed:false};function G(){j("accessResult");if(E===true&&F===true){j("CB Object: "+JSON.stringify(H,null,3));if(H.uptime===false||H.totalUsed===false){D({errorCode:"CORDOVA_FAIL",errorText:"Failed to get usage data"});return}else{j("SUCCESS");C(H);return}}else{j("Not Yet")}}B.Request("luna://com.webos.service.tv.signage/",{method:"getUTT",parameters:{},onSuccess:function(I){j("On getUTT Success");E=true;if(I.returnValue===true){j("UTT is :"+I.UTT);H.totalUsed=I.UTT}G()},onFailure:function(I){j("On getUTT Failure :"+JSON.stringify(I,null,3));E=true;G()}});B.Request("luna://com.webos.service.tv.signage/",{method:"dsmp/getElapsedTime",parameters:{},onSuccess:function(I){j("On getElapsedTime Success");F=true;j("result: "+JSON.stringify(I,null,3));if(I.returnValue===true){var J=I.elapsedTime;H.uptime=J;j("Elapsed!!: "+J)}G()},onFailure:function(I){j("On getSystemSettings Failure "+JSON.stringify(I,null,3));F=true;G()}})};a.prototype.captureScreen=function(C,D,E){var F={save:(E===undefined||E===null||E.save===undefined?false:E.save)};if(E!==undefined&&E!==null&&E.thumbnail!==undefined&&E.thumbnail===true){F.width=128;F.height=72}else{if(E.imgResolution===a.ImgResolution.FHD){F.width=1920;F.height=1080}else{F.width=1280;F.height=720}}B.Request("luna://com.webos.service.commercial.signage.storageservice",{method:"captureScreen",parameters:F,onSuccess:function(G){j("On Success");if(G.returnValue===true){C({data:G.data,size:G.size,encoding:G.encoding})}else{D({errorCode:G.errorCode,errorText:G.errorText})}},onFailure:function(G){j("On Failure");D({errorCode:G.errorCode,errorText:G.errorText})}})};a.prototype.setIntelligentAuto=function(D,E,F){j("setIntelligentAuto: "+F.enabled);if(F.enabled===null&&typeof E==="function"){var C={};n(C,"SSIA","Signage.setIntelligentAuto returns failure. command was not defined.");E(C);j("Signage.setIntelligentAuto invalid ");return}B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{intelligentAuto:(F.enabled===true)?"on":"off"}},onSuccess:function(G){j("setIntelligentAuto: On Success");if(G.returnValue===true){if(typeof D==="function"){D()}}},onFailure:function(G){j("setIntelligentAuto: On Failure");delete G.returnValue;if(typeof E==="function"){n(G,"SSIA","Signage.setIntelligentAuto returns failure.");E(G)}}});j("Signage.setIntelligentAuto Done")};a.prototype.getIntelligentAuto=function(C,D){j("getIntelligentAuto: ");B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["intelligentAuto"]},onSuccess:function(E){j("getIntelligentAuto: On Success");if(E.returnValue===true){var F={};F.enabled=E.settings.intelligentAuto;if(typeof C==="function"){C(F)}}},onFailure:function(E){j("getIntelligentAuto: On Failure");delete E.returnValue;if(typeof D==="function"){n(E,"SGIA","Signage.getIntelligentAuto returns failure.");D(E)}}});j("Signage.getIntelligentAuto Done")};a.prototype.setStudioMode=function(D,E,F){j("setStudioMode: "+F.enabled);if(F.enabled===null&&typeof E==="function"){var C={};n(C,"SSSM","Signage.setStudioMode returns failure. command was not defined.");E(C);j("Signage.setStudioMode invalid ");return}B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{studioMode:(F.enabled===true)?"on":"off"}},onSuccess:function(G){j("setStudioMode: On Success");if(G.returnValue===true){if(typeof D==="function"){D()}}},onFailure:function(G){j("setStudioMode: On Failure");delete G.returnValue;if(typeof E==="function"){n(G,"SSSM","Signage.setStudioMode returns failure.");E(G)}}});j("Signage.setStudioMode Done")};a.prototype.getStudioMode=function(C,D){j("getStudioMode: ");B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["studioMode"]},onSuccess:function(E){j("getStudioMode: On Success");if(E.returnValue===true){var F={};F.enabled=(E.settings.studioMode==="on")?true:false;if(typeof C==="function"){C(F)}}},onFailure:function(E){j("getStudioMode: On Failure");delete E.returnValue;if(typeof D==="function"){n(E,"SGSM","Signage.getStudioMode returns failure.");D(E)}}});j("Signage.getStudioMode Done")};a.prototype.setLanDaisyChain=function(C,D,E){B.Request("luna://com.webos.service.config/",{method:"getConfigs",parameters:{configNames:["tv.model.supportCommerLanDaisyChain"]},onSuccess:function(F){if(F.returnValue===true){if(F.configs["tv.model.supportCommerLanDaisyChain"]===false){n(F,"SSLD","Signage.setLanDaisyChain returns failure. unsupported feature. ");D(F);j("Signage.setLanDaisyChain invalid ");return}else{if(E.enabled===null&&typeof D==="function"){var F={};n(F,"SSLD","Signage.setLanDaisyChain returns failure. command was not defined.");D(F);j("Signage.setLanDaisyChain invalid ");return}j("setLanDaisyChain: "+E.enabled);B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"set",parameters:{category:"commercial",settings:{lanDaisyChain:(E.enabled===true)?"on":"off"}},onSuccess:function(G){j("setLanDaisyChain: On Success");if(G.returnValue===true){if(typeof C==="function"){C()}}},onFailure:function(G){j("setLanDaisyChain: On Failure");delete G.returnValue;if(typeof D==="function"){n(G,"SSIA","Signage.setLanDaisyChain returns failure.");D(G)}}});j("Signage.setLanDaisyChain Done")}}},onFailure:function(F){delete F.returnValue;if(typeof D==="function"){D(F)}}})};a.prototype.getLanDaisyChain=function(C,D){B.Request("luna://com.webos.service.config/",{method:"getConfigs",parameters:{configNames:["tv.model.supportCommerLanDaisyChain"]},onSuccess:function(E){if(E.returnValue===true){if(E.configs["tv.model.supportCommerLanDaisyChain"]===false){n(E,"SSLD","Signage.getLanDaisyChain returns failure. unsupported feature. ");D(E);j("Signage.getLanDaisyChain invalid ");return}else{j("getLanDaisyChain: ");B.Request("luna://com.webos.service.commercial.signage.storageservice/settings/",{method:"get",parameters:{category:"commercial",keys:["lanDaisyChain"]},onSuccess:function(F){j("getLanDaisyChain: On Success");if(F.returnValue===true){var G={};G.enabled=(F.settings.lanDaisyChain==="on")?true:false;if(typeof C==="function"){C(G)}}},onFailure:function(F){j("getLanDaisyChain: On Failure");delete F.returnValue;if(typeof D==="function"){n(F,"SSLD","Signage.getLanDaisyChain returns failure.");D(F)}}});j("Signage.getLanDaisyChain Done")}}},onFailure:function(E){delete E.returnValue;if(typeof D==="function"){D(E)}}})};a.prototype.addEventListener=o;a.prototype.removeEventListener=w;c.exports=a});Signage=cordova.require("cordova/plugin/signage");