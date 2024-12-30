var downloadProgress = {
		status : "StandBy",
		progress : 0
	},
	intervalTime = 250,
	DOWNLOAD_INTERNAL_URL = 'file://internal/data.dat',
	DOWNLOAD_URL,
	TOTAL_FILE_SIZE = 0,
	LOCAL_FILE_SIZE = 0,
	LOCAL_FILE_SIZE_TEMP = 0,
	DOWNLOAD_SPEED = {},
	REMAIN_TIME;
	

var failureCb = function(cbObject) {
	var errorCode = cbObject.errorCode;
	var errorText = cbObject.errorText;
	document.getElementById('progress').innerHTML = "Error Code [" + errorCode + "]: " + errorText;
	downloadProgress.status = 'Failure';
}

// Initialize
function init() {
	document.getElementById('progress').innerHTML = "Initializing...... (Removing file)"
	
	// Delete file for download -> create new file
	var options = {
		file : DOWNLOAD_INTERNAL_URL
	};

	var storage = new Storage();
	// If remove success, do download
	// If remove failed, it means data.dat not exists. So no problem.
	storage.removeFile(downloadFile, downloadFile, options);
	
}

function downloadFile() {
	downloadProgress.status = 'Preparing download';
	document.getElementById('progress').innerHTML = downloadProgress.status;
	

	DOWNLOAD_URL = (document.getElementById('fileURL').value) === "" ?
				"http://192.168.137.1:8080/data.dat" : document.getElementById('fileURL').value; 

	getFileInfo();
	setInterval(updateProgress, intervalTime);
	
		
	var successCb = function() {
		console.log("############################## COPYFILE SUCCESS CALLBACK ###############################");
		//downloadProgress.status = 'Complete';	
		// copyFile Success Callback calls even if downloading is NOT complete
	};

	var downloadOptions = {
		source : DOWNLOAD_URL,
		destination : DOWNLOAD_INTERNAL_URL
	};

	downloadProgress.status = 'Downloading';
	var storage = new Storage();
	storage.copyFile(successCb, failureCb, downloadOptions);
}

// Get total file size from HTTP header
function getFileInfo() {
	var req = new XMLHttpRequest();
	req.open('GET', DOWNLOAD_URL, false);
	req.send(null);
	TOTAL_FILE_SIZE = parseInt(req.getResponseHeader('content-length'));
	console.log("File Size : " + TOTAL_FILE_SIZE);
}

function updateProgress() {
	LOCAL_FILE_SIZE_TEMP = LOCAL_FILE_SIZE;	
	var successCb = function(cbObject) {
		LOCAL_FILE_SIZE = cbObject.size;
		
		getDownloadSpeed();
		remainTime();
		
		downloadProgress.progress = parseInt((LOCAL_FILE_SIZE / TOTAL_FILE_SIZE) * 100);
		if (LOCAL_FILE_SIZE === TOTAL_FILE_SIZE) {
			downloadProgress.status = 'Complete';			
		}
		
		if (downloadProgress.status === 'Complete') {
			document.getElementById('progress').innerHTML = downloadProgress.progress + " %. " + downloadProgress.status;
			clearInterval(function() {setInterval(updateProgress, intervalTime);});
			document.getElementById('progressBarCurrent').style.width =  downloadProgress.progress * 10 + "px";
			document.getElementById('progressBarTotal').style.width = (100 - downloadProgress.progress) * 10 + "px";
		}
		else {

			document.getElementById('progressBarCurrent').style.width =  downloadProgress.progress * 10 + "px";
			document.getElementById('progressBarTotal').style.width = (100 - downloadProgress.progress) * 10 + "px";
			
			document.getElementById('progress').innerHTML = "Downloaded : " + (LOCAL_FILE_SIZE/1024).toFixed(0) + " / " + (TOTAL_FILE_SIZE/1024).toFixed(0) + " KB"
			                                              + " (" + downloadProgress.progress + " %" + ")<br>";
			if (DOWNLOAD_SPEED.mb >= 1)
				document.getElementById('progress').innerHTML += "Download Speed : " + DOWNLOAD_SPEED.mb + " MB/sec<br>";
			else if (DOWNLOAD_SPEED.kb >= 1)
				document.getElementById('progress').innerHTML += "Download Speed : " + DOWNLOAD_SPEED.kb + " KB/sec<br>";
			else
				document.getElementById('progress').innerHTML += "Download Speed : " + DOWNLOAD_SPEED.bytes + " Bytes/sec<br>";
			document.getElementById('progress').innerHTML += "Remaining time : " + REMAIN_TIME + " seconds";
			
		}
	};

	var options = {
		path : DOWNLOAD_INTERNAL_URL
	};

	var storage = new Storage();
	storage.statFile(successCb, failureCb, options);
}

function getDownloadSpeed() {
	DOWNLOAD_SPEED.bytes = (LOCAL_FILE_SIZE - LOCAL_FILE_SIZE_TEMP) * (1 / (intervalTime/1000));	// per second
	DOWNLOAD_SPEED.kb = (DOWNLOAD_SPEED.bytes / 1024).toFixed(2);
	DOWNLOAD_SPEED.mb = (DOWNLOAD_SPEED.kb / 1024).toFixed(2);
}

function remainTime() {
	var remain_size = TOTAL_FILE_SIZE - LOCAL_FILE_SIZE;
	var remain_time = remain_size / DOWNLOAD_SPEED.bytes;
	REMAIN_TIME = parseInt(remain_time);
}