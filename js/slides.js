var Slide = function($frame, config){
	this.$frame = $frame;
	this.config = config;
	this.slides = config.slides || [];

	this.width = $frame.width();
	this.height = $frame.height();

	this.init();
};

Slide.prototype.init = function(){
	var self = this;

	this.loadNext()
		.then(function(i){
			self.addControls();
			self.goTo(i);
		})
		.fail(function(msg){
			console.log('unable to load first slide: ' + msg);
		});

	$(window).bind('resize', $.throttle(400, function(){
		var $f = self.$frame;
		self.width = $f.width();
		self.height = $f.height();
		self.resizeCurrentImage();
	}));
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

	this.$frame.append(a.join(''));
	this.bindControlEvents();
	this.flashControls();
};

Slide.prototype.bindControlEvents = function(){
	var $frame = this.$frame,
		self = this,
		transitioning = false,
		skip = function($icon, skipFunc){
			if(!transitioning) {
				transitioning = true;
				$icon.siblings('.pause').removeClass('pause').addClass('play');
				self.pause();
				$.proxy(skipFunc, self)()
					.done(function(){
						transitioning = false;
					});
			}
		};

	$frame.mouseenter(function(){
		$(this).find('.controls').stop().animate({
			bottom: "0px"
		}, 300);
	}).mouseleave(function(){
		$(this).find('.controls').stop().animate({
			bottom: "-55px"
		}, 500);
	})
	.find('.controls').on('click', '.icon', function(e){
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
			skip($icon, self.recede);
		}
		else if ($icon.hasClass('next')) {
			skip($icon, self.advance);
		}
	});
};

Slide.prototype.flashControls = function() {
	var self = this;
	setTimeout(function(){self.$frame.trigger('mouseenter');}, 1000);
};

Slide.prototype.play = function(){
	var self = this,
		speed = this.config.speed;

	this.playing = true;

	(function loadAndGo() {
		if (!self.playing) { return; }

		self.loadNext()
			.then(function(i) {
				if (!self.playing) { return; }

				self.goTo(i)
					.then(function() {
						if (!self.playing) { return; }

						self.timeout = setTimeout(loadAndGo, speed);
					})
					.fail(function(msg) {
						console.log('failed to goTo ' + i + ': ' + msg);
					});
			})
			.fail(function(msg) {
				console.log('failed to play: ' + msg);
			});	
	})();
};

Slide.prototype.pause = function(){
	this.playing = false;
	if (this.timeout !== undefined) {
		clearTimeout(this.timeout);
	}
};

Slide.prototype.advance = function(){
	var self = this,
		dfd = $.Deferred();

	this.loadNext()
		.then(function(i){
			self.goTo(i)
				.fail(function(msg){
					console.log('failed to goTo ' + i + ': ' + msg);
				})
				.done(function(){
					dfd.resolve();
				});
		})
		.fail(function(msg){
			dfd.resolve();
			console.log('failed to advance: ' + msg);
		});

	return dfd.promise();
};

Slide.prototype.recede = function() {
	var self = this,
		dfd = $.Deferred();

	this.loadPrev()
		.then(function(i){
			self.goTo(i)
				.fail(function(msg){
					console.log('failed to goTo ' + i + ': ' + msg);
				})
				.done(function(){
					dfd.resolve();
				});
		})
		.fail(function(msg){
			dfd.resolve();
			console.log('failed to recede: ' + msg);
		});

	return dfd.promise();
};

Slide.prototype.goTo = function(i) {
	var self = this,
		slides = this.slides,
		slide = slides[i],
		$slide,
		dfd = $.Deferred();

	if (slide === undefined) {
		return dfd.reject('no slide at ' + i);
	}

	$slide = slide.$slide;

	if ($slide === undefined || !$slide.length) {
		return dfd.reject('no $slide at ' + i);
	}

	var $current = this.$frame.children('.slide:not(.hide)'), 
		fadeNew = function(){ 
			$slide.hide().removeClass('hide').fadeIn(400, dfd.resolve); 
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

	return dfd.promise();
};

Slide.prototype.loadPrev = function() {
	var self = this,
		slides = this.slides,
		numSlides = slides.length,
		triesLeft = numSlides,
		itr = this.itr === undefined ? 0 : this.itr,
		getNext = function(){
			itr = itr === 0 ? numSlides - 1 : itr - 1;
			return itr;
		},
		dfd = $.Deferred();

	(function loadPrev(){
		self.load(getNext())
			.then(function(i, $slide){
				self.itr = i;
				dfd.resolve(i);
			})
			.fail(function(){
				if (triesLeft--) {
					//console.log('the last one didnt load, loading next');
					loadPrev();
				}
				else {
					dfd.reject('theres nothing else to load');
				}
			});
	})();
	
	return dfd.promise();
};

Slide.prototype.loadNext = function() {
	var self = this,
		slides = this.slides,
		numSlides = slides.length,
		triesLeft = numSlides,
		itr = this.itr === undefined ? -1 : this.itr,
		getNext = function(){
			itr = itr === numSlides - 1 ? 0 : itr + 1;
			return itr;
		},
		dfd = $.Deferred();

	(function loadNext(){
		self.load(getNext())
			.then(function(i, $slide){
				self.itr = i;
				dfd.resolve(i);
			})
			.fail(function(){
				if (triesLeft--) {
					console.log('the last one didnt load, loading next');
					loadNext();
				}
				else {
					dfd.reject('theres nothing else to load');
				}
			});
	})();
	
	return dfd.promise();
};

Slide.prototype.resizeCurrentImage = function() { 
	try { 
		var $currentImg = this.slides[this.itr].$slide.find('img');
		this.sizeImg($currentImg);
	}
	catch(e){}
};

Slide.prototype.load = function(i) {
	var self = this,
		slides = this.slides,
		slide,
		html,
		src,
		dfd = $.Deferred(),
		startTime = +new Date,
		id = "s" + startTime;

	if (i < 0 || i >= slides.length) {
		return dfd.reject('slide index is bad: ' + i);
	}

	slide = slides[i];

	if (slide.$slide !== undefined) {
		return dfd.resolve(i, slide.$slide);
	}

	src = slide.src;

	if (src === undefined || src.length === 0) {
		return dfd.reject('no src on this slide');
	}

	html = '<div id="'+id+'" class="slide offpage"><img src="'+src+'"></div>';
	this.$frame.append(html);

	var tries = 0;
	$('#'+id+' img').load(function(){
		var $img = $(this),
			$slide = $img.closest('.slide');
		if (!self.sizeImg($img)) {
			if(tries++ < 3) {
				console.log('no dimensions, trying again');
				$img.trigger('load');
			}
			else {
				dfd.reject('bad image, no dimensions')
			}
		}
		else {
			$slide.removeAttr('id').removeClass('offpage').addClass('hide');

			slide.$slide = $slide;
			dfd.resolve(i, $slide);
		}
	}).error(function(){
		dfd.reject('loading failed');
	});

	return dfd.promise();
};

Slide.prototype.sizeImg = function($img) { 
	var w = this.width,
		h = this.height,
		oldWidth = $img.width(),
		oldHeight = $img.height(),
		scaledWidth,
		scaledHeight,
		wr = oldWidth / w,
		hr = oldHeight / h,
		ratio;

	if (oldWidth === 0 || oldHeight === 0) { 
		return false;
	}
                                               
	ratio = Math.max(wr, hr);
	scaledWidth = oldWidth / ratio;
	scaledHeight = oldHeight / ratio;

	$img.css({
		width: scaledWidth + "px",
		height: scaledHeight + "px",
		marginTop: (scaledHeight * -.5) + "px",
		marginLeft: (scaledWidth * -.5) + "px"
	});

	return true;
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
