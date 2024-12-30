/**
 * 
 * remocon.js
 * Define remocon buttons, and button operations
 * 
 */

// Button Keycode Constants
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
    
    // 24 Hours * 60 Minutes
    MAX_TIME = 24 * 60;        
     
    rotateSpeed = 10;        // Speed of controller pin
    selectedTime = 0,        // Current 'SELECTED' Time
    BacklightValue = 0,    
    
    isBacklightSet = false,    // If true, Backlight setting window appear
    isHelp = false;            // If true, Help window appear
    
// Remote controller operation defines
function remocon() {
    document.onkeydown = function(event) {
    var keyCode = event.keyCode;

    var hour = parseInt(selectedTime / 60);
    var min  = selectedTime % 60;
    
    /////////////////////////////////////////////////////
    //    Case 1 : Normal mode
        if (!isBacklightSet && !isHelp) {
            
            switch (keyCode) {

            // Add Backlight Schedule
            case BUTTON_DOWN:
                isBacklightSet = true;
                document.getElementById('controllerInfo').innerHTML = 'Adding Schedule......'
                addSchedule(selectedTime);
                break;

            // Delete Backlight Schedule
            case BUTTON_UP:
                deleteSchedule(selectedTime);
                document.getElementById('controllerInfo').innerHTML = 'Delete Schedule at '
                    + (hour < 10? ("0" + hour ) : hour ) + ':'
                    + (min < 10? ("0" + min ) : min ) + '.';
                break;

            case BUTTON_LEFT: 
                selectedTime = (MAX_TIME + selectedTime - rotateSpeed) % MAX_TIME;
                
                break;

            case BUTTON_RIGHT: 
                selectedTime = (MAX_TIME + selectedTime + rotateSpeed) % MAX_TIME;
                break;

            // Set rotate speed
            case BUTTON_1:
                rotateSpeed = 10; // 10 Minute
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 10 Min';
                break;
            case BUTTON_2:
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 20 Min';
                rotateSpeed = 20; // 20 Minute
                break;
            case BUTTON_3:
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 30 Min';
                rotateSpeed = 30; // 30 Minutes
                break;
            case BUTTON_4:
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 1 Hour';
                rotateSpeed = 60; // 1 hours Minutes
                break;
            case BUTTON_5:
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 2 Hour';
                rotateSpeed = 2 * 60; // 1 hour
                break;
            case BUTTON_6:
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 3 Hours';
                rotateSpeed = 3 * 60; // 3 hours
                break;
            case BUTTON_7:
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 6 Hours';
                rotateSpeed = 6 * 60; // 6 hours
                break;
            case BUTTON_8:
                document.getElementById('rotateSpeed').innerHTML = 'Control Speed :<br> 12 Hours';
                rotateSpeed = 12 * 60; // 12 hours
                break;
                
            // Go to 00:00 or 12:00
            case BUTTON_9:
                document.getElementById('rotateSpeed').innerHTML = 'Go to<br> 00:00';
                selectedTime = 0; // Default 1
                document.getElementById('controllerArrowRotate').setAttribute(
                        "style", "-webkit-transform:rotate(" + 2.5 * selectedTime + "deg);")
                break;
            case BUTTON_0:
                document.getElementById('rotateSpeed').innerHTML = 'Go to<br> 12:00';
                selectedTime = 12 * 60; // Default 2
                document.getElementById('controllerArrowRotate').setAttribute(
                        "style", "-webkit-transform:rotate(" + 2.5 * selectedTime + "deg);")
                break;

            // Show Windows Button
            case BUTTON_BLUE:
                openHelp();
                
            default:
                console.log("Undefined button");
                break;
            }

            hour = parseInt(selectedTime / 60);
            min  = selectedTime % 60;
            printBacklightValue_Controller(hour, min);
        }
        
    /////////////////////////////////////////////////////    
    // Case 2 : Adding Backlight Schedule
        else if (isBacklightSet){

            var hour = parseInt(selectedTime / 60);
            var min  = selectedTime % 60; 
            switch (keyCode) {

            case BUTTON_LEFT:
                BacklightValueForSetting -= 10;
                if (BacklightValueForSetting < 0)
                    BacklightValueForSetting = 0;
                document.getElementById('popupWindow').innerHTML = 'Set Backlight Value : <br>' + BacklightValueForSetting;
                break;
                
            case BUTTON_RIGHT:
                BacklightValueForSetting += 10;
                if (BacklightValueForSetting > 100)
                    BacklightValueForSetting = 100;
                document.getElementById('popupWindow').innerHTML = 'Set Backlight Value : <br>' + BacklightValueForSetting;
                break;
            
            case BUTTON_UP:
                BacklightValueForSetting++;
                if (BacklightValueForSetting > 100)
                    BacklightValueForSetting = 100;
                document.getElementById('popupWindow').innerHTML = 'Set Backlight Value : <br>' + BacklightValueForSetting;
                break;
            
            case BUTTON_DOWN:
                BacklightValueForSetting--;
                if (BacklightValueForSetting < 0)    
                    BacklightValueForSetting = 0; 
                document.getElementById('popupWindow').innerHTML = 'Set Backlight Value : <br>' + BacklightValueForSetting; 
                break;
                
            case BUTTON_OK:
                var min_index = parseInt(min/10);
                Backlight[hour][min_index] = BacklightValueForSetting;
                document.getElementById('popupWindow').style.visibility = 'hidden';
                document.getElementById('controllerInfo').innerHTML = 'Adding Schedule Done.'
                printBacklightValue_Controller(hour, min);
                changeScheduleTable(hour, min, BacklightValueForSetting);
                isBacklightSet = false;
                break;
            }                        
        }
        
    /////////////////////////////////////////////////////        
    // Case 3 : Help Windows
        else if (isHelp) {
            switch(keyCode) {
            case BUTTON_OK:
                isHelp = false;
                document.getElementById('helpWindow').style.visibility = 'hidden';
                break;
            }
            
        }
    }
}

// Help Window
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