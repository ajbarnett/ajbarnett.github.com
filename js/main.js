var Countdown = function(){
	var $cd = $('#countdown-days'),
		$container = $cd.closest('.countdown'),
		daysleft = Math.floor((new Date(2013, 5, 22) - new Date) / (1000*60*60*24));

	setTimeout(function(){
		$cd.text(daysleft);
		$container.hide().removeClass('hide').fadeIn(500);
	}, 200);
};







$(document).ready(function(){
	Countdown();
});