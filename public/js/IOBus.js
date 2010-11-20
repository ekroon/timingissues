define( ["../socket.io/socket.io.js"] ,function() {
	var IOBus = function (options) {
		
		this.options = { 
			autoReconnect : false
		};
		this.options = $.extend(this.options, options);
		this.connected = false;
		this._subscriptions = {};
		
	}
	
	IOBus.prototype._socket = new io.Socket();
	
	IOBus.prototype.subscribe = function(uri, fn) 
	{
		if (!(uri in this._subscriptions)) this._subscriptions[uri] = [];
		this._subscriptions[uri].push(fn);
		
		this.sendMessage('subscribe', uri);
			
	}
		
	IOBus.prototype.messageHandler = function(messageString) 
	{
		var message = $.parseJSON(messageString);
		
		if (message.uri && message.uri in this._subscriptions){
			alert('');
				for (var i = 0, ii = this._subscriptions[message.uri].length; i < ii; i++) 
					this._subscriptions[message.uri][i].apply(this, [message.data]);
		}
	}	
		
	IOBus.prototype.connect = function () 
	{
		
		var self = this;
		self._socket
		.on('connect', function() {
			self.connected = true;
			self.onConnect();
			self.send('client-time', {time : new Date() });
			for (uri in self._subscriptions) {
				self.send('subscribe', uri);
			}
		})
		.on('disconnect', function () 
				{ 
					self.connected = false;
					if (self.autoReconnect) 
					{
						self.connect();
					}
					self.onDisconnect();
				}
			)
		.on('message', function(message){self.messageHandler(message);}).connect();
	};
		
	IOBus.prototype.send = function (type, uri, data) 
	{
		this._socket = this._socket.send({type: type, uri : uri, data : data});
	};
	
	
	IOBus.prototype.onConnect = function() 
	{
	};
	
	IOBus.prototype.onDisconnect = function() 
	{
	}; 

	return IOBus;
}
);