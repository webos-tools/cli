// helloclient.js
// Subscribe & cancel subscription to helloworld's heartbeat service
var Service = require('webos-service');

// Register com.example.helloworld, on both buses
var service = new Service("com.example.helloclient");
console.log("simple call");
	service.call("luna://@SERVICE-NAME@/hello", {}, function(message) {
	console.log("message payload: " + JSON.stringify(message.payload));
	var sub = service.subscribe("luna://@SERVICE-NAME@/heartbeat", {subscribe: true});
	var count = 0;
	var max = 10;
	sub.addListener("response", function(msg) {
		console.log(JSON.stringify(msg.payload));
		if (++count >= max) {
			sub.cancel();
			setTimeout(function(){
				console.log(max+" responses received, exiting...");
				process.exit(0);
			}, 1000);
		}
	});
});
