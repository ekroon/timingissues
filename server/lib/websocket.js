var websocket = function websocket(app,pubsubhub) {
		var config = require('configuration');
    var socket = require('socket.io').listen(app);
    
    socket.on('clientConnect', function(client) {
        //do nothing
    });
    
    socket.on('clientDisconnect', function(client) {
        pubsubhub.unsubscribeClient(client.sessionId);
    });
    
    socket.on('clientMessage', function(message, client) {clientMessageHandler(message, client)});
    
    var hubMessageHandler = function(clientId) {
        return function (err, sender, msgId, message) {
            socket.clients[clientId].send(JSON.stringify({method : 'put', body : message}));
        }
    }
    
    var callbackHandler = function(clientId, callbackId) {
        return function(err, sender, body) {
            socket.clients[clientId].send(JSON.stringify({method : 'callback', callback : callbackId, err : err, sender : sender, body : body}));
        }
    }
    
    var clientMessageHandler = function(message, client) {
        
        if(message.method == 'subscribe') {
            pubsubhub.subscribe(client.sessionId, message.uri, hubMessageHandler(client.sessionId), function (err, result) {});
        }
        
        else if (message.method == 'unsubscribe') {
            pubsubhub.unsubscribe(client.sessionId, message.uri, function (err, result) {});
        }
        
        else if (message.method == 'put' || message.method == 'get') {
            var cb = function (){};
            if (message.callback != undefined) { // short callback, should be long
              cb = callbackHandler(client.sessionId, message.callback);
            }
            pubsubhub.publish(client.sessionId, message.uri, message.body, cb, function (err, result){});
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