$(function() {
	$("#input-text").on("keyup", function (event) {
	    if (event.keyCode == 13) {
	    	sendChatMessage(getCurrentTabPage().name, $("#input-text").val());
	   		$("#input-text").val("");
	    }
	});
});

var lastSender;
var chatContainerMain;
var chatContainerName;
var chatContainerMessages;

function displayChatMessage(tabName, sender, hue, message) {
	var page = getTabPageBy("name", tabName).page;

	if (sender != lastSender) {
		chatContainerMain = document.createElement("div");
		chatContainerMain.className = "message-container-1";

		$(chatContainerMain).css({ backgroundColor: $.Color({ 
				hue: hue,
				saturation: 0.375,
				lightness: 0.15,
				alpha: 1.0
			 }) 
		});

		console.log(JSON.stringify($.Color(55, 25, 20, 1).hsla()));

		chatContainerName = document.createElement("div");
		chatContainerName.className = "message-container-2";

		chatContainerMessages = document.createElement("div");
		chatContainerMessages.className = "message-container-3";

		var senderText = document.createElement("span");
		senderText.className = "message-sender";
		senderText.style.fontStyle = "italic";
		senderText.innerHTML = sender;

		chatContainerName.appendChild(senderText);
		chatContainerMain.appendChild(chatContainerName);
		chatContainerMain.appendChild(chatContainerMessages);
		page.appendChild(chatContainerMain);
	}

	var messageText = document.createElement("span");
	messageText.className = "message-text";
	messageText.innerHTML = "<span style=\"opacity: 0.3\">&middot;&nbsp;</span>" + message;

	chatContainerMessages.appendChild(messageText);
	chatContainerMessages.appendChild(document.createElement("br"));

	page.scrollTop = page.scrollHeight;
	lastSender = sender;
}