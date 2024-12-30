var VIDEO_FILE_1_FROM_REMOTE = "http://signup.lge.com/Update/Update_Release/CDTechSupport/Content/content/video-1.mp4",
	VIDEO_FILE_2_FROM_REMOTE = "http://signup.lge.com/Update/Update_Release/CDTechSupport/Content/content/video-2.mp4",
	VIDEO_FILE_3_FROM_REMOTE = "http://signup.lge.com/Update/Update_Release/CDTechSupport/Content/content/video-3.mp4",
	VIDEO_FILE_1_LOCAL = "file://internal/video/video1.mp4",
	VIDEO_FILE_2_LOCAL = "file://internal/video/video2.mp4",
	VIDEO_FILE_3_LOCAL = "file://internal/video/video3.mp4",
	VIDEO_FILE_1_PLAY_URI = "http://127.0.0.1:9080/video/video1.mp4",
	VIDEO_FILE_2_PLAY_URI = "http://127.0.0.1:9080/video/video2.mp4",
	VIDEO_FILE_3_PLAY_URI = "http://127.0.0.1:9080/video/video3.mp4",
	VIDEO_NOT_PLAYING = "VIDEO_IS_NOT_PLAYING",
	VIDEO_PLAYING_1 = "VIDEO_1_IS_PLAYING",
	VIDEO_PLAYING_2 = "VIDEO_2_IS_PLAYING",
	VIDEO_PLAYING_3 = "VIDEO_3_IS_PLAYING",
	videoScheduleTable,
	currentMovieID,
	selectedTime = {};


function initVideoPlayer() {

	document.getElementById('scheduler').innerHTML = "";

	videoScheduleTable = new Array(24);
	for (var M = 0; M < 6; M++) {
		for (var H = 0; H < 24; H++) {
			if (M == 0)
				videoScheduleTable[H] = new Array(6);
			videoScheduleTable[H][M] = 0;
			document.getElementById('scheduler').innerHTML += "<div id = 'schedule" + H + "_" + M + "' class = 'scheduleEach' " +
				"style = 'float:left;'>" + H + ":" + M + "0" +
				"<div id = 'scheduleContent" + H + "_" + M +
				"' style = 'color: #C70752; font-size:400%'> </div>" +
				"</div>";
		}
	}
	document.getElementById("schedule0_0").style.backgroundColor = "#808080";
	console.log("Downloading video start.1111111.....");
	downloadVideoFile();
	console.log("Downloading video start.22222222.....");
	setInterval(interval, 1000);
	selectedTime.hour = 0;
	selectedTime.minute = 0;
	remocon();
}


function interval() {
	getTime();
}

function getTime(doNow) {
	if(IDCAP_webOSVersion())
    {
		idcap.request( "idcap://time/currenttime/get" , {
		"parameters": {},
		"onSuccess": function (cbObject) {

			var hour = cbObject.hour,
				minute = cbObject.minute,
				sec = cbObject.second;
			document.getElementById('currentTime').innerHTML = (hour < 10 ? ('0' + hour) : hour);
			document.getElementById('currentTime').innerHTML += ':' + (minute < 10 ? ('0' + minute) : minute);
			document.getElementById('currentTime').innerHTML += ':' + (sec < 10 ? ('0' + sec) : sec) + "<br>";
			document.getElementById('currentTime').innerHTML += cbObject.month + ". " + cbObject.day + ". " + cbObject.year;
			if (((minute % 10 == 0) && (sec % 60 == 0)) || doNow === true)
				doVideoSchedule(cbObject);
		},
		"onFailure": function (err) {
			console.log("onFailure : errorMessage = " + err.errorMessage);
		}
		});
	}
	else
	{
		function successCb(cbObject) {
			var hour = cbObject.hour,
				minute = cbObject.minute,
				sec = cbObject.sec;
			document.getElementById('currentTime').innerHTML = (hour < 10 ? ('0' + hour) : hour);
			document.getElementById('currentTime').innerHTML += ':' + (minute < 10 ? ('0' + minute) : minute);
			document.getElementById('currentTime').innerHTML += ':' + (sec < 10 ? ('0' + sec) : sec) + "<br>";
			document.getElementById('currentTime').innerHTML += cbObject.month + ". " + cbObject.day + ". " + cbObject.year;
			if (((minute % 10 == 0) && (sec % 60 == 0)) || doNow === true)
				doVideoSchedule(cbObject);
		}

		function failureCb(cbObject) {
			var errorCode = cbObject.errorCode;
			var errorText = cbObject.errorText;

			console.log("Error Code [" + errorCode + "]: " + errorText);
		}

		var configuration = new Configuration();
		configuration.getCurrentTime(successCb, failureCb);
	}
		
}

function doVideoSchedule(time) {
	var movieID = videoScheduleTable[time.hour][parseInt(time.minute / 10)];

	if (currentMovieID !== movieID) {
		switch (movieID) {
			case 1:
				playVideo(VIDEO_FILE_1_LOCAL);
				break;
			case 2:
				playVideo(VIDEO_FILE_2_LOCAL);
				break;
			case 3:
				playVideo(VIDEO_FILE_3_LOCAL);
				break;
		}
	}
}

function playVideo(videoFile) {
	if(IDCAP_webOSVersion())
    {
		idcap.request( "idcap://storage/file/stat" , {
		"parameters": {
			"path" : videoFile
		},
		"onSuccess": function (cbObject) {

			console.log("idcap Playing video...... : " + videoFile);
			switch (videoFile) {
				case VIDEO_FILE_1_LOCAL:
					currentMovieID = 1;
					document.getElementById('videoPlayer').src = VIDEO_FILE_1_PLAY_URI;
					document.getElementById('status').innerHTML = "Playing Video 1......";
					break;
				case VIDEO_FILE_2_LOCAL:
					currentMovieID = 2;
					document.getElementById('videoPlayer').src = VIDEO_FILE_2_PLAY_URI;
					document.getElementById('status').innerHTML = "Playing Video 2......";
					break;
				case VIDEO_FILE_3_LOCAL:
					currentMovieID = 3;
					document.getElementById('videoPlayer').src = VIDEO_FILE_3_PLAY_URI;
					document.getElementById('status').innerHTML = "Playing Video 3......";
					break;
			}
			var size;
			try {
				if (cbObject.size) { size = cbObject.size }
				else if (cbObject.stat.size) { size = cbObject.stat.size }
			}
			catch (err) {
				size = 'Unknown';
	
			}
	
			document.getElementById('status_detail').innerHTML = "Size : " + (size / 1048576).toFixed(2) + " MB";
			document.getElementById('videoPlayer').load();
		},
		"onFailure": function (err) {
			console.log("onFailure : errorMessage = " + err.errorMessage);
		}
		});
	}
	else
	{
		var successCb = function (cbObject) {
			console.log("Playing video...... : " + videoFile);
			switch (videoFile) {
				case VIDEO_FILE_1_LOCAL:
					currentMovieID = 1;
					document.getElementById('videoPlayer').src = VIDEO_FILE_1_PLAY_URI;
					document.getElementById('status').innerHTML = "Playing Video 1......";
					break;
				case VIDEO_FILE_2_LOCAL:
					currentMovieID = 2;
					document.getElementById('videoPlayer').src = VIDEO_FILE_2_PLAY_URI;
					document.getElementById('status').innerHTML = "Playing Video 2......";
					break;
				case VIDEO_FILE_3_LOCAL:
					currentMovieID = 3;
					document.getElementById('videoPlayer').src = VIDEO_FILE_3_PLAY_URI;
					document.getElementById('status').innerHTML = "Playing Video 3......";
					break;
			}
			var size;
			try {
				if (cbObject.size) { size = cbObject.size }
				else if (cbObject.stat.size) { size = cbObject.stat.size }
			}
			catch (err) {
				size = 'Unknown';
	
			}
	
			document.getElementById('status_detail').innerHTML = "Size : " + (size / 1048576).toFixed(2) + " MB";
			document.getElementById('videoPlayer').load();
		};
	
		var failureCb = function (cbObject) {
			var errorCode = cbObject.errorCode;
			var errorText = cbObject.errorText;
			console.error(" Error Code [" + errorCode + "]: " + errorText);
		};
	
		var options = {
			path: videoFile
		};
	
		var storage = new Storage();
		storage.statFile(successCb, failureCb, options);
	}
	
}

async function downloadVideoFile()
{
	
	console.log("Downloading video start......");
	if(IDCAP_webOSVersion())
    {
		await idcap.request( "idcap://storage/file/download" , {
			"parameters": {
				"action" : 'start',
				"source" : VIDEO_FILE_1_FROM_REMOTE,
				"destination" : VIDEO_FILE_1_LOCAL,
				"httpOption" : {
					"maxRedirection" : 5
				}
			}
		}).then(await function (cbObject) {
			console.log("1st Ticket: " + cbObject.ticket);
			return idcap.request( "idcap://storage/file/download" , {
				"parameters": {
					"action" : 'start',
					"source" : VIDEO_FILE_2_FROM_REMOTE,
					"destination" : VIDEO_FILE_2_LOCAL,
					"httpOption" : {
						"maxRedirection" : 5
					}
				}
			})
		}).then(await function (cbObject) {
			console.log("2nd Ticket: " + cbObject.ticket);
			return idcap.request( "idcap://storage/file/download" , {
						"parameters": {
							"action" : 'start',
							"source" : VIDEO_FILE_3_FROM_REMOTE,
							"destination" : VIDEO_FILE_3_LOCAL,
							"httpOption" : {
								"maxRedirection" : 5
							}
						}
			})
		}).then(await function (cbObject) {
			console.log("3rd Ticket: " + cbObject.ticket);
		})
		.catch(function (err) {
			console.log("onFailure : errorMessage = " + err.errorMessage);
		})

		var vd1=0, vd2=0, vd3=0;
		document.addEventListener(
			"idcap::file_downloaded",
			function (param) {
				console.log(
					"Event 'file_downloaded' is received.\n" +
					"Result = " + param.result + "\n" +
					"Error message = " + param.errorMessage + "\n" +
					"uri = " + param.uri + "\n" +
					"Download path = " + param.downloadPath
				);
				switch(param.downloadPath) {
					case VIDEO_FILE_1_LOCAL:
						vd1 = 1; 
						console.log("Download video 1 done.");
						document.getElementById('status').innerHTML = "Download video 1 done.";
						document.getElementById('status_detail').innerHTML = VIDEO_FILE_1_LOCAL;
						break;
					case VIDEO_FILE_2_LOCAL:
						vd2 = 1;
						console.log("Download video 2 done.");
						document.getElementById('status').innerHTML = "Download video 2 done.";
						document.getElementById('status_detail').innerHTML = VIDEO_FILE_2_LOCAL;
						break;
					case VIDEO_FILE_3_LOCAL:
						vd3 = 1;
						console.log("Download video 3 done.");
						document.getElementById('status').innerHTML = "Download video 3 done.";
						document.getElementById('status_detail').innerHTML = VIDEO_FILE_3_LOCAL;
						break;
				}
				if(vd1 === 1 && vd2 === 1 && vd3 === 1 )
				{
					playVideo(VIDEO_FILE_1_LOCAL);
				}	
			},
			false
		   );
	}
	else
	{
		var failureCb = function (cbObject) {
			var errorCode = cbObject.errorCode;
			var errorText = cbObject.errorText;
			console.error(" Error Code [" + errorCode + "]: " + errorText);
			document.getElementById('status').innerHTML = "Download Failed.";
			document.getElementById('status_detail').innerHTML = "Check your Internet connection.";
		};
	
		var successCb_downloadDone_1 = function () {
			console.log("Download video 1 done.");
			document.getElementById('status').innerHTML = "Download video 1 done.";
			document.getElementById('status_detail').innerHTML = VIDEO_FILE_1_LOCAL;
	
			var successCb_downloadDone_2 = function () {
				console.log("Download video 2 done.");
				document.getElementById('status').innerHTML = "Download video 2 done.";
				document.getElementById('status_detail').innerHTML = VIDEO_FILE_2_LOCAL;
	
				var successCb_downloadDone_3 = function () {
					console.log("Download video 3 done.");
					document.getElementById('status').innerHTML = "Download video 3 done.";
					document.getElementById('status_detail').innerHTML = VIDEO_FILE_3_LOCAL;
					playVideo(VIDEO_FILE_1_LOCAL);
				};
				var download_3 = {
					source: VIDEO_FILE_3_FROM_REMOTE,
					destination: VIDEO_FILE_3_LOCAL
				};
	
				var storage = new Storage();
				storage.copyFile(successCb_downloadDone_3, failureCb, download_3);
	
			};
			var download_2 = {
				source: VIDEO_FILE_2_FROM_REMOTE,
				destination: VIDEO_FILE_2_LOCAL
			};
	
			var storage = new Storage();
			storage.copyFile(successCb_downloadDone_2, failureCb, download_2);
		}
	
		var download_1 = {
			source: VIDEO_FILE_1_FROM_REMOTE,
			destination: VIDEO_FILE_1_LOCAL
		};
	
		var storage = new Storage();
		storage.copyFile(successCb_downloadDone_1, failureCb, download_1);
	}
	
}
