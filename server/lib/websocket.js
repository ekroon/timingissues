var websocket = function websocket(app,pubsubhub) {
		var config = require('configuration');
    var socket = require('socket.io').listen(app);
    // socket.on('connection', function(client) {
//         client.on('message', clientHandler);
//     });
    socket.on('clientMessage', function(message, client) {subscribeHandler(message, client)});
    
    var subscribeHandler = function(message, client) {
        if (message.callback != undefined) {
        	console.log('sending callback to: ' + client.sessionId);
        	client.send(JSON.stringify({method : 'callback', callback : message.callback}));
        }
    }
    
    var clientHandler = function(message, client ) {
    }
    
    function showClientDetails(client) {
    	for (name in client)
    		console.log(name);
    }
}
module.exports = websocket;