var Slide = function($el, config) {
	this.$el = $el;
	this.config = config;

	this.width = $el.width();
	this.height = $el.height();

	this.i = 0;
	this.firstload = true;

	this.init();
};

Slide.prototype.init = function() {
	var config = this.config,
		slides = config.slides;

	if (slides.length) {
		this.goTo(0);
		if (config.autostart) {
			this.play();
		}
		this.load(1); 
	}
};

Slide.prototype.play = function() {
	var self = this;
	this.interval = setInterval(function(){
		self.advance();
		self.load(self.i + 1); //preload the next one
	}, this.config.speed);
};

Slide.prototype.pause = function() {
	clearInterval(this.interval);
};

Slide.prototype.advance = function() {
	this.i = this.i + 1;
	this.goTo(this.i);
};

Slide.prototype.recede = function() {
	this.i = this.i - 1;
	this.goTo(this.i);
};

Slide.prototype.transition = function($newSlide){
	var self = this;

	if (!$newSlide.length) { 
		return;
	}

	var $current = self.$el.children('.slide').not('.hide'),
		fadeNew = function(){ 
			$newSlide.hide().removeClass('hide').fadeTo(400, 1); 
		};

	if ($current.length) {
		$current.fadeTo(300, 0, function(){
			$(this).addClass('hide');
			fadeNew();
		});
	}
	else {
		fadeNew();
	}
};

Slide.prototype.goTo = function(i) {
	var self = this,
		slides = this.config.slides,
		slide;

	if (i < 0 || i >= slides.length) {
		return;
	}

	slide = slides[i];

	if (slide.$el !== undefined) {
		this.transition(slide.$el);
	}
	else if (slide.loading) {
		// ?
	}
	else {
		this.load(i, function($newSlide){
			self.transition($newSlide);
		})
	}
};

Slide.prototype.load = function(i, callback) {
	var self = this,
		slides = this.config.slides,
		slide,
		html,
		src;

	if (i < 0 || i >= slides.length) {
		return;
	}

	slide = slides[i];
	slide.loading = true;
	src = slide.src;

	if (src === undefined || src.length === 0) {
		return;
	}

	html = '<div id="latest-slide" class="slide offpage"><img src="'+src+'"></div>';
	this.$el.append(html);

	$('#latest-slide img').load(function(){
		var $img = $(this),
			$slide = $img.closest('.slide'),
			w = self.width,
			h = self.height,
			oldWidth = $img.width(),
			oldWheight = $img.height(),
			scaledWidth,
			scaledHeight,
			wr = oldWidth / w,
			hr = oldWheight / h,
			ratio;

		if (wr > 1 || hr > 1) {
			ratio = Math.max(wr, hr);
			scaledWidth = oldWidth / ratio;
			scaledHeight = oldWheight / ratio;
		}
		else {
			scaledWidth = oldWidth;
			scaledHeight = oldWheight;
		}

		$img.css({
			width: scaledWidth + "px",
			height: scaledHeight + "px",
			marginTop: (scaledHeight * -.5) + "px",
			marginLeft: (scaledWidth * -.5) + "px"
		});
		$slide.removeAttr('id').removeClass('offpage').addClass('hide');

		slide.$el = $slide;
		if (callback !== undefined) {
			callback($slide);
		}
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
	$('#home-slides').slide({
		slides: (function(){
			var count = 10,
				i = 0,
				a = new Array(count);
			while (i < count) {
				a[i++] = {
					src: "img/" + (i < 10 ? "0" : "") + i + ".jpg"
				}
			}
			return a;
		})()
	});
});