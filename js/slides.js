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
	var self = this,
		speed = this.config.speed,
		func = function(){
			self.advance();
			self.preload(self.i + 1); 
		};

	setTimeout(function(){
		self.isPlaying = true;
		func();
		self.interval = setInterval(func, speed);
	}, 400);
};

Slide.prototype.pause = function() {
	clearInterval(this.interval);
	this.isPlaying = false;
};

Slide.prototype.advance = function() {
	var self = this,
		next = (this.i + 1) % this.numSlides;
	
	this.i = next;
	this.goTo(next)
		.fail(function( msg ) {
			console.log('failed to goTo ' + next + ': ' + msg);
			self.advance();
		});
};

Slide.prototype.recede = function() {
	var self = this,
		i = this.i,
		next = (i === 0 ? this.numSlides : i) - 1;

	this.i = next;
	this.goTo(next)
		.fail(function( msg ) {
			console.log('failed to goTo ' + next + ': ' + msg);
			self.recede();
		});
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

	$el.find('.controls').on('click', '.icon', function(e){
		e.preventDefault();
		var $icon = $(e.target);

		function pause(){
			self.pause();
			$icon.removeClass('pause').addClass('play');
		}

		if ($icon.hasClass('play')) {
			self.play();
			$icon.removeClass('play').addClass('pause');
		}
		else if ($icon.hasClass('pause')) {
			self.pause();
			$icon.removeClass('pause').addClass('play');
		}
		else if ($icon.hasClass('prev')) {
			$icon.siblings('.pause').removeClass('pause').addClass('play');
			self.pause();
			self.recede();
		}
		else if ($icon.hasClass('next')) {
			$icon.siblings('.pause').removeClass('pause').addClass('play');
			self.pause();
			self.advance();
		}
	});
};

Slide.prototype.transition = function($newSlide){ // pass index instead?
	var self = this;

	if (!$newSlide.length) { 
		console.log('no $newSlide');
		console.log($newSlide);
		return;
	}

	var $current = self.$el.children('.slide:not(.hide)'), 
		fadeNew = function(){ 
			$newSlide.hide().removeClass('hide').fadeIn(400); 
		};

	if ($current.length) {
		$current.fadeOut(300, function(){
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
		dfd = $.Deferred(),
		slides = this.config.slides,
		slide;

	if (i < 0 || i >= slides.length) {
		return dfd.reject('i is out of range (' + i + ')');
	}

	slide = slides[i];

	if (slide.$el !== undefined) {
		this.transition(slide.$el);
	}
	else {
		this.load(i)
			.then(function($newSlide){
				self.transition($newSlide);
				dfd.resolve();
			})
			.fail(function(msg){
				dfd.reject('failed to load slide ' + i + ': ' + msg);
			});
	}

	return dfd.promise();
};

Slide.prototype.preload = function(i) {
	var self = this,
		nextSlide = this.config.slides[i],
		retries = 0,
		pl = function(){
			self.load(i)
				.then(function(){
					console.log('preload successful for ' + i);
				})
				.fail(function(msg){
					console.log('preload failed for '+i+' : ' + msg);
					if (++retries < 3) {
						console.log('retrying preload');
						pl();
					}
					else {
						console.log('failed to preload ' + i);
					}
				});
		};

	if (nextSlide !== undefined && nextSlide.$el === undefined) {
		pl(i);
	}
	else {
		console.log('no need to preload ' + i);
	}
};

Slide.prototype.load = function(i) {
	var self = this,
		slides = this.config.slides,
		slide,
		html,
		src,
		dfd = $.Deferred(),
		id = "s" + (+new Date);

	if (i < 0 || i >= slides.length) {
		return dfd.reject('slide index is bad: ' + i);
	}

	slide = slides[i];

	if (slide.$el !== undefined) {
		return dfd.resolve(slide.$el);
	}

	src = slide.src;

	if (src === undefined || src.length === 0) {
		return dfd.reject('no src on this slide');
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
		dfd.resolve($slide);
	}).error(function(){
		dfd.reject('loading failed');
	});

	return dfd.promise();
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