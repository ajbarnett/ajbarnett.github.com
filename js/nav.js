
$.fn.uncomment = function(recurse) {
	$(this).contents().each(function() {
		if ( recurse && this.hasChildNodes() ) {
			$(this).uncomment(recurse);
		} else if ( this.nodeType == 8 ) {
			// Need to "evaluate" the HTML content,
			// otherwise simple text won't replace
			var e = $('<span>' + this.nodeValue + '</span>');
			$(this).replaceWith(e.contents());
		}
	});
};

if (typeof console === "undefined") {
	console = {log:function(){},info:function(){}};
}

var Countdown = function(){
	var $cd = $('#countdown-days'),
		$container = $cd.closest('.countdown'),
		daysleft = Math.floor((new Date(2013, 5, 22) - new Date) / (1000*60*60*24));

	setTimeout(function(){
		if ($(window).width() < 480) { return; }
		$cd.text(daysleft);
		$container.hide().removeClass('hide').fadeIn(1000);
	}, 200);
};

var jaNav = function(){
	this.$nav = $('.main-nav');
	this.$trees = $('.trees');

	this.init();
};

jaNav.prototype.init = function() {
	var $window = $(window),
		self = this;

	this.loadAllSections();
	this.bindNavClick();

	$('#backtotop').click(function(e){
		e.preventDefault();
		$('html, body').animate({ scrollTop: 0 });
		$(this).fadeOut(100);
	});

	this.handleResize($window);
	$window.resize($.throttle(500, function(){
		self.handleResize($window);
	}));
};

jaNav.prototype.handleResize = function($window) {
	var ww = $window.width(),
		wasSmall = this.isSmall,
		isSmall = (this.isSmall = ww < 820),
		hasChanged = wasSmall === undefined || wasSmall !== isSmall;

	if (isSmall) {
		if (hasChanged) {
			this.destroyBackToTop($window);
		}
	}
	else {
		this.initBackToTop($window);
	}
};

jaNav.prototype.initBackToTop = function($window) { 
	var self = this,
		$btt = self.$btt || (self.$btt = $(document.getElementById('backtotop'))),
		checkBtt = function(){ 
			var $nav = self.$nav,
				bttWidth = self.bttWidth || (self.bttWidth = $btt.width()),
				navHeight = self.navHeight || (self.navHeight = $nav.outerHeight()),
				navWidth = self.navWidth || (self.navWidth = $nav.outerWidth()),
				navOffset = $nav.offset(),
				navBottom = navOffset.top + navHeight,
				navRight = navOffset.left + navWidth,
				top = $window.scrollTop();

			if (top > navBottom + 400) { 
				$btt.css('left', navRight - bttWidth - 20);
				if ($btt.is(':hidden')) {
					$btt.fadeIn(100);
				}
			}
			else {
				if ($btt.is(':visible')) {
					$btt.fadeOut(100);
				}
			}
		};

	if (!$btt.data('check-btt')) {
		$btt.data('check-btt', true);
		$window.bind('scroll.checkbtt', $.throttle(500, checkBtt));
	}

	checkBtt();
};

jaNav.prototype.destroyBackToTop = function($window) { 
	var $btt = this.$btt || (this.$btt = $(document.getElementById('backtotop')));

	if ($btt.data('check-btt')) { 
		$window.unbind('.checkbtt');
		$btt.data('check-btt', false).fadeOut(100);
	}
};

jaNav.prototype.bindNavClick = function(w) {
	var $nav = this.$nav,
		self = this,
		handler = function(e){ 
			e.preventDefault();
			var $this = $(this);
			var secId = $this.find('a').attr('href') || $this.attr('href');
			self.goToSection(secId);
		};

	if (!$nav.length) { return; }

	$nav.on('click', 'li', handler);
	$('body').on('click', 'a[href^=#]', handler);
};

jaNav.prototype.goToSection = function(section) {
	var $section = $(section);

	if (!$section.length) { return; }

	$('html, body').animate({
		scrollTop: $section.offset().top
	})
};

jaNav.prototype.goToNav = function($nav) {
	var $left = $nav.closest('.left-rail'),
		$right = $('.main-rail'),
		w = $(window).width();

	$right.css({
		position: "absolute"
	}).animate({
		left: w
	});

	$left.css({
		position: "relative"
	}).animate({
		left: 0
	});



};

jaNav.prototype.loadAllSections = function() {
	var self = this;

	$('.sec').each(function(){
		self.loadSection('#' + this.id);
	});
};

jaNav.prototype.loadSection = function(section) {
	var $section = $(section),
		sctn = $section.Section(),
		dfd = new $.Deferred();

	if (!$section.length || sctn === undefined) {
		dfd.reject("no section");
	} 
	else if (sctn.isLoaded()) { 
		dfd.resolve();
	}
	else {
		sctn.loadHtml();
		setTimeout(function(){
			sctn.initialize();
			dfd.resolve();
		}, 100);
	}

	return dfd.promise();
};



$(document).ready(function(){
	new jaNav();
	Countdown();
});