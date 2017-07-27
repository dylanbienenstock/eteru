var socket;

$(function() {
	socket = io();

	socket.on("login response", function(data) {
		document.body.style.cursor = "auto !important";

		if (data.accepted) {
			loginAccepted(data.message);
			addActiveUserListing(data.username);
		} else {
			loginDenied(data.message);
		}
	});

	socket.on("user connected", function(username) {
		
	});

	socket.on("user disconnected", function(username) {
		handleUserDisconnect(username);
	});

	socket.on("room join response", function(data) {
		if (data.accepted) {
			newChatRoom(data.room, data.title, data.description);
			addActiveUser(data.room, data.username);

			for (var i = 0; i < data.activeUsers.length; i++) {
				addActiveUser(data.room, data.activeUsers[i]);;
			}

			for (var i = 0; i < data.topics.length; i++) {
				var topic = data.topics[i];
				
				newTopic(topic.room, topic.starter, topic.name, topic.description, topic.hue);
			}

			selectTabByName(data.room);

			for (var i = 0; i < data.topics.length; i++) {
				var topic = data.topics[i];
				
				updateTopicListingDetails(topic.room, topic.name, topic.messageCount, topic.lastMessageTime);
			}
		}
	});

	socket.on("user join", function(data) {
		displayServerMessage(data.room, data.username + " has joined the room.");
		addActiveUser(data.room, data.username);
	});

	socket.on("user leave", function(data) {
		displayServerMessage(data.room, data.username + " has left the room.");
		removeActiveUser(data.room, data.username);
	});

	socket.on("chat in", function(data) {
		displayChatMessage(data.room, data.topic, data.username, data.message);
		updateTopicListingDetails(data.room, data.topic, data.messageCount, data.lastMessageTime);
	});

	socket.on("chat server", function(data) {
		displayServerMessage(getCurrentTabPage().name, data.message);
	});

	socket.on("topic create response", function(data) {
		document.body.style.cursor = "auto !important";

		if (data.accepted) {
			newTopic(data.room, data.username, data.topic, data.description, data.hue);
			topicAccepted(data.message);
		} else {
			topicRejected(data.message);
		}
	});

	socket.on("topic create", function(data) {
		newTopic(data.room, data.username, data.topic, data.description, data.hue);
	});

	socket.on("topic remove", function(data) {
		removeTopic(data.room, data.topic);
		displayServerMessage(getCurrentTabPage().name, "Topic " + data.topic + " has closed.");
	});
});

// PASSWORDS / ACCOUNTS NOT IMPLEMENTED YET
function sendLoginRequest(username, password) {
	document.body.style.cursor = "wait !important";

	socket.emit("login request", { 
		username: username,
		password: password
	});
}

function sendRoomJoinRequest(roomName, openTabInBackground) {
	if (roomExists(roomName)) return;

	socket.emit("room join request", roomName);
}

function sendChatMessage(roomName, topicName, message) {
	socket.emit("chat out", {
		room: roomName,
		topic: topicName,
		message: message
	});
}

function sendTopicCreateRequest(roomName, topicName, description, hue) {
	document.body.style.cursor = "wait !important";

	socket.emit("topic create request", {
		room: roomName,
		topic: topicName,
		description: description,
		hue: hue
	});
}