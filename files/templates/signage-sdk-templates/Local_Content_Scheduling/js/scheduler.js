var isSchedulerOpen = false;

function scheduler() {
	
	
}
// Help Window

function openScheduler() { 
	var helpWindow = document.getElementById('scheduler');
	helpWindow.style.visibility = 'visible';
	isSchedulerOpen = true;
}

function closeScheduler() {

	var helpWindow = document.getElementById('scheduler');
	helpWindow.style.visibility = 'hidden';
	isSchedulerOpen = false;
	getTime(true);
}

function openHelp() { 
	isHelp = true;
	var helpWindow = document.getElementById('helpWindow');
	helpWindow.style.visibility = 'visible';
	helpWindow.innerHTML = "<br>Display Backlight Scheduling Sample App" +
			"<br>for webOS Signage<br><br>" +
			"1~8 : Set control speed<br>" +
			"9 : Go to 00:00<br>" +
			"0 : Go to 12:00<br>" +
			"Left/Right : Set Time<br>" +
			"Up : Delete current schedule<br>" +
			"Down : Set current schedule<br><br>" +
			"Press OK to close this help......";
	
}

function addSchedule(keyCode) {
	var min = selectedTime.minute === 0 ? "00" : selectedTime.minute + "0";
	switch(keyCode) {
		case BUTTON_1:
			videoScheduleTable[selectedTime.hour][selectedTime.minute] = 1;
			document.getElementById("schedule" + selectedTime.hour + "_" + selectedTime.minute).innerHTML =
				selectedTime.hour + ":" + min + "<div id = 'scheduleContent" +  selectedTime.hour + "_" + selectedTime.minute +
				"' style = 'color: #C70752; font-size:400%'>1</div>";
			break;
		case BUTTON_2:
			videoScheduleTable[selectedTime.hour][selectedTime.minute] = 2;
			document.getElementById("schedule" + selectedTime.hour + "_" + selectedTime.minute).innerHTML =
				selectedTime.hour + ":" + min + "<div id = 'scheduleContent" +  selectedTime.hour + "_" + selectedTime.minute +
				"' style = 'color: #C70752; font-size:400%'>2</div>";
					
				break;
		case BUTTON_3:
			videoScheduleTable[selectedTime.hour][selectedTime.minute] = 3;
			document.getElementById("schedule" + selectedTime.hour + "_" + selectedTime.minute).innerHTML =
				selectedTime.hour + ":" + min + "<div id = 'scheduleContent" +  selectedTime.hour + "_" + selectedTime.minute +
				"' style = 'color: #C70752; font-size:400%'>3</div>";
				
			break;
		case BUTTON_0:
			videoScheduleTable[selectedTime.hour][selectedTime.minute] = 0;
			document.getElementById("schedule" + selectedTime.hour + "_" + selectedTime.minute).innerHTML =
				selectedTime.hour + ":" + min + "<div id = 'scheduleContent" +  selectedTime.hour + "_" + selectedTime.minute +
				"' style = 'color: #C70752; font-size:400%'> </div>";
				
			break;
		
		default:
			break;
	}
} 

// Move cursor
function refreshTable() {	 
	for (var M = 0; M < 6; M++) {
		for (var H = 0; H < 24; H++) {
			document.getElementById("schedule" + H + "_" + M).style.backgroundColor= "#FFFFFF";
			if ( (selectedTime.hour === H) && (selectedTime.minute === M) )
				document.getElementById("schedule" + H + "_" + M).style.backgroundColor= "#808080";
		}
	}		
}