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
		}
		
	};
	
	return util;
	}
);
