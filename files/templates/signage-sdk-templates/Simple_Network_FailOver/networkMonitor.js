var VIDEO_URI = "",
	rotate = 0,
	imageData,
	time,
	screenshot = document.createElement('img'),
	screenshotCapturedInterval = document.createElement('img'),
	FILEPATH_AJAX = 'http://127.0.0.1:9080/ScreenCapture.png',
	xhr,
	vid,
	HDMIScreen;

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
	vid = document.createElement("video");
	HDMIScreen = document.getElementById("HDMIScreen");
	vid.id = "HDMIVideo";
	vid.style.width = "100%";
	vid.style.height = "100%";
	vid.autoplay = "";
	vid.noaudio = "";

	var vidSource = document.createElement('source');
	vidSource.src = "ext://hdmi:1";
	vidSource.type = "service/webos-external";

	vid.appendChild(vidSource);
	HDMIScreen.appendChild(vid);

	vid.load();
	vid.play();

	init();
}

function getContent() {
	idcap.request("idcap://utility/screen/capture", {
		"parameters": {},
		"onSuccess": function (cbObject) {
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (e) {
				if (this.readyState == 4) {
					if (this.status == 200) {
						screenshotCapturedInterval.src = "data:image/png;base64," + EncodeBase64(xhr.responseText);
						var captureImageDiv = document.getElementById('capturedImage');
						captureImageDiv.replaceChild(screenshotCapturedInterval, captureImageDiv.childNodes[0]);
					}
					else {
						errorHandler(e);
					}
				}
			}
			xhr.onerror = function (err) { }
			xhr.open('GET', FILEPATH_AJAX);
			xhr.overrideMimeType('text/plain; charset=x-user-defined');
			xhr.send();
		},
		"onFailure": function (err) {
			console.log("onFailure : errorMessage = " + err.errorMessage);
		}
	});
}

function EncodeBase64(responseText) {
	var binary = "";
	var responseTextLen = responseText.length;

	for (i = 0; i < responseTextLen; i++) {
		binary += String.fromCharCode(responseText.charCodeAt(i) & 255)
	}
	binary = btoa(binary);
	return binary;
}

function networkMonitor() {

	getCurrentTime();

	// Get network infomation
	idcap.request("idcap://network/configuration/get", {
		"parameters": {},
		"onSuccess": function (ret) {
			// Internet connected
			if (ret.wired.state === 'connected') {
				console.log('wired connection is connected');
				document.getElementById('disconnectText').style.visibility = 'hidden';
				document.getElementById('disconnectImage').style.visibility = 'hidden';
				document.getElementById('status').innerHTML = "Connected";
				getContent();
			}
			// Internet Disconnected
			else {
				console.log('wired connection is disconnected');
				document.getElementById('disconnectText').innerHTML = "Disconnected " +
					time.hour + ':' + time.minute + ':' + time.second;

				// Screenshot appear
				document.getElementById('disconnectText').style.visibility = 'visible';
				document.getElementById('disconnectImage').style.visibility = 'visible';
				screenshot.src = FILEPATH_AJAX;
				var disconnectImageDiv = document.getElementById('disconnectImage');
				disconnectImageDiv.replaceChild(screenshot, disconnectImageDiv.childNodes[0]);
			}
		},
		"onFailure": function (err) {
			console.log("onFailure : errorMessage = " + err.errorMessage);
		}
	});
}

function getCurrentTime() {
	// Get current time
	idcap.request("idcap://time/currenttime/get", {
		"parameters": {},
		"onSuccess": function (cbObject) {
			time = cbObject;
			time.hour = ((time.hour < 10) ? ("0" + time.hour) : time.hour);
			time.minute = ((time.minute < 10) ? ("0" + time.minute) : time.minute);
			time.second = ((time.second < 10) ? ("0" + time.second) : time.second);
			document.getElementById('timer').innerHTML = time.hour + ':' + time.minute + ':' + time.second;
			document.getElementById('pinRotate').setAttribute("style", "-webkit-transform:rotate(" + 6 * cbObject.second + "deg);");
		},
		"onFailure": function (err) {
			console.log("onFailure : errorMessage = " + err.errorMessage);
		}
	});
}