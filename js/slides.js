var Slide = function($el, config) {
	this.$el = $el;
	this.config = config;
	this.numSlides = config.slides && config.slides.length || 0;

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
		this.addControls();
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
		self.preload(); 
	}, this.config.speed);
	this.isPlaying = true;
};

Slide.prototype.pause = function() {
	clearInterval(this.interval);
	this.isPlaying = false;
};

Slide.prototype.resetInterval = function(){
	if (this.isPlaying) {
		this.pause();
		this.play();
	}
};

Slide.prototype.advance = function() {
	var next = (this.i + 1) % this.numSlides;
	
	this.i = next;
	this.goTo(next);
	this.resetInterval();
};

Slide.prototype.recede = function() {
	var i = this.i,
		next = (i === 0 ? this.numSlides : i) - 1;

	this.i = next;
	this.goTo(next);
	this.resetInterval();
};

Slide.prototype.addControls = function(){
	var a = [];

	a.push('<div class="controls">');

	if (this.config.autostart) {
		a.push('<div class="icon pause"></div>');
	}
	else {
		a.push('<div class="icon play"></div>');
	}
	a.push('<div class="icon prev"></div>');
	a.push('<div class="icon next"></div>');

	a.push('</div>');

	this.$el.append(a.join(''));
	this.bindControlEvents();
};

Slide.prototype.bindControlEvents = function(){
	var $el = this.$el,
		self = this;

	$el.mouseenter(function(){
		$(this).find('.controls').stop().animate({
			bottom: "0px"
		}, 300);
	}).mouseleave(function(){
		$(this).find('.controls').stop().animate({
			bottom: "-55px"
		}, 500);
	});

	$el.on('click', '.icon', function(e){
		e.preventDefault();
		var $icon = $(e.target);

		if ($icon.hasClass('play')) {
			self.play();
			$icon.removeClass('play').addClass('pause');
		}
		else if ($icon.hasClass('pause')) {
			self.pause();
			$icon.removeClass('pause').addClass('play');
		}
		else if ($icon.hasClass('prev')) {
			self.recede();
		}
		else if ($icon.hasClass('next')) {
			self.advance();
		}
	});
};

Slide.prototype.transition = function($newSlide){
	var self = this;

	if (!$newSlide.length) { 
		return;
	}

	var $current = self.$el.children('.slide:not(.hide)'),
		fadeNew = function(){ 
			$newSlide.hide().removeClass('hide').fadeTo(400, 1); 
		};

	if ($current.length) {
		$current.fadeTo(300, 0, function(){
			$(this).addClass('hide').hide();
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
		console.log('still loading...');
	}
	else {
		this.load(i, function($newSlide){
			self.transition($newSlide);
		})
	}
};

Slide.prototype.preload = function() {
	var numSlides = this.config.slides.length || 0,
		nextIndex = (this.i + 1) % numSlides;

	this.load(nextIndex);
};

Slide.prototype.load = function(i, callback) {
	var self = this,
		slides = this.config.slides,
		slide,
		html,
		src,
		id = "s" + (+new Date);

	if (i < 0 || i >= slides.length) {
		return;
	}

	slide = slides[i];

	if (slide.loading || slide.$el !== undefined) {
		return;
	}

	slide.loading = true;
	src = slide.src;

	if (src === undefined || src.length === 0) {
		return;
	}

	html = '<div id="'+id+'" class="slide offpage"><img src="'+src+'"></div>';
	this.$el.append(html);

	var tries = 0;
	$('#'+id+' img').load(function(){
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

		if ((oldWidth === 0 || oldWheight === 0) && tries < 3) {
			tries++;
			console.log('trying again');
			$img.trigger('load');
			return;
		}

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
		speed: 3000,
		autostart: true
	};
	var config = $.extend(defaults, config);
	return this.each(function(){
		new Slide($(this), config);
	});
};

$(document).ready(function(){
	$('#home-slides').slide({
		autostart: false,
		slides: (function(){
			var count = 93,
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

	$('#picnic-slides').slide({
		autostart: false,
		slides: [
			{src: "img/ebengfine_0.jpg"},
			{src: "img/ebengfine_ropeswing.jpg"},
			{src: "img/ebengfine_rocks.jpg"}
		]
	})
});