/**
 * 
 * explorerController.js
 * Defines remote operations of explorer mode
 * 
 */

////////////// TEST FOR PC
var key_Q = 81;
var key_W = 87;


/////////////////////////////
// If popup menu is exists
var isPopupExists = false

/////////////////////////////
// Clipboard define
var CLIPBOARD_EMPTY = "__EMPTY__",
    clipboard_path = CLIPBOARD_EMPTY,
    clipboard_file = CLIPBOARD_EMPTY,
    clipboard_type = CLIPBOARD_EMPTY;
 

function explorerController(param, pressed_button, filetype) {
	
	var storage = new Storage(),
	    errorMessage;
	
	
	// If any failure occur, print error message and go to root.
	var popupMenuFailureCb = function (cbObject) {
		var errorCode = cbObject.errorCode,
		    errorText = cbObject.errorText;
			console.log("Error Code [" + errorCode + "]: " + errorText);
		document.getElementById('fileInfo').innerHTML = errorMessage;
		document.cursor_pos = 0;
		ROOT();
	}
	
	switch(pressed_button) {
    
	// Open file, folder, or device
	case BUTTON_OK:
		// Open device
    	if (param.is_Root) {
    		document.cursor_pos = 0;
    		document.cursor_screen_pos = 0;
    		if (param.file_name == 'INTERNAL')
    			listFile_in_CurrentFolder('file://internal');
    		else if (param.file_name  == 'USB') 
    			listFile_in_CurrentFolder('file://usb:1');
    		isRoot = false;
    	}
    	
    	// Open folder
    	else if ('Folder' == (document.getElementById('typeid' + document.cursor_pos).innerText)) {
		    document.getElementById('status').innerHTML = "Open folder : " + param.file_name ;
			if ('.' == param.file_name )
				listFile_in_CurrentFolder(current_path);
			else if ('..' == param.file_name ) {
				
		    	if ( (param.path_Value === 'file://internal') || (param.path_Value === 'file://usb:1') ){
		    		document.cursor_screen_pos = 0;
		    		document.cursor_pos = 0;
		    		ROOT();
		    		break;
		    	}
				var previousFolderPath = param.path_Value.slice(0, -1 * (((param.path_Value).split("/")).pop().length + 1))
				listFile_in_CurrentFolder(previousFolderPath);
			} else {
				listFile_in_CurrentFolder(current_path + '/' + param.file_name );
			}
			document.cursor_screen_pos = 0;
			document.cursor_pos = 0;
		}
    	
    	// Open file
		else if ('Text File' == (document.getElementById('typeid' + document.cursor_pos).innerText)){
			document.getElementById('status').innerHTML = "Open text file : " + param.file_name;
			printText(param.path_Value + '/' + param.file_name);
		}
			 		
		else if ('Image File' == (document.getElementById('typeid' + document.cursor_pos).innerText)){
			document.getElementById('status').innerHTML = "Open image file : " + param.file_name;
			drawImage(param.path_Value + '/' + param.file_name);	
		}
 		
		else if ('Video File' == (document.getElementById('typeid' + document.cursor_pos).innerText)){
			document.getElementById('status').innerHTML = "Open Video file : " + param.file_name;
			current_mode = MODE_PLAYVIDEO;
			playVideo(param.path_Value + '/' + param.file_name);
		}
    	
		else {
			document.getElementById('status').innerHTML = "Open file : " + param.file_name;
			printBinary(param.path_Value + '/' + param.file_name);			
		}
		
		
		break;
		
	///////////////////////////////////////////////////////////////////////////
	// Choose item
	case BUTTON_UP:
		if (document.cursor_pos > 0)
			document.cursor_pos--;
		document.cursor_screen_pos--;
		if (document.cursor_screen_pos < 0)
			document.cursor_screen_pos = 0;
		
		
		if ( (document.cursor_screen_pos === 0) ) { 
			document.getElementById('fileList_name').scrollTop -= SCROLL_SPEED;
			document.getElementById('fileList_type').scrollTop -= SCROLL_SPEED;
			document.getElementById('fileList_size').scrollTop -= SCROLL_SPEED;
			document.getElementById('fileList_ctime').scrollTop -= SCROLL_SPEED;
			document.getElementById('fileList_atime').scrollTop -= SCROLL_SPEED;
			document.getElementById('fileList_mtime').scrollTop -= SCROLL_SPEED;
		}
		
		break;

	case BUTTON_DOWN:
		if (document.cursor_pos < param.max_IndexValue - 1)
			document.cursor_pos++;
		document.cursor_screen_pos++;
		if (document.cursor_screen_pos > MAX_LINE)
			document.cursor_screen_pos = MAX_LINE;	
		if ( (document.cursor_screen_pos === MAX_LINE) ) { 
			document.getElementById('fileList_name').scrollTop += SCROLL_SPEED;
			document.getElementById('fileList_type').scrollTop += SCROLL_SPEED;
			document.getElementById('fileList_size').scrollTop += SCROLL_SPEED;
			document.getElementById('fileList_ctime').scrollTop += SCROLL_SPEED;
			document.getElementById('fileList_atime').scrollTop += SCROLL_SPEED;
			document.getElementById('fileList_mtime').scrollTop += SCROLL_SPEED;
		}
		
		break;
		

	case BUTTON_LEFT:
		if (document.cursor_pos > 0)
			document.cursor_pos -= MAX_LINE;
		if (document.cursor_pos < 0)
			document.cursor_pos = 0;
		document.getElementById('status').innerHTML = "Selected ";
		if ('Folder' == (document.getElementById('typeid' + document.cursor_pos).innerText))
				document.getElementById('status').innerHTML += "Folder : " + param.file_name;
		else
			document.getElementById('status').innerHTML += "File : " + param.file_name;
		
		document.cursor_screen_pos -= MAX_LINE;
		if (document.cursor_screen_pos < 0)
			document.cursor_screen_pos = 0;
		
		
		if ( (document.cursor_screen_pos === 0) ) { 
			document.getElementById('fileList_name').scrollTop -= SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_type').scrollTop -= SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_size').scrollTop -= SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_ctime').scrollTop -= SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_atime').scrollTop -= SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_mtime').scrollTop -= SCROLL_SPEED * MAX_LINE;
		}
		break;
		
	case BUTTON_RIGHT:
		if (document.cursor_pos < param.max_IndexValue - 1)
			document.cursor_pos += MAX_LINE;
		if (document.cursor_pos > param.max_IndexValue - 1)
			document.cursor_pos = param.max_IndexValue - 1;
		document.getElementById('status').innerHTML = "Selected ";
		if ('Folder' == (document.getElementById('typeid' + document.cursor_pos).innerText))
				document.getElementById('status').innerHTML += "Folder : " + param.file_name;
		else
			document.getElementById('status').innerHTML += "File : " + param.file_name;
		
		document.cursor_screen_pos += MAX_LINE;
		if (document.cursor_screen_pos > MAX_LINE)
			document.cursor_screen_pos = MAX_LINE;
		
		console.log('document.cursor_screen_pos : ' + document.cursor_screen_pos 
				+  '    document.currentMaxFileNumber : ' + document.currentMaxFileNumber
				+  '    document.cursor_pos : ' + document.cursor_pos 
				+  '    document.currentMaxFileNumber :' + document.currentMaxFileNumber);
		
		if ( (document.cursor_screen_pos === MAX_LINE) ) { 
			document.getElementById('fileList_name').scrollTop += SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_type').scrollTop += SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_size').scrollTop += SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_ctime').scrollTop += SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_atime').scrollTop += SCROLL_SPEED * MAX_LINE;
			document.getElementById('fileList_mtime').scrollTop += SCROLL_SPEED * MAX_LINE;
		}
		break;
		
		
	///////////////////////////////////////////////
	// Button 0 : Remove All files of selected device
	case BUTTON_0:
		var drive = param.substring(7, 16).split("/")[0];
		
			if (drive) {
				current_mode = MODE_REMOVEALL;
				console.log("REMOVE ALL DATA : " + drive);
				RemoveAllDevice = drive;
				// format check window appear
				isPopupExists = true;	 
				document.getElementById('menu_popup').style.visibility = 'visible';
				document.getElementById('menu_popup').innerHTML = "<br><br>" +
						"Do you really want to remove all data from " + drive.toUpperCase() + "?<br>" +
						"Its process cannot cancel or undo." +
						"<br><br>" +
						"<div id = 'removeAllYes'> Yes, I want to remove all data in " + drive.toUpperCase() + "  device.</div>" + 
						"<div id = 'removeAllNo'> No. I don't want to remove any data.</div>";
		        document.getElementById('removeAllYes').removeAttribute("style");
		    	document.getElementById('removeAllNo').removeAttribute("style");
	    		document.getElementById('removeAllYes').style.background =  MENU_SELECTED;
				isPopupExists = false;
			}
		break;	
		
	///////////////////////////////////////////////
	// Button 1 : Save selected path		
	case BUTTON_1:
		if (!isRoot) {
			clipboard_path = param;
			clipboard_file = (clipboard_path).split("/").pop();
			if (filetype != null)
				clipboard_type = filetype;
			if (clipboard_path === param)
				document.getElementById('status').innerHTML = "Selected file path : [" + param + "] saved.";
			else 
				document.getElementById('status').innerHTML = "Cannot save selected file path to clipboard.";
			
			console.log ("PATH SAVED : " + clipboard_path + "   FILE : " + clipboard_file);
		}
		else {
			document.getElementById('status').innerHTML = "Cannot copy device";
		}
		break;
		
	///////////////////////////////////////////////
	// Button 2 : Copy selected file to current path
	case BUTTON_2:
		if (!isRoot) {
			if (clipboard_type === 'Folder') {
				console.log("Folder cannot copy.");
				break;
			}
			var popupMenuSuccessCb_2 = function (cbObject) {
				document.getElementById('status').innerHTML = "Copy success : [" + param + "] to [" + param + "]";
				listFile_in_CurrentFolder(current_path);
			}
			var popupMenuOption_2 = {
					source : clipboard_path,
					destination : param + '/' + clipboard_file
			}
			errorMessage = "Cannot copy selected file : [" + popupMenuOption_2.source + "] to [" + popupMenuOption_2.destination + "]";
			console.log ("COPY : [" + popupMenuOption_2.source + "] to [" + popupMenuOption_2.destination + "]");
			storage.copyFile(popupMenuSuccessCb_2, popupMenuFailureCb, popupMenuOption_2);		
		}
		else {
			document.getElementById('status').innerHTML = "Cannot paste in ROOT";
		}
		break;
		
	///////////////////////////////////////////////
	// Button 3 : Move selected file to current path
	case BUTTON_3:
		if (!isRoot) {
			var popupMenuSuccessCb_3 = function (cbObject) {
				document.getElementById('status').innerHTML = "Move success : [" + param + "] to [" + param + "]";
				listFile_in_CurrentFolder(current_path);
			}
			var popupMenuOption_3 = {
					oldPath : clipboard_path,
					newPath : param + '/' + clipboard_file
			}
			errorMessage = "Cannot move selected file : [" + popupMenuOption_3.oldPath + "] to [" + popupMenuOption_3.newPath + "]";
			console.log ("MOVE : [" + popupMenuOption_3.oldPath + "] to [" + popupMenuOption_3.newPath + "]");
			storage.moveFile(popupMenuSuccessCb_3, popupMenuFailureCb, popupMenuOption_3);
		}
		else {
			document.getElementById('status').innerHTML = "Cannot move in ROOT";
		}
		break;
		
	///////////////////////////////////////////////
	// Button 4 : Remove selected file
	case BUTTON_4:
		if (!isRoot) {
			var popupMenuSuccessCb_4 = function (cbObject) {
				document.getElementById('status').innerHTML = "Remove success : [" + param + "]";
				document.cursor_pos = 0;
				listFile_in_CurrentFolder(current_path);
			} 
			var popupMenuOption_4 = {
					file : param,
					recursive : (filetype === 'Folder') ? true: false
			}
			errorMessage = "Cannot remove selected item : [" + JSON.stringify(popupMenuOption_4).file + "]";
			console.log ("REMOVE : [" + param + "][" + JSON.stringify(popupMenuOption_4) + "]");
			storage.removeFile(popupMenuSuccessCb_4, popupMenuFailureCb, popupMenuOption_4); 
		}
		else {
			document.getElementById('status').innerHTML = "Cannot remove device";
		}
		break;
		
	///////////////////////////////////////////////
	// Button 5 : Make Directory
	case BUTTON_5:
		if (!isRoot) { 
			current_mode = MODE_MKDIR;
			isPopupExists = true;
			isMkdir = true;
			document.getElementById('menu_popup').style.visibility = 'visible';
			document.getElementById('menu_popup').innerHTML = "" +
							"<div style = 'font-size:" + '"300%"' + ";'><br>Directory name for making : <br>" +
									"No Input : Cancel Make Directory</div><br>" +
							"<textarea rows = '1' cols = '15' style='font-size:200%;' id = 'dirname'></textarea>";
							"";
			document.getElementById('dirname').select();
			document.getElementById('dirname').value = "";
		}
		else {
			document.getElementById('status').innerHTML = "Cannot make directory in ROOT.";
		}
		break;
		
	///////////////////////////////////////////////
	// Button 6 : Unzip file
	case BUTTON_6:
		if (!isRoot) { 
			console.log("UNZIP zip file : " + param );
			if (param.slice(-4) !== ".zip") {
				console.log("Unzip - select file is NOT zip file");
				break;
			}
			
			
			var popupMenuSuccessCb_6 = function (cbObject) {
				document.getElementById('status').innerHTML = "UNZIP success : [" + param + "] to [" + param.slice(0, -4) + "]";
				document.cursor_pos = 0;
				listFile_in_CurrentFolder(current_path);
			}
			var popupMenuOption_6 = {
					zipPath : param,
					targetPath : param.slice(0, -4)
			};
			errorMessage = "Cannot unzip selected file : [" + popupMenuOption_6.zipPath + "] to [" + popupMenuOption_6.targetPath + "]";
			console.log ("UNZIP : [" + popupMenuOption_6.zipPath + "] to [" + popupMenuOption_6.targetPath + "]");
			storage.unzipFile(popupMenuSuccessCb_6, popupMenuFailureCb, popupMenuOption_6);
		}
		else {
			document.getElementById('status').innerHTML = "Cannot unzip device.";
		}
		break;
		
	///////////////////////////////////////////////
	// Button 7 : Change Logo
	case BUTTON_7:
		console.log("Change Logo : " + param );
		
		if (filetype !== 'Image File') {
			console.log("Change Logo - Not image file or not support image file");
			break;
		}
		var popupMenuSuccessCb_7 = function (cbObject) {
			console.log("Change logo success : [" + param + "]");
			document.getElementById('status').innerHTML = "Change logo success : [" + param + "]";
		}
		var popupMenuOption_7 = {
				uri : param
		};
		errorMessage = "Cannot change logo selected file : [" + popupMenuOption_7.uri + "]";
		console.log ("CHANGE LOGO : [" + popupMenuOption_7.uri + "]");
		storage.changeLogoImage(popupMenuSuccessCb_7, popupMenuFailureCb, popupMenuOption_7);
		break;
		
	///////////////////////////////////////////////
	// Button 8 : Currently not define
	case BUTTON_8:
		
		break;
		
	///////////////////////////////////////////////
	// Button 9 : Currently not define
	case BUTTON_9:

		break;
		
	///////////////////////////////////////////////
	// Button YELLOW : Appear [Help] Window
	case key_Q:
	case BUTTON_YELLOW:
		helpWindow();
		break;
		
	///////////////////////////////////////////////
	// Button BLUE : Disappear [About...] Window

		
	default:
		break;	
	}
}

// Help window definition
function helpWindow() {
	current_mode = MODE_HELP;
	isPopupExists = true;
	document.getElementById('menu_popup').style.visibility = 'visible';
	document.getElementById('menu_popup').innerHTML = "<br>" +
			"<div style = 'font-size:150%;'>File Explorer for webOS Signage</div>" +
			"<div align='right' style = 'font-size:75%;'>Version 1.0</div>" +
			"<br>Remote Controller Button Infomation<br><br>" +
			"<table style = 'width: 900px; font-size: 20pt;'> <tr>" +
			"<td style = 'width: 300px';>1 : Copy file</td>" +
			"<td style = 'width: 300px';>2 : Paste file</td>" +
			"<td style = 'width: 300px';>3 : Cut file</td></tr><tr>" +
			"<td style = 'width: 300px';>4 : Remove file</td>" +
			"<td style = 'width: 300px';>5 : Make Directory</td>" +
			"<td style = 'width: 300px';>6 : Unzip File</td></tr><tr>" +
			"<td style = 'width: 300px';>7 : Change Logo</td>" +
			"<td style = 'width: 300px';>0 : Remove All files</td>" +
			"<td style = 'width: 300px';>Arrow : Move Cursor</td></tr><tr>" +
			"<td style = 'width: 200px';>OK : Open file</td>" +
			"<td style = 'width: 350px';>Yellow : Appear Help Page</td>" +
			"<td style = 'width: 350px';>Blue : Disappear Window</td>" +
			"</tr></table><br>" + 
			"Press blue button to close this window......";
}