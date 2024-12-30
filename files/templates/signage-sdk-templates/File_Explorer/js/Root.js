/**
 * 
 * Root.js
 * Get each storage information(total/free/used size), and open selected storage
 * 
 */

var isRoot;

function ROOT() {
	isRoot = true;
	var numOfDevice = 1;
	var ROOTsuccessCb = function(cbObject) {
		document.getElementById("filetitle_name").innerHTML = "Name";
		document.getElementById("filetitle_type").innerHTML = "Type";
		document.getElementById("filetitle_size").innerHTML = "";
		document.getElementById("filetitle_ctime").innerHTML = "Free Size"; 
		document.getElementById("filetitle_atime").innerHTML = "Used Size"; 
		document.getElementById("filetitle_mtime").innerHTML = "Total Size";
		
		document.getElementById('fileList_size').innerHTML = "";
		
		document.getElementById('currentPos').innerHTML = "File Explorer for webOS Signage";
		
		////////////////////////////////////////////////////////////////////////////////
		// Internal Memory Status
		document.getElementById('fileList_name').innerHTML  = " <div id = 'fileid0' class = 'filename_select'>" + "<font color = #FF0000>" + 'INTERNAL' + ' </font></div>';
		document.getElementById('fileList_type').innerHTML  = '<div id = "typeid0"><font color = #FF0000>Device </font></div>';
		
		document.getElementById('fileList_ctime').innerHTML = cbObject.free.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KB<br>";
		document.getElementById('fileList_atime').innerHTML = cbObject.used.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KB<br>";
		document.getElementById('fileList_mtime').innerHTML = cbObject.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KB<br>";
	
		//////////////////////////////////////////////////////////////////////////////
		// USB Memory Status (if exists)
		/*
		if (cbObject.externalMemory['usb:1'].total) {
			numOfDevice++;
			document.getElementById('fileList_name').innerHTML +=" <div id = 'fileid1' class = 'filename_select'>" + "<font color = #FF0000>" + 'USB' + ' </font></div>';
			document.getElementById('fileList_type').innerHTML += '<div id = "typeid1"><font color = #FF0000>Device </font></div>';
			document.getElementById('fileList_ctime').innerHTML += cbObject.externalMemory['usb:1'].free + " KB<br>";
			document.getElementById('fileList_atime').innerHTML += cbObject.externalMemory['usb:1'].used + " KB<br>";
			document.getElementById('fileList_mtime').innerHTML += cbObject.externalMemory['usb:1'].total + " KB<br>";
			
		}
		*/
		//////////////////////////////////////////////////////////////////////////////
		document.getElementById('status').innerHTML = numOfDevice + " device storage(s)  detected.";
		document.getElementById('fileid0').style.background =  '#C70752';
		controller(numOfDevice, "ROOT", isRoot);
	}
	
	var ROOTfailureCb = function (cbObject) {
		console.log("Failed to load image - Path : " + srcURI);

		var errorCode = cbObject.errorCode,
		    errorText = cbObject.errorText,
		    errorMessage = "Error Code [" + errorCode + "]: " + errorText;
			console.log(errorMessage);
			document.getElementById('fileInfo').innerHTML = errorMessage;
		
	}
	

	var storage = new Storage();
	storage.getStorageInfo(ROOTsuccessCb, ROOTfailureCb);
}