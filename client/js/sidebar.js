var leftHandle;
var leftSidebarAnimating = false;
var leftSidebarCollapsed = false;

var rightHandle;
var rightSidebarAnimating = false;
var rightSidebarCollapsed = false;

var sidebarFullWidth = 216;

$(function() {
	leftHandle = document.createElement("div");
	leftHandle.id = "left-sidebar-handle";
	leftHandle.className = "sidebar-handle";
	leftHandle.innerHTML = "&larr;";

	rightHandle = document.createElement("div");
	rightHandle.id = "right-sidebar-handle";
	rightHandle.className = "sidebar-handle";
	rightHandle.innerHTML = "&rarr;";

	positionHandles();
	document.body.appendChild(leftHandle);
	document.body.appendChild(rightHandle);

	$("body").on("mousemove", function(event) {
		if (!leftSidebarAnimating) {
			var quickDist = Math.abs($(leftHandle).offset().left - event.pageX) + Math.abs($(leftHandle).offset().top - event.pageY);

			if (quickDist <= 300) {
				leftHandle.style.opacity = 1;
			}
			else {
				leftHandle.style.opacity = 0;
			}
		}

		if (!rightSidebarAnimating) {
			var quickDist = Math.abs($(rightHandle).offset().left - event.pageX) + Math.abs($(rightHandle).offset().top - event.pageY);

			if (quickDist <= 300) {
				rightHandle.style.opacity = 1;
			}
			else {
				rightHandle.style.opacity = 0;
			}
		}
	})

	$("body").on("click", "#left-sidebar-handle", function() {
		leftSidebarAnimating = true;

		if (!leftSidebarCollapsed) {
			$("#left-sidebar").animate({ width: 0, minWidth: 0 }, 200, function() {
				leftSidebarAnimating = false; 
				leftSidebarCollapsed = true;
				leftHandle.innerHTML = "&rarr;";
			});
		} else {
			$("#left-sidebar").animate({ width: sidebarFullWidth, minWidth: sidebarFullWidth }, 200, function() {
				leftSidebarAnimating = false; 
				leftSidebarCollapsed = false;
				leftHandle.innerHTML = "&larr;";
			});
		}
	});

	$("body").on("click", "#right-sidebar-handle", function() {
		rightSidebarAnimating = true;

		if (!rightSidebarCollapsed) {
			$("#right-sidebar").animate({ width: 0, minWidth: 0 }, 200, function() {
				rightSidebarAnimating = false; 
				rightSidebarCollapsed = true;
				rightHandle.innerHTML = "&larr;";
			});
		} else {
			$("#right-sidebar").animate({ width: sidebarFullWidth, minWidth: sidebarFullWidth }, 200, function() {
				rightSidebarAnimating = false; 
				rightSidebarCollapsed = false;
				rightHandle.innerHTML = "&rarr;";
			});
		}
	});

	$("#left-sidebar").resize(function() {
		positionHandles(true);

		$("#left-sidebar-content").css({ left: $("#left-sidebar").width() - sidebarFullWidth + 1 });
	});

	$("#right-sidebar").resize(function() {
		positionHandles(false);
	});

	$(window).resize(function() {
		positionHandles(true);
		positionHandles(false);
		resizeTopics();
	});

	setTimeout(resizeTopics, 10);

	$("#right-sidebar-handle").click(); // TEMPORARY
});

function resizeTopics() {
	var overflowHeight = $("body").height() - 16;
	var topicsHeight = $("#sbe-current-topics").outerHeight();
	var topicsY = $("#sbe-current-topics").offset().top;
	var newHeight = topicsHeight - ((topicsY + topicsHeight) - overflowHeight) - 8;

	$("#sbe-current-topics").css( { height: newHeight });
}

function positionHandles(left) {
	if (left) {
		leftHandle.style.left = Math.max($("#left-sidebar").outerWidth() + 12, 12) + "px";
		leftHandle.style.top = $(document.body).height() / 2 - 16 + "px";

		arrangeTabsSkipTransition();
	} else {
		rightHandle.style.left = Math.min($("#right-sidebar").offset().left - 32 - 16 - 12, $("body").width() - 12 - 32) + "px";
		rightHandle.style.top = $(document.body).height() / 2 - 16 + "px";
	}
}

var currentActiveUserCount = 0;

function addActiveUserListing(username) {
	var activeUserContainer = document.createElement("div");
	activeUserContainer.className = "active-user-listing-container";

	var activeUserText = document.createElement("span");
	activeUserText.className = "active-user-listing";
	activeUserText.innerHTML = username;

	activeUserContainer.appendChild(activeUserText);
	document.getElementById("sbe-active-users-content").appendChild(activeUserContainer);

	$("#sbe-active-users-content").find("div:even").css({ backgroundColor: "transparent" });
	$("#sbe-active-users-content").find("div:odd").css({ backgroundColor: "var(--chat-bg-light)" });

	currentActiveUserCount++;
	document.getElementById("sbe-active-users-title").innerHTML = "active users (" + currentActiveUserCount + ")";
}

function removeActiveUserListing(username) {
	var list = document.getElementById("sbe-active-users-content");
	var children = list.children;

	for (var i = 0; i < children.length; i++) {
		if ($(children[i]).find("span").first().text() == username) {
			list.removeChild(children[i]);

			$("#sbe-active-users-content").find("div:even").css({ backgroundColor: "transparent" });
			$("#sbe-active-users-content").find("div:odd").css({ backgroundColor: "var(--chat-bg-light)" });

			currentActiveUserCount--;
			document.getElementById("sbe-active-users-title").innerHTML = "active users (" + currentActiveUserCount + ")";

			break;
		}
	}	
}

function fixActiveUserListingColors() {
	nextActiveUserLightGray = true;
	var children = document.getElementById("sbe-active-users-content").children;

	for (var i = 0; i < children.length; i++) {
		if (nextActiveUserLightGray) {
			children[i].style.backgroundColor = "var(--chat-bg-light)";
		}

		nextActiveUserLightGray = !nextActiveUserLightGray;
	}
}