var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http); 
var validator = require("validator");
//var favicon = require("serve-favicon");

app.set("port", (process.env.PORT || 8080));

app.use(express.static("./client"));
//app.use(favicon("./client/favicon.ico"));

app.get("/", function(req, res) {
	res.sendFile("./client/index.html");
});

io.on("connection", onConnect);

http.listen(app.get("port"), function() {
  console.log("Server listening on port 8080.");
});

/*

/!\ PACKET FORMATS /!\
(client to server: ->, server to client: <-)
-------------------------------------------- 
TO DO: Reformat this to { name: <type> } instead of { type: name }

-> "login request" - { string: username, string: password } --- passwords not implemented
<- "login response" - { bool: accepted, string: username, string: message }

-> "room join request" - string: room
<- "room join response" - { bool: accepted, string: username, string: room, string: title, string: description, string[]: activeUsers, topic[]: topics  }
-> "room leave" - string: room

<- "user connected" - string: username --- connected/disconnected refers to a user joining/leaving the network
<- "user disconnected" - string: username
<- "user join" - { string: username, string: room } --- join/leave refers to a user joining/leaving a specific room
<- "user leave" - { string: username, string: room }

-> "chat out" - { string: room, string: topic, string: message } --- "out" is relative to client, not server
<- "chat in" - { string: room, string: topic, string: username, string: message } --- "username" refers to the sender
<- "chat server" - { string: color, string: message } --- Global server message

-> "topic create request" - { string: room, string: name, string: description, number: hue }
<- "topic create response" - { bool: accepted, string: username, string: room, string: topic, string: description, string: hue, string: message }
<- "topic create" - { string: username, string: room, string: description, string: hue }
<- "topic remove" - { string: room, string: topic }

*/

var usernameList = {} // Key: socket.id, Value: username
var usernameValidator = /^([A-Za-z0-9\-]+)$/g;

const chatRoomTitles = {
	"rei": "&#x96F6;&nbsp;<span class=\"tab-label\">(rei)</span>",
	"ichi": "&#x4E00;&nbsp;<span class=\"tab-label\">(ichi)</span>",
	"ni": "&#x4E8C;&nbsp;<span class=\"tab-label\">(ni)</span>",
	"san": "&#x4E09;&nbsp;<span class=\"tab-label\">(san)</span>"
};

const chatRoomDescriptions = {
	"rei": "random - this room is for discussions of any topic :^)",
	"ichi": "no description",
	"ni": "no description",
	"san": "no description"
};

var chatRooms = {};
var chatRoomNames = [];

const topicTimeout = 15 * 1000 * 60; 

function newChatRoom(roomName, title, description) {
	var newChatRoom = {
		name: roomName,
		title: title,
		description: description,
		activeUsers: [],
		topics: {},
		topicNames: []
	};

	chatRooms[roomName] = newChatRoom;
	chatRoomNames.push(roomName);

	newTopic(roomName, null, null, null, null);
}

function newTopic(roomName, starterName, topicName, description, hue) {
	var newTopic = {
		room: roomName,
		starter: starterName,
		name: topicName,
		description: description,
		hue: hue,
		timeout: null
	};

	chatRooms[roomName].topics[topicName] = newTopic;
	chatRooms[roomName].topicNames.push(topicName);

	resetTopicTimeout(roomName, topicName);
}

function removeTopic(roomName, topicName) {
	if (chatRoomNames.includes(roomName) && chatRooms[roomName].topicNames.includes(topicName)) {
		var i = chatRooms[roomName].topicNames.indexOf(topicName);

		if (i != -1) {
			delete chatRooms[roomName].topics[topicName];
			chatRooms[roomName].topicNames.splice(i, 1);

			io.emit("topic remove", {
				room: roomName,
				topic: topicName	
			});
		}
	}
}

function resetTopicTimeout(roomName, topicName) {
	if (chatRooms[roomName] != null && chatRooms[roomName] != undefined && chatRooms[roomName].topicNames.includes(topicName)) {
		clearTimeout(chatRooms[roomName].topics[topicName].timeout);
		chatRooms[roomName].topics[topicName].timeout = (topicName == null ? null : setTimeout(function() { removeTopic(roomName, topicName); }, topicTimeout));
	}
}

newChatRoom("rei", chatRoomTitles["rei"], chatRoomDescriptions["rei"]);
newChatRoom("ichi", chatRoomTitles["ichi"], chatRoomDescriptions["ichi"]);
newChatRoom("ni", chatRoomTitles["ni"], chatRoomDescriptions["ni"]);
newChatRoom("san", chatRoomTitles["san"], chatRoomDescriptions["san"]);

function onConnect(socket) {
	socket.on("disconnect", function() {
		if (usernameList[socket.id] != undefined) {
			console.log("User disconnected: " + usernameList[socket.id]); // DEBUG

			for (var i = 0; i < chatRoomNames.length; i++) {
				var room = chatRooms[chatRoomNames[i]];
				var i2 = room.activeUsers.indexOf(usernameList[socket.id]);

				if (1 != -1) {
					room.activeUsers.splice(i2, 1);
				}
			}		

			socket.broadcast.emit("user disconnected", usernameList[socket.id]);
		}
		delete usernameList[socket.id];
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
			socket.emit("user connected", data.username);
			console.log("User connected: " + data.username); // DEBUG
		}
	});

	socket.on("room join request", function(roomName) {
		var room = chatRooms[roomName];

		if (room != null && room != undefined) {
			var topicsArray = [];

			for (var i = chatRooms[roomName].topicNames.length - 1; i >= 0; i--) {
				topicsArray[i] = chatRooms[roomName].topics[chatRooms[roomName].topicNames[i]];
			}

			socket.emit("room join response", {
				accepted: true,
				username: usernameList[socket.id],
				room: roomName,
				title: room.title,
				description: room.description,
				activeUsers: room.activeUsers,
				topics: topicsArray
			});

			socket.to(roomName).emit("user join", {
				username: usernameList[socket.id],
				room: roomName
			});

			room.activeUsers.push(usernameList[socket.id]);
			socket.join(roomName);

			console.log(usernameList[socket.id] + " joined " + roomName + "."); // DEBUG
		} else {
			socket.emit("room join response", {
				accepted: false
			});
		}
	});

	//socket.on("room leave")

	socket.on("chat out", function(data) {
		if (data.room != null && data.room != undefined && chatRoomNames.includes(data.room)) {
			console.log("(" + data.room + ") " + usernameList[socket.id] + ": " + data.message);

			if (data.message.length > 0) {
				io.to(data.room).emit("chat in", {
					room: data.room,
					topic: data.topic,
					username: usernameList[socket.id],
					message: data.message
				});

				resetTopicTimeout(data.room, data.topic);
			}
		}
	});
	
	socket.on("topic create request", function(data) {
		var topicCreateResponse = processTopicCreateRequest(data);

		socket.emit("topic create response", {
			accepted: topicCreateResponse.accepted,
			username: usernameList[socket.id],
			room: data.room, 
			topic: data.topic,
			description: data.description,
			hue: data.hue,
			message: topicCreateResponse.message
		});

		if (topicCreateResponse.accepted) {
			socket.to(data.room).emit("topic create", {
				username: usernameList[socket.id],
				room: data.room,
				topic: data.topic,
				description: data.description,
				hue: data.hue
			});

			newTopic(data.room, usernameList[socket.id], data.topic, data.description, data.hue);
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

	if (data.username.length < 3 || data.username.length > 24) {
		loginResponse.accepted = false;
		loginResponse.message = "Username must be between 3 and 24 characters.";

		return loginResponse;
	}

	if (data.username.match(usernameValidator) == null) {
		loginResponse.accepted = false;
		loginResponse.message = "Use only letters, numbers, and hyphens.";

		return loginResponse;
	}

	if (getSocketIdByUsername(data.username) != null) {
		loginResponse.accepted = false;
		loginResponse.message = "That username is currently taken.";

		return loginResponse;
	}

	return loginResponse;
}

function processTopicCreateRequest(data) {
	var topicCreateResponse = { accepted: true, message: "Topic created!" };

	if (chatRooms[data.room] == null || chatRooms[data.room] == undefined) {
		topicCreateResponse.accepted = false;
		topicCreateResponse.message = "Invalid room.";

		return topicCreateResponse;
	}

	if (data.topic.length < 3 || data.topic.length > 24) {
		topicCreateResponse.accepted = false;
		topicCreateResponse.message = "Topic name must be between 3 and 24 characters.";

		return topicCreateResponse;
	}

	if (data.topic.match(usernameValidator) == null) {
		topicCreateResponse.accepted = false;
		topicCreateResponse.message = "Use only letters, numbers, and hyphens.";

		return topicCreateResponse;
	}

	if (data.hue == null) {
		topicCreateResponse.accepted = false;
		topicCreateResponse.message = "Select a topic color.";

		return topicCreateResponse;
	}

	for (var i = 0; i < chatRooms[data.room].topics.length; i++) {
		if (chatRooms[data.room].topics[i].name == data.topic) {
			topicCreateResponse.accepted = false;
			topicCreateResponse.message = "That topic already exists.";

			return topicCreateResponse;
		}
	}

	return topicCreateResponse;
}