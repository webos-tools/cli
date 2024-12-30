var BUTTON_LEFT = 37,
    BUTTON_RIGHT = 39,
    BUTTON_OK = 13;

var currentSelected = 10,
    currentSelected_leftPos = 243;

function keyHandler() {
	var maxIndex = timezoneValue.length;
	document.onkeydown = function(event) {
	    var keyCode = event.keyCode;
	    
	    
	    if (keyCode === BUTTON_LEFT) {
	    	currentSelected = (maxIndex + currentSelected - 1) % maxIndex;
	    	
	    }  
	    else  if (keyCode === BUTTON_RIGHT) {
	    	currentSelected = (maxIndex + currentSelected + 1) % maxIndex;
	    }	
	    else  if (keyCode === BUTTON_OK) {
	    	setCurrentTime();
	    }	

	    
	    if (currentSelected === 22) {	    	
			document.getElementById('selectedArea').style.visibility = 'hidden';
			document.getElementById('selectedArea_12plus').style.visibility = 'visible';
			document.getElementById('selectedArea_12minus').style.visibility = 'hidden';
			document.getElementById('selectedArea_left').style.visibility = 'hidden';
			document.getElementById('selectedArea_right').style.visibility = 'hidden';    	
	    }
	    else if (currentSelected === 23) {	    	
			document.getElementById('selectedArea').style.visibility = 'hidden';
			document.getElementById('selectedArea_12plus').style.visibility = 'hidden';
			document.getElementById('selectedArea_12minus').style.visibility = 'visible';
			document.getElementById('selectedArea_left').style.visibility = 'hidden';
			document.getElementById('selectedArea_right').style.visibility = 'hidden'; 	
	    }
	    else if (currentSelected === 24) {
			document.getElementById('selectedArea').style.visibility = 'hidden';
			document.getElementById('selectedArea_12plus').style.visibility = 'hidden';
			document.getElementById('selectedArea_12minus').style.visibility = 'hidden';
			document.getElementById('selectedArea_left').style.visibility = 'visible';
			document.getElementById('selectedArea_right').style.visibility = 'visible';
		}
		else {
			document.getElementById('selectedArea').style.visibility = 'visible';
			document.getElementById('selectedArea_12plus').style.visibility = 'hidden';
			document.getElementById('selectedArea_12minus').style.visibility = 'hidden';
			document.getElementById('selectedArea_left').style.visibility = 'hidden';
			document.getElementById('selectedArea_right').style.visibility = 'hidden';
			document.getElementById('selectedArea').style.left = currentSelected_leftPos + 64 * (currentSelected) + "px";
		}
		//console.log(parseInt(timezoneValue[currentSelected].substring(0, 3)));
		document.getElementById('setTime').innerHTML = "Timezone Offset" + "<br>" + timezoneValue[currentSelected];
	}
}