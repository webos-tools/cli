// helloworld_webos_service.js
// simple service, based on low-level Palmbus API

var pkgInfo = require('./package.json');
var Service = require('webos-service');
// Register com.yourdomain.@DIR@.service, on both buses
var service = new Service(pkgInfo.name);
var greeting = "Hello, World!";

// a method that always returns the same value
service.register("hello", function(message) {
	console.log("In hello callback");
	message.respond({
		returnValue: true,
		message: greeting
	});
});

// set some state in the service
service.register("config/setGreeting", function(message) {
	console.log("In setGreeting callback");
	if (message.payload.greeting) {
		greeting = message.payload.greeting;
	} else {
		message.respond({
			returnValue: false,
			errorText: "argument 'greeting' is required",
			errorCode: 1
		});
	}
	message.respond({
		returnValue: true,
		greeting: greeting
	});
});

// handle subscription requests
var interval;
var subscriptions = {};
var x = 1;
function createInterval() {
	if (interval) {
		return;
	}
	console.log("create new interval");
	interval = setInterval(function() {
		sendResponses();
	}, 1000);
}

// send responses to each subscribed client
function sendResponses() {
	console.log("Sending responses, subscription count="+Object.keys(subscriptions).length);
	for (var i in subscriptions) {
		if (subscriptions.hasOwnProperty(i)) {
			var s = subscriptions[i];
			s.respond({
				returnValue: true,
				event: "beat "+x
			});
		}
	}
	x++;
}

// listen for requests, and handle subscriptions via implicit event handlers in call
// to register
service.register("heartbeat", function(message) {
	var uniqueToken = message.uniqueToken;
	console.log("heartbeat callback, uniqueToken: "+uniqueToken+", token: "+message.token);
	message.respond({event: "beat"});
	if (message.isSubscription) {
		subscriptions[uniqueToken] = message;
		if (!interval) {
			createInterval();
		}
	}
},
function(message) {
	var uniqueToken = message.uniqueToken;
	console.log("Canceled " + uniqueToken);
	delete subscriptions[uniqueToken];
	var keys = Object.keys(subscriptions);
	if (keys.length === 0) {
		console.log("no more subscriptions, canceling interval");
		clearInterval(interval);
		interval = undefined;
	}
});

// EventEmitter-based API for subscriptions
// note that the previous examples are actually using this API as well, they're
// just setting a "request" handler implicitly
var heartbeat2 = service.register("heartbeat2");
heartbeat2.on("request", function(message) {
	console.log("heartbeat callback");
	message.respond({event: "beat"});
	if (message.isSubscription) {
		subscriptions[message.uniqueToken] = message;
		if (!interval) {
			createInterval();
		}
	}
});
heartbeat2.on("cancel", function(message) {
	console.log("Canceled " + message.uniqueToken);
	delete subscriptions[message.uniqueToken];
	var keys = Object.keys(subscriptions);
	if (keys.length === 0) {
		console.log("no more subscriptions, canceling interval");
		clearInterval(interval);
		interval = undefined;
	}
});

service.register("pong", function(message) {
	console.log("Pong!");
	console.log(message.payload);
	message.respond({message: "Pong"});
});

service.register("/do/re/me", function(message) {
	message.respond({verses:[
		{doe: "a deer, a female deer"},
		{ray: "a drop of golden sun"},
		{me: "a name I call myself"}
	]});
});
