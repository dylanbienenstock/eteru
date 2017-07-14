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

	// TEMPORARY

	$("#right-sidebar-handle").click();

	// Dragging / resizing functionality. Commented out because
	// I'm losing my will to live.

	/*

	var mouseStartY;
	var dragStartY;
	var dragging = false;
	var overflowHeight = $("body").height() - 16;

	$("body").on("mousedown", "#left-sidebar-resize", function(event) {
		mouseStartY = event.pageY;
		dragging = true;
	});

	$("body").mouseup(function() {
		dragging = false;
	});

	$(window).mousemove(function(event) {
		if (dragging) {
			var mouseOffsetY = event.pageY - $("#sbe-active-users").offset().top - 32 - mouseStartY;
			var topicsHeight = $("#sbe-current-topics").outerHeight();
			var topicsY = $("#sbe-current-topics").offset().top;
			var newHeight = topicsHeight - ((topicsY + topicsHeight) - overflowHeight) - 8;

			console.log(event.pageY + " ? " + ($("body").height() - 175 - 16));
			if (event.pageY < $("body").height() - 175 - 16) {
				$("#sbe-current-topics").css( { height: newHeight });
				$("#sbe-active-users").css( { height: mouseStartY + mouseOffsetY});
			}
			else {
				$("#sbe-current-topics").css( { height: "175px" });
				$("#sbe-active-users").css( { height: mouseStartY + mouseOffsetY});
			}
		}
	});

	var topicsHeight = $("#sbe-current-topics").outerHeight();
	var topicsY = $("#sbe-current-topics").offset().top;
	var newHeight = topicsHeight - ((topicsY + topicsHeight) - overflowHeight) - 8;

	$("#sbe-current-topics").css( { height: newHeight });

	*/
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





















































































//////    /!\ testing purposes only (TOP SECRET CODE) /!\    //////


$(function() {
	$("body").on("click", "#sbe-room-info-leave", function() {
		for (var i = 0; i < 5; i++) {
			var activeUsers = document.getElementById("sbe-active-users-content");
			var line = document.createElement("span");
			line.innerHTML = "--------------";
			activeUsers.appendChild(line);
			activeUsers.appendChild(document.createElement("br"));
		}
	});

	$("body").on("click", "#sbe-room-info-rules", function() {
		for (var i = 0; i < 5; i++) {
			var activeUsers = document.getElementById("sbe-current-topics-content");
			var line = document.createElement("span");
			line.innerHTML = "--------------";
			activeUsers.appendChild(line);
			activeUsers.appendChild(document.createElement("br"));
		}
	});
});