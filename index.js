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

http.listen(3000, function() {
  console.log("listening on *:3000");
});

/*

			  PACKET FORMATS
(client to server: ->, server to client: <-)
--------------------------------------------

-> "login request" - { string: username, string: password } --- passwords not implemented
<- "login response" - { bool: accepted, string: message }
<- "user connected" - { string: username, string: message }
<- "user disconnected" - { string: username, string: message }

*/

var takenUsernames = [];
var usernameValidator = /^([A-Za-z0-9\-]+)$/g;

function onConnect(socket) {
	socket.on("login request", function(data) {
		var loginResponse = processLoginRequest(data);

		socket.emit("login response", {
			accepted: loginResponse.accepted,
			message: loginResponse.message
		});

		if (loginResponse.accepted) {
			takenUsernames.push(data.username);

			socket.broadcast.emit("user connected", {
				username: data.username,
				message: "User connected: " + data.username
			});
		}
	});
}

function processLoginRequest(data) {
	var loginResponse = { accepted: true, message: "Successfully connected!" };

	if (data.username.match(usernameValidator) == null) {
		loginResponse.accepted = false;
		loginResponse.message = "Use only letters, numbers, and hyphens.";
	}

	if (takenUsernames.includes(data.username)) {
		loginResponse.accepted = false;
		loginResponse.message = "That username is currently taken.";
	}

	return loginResponse;
}