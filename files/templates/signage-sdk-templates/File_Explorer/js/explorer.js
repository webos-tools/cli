/**
 * 
 * explorer.js
 * Defines file operations and initialize function
 * 
 */

function init() {
	helpWindow();
	document.cursor_pos = 0;
	document.cursor_screen_pos = 0;
	document.currentMaxFileNumber = 0;
	document.timeloadfile = 0;
	ROOT();
}


function printCurrentPath(pathValue) {
	document.getElementById('currentPos').innerHTML = pathValue + '/';
}

// Play Video using <video> tag
function playVideo(srcURI) {
	var videoURI = ".__temp__/____tempVideo_____.mp4";

	idcap.request("idcap://storage/file/copy", {
		"parameters": {
			"from": srcURI,
			"to": "file://internal/" + videoURI
		},
		"onSuccess": function () {
			console.log("Play Video : " + srcURI);
			isPopupExists = true;
			var newURI = "http://127.0.0.1:9080/" + videoURI;
			document.getElementById('menu_popup').style.visibility = 'visible';
			document.getElementById('menu_popup').innerHTML = "Press Blue Button to close this window<br>"
				+ "<video id = 'videoPlayer' width = 640 height= 480 autoplay loop></video>";
			document.getElementById("videoPlayer").src = newURI;
			document.getElementById("videoPlayer").load();
		},
		"onFailure": function (err) {
			console.log("Failed to load file - Path : " + srcURI);
			console.log("onFailure : errorMessage = " + err.errorMessage);

			var errorMessage = err.errorMessage;
			document.getElementById('status').innerHTML = errorMessage;
		}
	});
}


function stopVideo() {
	console.log(document.getElementById("videoPlayer").currentSrc);
	document.getElementById("videoPlayer").pause();
}

// Read common files and print hex value
function printBinary(srcURI) {
	console.log("BINARY URI : " + srcURI);
	document.getElementById('status').innerHTML = "Open file : " + srcURI + "<br>";

	idcap.request("idcap://storage/file/read", {
		"parameters": {
			"path": srcURI,
			"position": 0,
			"encoding": "binary"
		},
		"onSuccess": function (cbObject) {
			console.log("Binary read success.");

			document.getElementById('status').innerHTML = "Load file : " + srcURI;
			var dataView = new DataView(cbObject.data);
			var binary_data = [];
			for (var i = 0; i < cbObject.data.byteLength; i++) {
				binary_data[i] = ("00" + dataView.getUint8(i).toString(16)).substr(-2).toUpperCase() + ' ';
			}
			document.getElementById('contents').innerHTML = binary_data.join("");
		},
		"onFailure": function (err) {
			console.log("Failed to load file - Path : " + srcURI);
			console.log("onFailure : errorMessage = " + err.errorMessage);

			var errorMessage = err.errorMessage;
			document.getElementById('status').innerHTML = errorMessage;
		}
	});
}

// Read .txt file and print text
function printText(srcURI) {
	//	console.log("TEXT URI : " + srcURI);
	document.getElementById('status').innerHTML = "Open file : " + srcURI + "<br>";

	idcap.request("idcap://storage/file/read", {
		"parameters": {
			"path": srcURI,
			"position": 0,
			"encoding": "utf8"
		},
		"onSuccess": function (cbObject) {
			var printTextArea = document.getElementById('contents');
			console.log("Get Txt Data : \n " + cbObject.data);
			printTextArea.innerText = cbObject.data;
		},
		"onFailure": function (err) {
			console.log("Failed to print text file - Path : " + srcURI);
			console.log("onFailure : errorMessage = " + err.errorMessage);

			var errorMessage = err.errorMessage;
			document.getElementById('status').innerHTML = errorMessage;
		}
	});
}

// Draw image
function drawImage(srcURI) {
	console.log("IMAGE URI : " + srcURI);
	document.getElementById('status').innerHTML = "Open file : " + srcURI + "<br>";

	idcap.request("idcap://storage/file/read", {
		"parameters": {
			"path": srcURI,
			"position": 0,
			"encoding": "binary"
		},
		"onSuccess": function (cbObject) {
			console.log("Image read success : " + cbObject.data.byteLength + " Bytes");
			document.getElementById('status').innerHTML = "Load image : " + srcURI;
			document.getElementById('contents').innerHTML = cbObject.data;
			var binary_data = [];
			var chararray = [];

			// Get Binary Data
			var dataView = new DataView(cbObject.data);
			// Encode binary to base64

			for (var i = 0; i < cbObject.data.byteLength; i++) {
				binary_data[i] = ("00" + dataView.getUint8(i).toString(16)).substr(-2).toUpperCase();
				chararray[i] = String.fromCharCode(parseInt(binary_data[i], 16)).toString('base64');
			}
			var data_base64 = btoa(chararray.join(""));

			// Draw image
			var drawImageArea = document.getElementById('contents');
			var imageSrc = document.createElement("IMG");
			imageSrc.src = "data:image/jpeg;base64, " + data_base64.toString();
			imageSrc.onload = function () {
				console.log("IMAGE : " + imageSrc.width + " x " + imageSrc.height);
				drawImageArea.innerHTML = "<img width='423' height='906' src='" + imageSrc.src + "' >";
			}
		},
		"onFailure": function (err) {
			console.log("Failed to load image - Path : " + srcURI);
			console.log("onFailure : errorMessage = " + err.errorMessage);

			var errorMessage = err.errorMessage;
			document.getElementById('status').innerHTML = errorMessage;
		}
	});
}

// List all files and subfolders in current folder
function listFile_in_CurrentFolder(pathValue) {
	document.getElementById('status').innerHTML = "Open Folder : " + (pathValue).split("/").pop();

	document.getElementById("filetitle_name").innerHTML = "Name";
	document.getElementById("filetitle_type").innerHTML = "Type";
	document.getElementById("filetitle_size").innerHTML = "Size (Bytes)";
	document.getElementById("filetitle_ctime").innerHTML = "Create Time";
	document.getElementById("filetitle_atime").innerHTML = "Access Time";
	document.getElementById("filetitle_mtime").innerHTML = "Modify Time";

	current_path = pathValue;
	document.timeloadfile = 0;

	document.getElementById('fileList_name').innerHTML = "";
	document.getElementById('fileList_type').innerHTML = "";
	document.getElementById('fileList_size').innerHTML = "";
	document.getElementById('fileList_ctime').innerHTML = "";
	document.getElementById('fileList_atime').innerHTML = "";
	document.getElementById('fileList_mtime').innerHTML = "";

	printCurrentPath(pathValue);

	idcap.request("idcap://storage/file/list", {
		"parameters": {
			"path": pathValue
		},
		"onSuccess": function (cbObject) {
			var files = cbObject.fileList,

				/////////////////////////////////////////////////////////////////////////////
				// Root folder doesn't print "." and ".."
				//if ( (pathValue !== 'file://internal/') && (pathValue !== 'file://internal') ) {
				isRoot = false;
			document.getElementById('fileList_size').innerHTML += "<br>";
			document.getElementById('fileList_name').innerHTML += " <div id = 'fileid0' class = 'filename_select'>" + "<font color = #FFFFAA>" + '.' + ' </font></div>';
			document.getElementById('fileList_type').innerHTML += '<div id = "typeid0"><font color = #FFFFAA>Folder </font></div>';

			var previousFolderPath = pathValue.slice(0, -1 * (((pathValue).split("/")).pop().length + 1))
			document.getElementById('fileList_size').innerHTML += "<br>";
			document.getElementById('fileList_name').innerHTML += " <div id = 'fileid1'  class = 'filename_select'>" + "<font color = #FFFFAA>" + '..' + ' </font></div>';
			document.getElementById('fileList_type').innerHTML += '<div id = "typeid1"><font color = #FFFFAA>Folder </font></div>';

			document.getElementById('fileList_ctime').innerHTML += "<br><br>";
			document.getElementById('fileList_atime').innerHTML += "<br><br>";
			document.getElementById('fileList_mtime').innerHTML += "<br><br>";
			//}
			/////////////////////////////////////////////////////////////////////////////

			for (var i = 0; i < files.length; ++i) {
				var fileInfo = files[i],
					nextPath = pathValue + "/" + fileInfo.name,
					index = i;

				if (!isRoot) {
					index += 2;
				}

				////////////////////////////////////////////////////////////////////////////////////////////
				// Get file stats (create / access / modified time)
				idcap.request("idcap://storage/file/stat", {
					"parameters": {
						"path": nextPath
					},
					"onSuccess": function (cbObject) {
						document.getElementById('fileList_ctime').innerHTML += fileName.ctime.slice(0, 10)
							+ " " + fileName.ctime.slice(11, 19) + "<br>";
						document.getElementById('fileList_atime').innerHTML += fileName.atime.slice(0, 10)
							+ " " + fileName.atime.slice(11, 19) + "<br>";
						document.getElementById('fileList_mtime').innerHTML += fileName.mtime.slice(0, 10)
							+ " " + fileName.mtime.slice(11, 19) + "<br>";
						document.timeloadfile++;
						if (document.timeloadfile === files.length) {
							document.getElementById('fileList_ctime').innerHTML += "<br><br><br>";
							document.getElementById('fileList_atime').innerHTML += "<br><br><br>";
							document.getElementById('fileList_mtime').innerHTML += "<br><br><br>";

						}
					},
					"onFailure": function (err) {
						console.log("Failed to get stat files. Path : " + nextPath);
						console.log("onFailure : errorMessage = " + err.errorMessage);

						var errorMessage = err.errorMessage;
						document.getElementById('fileInfo').innerHTML = errorMessage;
					}
				});
				////////////////////////////////////////////////////////////////////////////////////////////

				switch (fileInfo.type) {

					// If folder ('D' means folder)
					case 'D':

						document.getElementById('fileList_size').innerHTML += "<br>";
						document.getElementById('fileList_name').innerHTML += " <div id = 'fileid" + index + "'  class = 'filename_select'>" +
							"<font color = " + FILETYPE_COLOR_FOLDER + ">" + fileInfo.name + ' </font></div>';
						document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
							"<font color = " + FILETYPE_COLOR_FOLDER + ">Folder </font></div>";
						break;

					// Else if file
					default:
						document.getElementById('fileList_size').innerHTML += fileInfo.size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " <br>";
						var extension = ((fileInfo.name).split(".")).pop().toLowerCase();
						if ((fileInfo.name).split(".").length == 1)
							extension = "";

						switch (extension) {
							///////////////////////////////
							// ZIP File
							case 'zip':
								document.getElementById('fileList_name').innerHTML += "<div id = 'fileid" + index + "' class = 'filename_select'>" +
									"<font color = " + FILETYPE_COLOR_ZIP + ">" + fileInfo.name + ' </font></div>';
								document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
									"<font color = " + FILETYPE_COLOR_ZIP + ">ZIP File </font></div>";
								break;
							///////////////////////////////
							// HTML File
							case 'htm':
							case 'html':
								document.getElementById('fileList_name').innerHTML += "<div id = 'fileid" + index + "' class = 'filename_select'>" +
									"<font color = " + FILETYPE_COLOR_HTML + ">" + fileInfo.name + ' </font></div>';
								document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
									"<font color = " + FILETYPE_COLOR_HTML + ">HTML File </font></div>";
								break;
							///////////////////////////////
							// Text File
							case 'txt':
								document.getElementById('fileList_name').innerHTML += "<div id = 'fileid" + index + "' class = 'filename_select'>" +
									"<font color = " + FILETYPE_COLOR_TEXT + ">" + fileInfo.name + ' </font></div>';
								document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
									"<font color = " + FILETYPE_COLOR_TEXT + ">Text File </font></div>";
								break;
							///////////////////////////////
							// Image Files (Logo available)
							case 'jpg':		// FALL-THROUGH
							case 'jpeg':	// FALL-THROUGH
							case 'bmp':		// FALL-THROUGH
								document.getElementById('fileList_name').innerHTML += "<div id = 'fileid" + index + "'  class = 'filename_select'>" +
									"<font color = " + FILETYPE_COLOR_IMAGE_LOGO_AVAILABLE + ">" + fileInfo.name + ' </font></div>';
								document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
									"<font color = " + FILETYPE_COLOR_IMAGE_LOGO_AVAILABLE + ">Image File </font></div>";

								break;
							/////////////////////////////
							// Image Files
							case 'gif':		// FALL-THROUGH
							case 'bmp':		// FALL-THROUGH
							case 'png':		// FALL-THROUGH
								document.getElementById('fileList_name').innerHTML += "<div id = 'fileid" + index + "'  class = 'filename_select'>" +
									"<font color = " + FILETYPE_COLOR_IMAGE + ">" + fileInfo.name + ' </font></div>';
								document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
									"<font color = " + FILETYPE_COLOR_IMAGE + ">Image File </font></div>";
								break;
							///////////////////////////////
							// Video File
							case 'mp4':
								document.getElementById('fileList_name').innerHTML += "<div id = 'fileid" + index + "' class = 'filename_select'>" +
									"<font color = " + FILETYPE_COLOR_VIDEO + ">" + fileInfo.name + ' </font></div>';
								document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
									"<font color = " + FILETYPE_COLOR_VIDEO + ">Video File </font></div>";
								break;
							///////////////////////////////
							// Default File
							default:
								document.getElementById('fileList_name').innerHTML += "<div id = 'fileid" + index + "'  class = 'filename_select'>" +
									"<font color = " + FILETYPE_COLOR_NORMALFILE + ">" + fileInfo.name + ' </font></div>';
								document.getElementById('fileList_type').innerHTML += " <div id = 'typeid" + index + "'>" +
									"<font color = " + FILETYPE_COLOR_NORMALFILE + "> File </font></div>";
								break;
						}


						break;
				}
			}
			document.getElementById('fileid0').style.background = '#C70752';

			// For scrolling down
			document.getElementById('fileList_name').innerHTML += "<br><br><br>";
			document.getElementById('fileList_type').innerHTML += "<br><br><br>";
			document.getElementById('fileList_size').innerHTML += "<br><br><br>";

			controller(files.length, pathValue, isRoot);
		},
		"onFailure": function (err) {
			console.log("Failed to get list files. Path : " + pathValue);
			console.log("onFailure : errorMessage = " + err.errorMessage);

			var errorMessage = err.errorMessage;
			document.getElementById('fileInfo').innerHTML = errorMessage;
		}
	});
}

// Utility function
function sleep(num) { // unit : ms
	var now = new Date();
	var stop = now.getTime() + num;
	while (true) {
		now = new Date();
		if (now.getTime() > stop)
			return;
	}
}