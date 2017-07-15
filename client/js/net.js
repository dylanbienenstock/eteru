var socket;

$(function() {
	socket = io();

	socket.on("login response", function(data) {
		if (data.accepted) {
			loginAccepted(data.message);
		} else {
			loginDenied(data.message);
		}
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