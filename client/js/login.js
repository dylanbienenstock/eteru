var loginWasAccepted = false;
var loginMessageFadeTimeout;

$(function() {
	document.getElementById("input-username").focus();

	centerLogin();

	$(window).resize(function() {
		centerLogin();
	});

	$("#login").on("keyup", function (event) {
	    if (!loginWasAccepted && event.keyCode == 13) {
	    	var username = $("#input-username").val();
	    	var password = $("#input-password").val();

	    	$("#input-username").prop("disabled", true);
	    	$("#input-password").prop("disabled", true);

	    	sendLoginRequest(username, password);
	    }
	});
});

function centerLogin() {
	$("#login").offset({
		left: $(window).width() / 2 - $("#login").outerWidth() / 2, 
		top: $(window).height() / 2 - $("#login").outerHeight() / 2
	});

	centerLoginMessage();
}

function centerLoginMessage() {
	$("#login-message").offset({
		left: $("#login").offset().left + $("#login").outerWidth() / 2 - $("#login-message").outerWidth() / 2, 
		top: $("#login").offset().top + $("#login").outerHeight() + 2
	});
}

const FAST_LOGIN_ANIMATION = false;

function loginAccepted(message) {
	loginWasAccepted = true;

	$("#login-message")
	.stop()
	.css({ opacity: 1, color: "#00FF00" })
	.text(message);

	$("#input-username").stop().css({ color: "#00FF00", borderColor: "#00FF00" });
	$("#label-username").stop().css({ color: "#00FF00" })

	centerLoginMessage();
	clearTimeout(loginMessageFadeTimeout);

	if (FAST_LOGIN_ANIMATION) { // 1.6 seconds
		setTimeout(function() {
			$("#veil").fadeOut(600);
		}, 1000);
	} else { 			  		// 2.9 seconds
		setTimeout(function() {
			$("#login-message").fadeOut(600);
			$("#login").fadeOut(600, function() {
				setTimeout(function() {
					$("#veil").fadeOut(600);
				}, 100);
			});
		}, 1000);
	}
}

function loginDenied(message) {
	$("#input-username").prop("disabled", false);
	$("#input-password").prop("disabled", false);

	$("#input-username").get(0).focus();

	$("#login-message")
	.stop()
	.css({ opacity: 1 })
	.text(message);

	$("#input-username").stop().css({ color: "red", borderColor: "red" });
	$("#label-username").stop().css({ color: "red" })

	clearTimeout(loginMessageFadeTimeout);

	loginMessageFadeTimeout = setTimeout(function() {
		$("#login-message").stop().animate({ opacity: 0 }, 500);
		$("#input-username").stop().animate({ color: "#808080", borderColor: "#808080" }, 500);
		$("#label-username").stop().animate({ color: "#808080" }, 500);
	}, 1500);

	centerLoginMessage();
}