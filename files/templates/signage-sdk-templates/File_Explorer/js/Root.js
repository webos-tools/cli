function ROOT() {
	isRoot = true;
	var numOfDevice = 1;

	idcap.request("idcap://storage/info/get", {
		"parameters": {},
		"onSuccess": function (cbObject) {
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
			document.getElementById('fileList_name').innerHTML = " <div id = 'fileid0' class = 'filename_select'>" + "<font color = #FF0000>" + 'INTERNAL' + ' </font></div>';
			document.getElementById('fileList_type').innerHTML = '<div id = "typeid0"><font color = #FF0000>Device </font></div>';

			document.getElementById('fileList_ctime').innerHTML = cbObject.internal.free.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KB<br>";
			document.getElementById('fileList_atime').innerHTML = cbObject.internal.used.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KB<br>";
			document.getElementById('fileList_mtime').innerHTML = cbObject.internal.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KB<br>";

			document.getElementById('status').innerHTML = numOfDevice + " device storage(s)  detected.";
			document.getElementById('fileid0').style.background = '#C70752';
			controller(numOfDevice, "ROOT", isRoot);
		},
		"onFailure": function (err) {
			console.log("onFailure : errorMessage = " + err.errorMessage);

			var errorMessage = err.errorMessage;
			document.getElementById('fileInfo').innerHTML = errorMessage;
		}
	});
}