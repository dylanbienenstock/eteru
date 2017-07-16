var socket;

$(function() {
	socket = io();

	socket.on("login response", function(data) {
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
			newChatRoom(data.room, data.title);
			addActiveUser(data.room, data.username);

			for (var i = 0; i < data.activeUsers.length; i++) {
				addActiveUser(data.room, data.activeUsers[i]);;
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
		displayChatMessage(data.room, data.username, data.message);
	});

	socket.on("chat server", function(data) {
		displayServerMessage(getCurrentTabPage().name, data.message);
	});
});

// PASSWORDS / ACCOUNTS NOT IMPLEMENTED YET
function sendLoginRequest(username, password) {
	socket.emit("login request", { 
		username: username,
		password: password
	});
}

function sendRoomJoinRequest(roomName) {
	socket.emit("room join request", roomName);
}

function sendChatMessage(roomName, message) {
	socket.emit("chat out", {
		room: roomName,
		message: message
	});

	console.log("sendChatMessage " + roomName);
}