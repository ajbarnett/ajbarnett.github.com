/* vim: noet ts=4 sw=4
 * Version: 1.0
 * Date: 2010-01-28
 * Author: Romuald Brunet <romuald@chivil.com>
 */
(function($) {
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
})(jQuery);

if (typeof console === "undefined") {
	console = {log:function(){},info:function(){}};
}

var Countdown = function(){
	var $cd = $('#countdown-days'),
		$container = $cd.closest('.countdown'),
		daysleft = Math.floor((new Date(2013, 5, 22) - new Date) / (1000*60*60*24));

	setTimeout(function(){
		$cd.text(daysleft);
		$container.hide().removeClass('hide').fadeIn(1000);
	}, 200);
};







$(document).ready(function(){
	Countdown();
});