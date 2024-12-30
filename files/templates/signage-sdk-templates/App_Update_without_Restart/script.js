var INTERNAL_JSON_FILE_SERVER = 'file://internal/applicationInfo_Server.json',
    INTERNAL_JSON_FILE_LCOAL  = 'file://internal/applicationInfo.json',
    CONSTANT_PATH = "/procentric/scap/application",
    localAppInformation,
    serverAppInformation,
    storage = new Storage(),
    configuration = new Configuration();

// SCAP Failure Callback Function
function failureCb(cbObject) {
	var errorCode = cbObject.errorCode;
	var errorText = cbObject.errorText;
	document.getElementById("status").innerHTML = "Error Code [" + errorCode + "]: " + errorText;
}

// Get device server settings
function getServerSettings() {
	 function successCb(cbObject) {
		document.getElementById("serverSettings").innerHTML = "Current Server Settings : <br>"
															+ "IP : " + cbObject.serverIp + "<br>"
															+ "Port : " + cbObject.serverPort + "<br>"
															+ "HTTPS : " + cbObject.secureConnection + "<br>"
														    + "LaunchMode : " + cbObject.appLaunchMode + "<br>"
														    + "Domain Mode : " + cbObject.fqdnMode + "<br>"
														    + "Domain : " + (cbObject.fqdnAddr === "" ? "[NOT INPUTTED]" : cbObject.fqdnAddr);
	  }
	  configuration.getServerProperty(successCb, failureCb);
}

// Get Application information from applicationInfo.json in device
function applicationInfo(obj) {
	console.log("APP INFO : " + JSON.stringify(obj));
	localAppInformation = obj;
	document.getElementById("localAppInfo").innerHTML = "Local Installed Application Settings : <br>"
		 										+ "Application Name : " + localAppInformation.applicationName + "<br>"
		 										+ "Version : " + localAppInformation.version + "<br>"
		 										+ "Developer : " + localAppInformation.developer + "<br>"
		 										+ "Release Date : " + localAppInformation.releaseDate + "<br><br>";	
}


/*
 Get Application information from JSON file
 JSON Format : 
**************************************************************
applicationInfo(
    {
        "applicationName" : "Test App",
        "version" : 1.0111,
        "releaseDate" : "2015-03-16",       
        "developer" : "Developer",
        "isDomainUse" : false,
        "server" : {
            "ip" : "192.168.137.1",
            "port" : 8080,
            "secured" : false,
            "domain" : "TEST"
        }
    }
);
 
applicationName, version, releaseDate, developer : For using this application(just print).
                                                   You can implement some application validation method such as compare version, check developer, etc...     
                                                   ( Example : compareVersion() )                                               
isDomainUse, server : For using set server property.     
    
**************************************************************
*/
function getServerAppInfo() {
	var downloadComplete = function() {
		document.getElementById("status").innerHTML = "JSON file download complete.<br>";
		
		/////////////////////////////////////////////////////////////////////////////////
		//
		// Get settings from downloaded json file
		//
		
		var getServerAppInformation = function(cbObject) {
			document.getElementById("downlaodJSON").innerHTML = "Downloaded JSON Data : <br>"
															  + cbObject.data + "<br><br>";
			
			//////////////////////////////////////////////////////////////////////////////////////////////////////
			//
			// Parse applicationInfo.json file and set server settings
			//
			
			console.log(cbObject.data.slice(18, (cbObject.data.length - 3)))
			serverAppInformation = JSON.parse(cbObject.data.slice(17, (cbObject.data.length - 3)));
			document.getElementById("serverAppInfo").innerHTML    = "Server Application Settings : <br>" 
																	+ "Application Name : " + serverAppInformation.applicationName + "<br>"
																	+ "Version : " + serverAppInformation.version + "<br>"
																	+ "Developer : " + serverAppInformation.developer + "<br>"
																	+ "Release Date : " + serverAppInformation.releaseDate + "<br><br>";
			var options = {
				serverIp : serverAppInformation.server.ip,
				serverPort : serverAppInformation.server.port,
				secureConnection : serverAppInformation.server.secured,
				appLaunchMode : Configuration.AppMode.LOCAL,
				fqdnMode : serverAppInformation.isDomainUse,
				fqdnAddr : serverAppInformation.server.domain
			};
			compareVersion();
			setServerSettings(options);
			
			//
			//////////////////////////////////////////////////////////////////////////////////////////////////////
		};

		// Read file from the start, read the whole file, and read as text.
		var readOptions = {
			path : INTERNAL_JSON_FILE_SERVER,
			position : 0,
			length : 1024,
			encoding : 'utf8'
		};
		storage.readFile(getServerAppInformation, failureCb, readOptions);
		
		//
		/////////////////////////////////////////////////////////////////////////////////
	}
	var downloadOptions = {
		source : document.getElementById('jsonFilePath').value,
		destination : INTERNAL_JSON_FILE_SERVER
	};
	
	// Download json file from remote
	storage.copyFile(downloadComplete, failureCb, downloadOptions);
}

// Set device's server settings for download new application
function changeRemoteSettings() {
	if (document.getElementById("remoteMode").value == "IP and Port") {
		console.log("IP")
		document.getElementById("remoteSettings").innerHTML = ""
			+ "IP : <textarea id='ip' style='font-size: 75%;' rows=1></textarea><br>" 
	 		+ "Port : <textarea id='port' style='font-size: 75%;' rows=1></textarea><br>"
	 		+ "<button onclick='setServerSettings(" + '"IP"' + ")' style='font-size: 100%;'>Set Server Settings</button>";
	}
		
	else if (document.getElementById("remoteMode").value == "Domain") {
		console.log("DOMAIN")
		document.getElementById("remoteSettings").innerHTML = ""
			+ "URL : <textarea id='serverURL' style='font-size: 100%;' rows=1></textarea><br>" 
			+ "<input type='checkbox' id = 'https'>HTTPS<br>"
	 		+ "<button onclick='setServerSettings(" + '"DOMAIN"' + ")' style='font-size: 100%;'>Set Server Settings</button>";
	}		
}

// Set device server settings
function setServerSettings(param) {
	var options = param;
	function successCb() {
		getServerSettings();
		document.getElementById("status").innerHTML += "Set up server settings.";
	}
	configuration.setServerProperty(successCb, failureCb, options);
}

// Compare application version from device and from server 
function compareVersion() {
	if (localAppInformation.version < serverAppInformation.version) {
		document.getElementById("status").innerHTML += "New application version detected.<br>"
	}
	else {
		document.getElementById("status").innerHTML += "Latest application is installed.<br>" 
	}
}

// Restart updated application
function refrestApplication() {
	var successCb = function(cbObject) {
		document.getElementById("status").innerHTML = "Application Update complete.<br>"
													+ "Application will be restart......";
		function restartApplication() {
			function successCb() {
				document.getElementById("status").innerHTML = "Restart Complete."
			}
			
			configuration.restartApplication(successCb, failureCb);
		};		
		restartApplication();
	};

	var options = {
		to : Storage.AppMode.REMOTE,
		recovery : false
	};

	var storage = new Storage();
	storage.upgradeApplication(successCb, failureCb, options);
}