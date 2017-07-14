$(function() {
	$("#input-text").on("keyup", function (event) {
	    if (event.keyCode == 13) {
	    	sendChatMessage(getCurrentTabPage().name, $("#input-text").val());
	    	$("#input-text").val("");
	    }
	});
});

function displayChatMessage(tabName, senderText, messageText) {
	var page = getTabPageBy("name", tabName).page;
	var container = document.createElement("div");
	container.className = "message-test";

	var sender = document.createElement("span");
	sender.innerHTML = senderText;
	sender.style.color = "yellow";
	sender.style.marginRight = "16px";

	var message = document.createElement("span");
	message.innerHTML = messageText;

	container.appendChild(sender);
	container.appendChild(message);
	page.appendChild(container);
	page.appendChild(document.createElement("br"));

	page.scrollTop = page.scrollHeight;
}