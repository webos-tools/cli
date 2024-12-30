var BUTTON_LEFT = 37,
    BUTTON_UP = 38,
    BUTTON_RIGHT = 39,
    BUTTON_DOWN = 40,
    BUTTON_OK = 13,
    BUTTON_0 = 48,
    BUTTON_1 = 49,
    BUTTON_2 = 50,
    BUTTON_3 = 51,
    BUTTON_4 = 52,
    BUTTON_5 = 53,
    BUTTON_6 = 54,
    BUTTON_7 = 55,
    BUTTON_8 = 56,
    BUTTON_9 = 57,
    BUTTON_YELLOW = 405,
    BUTTON_BLUE = 406,
     
    isScheduler = false;
 

function remocon() {
	document.onkeydown = function(event) {
		var keyCode = event.keyCode;
		if (!isSchedulerOpen) {
			switch (keyCode) {
			case BUTTON_OK:
				isSchedulerOpen = true;
				openScheduler();
			default:
				break;

			}
		}
		else {
			switch (keyCode) {
			case BUTTON_OK:
				closeScheduler();
				break;
			case BUTTON_UP:
				if (selectedTime.minute > 0)
					selectedTime.minute -= 1;
				refreshTable()
				break;
			case BUTTON_DOWN:
				if (selectedTime.minute < 5)
					selectedTime.minute += 1;
				refreshTable()
				break;
			case BUTTON_LEFT:
				if (selectedTime.hour > 0)
					selectedTime.hour -= 1;
				refreshTable()
				break;
			case BUTTON_RIGHT:
				if (selectedTime.hour < 23)
					selectedTime.hour += 1;
				refreshTable()
				break;
			case BUTTON_1:	
			case BUTTON_2:
			case BUTTON_3:
			case BUTTON_0:	// Remove schedule
				addSchedule(keyCode);
				break;
				
			default:
				break;
			}
			
		}
	}
}