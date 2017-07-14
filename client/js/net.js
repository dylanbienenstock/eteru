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
});

// PASSWORDS / ACCOUNTS NOT IMPLEMENTED YET
function sendLoginRequest(username, password) {
	socket.emit("login request", { 
		username: username,
		password: password
	});
}

