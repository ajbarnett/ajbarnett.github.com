var Countdown = function(){
	var $cd = $('#countdown-days'),
		$container = $cd.closest('.callout'),
		daysleft = Math.floor((new Date(2013, 5, 22) - new Date) / (1000*60*60*24));

	setTimeout(function(){
		$cd.hide().text(daysleft).fadeIn(500);
	}, 200);
};







$(document).ready(function(){
	Countdown();
});