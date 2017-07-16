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

	socket.on("populate users", function(data) {
		data.forEach(function(username) {
			addActiveUserListing(username);
		});
	});

	socket.on("user connected", function(data) {
		displayServerMessage(getCurrentTabPage().name, data.message);
		addActiveUserListing(data.username);
	});

	socket.on("user disconnected", function(data) {
		displayServerMessage(getCurrentTabPage().name, data.message);
		removeActiveUserListing(data.username);
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

function sendChatMessage(room, message) {
	socket.emit("chat out", {
		room: room,
		message: message
	});
}