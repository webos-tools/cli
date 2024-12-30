var date = null,
	year = 0,
	month = 0,
	day = 0,
	hour = 0,
	minute = 0,
	sec = 0,
	selectedTimezoneValue = 0,
	timezoneDelta = 0;

function init() {
	//	getUTC();	// Automatically call when index.html loaded
	keyHandler();
}

// If connect failure, use local time (device time) only

function getDeviceTime() {
	console.log("Internet Connection Failure!");
	date = new Date();
	document.getElementById('currentTime').innerHTML = "Get Device Time......";
	document.getElementById('connectStatus').innerHTML = "Internet Disconnected<br>Device Time";
	document.getElementById('setTime').innerHTML = "Timezone Offset" + "<br>" + timezoneValue[currentSelected];
	setInterval(getCurrentTime, 500)
}

// First time application run, get time from http://www.timeapi.org server.
function getUTC(json) {
	selectedTimezoneValue = 0;
	document.getElementById('currentTime').innerHTML = "Get UTC......";
	document.getElementById('connectStatus').style.color = "#0000FF";
	document.getElementById('connectStatus').innerHTML = "Internet Connected<br>UTC Time";
	date = new Date(json.dateString);
	year = date.getFullYear();
	month = date.getMonth();
	day = date.getDate();
	hour = date.getHours();
	minute = date.getMinutes();
	sec = date.getSeconds();

	setCurrentTime();
	setInterval(getCurrentTime, 500)
}

// Set device time using SCAP API.
function setCurrentTime() {

	timezoneDelta = parseInt(timezoneValue[currentSelected].substring(0, 3)) - selectedTimezoneValue;
	date.setTime(date.getTime() + (1000 * 60 * 60 * timezoneDelta));

	year = date.getFullYear();
	month = date.getMonth();
	day = date.getDate();
	hour = date.getHours();
	minute = date.getMinutes();
	sec = date.getSeconds();


	var options = {
		year: year,
		month: month,
		day: day,
		hour: hour,
		minute: minute,
		sec: sec
	};

	function successCb() {
		document.getElementById('setTime').innerHTML = "Timezone Offset" + "<br>" + timezoneValue[currentSelected];
		selectedTimezoneValue = parseInt(timezoneValue[currentSelected].substring(0, 3));
	}

	function failureCb(cbObject) {
		var errorCode = cbObject.errorCode;
		var errorText = cbObject.errorText;
		document.getElementById('currentTime').innerHTML = "Error Code [" + errorCode + "]: " + errorText;
	}

	var configuration = new Configuration();
	configuration.setCurrentTime(successCb, failureCb, options);
}

// Get device time intervally.
function getCurrentTime() {
	function successCb(cbObject) {
		year = cbObject.year;
		month = cbObject.month;
		day = cbObject.day;
		hour = cbObject.hour;
		minute = cbObject.minute;
		sec = cbObject.sec;

		date.setFullYear(year);
		date.setMonth(month);
		date.setDate(day);
		date.setHours(hour);
		date.setMinutes(minute);
		date.setSeconds(sec);

		document.getElementById('currentTime').innerHTML =
			year + "-"
			+ month + "-"
			+ day + "<br>"
			+ ((hour < 10) ? ("0" + hour) : hour) + ":"
			+ ((minute < 10) ? ("0" + minute) : minute) + ":"
			+ ((sec < 10) ? ("0" + sec) : sec);
	}

	function failureCb(cbObject) {
		var errorCode = cbObject.errorCode;
		var errorText = cbObject.errorText;
		document.getElementById('currentTime').innerHTML = "Error Code [" + errorCode + "]: " + errorText;
	}

	var configuration = new Configuration();
	configuration.getCurrentTime(successCb, failureCb);
}