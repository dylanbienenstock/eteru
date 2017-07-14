var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http); 
var validator = require("validator");

//app.set("port", (process.env.PORT || 8080));

app.use(express.static("client"));

app.get("/", function(req, res) {
	res.sendFile("client/index.html");
});

io.on("connection", onConnect);

http.listen(8080, function() {
  console.log("listening on *:8080");
});

/*

/!\ PACKET FORMATS /!\
(client to server: ->, server to client: <-)
--------------------------------------------

-> "login request" - { string: username, string: password } --- passwords not implemented
<- "login response" - { bool: accepted, string: message }
<- "user connected" - { string: username, string: message }
<- "user disconnected" - { string: username, string: message }
-> "chat out" - { string: room, string: message } --- "out" is relative to client, not server
<- "chat in" - { string: room, string: username, string: message } --- "username" refers to the sender

*/

var usernameList = {} // Key: socket.id, Value: username
var usernameValidator = /^([A-Za-z0-9\-]+)$/g;

function onConnect(socket) {
	socket.on("disconnect", function() {
		delete usernameList[socket.id];
	});

	socket.on("login request", function(data) {
		var loginResponse = processLoginRequest(data);

		socket.emit("login response", {
			accepted: loginResponse.accepted,
			message: loginResponse.message
		});

		if (loginResponse.accepted) {
			usernameList[socket.id] = data.username;

			socket.broadcast.emit("user connected", {
				username: data.username,
				message: "User connected: " + data.username
			});
		}
	});

	socket.on("chat out", function(data) {
		io.emit("chat in", {
			room: data.room,
			username: usernameList[socket.id],
			message: data.message
		});
	});
}

function getSocketIdByUsername(username) {
	for (var socketid in usernameList) {
		if (usernameList.hasOwnProperty(socketid) && usernameList[socketid] == username) {
			return socketid;
		}
	}

	return null;
}

function processLoginRequest(data) {
	var loginResponse = { accepted: true, message: "Successfully connected!" };

	if (data.username.match(usernameValidator) == null) {
		loginResponse.accepted = false;
		loginResponse.message = "Use only letters, numbers, and hyphens.";
	}

	if (getSocketIdByUsername(data.username) != null) {
		loginResponse.accepted = false;
		loginResponse.message = "That username is currently taken.";
	}

	console.log(data.username + " connected"); // DEBUG

	return loginResponse;
}