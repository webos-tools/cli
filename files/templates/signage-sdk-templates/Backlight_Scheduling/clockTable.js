/***
 * 
 * clockTable.js
 * Draw backlight schedule table to right side of screen
 * 
 */ 
// Draw Table right side
function drawScheduleTable(){ 
	document.getElementById('clock').innerHTML = "";
	for(var H=0; H<24; H++) {
		document.getElementById('clock').innerHTML += "<div id = clockTable" + H + ">";		
		document.getElementById('clockTable' + H).setAttribute("width", "792px");
		document.getElementById('clockTable' + H).setAttribute("height", "33px");
		for (var M=0; M<6; M++) {
			document.getElementById('clock').innerHTML += "<div id = clockTable" + H + "_" + M + " class='clock_segment'>"; 
			document.getElementById('clockTable' + H + '_' + M).setAttribute("background-color", "#000000");
			document.getElementById('clockTable' + H + '_' + M).setAttribute("border", "solid");
			document.getElementById('clockTable' + H + '_' + M).setAttribute("border-color", "#0000FF");				
		}
		document.getElementById('clock').innerHTML += "</div>";
	}
}


// Change value of schedule table
function changeScheduleTable(H, M, value) {
	console.log("Change color"); 
	document.getElementById('clockTable' + H + '_' + parseInt(M/10)).innerText = value; 
}