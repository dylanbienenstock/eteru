var unseenMessage = false;
var title = "ethereal ";
var blinker = "\u25CB";

var lastSender;
var lastColor;

var nextMessageLightGray = true;

var currentRoomName;
var chatRooms = {};
var chatRoomNames = [];

function newChatRoom(roomName, title) {
	var newPageObject = newPage(roomName, title);

	var newChatRoom = {
		name: roomName,
		pageObject: newPageObject,
		activeUsers: [],
		topics: {},
		topicNames: [],
		topicMuted: {},
		currentTopicName: null,
		lastSender: null,
		lastTopic: null,
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

function newTopic(roomName, starterName, topicName, description, hue) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {
		var newTopic = {
			roomName: roomName,
			starterName: starterName,
			name: topicName, 
			description: description,
			hue: hue
		};

		room.topics[topicName] = newTopic;
		room.topicNames.push(topicName);

		if (roomName == currentRoomName) {
			addTopicListing(roomName, topicName, hue);
		}
	}
}

function setTopic(roomName, topicName) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {
		room.currentTopicName = topicName;

		if (topicName == null) {
			$("#topic-display").html("no&nbsp;topic:");
			$("#topic-dot").html("");
			$("#input").css({ backgroundColor: "#202020" });
		} else {
			$("#topic-display").text(topicName + ":");
			$("#input").css({ backgroundColor: chatColorFromHue(room.topics[topicName].hue || 0) });
			$("#topic-dot").css({ color: chatColorFromHue(room.topics[topicName].hue || 0, true) });
			document.getElementById("topic-dot").innerHTML = "&#9679;&nbsp;";
		}
	}
}

function toggleTopicMute(roomName, topicName) { // true = muted
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {	
		var topicIsMuted = room.topicMuted[topicName];
		
		if (topicIsMuted) {
			room.topicMuted[topicName] = false;

			return false;
		} else {
			room.topicMuted[topicName] = true;

			return true;
		}
	}

	return true;
}

function setTopicMuted(roomName, topicName, muted) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {	
		room.topicMuted[topicName] = muted;
	}
}

function isTopicMuted(roomName, topicName) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {	
		var topicIsMuted = room.topicMuted[topicName];

		return topicIsMuted;
	}
}

function setChatRoom(roomName) {
	var room = chatRooms[roomName];

	clearActiveUserListings();
	clearTopicListings();

	if (room != null && room != undefined) {
		setLeftSidebar(true);
		currentRoomName = roomName;

		for (var i = 0; i < room.activeUsers.length; i++) {
			addActiveUserListing(roomName, room.activeUsers[i]);
		}

		for (var i = 0; i < room.topicNames.length; i++) {
			var topic = room.topics[room.topicNames[i]];

			addTopicListing(topic.roomName, topic.name, topic.hue);
		}
	} else {
		setLeftSidebar(false);
		currentRoomName = null;
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
	    	sendChatMessage(currentRoomName, chatRooms[currentRoomName].currentTopicName, $("#input-text").val());
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
	}
}

function removeActiveUser(roomName, username) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {
		var i = room.activeUsers.indexOf(username);

		if (i != -1) {
			room.activeUsers.splice(i, 1);
		}

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

function getCurrentRoomName() {
	return currentRoomName;
}

function getActiveUserCount(roomName) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined)
	{
		return room.activeUsers.length;
	}

	return 0;
}

function getTopicCount(roomName) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined)
	{
		return room.topicNames.length;
	}

	return 0;
}

function chatColorFromHue(hue, fullBright) {
	if (fullBright) {
		return $.Color({ 
					hue: hue,
					saturation: 1,
					lightness: 0.5,
					alpha: 1.0
				});
	}

	return $.Color({ 
				hue: hue,
				saturation: 0.375,
				lightness: 0.15,
				alpha: 1.0
			});
}

function displayChatMessage(roomName, topicName, sender, message) {
	displayChatMessageRaw(roomName, topicName, sender, null, false, true, message);
}

function displayServerMessage(roomName, message) {
	displayChatMessageRaw(roomName, null, null, "#080808", true, false, message);
}

// TO DO: work on the order of these parameters
function displayChatMessageRaw(roomName, topicName, sender, color, centered, showDots, message) {
	var room = chatRooms[roomName];

	if (room != null && room != undefined) {
		if (!window.isActive) {
			unseenMessage = true;
			document.title = title + "\u25CB";
		}

		if (topicName != null && room.topics[topicName] != null) {
			color = chatColorFromHue(room.topics[topicName].hue).toHexString();
		}

		if (sender != room.lastSender || color != room.lastColor || topicName != room.lastTopic) {
			room.containers.main = document.createElement("div");
			room.containers.main.className = "message-container-1";

			$(room.containers.main).css({ backgroundColor: color });

			room.containers.name = document.createElement("div");
			room.containers.name.className = "message-container-2";
			room.containers.name.style.textAlign = "right";

			room.containers.messages = document.createElement("div");
			room.containers.messages.className = "message-container-3";

			if (sender != null) {
				var senderText = document.createElement("span");
				senderText.className = "message-sender";
				senderText.style.fontStyle = "italic";
				senderText.innerHTML = sender;

				room.containers.name.appendChild(senderText);

				if (topicName != null && topicName != room.lastTopic) {
					room.containers.name.appendChild(document.createElement("br"));

					var topicDot = document.createElement("span");
					topicDot.className = "message-topic";
					topicDot.style.color = chatColorFromHue(room.topics[topicName].hue, true).toHexString();
					topicDot.innerHTML = "&#9679;&nbsp;";

					var topicText = document.createElement("span");
					topicText.className = "message-topic";
					topicText.innerHTML = topicName;

					room.containers.name.appendChild(topicDot);
					room.containers.name.appendChild(topicText);
				}
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
		room.lastTopic = topicName;
	} else {
		console.log("Tried to show message in nonexistent room: " + roomName);
	}
}