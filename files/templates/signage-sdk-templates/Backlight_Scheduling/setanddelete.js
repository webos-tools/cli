/***
 * 
 * setanddelete.js
 * Add or delete backlight schedule 
 * 
 */

var BacklightValueForSetting = 0;

// Add backlight schedule
function addSchedule(time) { 
	console.log("Add Backlight Schedule");
	BacklightValueForSetting = 0;
	document.getElementById('popupWindow').style.visibility = 'visible';	
	document.getElementById('popupWindow').innerHTML = 'Set Backlight Value : <br>0';	
}

// Delete backlight schedule
function deleteSchedule(time) {
	console.log("Delete Backlight Schedule");
	var hour = parseInt(time / 60);
	var min  = parseInt( (time % 60) / 10);
	Backlight[hour][min] = NOT_SCHEDULED;
	document.getElementById('clockTable' + hour + '_' + min).innerText = "";
}