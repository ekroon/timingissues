require(["IOBus", "util"], function(IOBus, util) {
	
	var bus = new IOBus();
	var matches;
	var classNames = ["odd", "even"];
	var index = 1;
	bus.on('connect', function () {
		bus.send('get', '/admin', {tournament : tournament}, function (err, sender, body){
			matches = body.matches;
			$( "#matchTemplate" ).tmpl( matches, { rowClass : function () { index = (index+1)%2; return classNames[index];} }).appendTo( "#matches" );
			
		});
	});
	
	
	$(document).ready(function() {
		
		bus.connect();


		
 	});


    
});

