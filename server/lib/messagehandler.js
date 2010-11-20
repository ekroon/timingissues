var messagehandler = function messagehandler(app) {
    var socket = require('socket.io').listen(app);
    socket.on('connection', function(client) {
        client.on('message', messageHandler);
    });

    var messageHandler = function(message) {
        console.log('message received: '  + message);
        socket.broadcast(JSON.stringify(message));
    }
}
module.exports = messagehandler;