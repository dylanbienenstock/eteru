var unseenMessage = false;
var title = "ethereal ";
var blinker = "\u25CB";

var lastSender;
var lastColor;

var nextMessageLightGray = true;

var chatContainerMain;
var chatContainerName;
var chatContainerMessages;

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
		displayChatMessageRaw(tabName, sender, "var(--chat-bg-light)", false, true, message);
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
	if (!window.isActive) {
		unseenMessage = true;
		document.title = title + "\u25CB";
	}

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
		} else {
			chatContainerMessages.style.paddingLeft = 0;
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