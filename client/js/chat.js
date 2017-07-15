var lastSender;
var lastColor;
var nextMessageLightGray = false;
var chatContainerMain;
var chatContainerName;
var chatContainerMessages;

$(function() {
	$("#input-text").on("keyup", function (event) {
	    if (event.keyCode == 13) {
	    	sendChatMessage(getCurrentTabPage().name, $("#input-text").val());
	   		$("#input-text").val("");
	    }
	});
});

function displayChatMessage(tabName, sender, message) {
	if (sender != lastSender) {
		nextMessageLightGray = !nextMessageLightGray;
	}

	if (nextMessageLightGray) {
		displayChatMessageRaw(tabName, sender, "#262626", false, true, message);
	} else {
		displayChatMessageRaw(tabName, sender, "transparent", false, true, message);
	}
}

function displayColoredChatMessage(tabName, sender, hue, message) {
	var color = $.Color({ 
					hue: hue,
					saturation: 0.375,
					lightness: 0.15,
					alpha: 1.0
				});

	displayChatMessageRaw(tabName, sender, color, false, true, message);
}

function displayServerMessage(tabName, message) {
	displayChatMessageRaw(tabName, null, "#080808", true, false, message);
}

// centering not implemented
function displayChatMessageRaw(tabName, sender, color, centered, showDots, message) {
	var page = getTabPageBy("name", tabName).page;

	if (sender != lastSender || color != lastColor) {
		chatContainerMain = document.createElement("div");
		chatContainerMain.className = "message-container-1";

		$(chatContainerMain).css({ backgroundColor: color });

		chatContainerName = document.createElement("div");
		chatContainerName.className = "message-container-2";

		chatContainerMessages = document.createElement("div");
		chatContainerMessages.className = "message-container-3";

		if (sender != null) {
			var senderText = document.createElement("span");
			senderText.className = "message-sender";
			senderText.style.fontStyle = "italic";
			senderText.innerHTML = sender;

			chatContainerName.appendChild(senderText);
		}

		chatContainerMain.appendChild(chatContainerName);
		chatContainerMain.appendChild(chatContainerMessages);
		page.appendChild(chatContainerMain);
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

	chatContainerMessages.appendChild(messageText);
	chatContainerMessages.appendChild(document.createElement("br"));

	page.scrollTop = page.scrollHeight;
	lastSender = sender;
	lastColor = color;
}