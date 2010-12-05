require(["IOBus", "util"], function(IOBus, util) {
	
	function sendScore() {
		var data = 
		{home: homeScore.get(), away : awayScore.get(),
			finalScore : $('#final-score:checked').val()==null};
			$('#update-score').attr('disabled', true);
		bus.send('put', util.getPath() + util.getQuery(), data, updateResult);
	}
	
	function updateResult(err, sender, body) {
		if (!err) {
			if (body.result == 'updated') {
				$("#updated-info").toggle();
				setTimeout(function(){$("#updated-info").toggle()}, 1000);
			}
			else {
				$("#not-updated-info").toggle();
				$('#update-score').removeAttr('disabled');
				setTimeout(function(){$("#not-updated-info").toggle()}, 1000);
			}
		}
	}
	
	var bus = new IOBus();
	bus.on('connect', function () {
		$('#update-score').removeAttr('disabled');
	});
	bus.on('disconnect', function () {
		$('#update-score').attr('disabled', true);
	});
	
	function score(object, updateButton) {
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
			updateButton.removeAttr('disabled');
   	}
   	
   	retval.down = function down() 
   	{
       score = Math.max(score - 1, 0);
       $(object).val(score);
			 updateButton.removeAttr('disabled');
   	}
   	
   	retval.get = function get()
   	{
   		return score;
   	}
   	
   	return retval;
	}
	
	var homeScore = score($('#home-score'),$('#update-score'));
	var awayScore = score($('#away-score'),$('#update-score'));
	
	
	$(document).ready(function() {
		
		$("not-updated-info").hide();
		$("updated-info").hide();
		
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

