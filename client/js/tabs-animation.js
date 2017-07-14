// to do: merge this file with tabs.js

var tabOrder = [];
var mouseStartX;
var draggingTab;
var draggingTabStartX;
var dragging = false;
var minLeft;

function registerTabsForDragNDrop(__tabs) {
	tabOrder = __tabs;
}

$(function() {
	$("body").on("mousedown", ".tab--inactive, .tab--active", function(event) {
		if (event.which != 1) return;

		mouseStartX = event.pageX;
		draggingTab = $(this);
		draggingTabStartX = $(this).offset().left;

		dragging = true;
		//selectTab($(this).attr("id"));
	});

	$("body").mouseup(function() {
		dragging = false;

		arrangeTabs();
	});

	$("body").mousemove(function(event) {
		if (!dragging) return;

		var mouseOffsetX = event.pageX - mouseStartX;

		tabOrder.sort(function(a, b) {
			var aCenterX = $(a).offset().left + $(a).outerWidth() / 2;
			var bCenterX = $(b).offset().left + $(b).outerWidth() / 2;

			if (aCenterX < bCenterX) {
				return -1;
			}

			if (aCenterX > bCenterX) {
				return 1;
			}

			return 0;
		});

		arrangeTabs();

		draggingTab.offset({left: Math.max(draggingTabStartX + mouseOffsetX, $("#left-sidebar").outerWidth() - 32), top: draggingTab.offset().top });
	});
});

function arrangeTabs() {
	var offset = 0;//$("#left-sidebar").outerWidth();
	
	for (var i = 0; i < tabOrder.length; i++) {
		var tab = tabOrder[i];

		if (tab != draggingTab) {
			tab.style.left = offset + "px";
			offset += $(tab).outerWidth() - 10; 

			var color = 80 - 12 * ((i - 1) % 3);
			$(tab).css("border-bottom-color", jQuery.Color(color, color, color, 1));
		}
	}
}

function arrangeTabsSkipTransition() {
	var offset = 0;//$("#left-sidebar").outerWidth();
	
	for (var i = 0; i < tabOrder.length; i++) {
		var tab = tabOrder[i];

		if (tab != draggingTab) {
			skipTransition(tab, function() {
tab.style.left = offset + "px";
			});
			

			offset += $(tab).outerWidth() - 10; 
		}
	}
}