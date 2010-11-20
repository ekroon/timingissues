require(["IOBus", "util", "js/countdown/jquery.countdown.min.js"], function(IOBus, util) {
	
	function SetScore() {
		var message = {type : 'score-update', data : {home: $('#home').val(), away : $('#away').val()}};
		socket.send(message);
	}
	
	var bus = new IOBus();
	bus.subscribe($(window).path, SetScore);
	
	$(document).ready(function() {
		
		var tillDate = new Date(); 
		tillDate.setMinutes(60);
		$('#clock').countdown({until: tillDate, format: 'MS', layout: '{mn}:{snn}'});
		
		bus.connect();
		
 	});


    
});

