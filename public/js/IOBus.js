define( ["../socket.io/socket.io.js"] ,function() {
	var IOBus = function (options) {
		
		this.options = { 
			autoReconnect : false
		};
		this.options = $.extend(this.options, options);
		this.connected = false;
		this.reconnecting = false;
		this._subscriptions = {};
		
	}
	
	IOBus.prototype._socket = new io.Socket();
	
	IOBus.prototype.subscribe = function(uri, fn) 
	{
		if (!(uri in this._subscriptions)) this._subscriptions[uri] = [];
		this._subscriptions[uri].push(fn);
		
		this.send('subscribe', uri);
			
	}
		
	IOBus.prototype.messageHandler = function(messageString) 
	{
		var message = $.parseJSON(messageString);
		if (message.uri && message.data && message.uri in this._subscriptions){
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
			self.send('client-time', '',{time : new Date() });
			if (self.reconnecting) {
				for (uri in self._subscriptions) {
					self.send('subscribe', uri);
				}
				self.reconnecting = false;
			}
		})
		.on('disconnect', function () 
				{ 
					self.connected = false;
					if (self.autoReconnect) 
					{
						self.connect();
						self.reconnecting = true;
					}
					self.onDisconnect();
				}
			)
		.on('message', function(message){self.messageHandler(message);}).connect();
	};
		
	IOBus.prototype.send = function (method, uri, data) 
	{
		this._socket = this._socket.send({method: method, uri : uri, data : data});
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