var Scrolls = function($el, config) {
	this.$nav = $el;
	this.config = config;
	this.spying = true;

	this.init();
};

Scrolls.prototype.init = function(){
	this.bindClick();
	this.bindPopper();
	this.bindSpyer();
	this.bindMapListener();
};

Scrolls.prototype.bindClick = function(){
	var self = this;

	this.$nav.on('click', 'a', function(e){
		e.preventDefault();

		var $this = $(this),
			config = self.config,
			href = $this.attr('href'),
			$target = $(href),
			newTop = 0;

		if ($target.length) {
			self.spying = false;
			if(href !== "#home") {
				newTop = $target.offset().top - config.offset;
			}
			$('html, body').animate({
				scrollTop: newTop
			}, 500, function(){
				self.activateNav($this);
				self.spying = true;
			});
		}
	});
};

Scrolls.prototype.bindPopper = function(){
	var self = this,
		$nav = this.$nav,
		config = this.config,
		thresh = 110,
		navTop = $nav.offset().top - thresh,
		attached = 'attached',
		detatched = 'detatched',
		state = attached;

	$(window).bind('scroll.popper', $.throttle(100, function(){
		var top = $(this).scrollTop();
		if (top > navTop && state === attached) {
			$nav.addClass('popped');
			state = detatched;
		}
		else if (top <= navTop && state === detatched) {
			$nav.removeClass('popped');
			state = attached;
		}
	}));
};

Scrolls.prototype.bindSpyer = function(){
	var self = this,
		$nav = this.$nav,
		offset = this.config.offset,
		sections = this.getSpyerSections(),
		firstSec = sections[0],
		secLen = sections.length,
		top;

	setInterval(function(){
		sections = self.getSpyerSections();
		firstSec = sections[0];
		secLen = sections.length;
	}, 5000);

	$(window).bind('scroll.spyer', $.throttle(250, function(){
		if (!self.spying) { return; }

		top = $(this).scrollTop();

		if (top <= firstSec.top - offset) {
			self.activateNav(firstSec.id);
		}
		else {
			$.each(sections, function(i, s){
				if (top >= s.top - offset && (i + 1 === secLen || (i + 1 < secLen && top < sections[i + 1].top - offset))) {
					self.activateNav(s.id);
					return false;
				}
			});
		}
	}));
};

Scrolls.prototype.getSpyerSections = function(){
	var sections = [];

	$('.sec[id]').each(function(){
		var $this = $(this),
			id = this.id,
			top = $this.offset().top;

		sections.push({id:id, top:top})
	});

	sections.sort(function(a, b){
		if (a.top < b.top) { return -1; }
		if (a.top > b.top) { return 1; }
		return 0;
	});

	return sections;
};

Scrolls.prototype.bindMapListener = function() { 
	var self = this,
		offset = 30,
		$map = $('#map-canvas'),
		$window = $(window);

	$window.on('.scrollToMap', function(){
		$('html, body').animate({
			scrollTop: $map.offset().top - offset
		}, 1000);
	})

};

Scrolls.prototype.activateNav = function(target){
	var $target;
	if (typeof target === "string") {
		$target = this.$nav.find('a[href="#' + target + '"]');
	}
	else {
		$target = target;
	}
	if ($target.length) {
		$target.addClass('active').closest('li').siblings().find('.active').removeClass('active');
		//window.location.hash = $target.attr('href');
	}
};

$.fn.scrolls = function(options) {

	var defaults = {
		offset: 0
	};

	var config = $.extend(defaults, options);

	return this.each(function(){
		new Scrolls($(this), config);
	});
};

$(document).ready(function(){
	//$('.main-nav').scrolls();
});