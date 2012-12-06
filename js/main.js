var Countdown = function(){
	var $cd = $('#countdown-days'),
		$container = $cd.closest('.hide'),
		daysleft = Math.floor((new Date(2013, 5, 22) - new Date) / (1000*60*60*24));
	$cd.text(daysleft);
	setTimeout(function(){
		$container.hide().removeClass('hide').fadeIn(1000);
	}, 1000);
};







$(document).ready(function(){
	Countdown();
});