var Scrolls = function($el, config) {
	this.$nav = $el;
	this.config = config;

	this.init();
};

Scrolls.prototype.init = function(){
	this.bindClick();
	this.bindPopper();
	this.bindSpyer();
};

Scrolls.prototype.bindClick = function(){
	var self = this;

	this.$nav.on('click', 'a', function(e){
		e.preventDefault();

		var $this = $(this),
			config = self.config,
			href = $this.attr('href'),
			$target = $(href);

		if ($target.length) {
			$('html, body').animate({
				scrollTop: $target.offset().top - config.offset
			}, 500, function(){
				//self.activateNav($this);
				window.location.hash = href;
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

	$(window).scroll($.throttle(100, function(){
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
		secLen = sections.length,
		top;

	$(window).scroll($.throttle(250, function(){
		top = $(this).scrollTop();

		$.each(sections, function(i, s){
			if (top >= s.top - offset && i + 1 < secLen && top < sections[i + 1].top - offset) {
				self.activateNav(s.id);
				return false;
			}
		});
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
	}
};

$.fn.scrolls = function(options) {

	var defaults = {
		offset: 40
	};

	var config = $.extend(defaults, options);

	return this.each(function(){
		new Scrolls($(this), config);
	});
};

$(document).ready(function(){
	$('.main-nav').scrolls();
});