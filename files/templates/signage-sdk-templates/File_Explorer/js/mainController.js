/**
 * 
 * mainController.js
 * Define remote controller operations
 * 
 */

//Current Mode
var current_mode = MODE_EXPLORER;
var isRemoveAll;
var isMkdir;
var RemoveAllDevice = "___NULL___";


function controller(maxFileListLength, pathValue, isRoot) {
	document.onkeydown = function (event) {
		var keyCode = event.keyCode,
			filename = document.getElementById('fileid' + document.cursor_pos).innerText,
			filetype = document.getElementById('typeid' + document.cursor_pos).innerText,
			maxIndexValue = isRoot ? maxFileListLength : maxFileListLength + 2;

		//console.log("KeyCode : " + keyCode);

		document.currentMaxFileNumber = maxIndexValue;
		///////////////////////////////////////////////////////////////////////////////////////
		//
		// Explorer Mode

		if (current_mode === MODE_EXPLORER) {
			switch (keyCode) {

				case BUTTON_OK:
					var param = {
						path_Value: pathValue,	// Current directory
						file_name: filename,		// Current selected file or folder
						is_Root: isRoot			// Current directory is root?
					};

					explorerController(param, keyCode, filetype);
					break;

				case BUTTON_UP:
				case BUTTON_DOWN:
				case BUTTON_LEFT:
				case BUTTON_RIGHT:
					var param = {
						file_name: filename,
						file_type: filetype,
						max_IndexValue: maxIndexValue
					};
					explorerController(param, keyCode, filetype);
					break;

				case key_Q:
				case BUTTON_YELLOW:
					explorerController(null, keyCode, null);
					break;
				case key_W:
				case BUTTON_BLUE:
					explorerController(null, keyCode, null);
					break;

				case BUTTON_1:
					explorerController(current_path + '/' + filename, keyCode, filetype);
					break;
				case BUTTON_2:
					if (CLIPBOARD_EMPTY !== clipboard_path)
						explorerController(current_path, keyCode, filetype);
					break;
				case BUTTON_3:
					if (CLIPBOARD_EMPTY !== clipboard_path)
						explorerController(current_path, keyCode, filetype);
					break;
				case BUTTON_4:
					explorerController(current_path + '/' + filename, keyCode, filetype);
					break;
				case BUTTON_5:
					explorerController(null, keyCode, null);
					break;
				case BUTTON_6:
					explorerController(current_path + '/' + filename, keyCode, filetype);
					break;
				case BUTTON_7:
					explorerController(current_path + '/' + filename, keyCode, filetype);
					break;
				case BUTTON_0:
					explorerController(current_path, keyCode, null);
					break;
			}
			for (var i = 0; i < maxIndexValue; i++) {
				if (document.getElementById('fileid' + i)) {
					document.getElementById('fileid' + i).removeAttribute("style");
					if (i === document.cursor_pos)
						document.getElementById('fileid' + document.cursor_pos).style.background = '#C70752';
				}
			}

		}

		///////////////////////////////////////////////////////////////////////////////////////
		//
		// Help Mode

		else if (current_mode === MODE_HELP) {
			switch (keyCode) {
				case key_W:
				case BUTTON_BLUE:
					current_mode = MODE_EXPLORER;
					isPopupExists = false;
					document.getElementById('menu_popup').style.visibility = 'hidden';
					break;
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////
		//
		// RemoveAll Mode

		else if (current_mode === MODE_REMOVEALL) {
			switch (keyCode) {
				case BUTTON_UP:
					isRemoveAll = true;
					document.getElementById('removeAllYes').removeAttribute("style");
					document.getElementById('removeAllNo').removeAttribute("style");
					document.getElementById('removeAllYes').style.background = MENU_SELECTED;
					break;

				case BUTTON_DOWN:
					isRemoveAll = false;
					document.getElementById('removeAllYes').removeAttribute("style");
					document.getElementById('removeAllNo').removeAttribute("style");
					document.getElementById('removeAllNo').style.background = MENU_SELECTED;
					break;

				case BUTTON_OK:
					console.log("isRemoveAll[ENTER] = " + isRemoveAll);
					if (isRemoveAll) {
						idcap.request("idcap://storage/file/remove", {
							// removing a Directory or file
							"parameters": {
								"path": "file://" + RemoveAllDevice + "/",
								"recursive": true
							},
							"onSuccess": function () {
								document.getElementById('menu_popup').innerHTML = "" +
									"<br><br>" +
									"Remove all data.<br>";

								isPopupExists = false;
								sleep(3000);
								document.getElementById('menu_popup').style.visibility = 'hidden';
								current_mode = MODE_EXPLORER;
								RemoveAllDevice = "___NULL___";
								ROOT();
							},
							"onFailure": function (err) {
								document.getElementById('status').innerHTML = "Fail to remove all data : " + RemoveAllDevice;
								listFile_in_CurrentFolder(current_path);
							}
						});
					}
					else {
						current_mode = MODE_EXPLORER;
						isPopupExists = false;
						document.getElementById('menu_popup').style.visibility = 'hidden';
						break;
					}
					break;

				case key_W:
				case BUTTON_BLUE:
					current_mode = MODE_EXPLORER;
					isPopupExists = false;
					document.getElementById('menu_popup').style.visibility = 'hidden';
					break;
			}
			console.log("isRemoveAll = " + isRemoveAll);
		}
		///////////////////////////////////////////////////////////////////////////////////////
		//
		// Mkdir Mode

		else if (current_mode === MODE_MKDIR) {
			switch (keyCode) {
				case BUTTON_UP:
					isMkdir = true;
					document.getElementById('mkdirYes').removeAttribute("style");
					document.getElementById('mkdirNo').removeAttribute("style");
					document.getElementById('mkdirYes').style.background = MENU_SELECTED;
					break;

				case BUTTON_DOWN:
					isMkdir = false;
					document.getElementById('mkdirYes').removeAttribute("style");
					document.getElementById('mkdirNo').removeAttribute("style");
					document.getElementById('mkdirNo').style.background = MENU_SELECTED;
					break;

				case BUTTON_OK:
					if (isMkdir) {
						if (document.getElementById('dirname').value === "")
							break;

						idcap.request("idcap://storage/file/mkdir", {
							"parameters": {
								"path": current_path + '/' + document.getElementById('dirname').value
							},
							"onSuccess": function () {
								isPopupExists = false;
								document.getElementById('menu_popup').style.visibility = 'hidden';
								console.log("MKDIR SUCCESS");
								current_mode = MODE_EXPLORER;
								mkdirDevice = "___NULL___";
								document.getElementById('status').innerHTML = 'Make Directory :<br>' + document.getElementById('dirname').value;
								document.cursor_pos = 0;

								document.getElementById('dirname').remove();
								listFile_in_CurrentFolder(current_path);
							},
							"onFailure": function (err) {
								console.log("onFailure : errorMessage = " + err.errorMessage);
								document.getElementById('status').innerHTML = "Fail to make directory : " + mkdirDevice;
								listFile_in_CurrentFolder(current_path);
							}
						});
					}
					else {
						current_mode = MODE_EXPLORER;
						isPopupExists = false;
						document.getElementById('menu_popup').style.visibility = 'hidden';
						break;
					}
					break;

				case key_W:
				case BUTTON_BLUE:
					current_mode = MODE_EXPLORER;
					isPopupExists = false;
					document.getElementById('menu_popup').style.visibility = 'hidden';
					break;
			}
		}


		///////////////////////////////////////////////////////////////////////////////////////
		//
		// Play Video Mode

		else if (current_mode === MODE_PLAYVIDEO) {
			switch (keyCode) {
				case key_W:
				case BUTTON_BLUE:
					current_mode = MODE_EXPLORER;
					stopVideo();
					isPopupExists = false;
					document.getElementById('menu_popup').style.visibility = 'hidden';
					break;
			}
		}
	}
}
