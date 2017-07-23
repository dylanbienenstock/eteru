function makeScrollable(target) {
	$(target).on("mousewheel", function(event) {
		target.scrollTop -= event.deltaY * event.deltaFactor;
	});
}