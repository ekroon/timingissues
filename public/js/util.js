define( function () {
	var util = {
		resizeFont : function(preferredHeight, fontSize, object) 
		{
			//Standard height, for which the body font size is correct
			var displayHeight = $(window).height();
			var percentage = displayHeight / preferredHeight;
			var newFontSize = Math.floor(fontSize * percentage);
			$(object).css("font-size", newFontSize + "px");
		},
		getPath : function() 
		{
			return $(location).attr('pathname');
		},
		getHash : function() 
		{
			return $(location).attr('hash');
		},
		getQuery : function() 
		{
			return $(location).attr('search');
		},
		getServerTime : function() {
			var time = null; 
    	$.ajax(
    		{	url: '/time', 
					async: false, dataType: 'text', 
					success: function(text) { 
							time = new Date($.parseJSON(text));
					}, 
					error: function(http, message, exc) { 
							time = new Date(); 
					}
    		}
    	); 
    	return time; 	
		},
		playSound : function (soundfile, object) {
 			$(object).html('').html(
 			"<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />");
 		}
		
	};
	
	return util;
	}
);
