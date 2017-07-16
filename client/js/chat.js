var unseenMessage = false;
var title = "ethereal ";
var blinker = "\u25CB";

var lastSender;
var lastColor;

var nextMessageLightGray = true;

var currentRoomName;
var chatRooms = {};
var chatRoomNames = []; // new

function newChatRoom(roomName, title) {
	var newChatRoom = {
		name: roomName,
		pageObject: newPage(roomName, title),
		activeUsers: [],
		lastSender: null,
		lastColor: null,
		containers: {
			main: null,
			name: null,
			messages: null
		}
	};

	chatRooms[roomName] = newChatRoom;
	chatRoomNames.push(roomName);
	arrangeTabsSkipTransition();
}

function setChatRoom(roomName) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {
		currentRoomName = roomName;
		clearActiveUserListings();

		for (var i = 0; i < room.activeUsers.length; i++) {
			addActiveUserListing(roomName, room.activeUsers[i]);
		}
	}
}

$(function() {
    window.isActive = true;
    $(window).blur(function() { this.isActive = false; });
    $(window).focus(function() { 
    	document.title = title;
    	this.isActive = true; 
    	unseenMessage = false;
    });

    window.setInterval(function() {
    	if (unseenMessage) {
    		document.title = title + blinker;
    		blinker = (blinker == "\u25CB" ? "\u25CF" : "\u25CB");
    	}
    }, 500);

	$("#input-text").on("keyup", function (event) {
	    if (event.keyCode == 13) {
	    	sendChatMessage(currentRoomName, $("#input-text").val());
	   		$("#input-text").val("");
	    }
	});
});

function addActiveUser(roomName, username) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined && !room.activeUsers.includes(username)) {
		room.activeUsers.push(username);

		if (room.name == currentRoomName) {
			addActiveUserListing(roomName, username);
		}

		console.log(username + " joined " + roomName);
	}
}

function removeActiveUser(roomName, username) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {
		delete chatRooms[roomName].activeUsers[username];

		removeActiveUserListing(roomName, username, true);
	}
}

function handleUserDisconnect(username) {
	for (var i = 0; i < chatRoomNames.length; i++) {
		removeActiveUser(chatRoomNames[i], username);
	}
}

function roomExists(roomName) {
	var room = chatRooms[roomName];

	return room != null && room != undefined;
}

function displayChatMessage(roomName, sender, message) {
	console.log(roomName + " " + sender + " " + message);

	var room = chatRooms[roomName];

	if (sender != room.lastSender) {
		nextMessageLightGray = !nextMessageLightGray;
	}

	if (nextMessageLightGray) {
		displayChatMessageRaw(roomName, sender, "var(--chat-bg-light)", false, true, message);
	} else {
		displayChatMessageRaw(roomName, sender, "transparent", false, true, message);
	}
}

function displayColoredChatMessage(roomName, sender, hue, message) {
	var color = $.Color({ 
					hue: hue,
					saturation: 0.375,
					lightness: 0.15,
					alpha: 1.0
				});

	displayChatMessageRaw(roomName, sender, color, false, true, message);
}

function displayServerMessage(roomName, message) {
	displayChatMessageRaw(roomName, null, "#080808", true, false, message);
}

// centering not implemented
function displayChatMessageRaw(roomName, sender, color, centered, showDots, message) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {
		if (!window.isActive) {
			unseenMessage = true;
			document.title = title + "\u25CB";
		}

		if (sender != room.lastSender || color != room.lastColor) {
			room.containers.main = document.createElement("div");
			room.containers.main.className = "message-container-1";

			$(room.containers.main).css({ backgroundColor: color });

			room.containers.name = document.createElement("div");
			room.containers.name.className = "message-container-2";

			room.containers.messages = document.createElement("div");
			room.containers.messages.className = "message-container-3";

			if (sender != null) {
				var senderText = document.createElement("span");
				senderText.className = "message-sender";
				senderText.style.fontStyle = "italic";
				senderText.innerHTML = sender;

				room.containers.name.appendChild(senderText);
			} else {
				room.containers.messages.style.paddingLeft = 0;
			}

			room.containers.main.appendChild(room.containers.name);
			room.containers.main.appendChild(room.containers.messages);
			room.pageObject.page.appendChild(room.containers.main);
		}

		var messageText = document.createElement("span");
		messageText.className = "message-text";

		if (centered) {
			messageText.style.textAlign = "center";
		}

		if (showDots) {
			messageText.innerHTML = "<span style=\"opacity: 0.3\">&middot;&nbsp;</span>" + message;
		} else {
			messageText.innerHTML = message;
		}

		room.containers.messages.appendChild(messageText);
		room.containers.messages.appendChild(document.createElement("br"));

		room.pageObject.page.scrollTop = room.pageObject.page.scrollHeight;
		room.lastSender = sender;
		room.lastColor = color;
	} else {
		console.log("Tried to show message in nonexistent room: " + roomName);
	}
}