var VIDEO_URI = "",
    rotate = 0,
    imageData,
    time,
    screenshot = document.createElement('img'),
    screenshotCapturedInterval = document.createElement('img');

function initHDMI() {
	getHDMIScreen();
}

function init() {
	
	document.getElementById('disconnectImage').appendChild(screenshot);
	document.getElementById('capturedImage').appendChild(screenshotCapturedInterval);
	screenshotCapturedInterval.width = 384;
	setInterval(networkMonitor, 1000);
}
 

function getHDMIScreen() {
	 var options = {};
	    options.divId = "HDMIScreen"; // It should be matched to div tag name in an html page.
	    options.videoId = "HDMIVideo";
	    options.callback = init;
	    options.src = "ext://hdmi:1";
	    
	    function successCb(cbObject) {
	        // Do something
	    }

	    function failureCb(cbObject) {
	        var errorCode = cbObject.errorCode;
	        var errorText = cbObject.errorText;
	        
	        console.log ("Error Code [" + errorCode + "]: " + errorText);
	        init();
	    }
	    var inputSource = new InputSource();
	    inputSource.initialize(successCb, failureCb, options);
}

function getContent() {
	
	var successCB = function(cbobj){
		imageData = cbobj.data;
		var size = cbobj.size;
		var encoding = cbobj.encoding;		
		console.log("Take screenshot : Size - " + size);	 	 
		

		screenshotCapturedInterval.src = "data:image/jpeg;base64, " + imageData;
		document.getElementById('capturedImage').replaceChild(screenshotCapturedInterval);
	};
	
	var failureCB = function(cbobj){
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;        
        console.log ("Error Code [" + errorCode + "]: " + errorText);
	}

	 var options = {
			 save : true
	 };
	 var signage = new Signage();
	 signage.captureScreen(successCB, failureCB, options);
}

function networkMonitor() {
	// Get network infomation
	var successCb = function(ret) {
		
		// Internet connected
		//if (ret.isInternetConnectionAvailable) {
		if (ret.wired.state === 'connected') {
			console.log("Internet  Connected");
			document.getElementById('disconnectText').style.visibility = 'hidden';
			document.getElementById('disconnectImage').style.visibility = 'hidden';
			document.getElementById('status').innerHTML = "Connected"; 
			getContent();
		}	
			
		// Internet Disconnected
		else {
			console.log("Internet status : Disconnected");
			document.getElementById('disconnectText').innerHTML = "Disconnected " + 
			time.hour + ':' + time.minute + ':' +  time.sec;    			
			
			// Screenshot appear
			document.getElementById('disconnectText').style.visibility = 'visible';
			document.getElementById('disconnectImage').style.visibility = 'visible';
			screenshot.src = "data:image/jpeg;base64, " + imageData;
			document.getElementById('disconnectImage').replaceChild(screenshot);
			
			
			
		}
	}
	
	var failureCb = function(ret) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;        
        console.log ("Error Code [" + errorCode + "]: " + errorText);
	}
	

    var deviceInfo = new DeviceInfo();
    getCurrentTime();
    deviceInfo.getNetworkInfo(successCb, failureCb);
}

function getCurrentTime() {
	// Get current time
    function successCb(cbObject) {
    	time = cbObject;
    	time.hour = ((time.hour < 10) ? ("0" + time.hour) : time.hour);
    	time.minute = ((time.minute < 10) ? ("0" + time.minute) : time.minute);
    	time.sec = ((time.sec < 10) ? ("0" + time.sec) : time.sec);
    	document.getElementById('timer').innerHTML = time.hour + ':' + time.minute + ':'+  time.sec;    			
    	document.getElementById('pinRotate').setAttribute("style", "-webkit-transform:rotate(" + 6 * cbObject.sec + "deg);");
    }

    function failureCb(cbObject) {
        var errorCode = cbObject.errorCode;
        var errorText = cbObject.errorText;
        
        console.log ("Error Code [" + errorCode + "]: " + errorText);
    }

    var configuration = new Configuration();
    configuration.getCurrentTime(successCb, failureCb);
}