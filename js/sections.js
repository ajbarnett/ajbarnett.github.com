var Section = function($section, config) {
	this.$sec = $section;
	this.config = config;
};

Section.prototype.loadHtml = function() {
	if (!this._ishtmlloaded) {
		this.$sec.addClass('loaded').uncomment();
		this._ishtmlloaded = true;
	}
};

Section.prototype.loadScripts = function() {
	if (typeof this._arescriptsloaded !== undefined) {
		return this._arescriptsloaded;
	}

	var scripts = this.config.scripts;

	if (!scripts || !scripts.length) { 
		return (this._arescriptsloaded = true);
	}

	for (var i = 0, l = scripts.length; i < l; i++) {
		this._loadScript(scripts[i]);
	}
};

Section.prototype._loadScript = function(path) {

};

Section.prototype.initialize = function(){
	var initFunc = this.config.init;

	if (initFunc && $.isFunction(initFunc)) {
		initFunc(this.$sec);
	}
};

Section.prototype.isLoaded = function() {
	return this._ishtmlloaded || false;
};

$.fn.Section = function(a, b) {
	if (typeof a === "object") {
		var defaults = {
			scripts: [],
			init: function($section) {}
		};
		var config = $.extend(defaults, a);
		return this.each(function(){
			var $this = $(this);
			$this.data('section-plugin', new Section($this, config));
		});
	}
	else if (typeof a === "string") {
		var $first = this.first();
		if ($first.length) {
			var section = $first.data('section-plugin');
			if (section && a.length) {
				return section[a](b);
			}
		}
	}
	else {
		return this.data('section-plugin');
	}
};

$(document).ready(function(){
	$('#home').Section({
		scripts: ['js/slides.js'],
		init: function($section) {
			$('#home-slides').slide({
				autostart: false,
				slides: (function(){
					var count = 93,
						i = 0,
						a = new Array(count);
					while (i < count) {
						a[i++] = {
							src: "img/" + (i < 10 ? "0" : "") + i + ".png"
						}
					}
					return a;
				})()
			});
		}
	});

	$('#theday, #accomodations, #outoftowners, #registry, #contact, #reading').Section({});

	$('#fridaypicnic').Section({
		scripts: ['js/slides.js'],
		init: function($section) {
			$('#picnic-slides').slide({
				autostart: false,
				slides: [
					{src: "img/ebengfine_0.jpg"},
					{src: "img/ebengfine_ropeswing.jpg"},
					{src: "img/ebengfine_rocks.jpg"}
				]
			});
		}
	});

	$('#directions').Section({
		scripts: ['asdf', 'js/maps.js'],
		init: function($section) {
			if (typeof Mapper !== "undefined") {
				new Mapper();
			}
		}
	});
});