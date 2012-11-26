var Slide = function($el, config) {
	this.$el = $el;
	this.config = config;

	this.width = $el.width();
	this.height = $el.height();

	this.i = 0;

	this.init();
};

Slide.prototype.init = function() {
	var config = this.config,
		slides = config.slides;

	if (slides.length) {
		this.load(0);
		if (config.autostart) {
			this.play();
		}
	}
};

Slide.prototype.play = function() {

};

Slide.prototype.pause = function() {

};

Slide.prototype.advance = function() {

};

Slide.prototype.recede = function() {

};

Slide.prototype.load = function(i) {
	var self = this,
		slides = this.config.slides,
		slide;

	if (i < 0 || i >= slides.length) {
		return;
	}

	slide = slides[i];

	$.load(slide.src, function(data){

	});
};

$.fn.slide = function(config) {
	var defaults = {
		slides: [],
		speed: 2000,
		autostart: true
	};
	var config = $.extend(defaults, config);
	return this.each(function(){
		new Slide($(this), config);
	});
};

$(document).ready(function(){
	$('.slide').slide();
});