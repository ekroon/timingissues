require(["IOBus", "util", "js/countdown/jquery.countdown.min.js"], function(IOBus, util) {
	
	var SetScore = function(scoreObject) {
		$('#home-score').html(scoreObject.home);
		$('#away-score').html(scoreObject.away);
	}
	
	var bus = new IOBus();
	bus.subscribe($(window).path, SetScore);
	
	$(document).ready(function() {
		$(window).bind('resize', function()
		{
			util.resizeFont(500,32.0, $('body'));
		}).trigger('resize');
		
		var tillDate = new Date(); 
		tillDate.setMinutes(60);
		$('#clock').countdown({until: tillDate, format: 'MS', layout: '{mn}:{snn}'});
		
		bus.connect();
		
 	});


    
});

