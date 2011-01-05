require(["IOBus", "util", "/js/countdown/jquery.countdown.min.js"], function(IOBus, util) {
	
	var setMatchLayout = function(periods) {
		if (periods[5] == 0) {
			$('#clock').addClass('red');
		}
		else {
			$('#clock').removeClass('red');
		}
		//if (periods[5] == 5 && periods[6] == 0)
		//	util.playSound('/snd/Download.wav','#sound');
	}
	
	var setWaitLayout = function(periods) {
		$('#clock').removeClass().addClass('clock');
	}
	
	var bus = new IOBus();
	var matches;
	bus.on('connect', function () {
		bus.send('get', '/clock', {tournament : tournament, field : field}, function (err, sender, body){
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
				onTick: setMatchLayout, serverSync: util.getServerTime, onExpiry : function(){setTimeout(function(){setClock();},10000);}});
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

