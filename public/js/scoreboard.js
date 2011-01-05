require(["IOBus", "util", "/js/countdown/jquery.countdown.min.js"], function(IOBus, util) {
	
	var setScore = function(scoreObject) {
		$('#home-score').html(scoreObject.home);
		$('#away-score').html(scoreObject.away);
	}
	
	var setMatchLayout = function(periods) {
		if (periods[6] == 0)
			$('#clock').removeClass().addClass('clock-big');
		if (periods[6] == 55 && periods[5] >= 1)
			$('#clock').removeClass().addClass('clock');
		if (periods[5] == 0)
			$('#clock').removeClass().addClass('clock-big').addClass('red');
		if (periods[5] == 5 && periods[6] == 0)
			util.playSound('/snd/Download.wav','#sound');
	}
	
	var setWaitLayout = function(periods) {
		$('#clock').removeClass().addClass('clock');
	}
	
	var bus = new IOBus();
	var matches;
	//bus.subscribe(util.getPath(), setScore);
	bus.on('connect', function () {
		//alert('connect');
		bus.send('get', '/scoreboard', {tournament : tournament, field : field}, function (err, sender, body){
			matches = body.matches;
			setClock();
		});
	});
	
	var setClock = function() {
		var negative = false;
		var time = new Date();
		var setLayout;
		var expiryTime = time;
		
		if (matches.length > 0) {
			
			var tstart = new Date(matches[0].value.starttime);
			var tstop = new Date(matches[0].value.stoptime);
			
			if ( tstart > time) {
				$('#clock').countdown('change',{until: tstart, format: 'MS', layout: '-{mn}:{snn}', 
				onTick: setWaitLayout, serverSync: util.getServerTime, onExpiry : setClock});
			}
			else if (tstart <= time && tstop > time)  {
				matches.shift();
				$('#clock').countdown('change', {until: tstop, format: 'MS', layout: '{mn}:{snn}', 
				onTick: setMatchLayout, serverSync: util.getServerTime, onExpiry : setClock});
			}
			else {
				matches.shift();
				setClock();
			}
			
		}
	}
	
	
	$(document).ready(function() {
		$(window).bind('resize', function()
		{
			util.resizeFont(500,32.0, $('body'));
		}).trigger('resize');
		
		$('#clock').countdown({until: +0, format: 'MS', layout: '{mn}:{snn}'});
		
		bus.connect();

		
 	});


    
});

