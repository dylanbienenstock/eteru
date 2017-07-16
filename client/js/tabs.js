// TO DO: Clean up this file

var tabs = [];
var tabNames = {};
var pages = []; // { id, page, name }
var firstTabAnimationRegistered = false;
var currentTabPage; // { id, page, name }

function newPage(name, title) {
	var isFirstTab = tabs.length == 0;
	var tab = document.createElement("div");
	tab.id = "tab-" + tabs.length;
	tab.className = isFirstTab ? "tab--active" : "tab--inactive";
	tab.innerHTML = title;

	document.getElementById("tabs").appendChild(tab);

	if (!isFirstTab) {
		var lastTab = tabs[tabs.length - 1];
		tab.style.position = "absolute";
		tab.style.left = $(lastTab).offset().left + $(lastTab).outerWidth() - 10 + "px";
		tab.style.zIndex = 1000 - tabs.length;

		var color = 80 - 12 * ((tabs.length - 1) % 3);
		tab.style.borderBottom = "30px solid rgb(" + color + ", " + color + ", " + color + ")";
	}

	// FIX THIS
	tab.onclick = function() {
		selectTab(tab.id);
	}

	var newPage = document.createElement("div");
	newPage.id = "page-" + tabs.length;
	newPage.className = "chat-tab-page";

	$(newPage).appendTo($("#chat"));

	var newPageObject = { id: tab.id, name: name, page: newPage };
	currentTabPage = newPageObject;

	pages.push(newPageObject);
	tabs.push(tab);
	tabNames[tab.id] = name;

	return newPageObject;
}

function selectTab(id) {
	setChatRoom(tabNames[id]);

	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];

		tab.className = "tab--inactive";
		tab.style.zIndex = 1000 - i;

		var color = 80 - 12 * ((i - 1) % 3);

		skipTransition(tab, function() { 
			tab.style.borderBottom = "30px solid rgb(" + color + ", " + color + ", " + color + ")";
		});

		if (tab.id == id) {
			tab.className = "tab--active";
			tab.style.zIndex = 1001; 
		}
	}

	if (id != "tab-0" && !firstTabAnimationRegistered) {
		registerTabAnimations(false);
		firstTabAnimationRegistered = true;
	}

	for (var i = 0; i < pages.length; i++) {
		var pages_i = pages[i];

		if (pages_i.id == id) {
			pages_i.page.style.display = "block";
			currentTabPage = pages_i;
		} else {
			pages_i.page.style.display = "none";
		}
	}
}

function getTabPageBy(nameOrId, value) {
	for (var i = 0; i < pages.length; i++) {
		var pages_i = pages[i];

		if (pages_i[nameOrId] == value) {
			return pages[i];
		}
	}

	return null;
}

function getCurrentTabPage() {
	return currentTabPage;
}

//// 

function registerTabAnimations(dragNDrop) {
	$(".tab--inactive").hover(function() {
		$(this).css("border-bottom-color", "#808080");
	}, function() {
		var color = 255;

		for (var i = 0; i < tabs.length; i++) {
			var tab = tabs[i];

			if (tab.id == $(this).attr("id")) {
				color = 80 - 12 * ((i - 1) % 3);
			}
		}

		$(this).css("border-bottom-color", jQuery.Color(color, color, color, 1));

		// $(this).stop().animate({
		// 	borderBottomColor: jQuery.Color(color, color, color, 1)
		// }, 150);
	})

	if (dragNDrop) {
		registerTabsForDragNDrop(tabs);
		arrangeTabs();
	}
}