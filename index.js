var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http); 
var validator = require("validator");

//app.set("port", (process.env.PORT || 8080));

app.use(express.static("./client"));

app.get("/", function(req, res) {
	res.sendFile("./client/index.html");
});

io.on("connection", onConnect);

http.listen(3000, function() {
  console.log("Server listening on port 3000.");
});

/*

/!\ PACKET FORMATS /!\
(client to server: ->, server to client: <-)
-------------------------------------------- 
TO DO: Reformat this to { name: <type> } instead of { type: name }

-> "login request" - { string: username, string: password } --- passwords not implemented
<- "login response" - { bool: accepted, string: username, string: message }

-> "room join request" - string: room
<- "room join response" - { bool: accepted, string: username, string: room, string: title, string[]: activeUsers  }
-> "room leave" - string: room

<- "user connected" - string: username
<- "user disconnected" - string: username
<- "user join" - { string: username, string: room }
<- "user leave" - { string: username, string: room }

-> "chat out" - { string: room, string: message } --- "out" is relative to client, not server
<- "chat in" - { string: room, string: username, number: hue, string: message } --- "username" refers to the sender, "hue" is temporary
<- "chat server" { string: color, string: message } --- Global server message

*/

var usernameList = {} // Key: socket.id, Value: username
var usernameValidator = /^([A-Za-z0-9\-]+)$/g;

var chatRoomTitles = {
	"rei": "&#x96F6;&nbsp;<span class=\"tab-label\">(rei)</span>",
	"ichi": "&#x4E00;&nbsp;<span class=\"tab-label\">(ichi)</span>",
	"ni": "&#x4E8C;&nbsp;<span class=\"tab-label\">(ni)</span>",
	"san": "&#x4E09;&nbsp;<span class=\"tab-label\">(san)</span>"
};

var chatRooms = {};
var chatRoomNames = [];

function newChatRoom(roomName, title) {
	var newChatRoom = {
		name: roomName,
		activeUsers: []
	};

	chatRooms[roomName] = newChatRoom;
	chatRoomNames.push(roomName);
}

newChatRoom("rei", chatRoomTitles["rei"]);
newChatRoom("ichi", chatRoomTitles["ichi"]);
newChatRoom("ni", chatRoomTitles["ni"]);
newChatRoom("san", chatRoomTitles["san"]);

function onConnect(socket) {
	socket.on("disconnect", function() {
		//console.log(1);
		if (usernameList[socket.id] != undefined) {
			console.log("User disconnected: " + usernameList[socket.id]); // DEBUG

			for (var i = 0; i < chatRoomNames.length; i++) {
				//console.log(i + "/" + 2);
				var room = chatRooms[chatRoomNames[i]];
				//console.log(i + "/" + 3);
				var i2 = room.activeUsers.indexOf(usernameList[socket.id]);
				//console.log(i + "/" + 4);

				if (1 != -1) {
					//console.log(i + "/" + 5);
					room.activeUsers.splice(i2, 1);
					//console.log(i + "/" + 6);
				}

				//console.log(i + "/" + 7);
			}		

			//console.log(8);
			socket.broadcast.emit("user disconnected", usernameList[socket.id]);
			//console.log(9);
		}
		//console.log(10);
		delete usernameList[socket.id];
		//console.log(11);
	});

	socket.on("login request", function(data) {
		var loginResponse = processLoginRequest(data);

		socket.emit("login response", {
			accepted: loginResponse.accepted,
			username: data.username,
			message: loginResponse.message
		});

		//////////////////////////////////////////

		if (loginResponse.accepted) {
			usernameList[socket.id] = data.username;
			socket.broadcast.emit("user connected", data.username);
			console.log("User connected: " + data.username); // DEBUG
		}
	});

	socket.on("room join request", function(roomName) {
		var room = chatRooms[roomName];

		if (room != null && room != undefined) {
			socket.emit("room join response", {
				accepted: true,
				username: usernameList[socket.id],
				room: roomName,
				title: chatRoomTitles[roomName],
				activeUsers: room.activeUsers
			});

			socket.broadcast.emit("user join", {
				username: usernameList[socket.id],
				room: roomName
			});

			room.activeUsers.push(usernameList[socket.id]);

			console.log(usernameList[socket.id] + " joined " + roomName + "."); // DEBUG
		} else {
			socket.emit("room join response", {
				accepted: false
			});
		}
	});

	//socket.on("room leave")

	socket.on("chat out", function(data) {
		console.log("(" + data.room + ") " + usernameList[socket.id] + ": " + data.message);

		if (data.message.length > 0) {
			io.emit("chat in", {
				room: data.room,
				username: usernameList[socket.id],
				message: data.message
			});
		}
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

	if (data.username.length < 3 || data.username.length > 24) {
		loginResponse.accepted = false;
		loginResponse.message = "Username must be between 3 and 24 characters.";
	}

	if (getSocketIdByUsername(data.username) != null) {
		loginResponse.accepted = false;
		loginResponse.message = "That username is currently taken.";
	}

	return loginResponse;
}