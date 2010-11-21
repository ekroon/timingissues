var messagehandler = function messagehandler(app) {
		var config = require('configuration');
    var socket = require('socket.io').listen(app);
    var clientregistry = require('clientRegistry');
    // socket.on('connection', function(client) {
//         client.on('message', clientHandler);
//     });
    socket.on('clientMessage', function(message, client) {subscribeHandler(message, client)});

    var subscribeHandler = function(message, client) {
        if (message.method && message.uri) {
					if (message.method == 'subscribe') {
						console.log(client.sessionId + ' subscribe: '  + message.uri);
						clientregistry.subscribe(message.uri, client);
					}
					if (message.method == 'unsubscribe') {
						console.log(client.sessionId + ' unsubscribe: '  + message.uri);
						clientregistry.unsubscribe(message.uri, client);
					}
					if (message.method == 'put') {
						console.log('put: '  + message.uri);
						if (message.uri == '/scorer') {
							var clients = clientregistry.getClients('/scoreboard');
							if (config.debug) console.log('returned clients: ' + clients.length);
							sendMessage(clients, 
							{method : 'get', uri : '/scoreboard', 
								data : {home : message.data.home, away : message.data.away}});
						}
					}
        }
    }
    
    var clientHandler = function(message, client ) {
    }
    
    function sendMessage(clients, message) {
    	if (config.debug) console.log('start sending messages to ' + clients.length + ' clients');
    	for (var i = 0, l = clients.length; i < l; i++) {
    		if (config.debug) console.log('sending message to: ' + clients[i].sessionId);
    		clients[i].send(JSON.stringify(message));
    	}
    }
    
    function showClientDetails(client) {
    	for (name in client)
    		console.log(name);
    }
}
module.exports = messagehandler;