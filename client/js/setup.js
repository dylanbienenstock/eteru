$(function() { 
	newPage("home", "<span class=\"tab-label\">home</span");
	selectTab("tab-0");
	registerTabAnimations(true);

	$(function(){
      $("#page-0").load("home.html"); 
    });
});