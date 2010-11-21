define( ["../socket.io/socket.io.js"] ,function() {
	var IOBus = function (options) {
		
		this.options = { 
			autoReconnect : true
		};
		this.options = $.extend(this.options, options);
		this.connected = false;
		this.reconnecting = false;
		this._subscriptions = {};
		this._callback = [];
		
	}
	
	IOBus.prototype._socket = new io.Socket();
	
	IOBus.prototype.subscribe = function(uri, fn) 
	{
		if (!(uri in this._subscriptions)) {
			this._subscriptions[uri] = [];
			this.send('subscribe', uri);	
		}	
		this._subscriptions[uri].push(fn);
		
		return this;
		
	}
	
	IOBus.prototype.unsubscribe = function(uri, fn){
		if (uri in this._subscriptions){
			for (var i = 0; i < this._subscriptions[uri].length; i++) {
				if (this._subscriptions[uri][i] == fn) {
					this._subscriptions[uri].splice(i, 1);
					i--;
				}
			}
			if (this._subscriptions[uri].length == 0) {
				delete this._subscriptions[uri];
				this.send('unsubscribe', uri);
			}
		}
		
		return this;
	};

		
	IOBus.prototype.messageHandler = function(messageString) 
	{
		var message = $.parseJSON(messageString);
		
		if (message.method != undefined && message.method == 'callback') {
			this._callback[message.callback].apply(this);
			this._callback.splice(message.callback,1);
		}
		
		if (message.uri && message.data && message.uri in this._subscriptions){
				for (var i = 0, l = this._subscriptions[message.uri].length; i < l; i++) {
					this._subscriptions[message.uri][i].apply(this, [message.data]);
				}
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
					if (self.options.autoReconnect) 
					{
						self.connect();
						self.reconnecting = true;
					}
					self.onDisconnect();
				}
			)
		.on('message', function(message){self.messageHandler(message);}).connect();
		
		return this;
	};
		
	IOBus.prototype.send = function (method, uri, data, fn) 
	{
		var msg = {method: method, uri : uri, data : data};
		if (fn) {
			this._callback.push(fn);
			msg.callback = this._callback.length - 1;
		}
		this._socket = this._socket.send(msg);
		return this;
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