require(["IOBus", "util"], function(IOBus, util) {
	
	function sendScore() {
		var data = 
		{home: homeScore.get(), away : awayScore.get(),
			finalScore : $('#final-score:checked').val()==null};
		bus.send('put', util.getPath() + util.getQuery(), data);
	}
	
	var bus = new IOBus();
	bus.onConnect = function () {
		$('#update-score').removeAttr('disabled');
	};
	bus.onDisconnect = function () {
		$('#update-score').attr('disabled', true);
	};
	
	function score(object) {
  	var score = 0;
  	
   	var retval = new function() 
		{
   	}
   	
   	retval.set = function set(s)
   	{
   		score = s;
   		object.val(score);
   	}
   	
   	retval.up = function up() 
   	{
    	score = score + 1;
    	$(object).val(score);
   	}
   	
   	retval.down = function down() 
   	{
       score = Math.max(score - 1, 0);
       $(object).val(score);
   	}
   	
   	retval.get = function get()
   	{
   		return score;
   	}
   	
   	return retval;
	}
	
	var homeScore = score($('#home-score'));
	var awayScore = score($('#away-score'));
	
	
	$(document).ready(function() {
		
		homeScore.set(0);
		awayScore.set(0);
		
		$('#home-scored').click(homeScore.up);
		$('#home-correction').click(homeScore.down);
		$('#away-scored').click(awayScore.up);
		$('#away-correction').click(awayScore.down);	
		
		$('#update-score').click(sendScore);
		
		bus.connect();
		
		$(window).keypress(function(event) {
			var code = event.charCode || event.keyCode;
			switch (code) {
				case 97:
					homeScore.up();
					break;
				case 122:
					homeScore.down();
					break;
				case 107:
					awayScore.up();
					break;
				case 109:
					awayScore.down();
					break;
				case 117:
					if (bus.connected) {
						sendScore();
					}
					break;
				case 102:
					$('#final-score').attr('checked', !$('#final-score').is(':checked'));
					break;
			}
		});
		
 	});


    
});

