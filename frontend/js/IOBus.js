var IOBus = {
	init : function () {
			this.socket = new io.Socket();
			this.connect();
			socket.on('connect', function () { this.connected = true;});
			socket.on('disconnect', this.connect}
		},
	connected : false, 
	socket : null
	connect : function () {
			this.socket.connect();
		},
	sendMessage : function (type, data) {
			socket.send({type : type, data : data});
		},
	onMessage : function (handler) {
			socket.on('message', function (messageString) {
				var message = $.getJSON(messageString)
				handler(type, data);
			}
		}
	};