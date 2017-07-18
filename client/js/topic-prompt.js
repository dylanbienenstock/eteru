var canvas;
var context;
var lastLineX;
var canvasWidth;
var canvasheight;
var selectedHue;
var colorResetTimeout;
var messageFadeTimeout;
var promptOpenedBefore;
var topicWasAccepted;

$(function() {
	canvas = document.getElementById("hue-canvas");
	context = canvas.getContext("2d");

	$("#new-topic-veil").click(function(event) {
		var minX = $("#new-topic").offset().left;
		var minY = $("#new-topic").offset().top;
		var maxX = minX + $("#new-topic").outerWidth();
		var maxY = minY + $("#new-topic").outerHeight();

		if (event.pageX < minX || event.pageX > maxX || event.pageY < minY || event.pageY > maxY) {
			$("#new-topic-veil").fadeOut(300);
		}
	});

	$(canvas).mousemove(function(event) {
		selectColorAt(event.pageX - $(canvas).offset().left);
	});

	centerNewTopicPrompt();

	$(window).resize(function() {
		centerNewTopicPrompt();
	});

	$("#hue-canvas").on("click", function (event) {
	    if (!topicWasAccepted) {
	    	var topicName = $("#input-new-topic-name").val();
	    	var description = $("#input-new-topic-description").val();

	    	$("#input-new-topic-name").prop("disabled", true);
	    	$("#input-new-topic-description").prop("disabled", true);

	    	sendTopicCreateRequest(getCurrentRoomName(), topicName, description, Math.floor(selectedHue));
	    }
	});
});

function centerNewTopicPrompt() {
	$("#new-topic").offset({
		left: $(window).width() / 2 - $("#new-topic").outerWidth() / 2, 
		top: $(window).height() / 2 - $("#new-topic").outerHeight() / 2
	});

	centerNewTopicMessage();
}

function centerNewTopicMessage() {
	$("#new-topic-message").offset({
		left: $("#new-topic").offset().left + $("#new-topic").outerWidth() / 2 - $("#new-topic-message").outerWidth() / 2, 
		top: $("#new-topic").offset().top + $("#new-topic").outerHeight() + 2
	});
}

function openNewTopicPrompt() {
	topicWasAccepted = false;

	$("#input-new-topic-name").val("");
	$("#input-new-topic-description").val("");
	$("#input-new-topic-name").prop("disabled", false);
	$("#input-new-topic-description").prop("disabled", false);
	$("#input-username").get(0).focus();
	$("#new-topic-veil").fadeIn(300);

	if (!promptOpenedBefore) {
		canvasWidth = $(canvas).width();
		canvasheight = $(canvas).height();
		context.translate(0.5, 0.5);

		promptOpenedBefore = true;
	}

	for (var i = 0; i < canvasWidth + 1; i++) {
		context.beginPath();
		context.moveTo(i, -1);
		context.lineTo(i, canvasheight + 1);
		context.lineWidth = 1;
		context.strokeStyle = chatColorFromHue(i * (360 / canvasWidth)).toHexString();
		context.stroke();
	}

	centerNewTopicPrompt();
}

function topicAccepted(message) {
	topicWasAccepted = true;

	$("#new-topic-message")
	.stop()
	.css({ opacity: 1, color: "#00FF00" })
	.text(message);

	centerNewTopicMessage();
	clearTimeout(messageFadeTimeout);

	setTimeout(function() {
		$("#new-topic-veil").fadeOut(600);
	}, 500);
}

function topicRejected(message) {
	$("#input-new-topic-name").prop("disabled", false);
	$("#input-new-topic-description").prop("disabled", false);

	$("#new-topic-message")
	.stop()
	.css({ opacity: 1, color: "#FF0000" })
	.text(message);

	centerNewTopicMessage();
	clearTimeout(messageFadeTimeout);

	messageFadeTimeout = setTimeout(function() {
		$("#new-topic-message").stop().animate({ opacity: 0 }, 500);
	}, 1500);
}

// Really sorry for this
function selectColorAt(lineX) {
	if (topicWasAccepted) return;

	lineX = Math.round(lineX);

	lineX -= 2;
	selectedHue = lineX * (360 / canvasWidth);

	if (lastLineX != null) {
		context.beginPath();
		context.moveTo(lastLineX, -1);
		context.lineTo(lastLineX, canvasheight + 1);
		context.lineWidth = 1;
		context.strokeStyle = chatColorFromHue(lastLineX * (360 / canvasWidth)).toHexString();
		context.stroke();

		context.beginPath();
		context.moveTo(lastLineX - 1, -1);
		context.lineTo(lastLineX - 1, canvasheight + 1);
		context.lineWidth = 1;
		context.strokeStyle = chatColorFromHue((lastLineX - 1) * (360 / canvasWidth)).toHexString();
		context.stroke();

		context.beginPath();
		context.moveTo(lastLineX + 1, -1);
		context.lineTo(lastLineX + 1, canvasheight + 1);
		context.lineWidth = 1;
		context.strokeStyle = chatColorFromHue((lastLineX + 1) * (360 / canvasWidth)).toHexString();
		context.stroke();
	}

	context.beginPath();
	context.moveTo(lineX, -1);
	context.lineTo(lineX, canvasheight + 1);
	context.lineWidth = 1;
	context.strokeStyle = chatColorFromHue(selectedHue, true).toHexString();
	context.stroke();

	context.beginPath();
	context.moveTo(lineX - 1, -1);
	context.lineTo(lineX - 1, canvasheight + 1);
	context.lineWidth = 1;
	context.strokeStyle = chatColorFromHue(selectedHue, true).toHexString();
	context.stroke();

	context.beginPath();
	context.moveTo(lineX + 1, -1);
	context.lineTo(lineX + 1, canvasheight + 1);
	context.lineWidth = 1;
	context.strokeStyle = chatColorFromHue(selectedHue, true).toHexString();
	context.stroke();

	lastLineX = lineX;

	$("#new-topic").css({ backgroundColor: chatColorFromHue(selectedHue) });
	$("#input-new-topic-name").css({ backgroundColor: chatColorFromHue(selectedHue) });
	$("#input-new-topic-description").css({ backgroundColor: chatColorFromHue(selectedHue) });

	clearTimeout(colorResetTimeout);

	colorResetTimeout = setTimeout(function() {
		//$("#new-topic").animate({ backgroundColor: "#303030" }, 400);
		//$("#input-new-topic-name").animate({ backgroundColor: "#303030" }, 400);
		//$("#input-new-topic-description").animate({ backgroundColor: "#303030" }, 400);
	}, 1250);
}