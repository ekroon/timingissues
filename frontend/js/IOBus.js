var IOBus = function (type, identify, options) {
	
	this._type = type;
	this._identify = identify;
	this.options = { 
		autoReconnect : false
	};
	this.options = $.extend(this.options, options);
	this.connected = false;
	this._subscriptions = {};
	
}

IOBus.prototype._socket = new io.Socket();

IOBus.prototype.subscribe = function(type, fn) 
{
	if (!(name in this._subscriptions)) this._subscriptions[type] = [];
	this._subscriptions[type].push(fn);
		
}
	
IOBus.prototype.messageHandler = function(messageString) 
{
	var message = $.parseJSON(messageString);
	
	if (message.type in this._subscriptions){
			for (var i = 0, ii = this._subscriptions[message.type].length; i < ii; i++) 
				this._subscriptions[message.type][i].apply(this, [message.data]);
	}
}	
	
IOBus.prototype.connect = function () 
{
	
	var self = this;
	self._socket
	.on('connect', function() {self.onConnect();})
	.on('disconnect', function () 
			{ 
				if (self.autoReconnect) 
				{
					self.connect();
				}
				self.onDisconnect();
			}
		)
	.on('message', function(message){self.messageHandler(message);}).connect();
};
	
IOBus.prototype.sendMessage = function (type, data) 
{
	this._socket = this._socket.send({type : type, data : data});
};


IOBus.prototype.onConnect = function() 
{
	this.connected = true;
};

IOBus.prototype.onDisconnect = function() 
{
	this.connected = false;
	if (this.options1.autoReconnect)
	{
		this.connect();
	}
};