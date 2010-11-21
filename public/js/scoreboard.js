require(["IOBus", "util", "js/countdown/jquery.countdown.min.js"], function(IOBus, util) {
	
	var setScore = function(scoreObject) {
		$('#home-score').html(scoreObject.home);
		$('#away-score').html(scoreObject.away);
	}
	
	var setLayout = function(periods) {
		if (periods[6] == 0)
			$('#clock').removeClass().addClass('clock-big');
		if (periods[6] == 55 && periods[5] >= 1)
			$('#clock').removeClass().addClass('clock');
		if (periods[5] == 0)
			$('#clock').addClass('red');
		if (periods[5] == 5 && periods[6] == 0)
			util.playSound('/snd/Download.wav','#sound');
	}
	
	var bus = new IOBus();
	bus.subscribe(util.getPath(), setScore);
	
	$(document).ready(function() {
		$(window).bind('resize', function()
		{
			util.resizeFont(500,32.0, $('body'));
		}).trigger('resize');
		
		var tillDate = new Date(); 
		tillDate.setMinutes(tillDate.getMinutes() + 2);
		$('#clock').countdown({until: tillDate, format: 'MS', layout: '{mn}:{snn}', 
		onTick: setLayout, serverSync: util.getServerTime});
		
		bus.connect();

		
 	});


    
});

