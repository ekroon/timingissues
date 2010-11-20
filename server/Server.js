var sys = require("sys"),
http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs"),
express = require("express")
io = require('socket.io');

var config = require(__dirname+'/../config/configuration.js');
var app = express.createServer();
var fileRoot = __dirname + '/../public';
var portNumber = parseInt(process.argv[2], 10);
if ('NaN' == portNumber.toString()) {
    portNumber = config.portNumber || 8080;
}

// safety check for services already listening on localhost only
var server = http.createServer(function(request, response) {});
if ((config.listen || null) == null) {
    server.listen(portNumber, 'localhost');
    server.close();
}

app.configure(function() {
    app.use(express.staticProvider(fileRoot));
});

app.listen(portNumber, config.listen || null, function() {
    sys.puts("Server running at http://"+(config.listen || "INADDR_ANY")+":"+portNumber+"/");
    var socket = io.listen(app);
    socket.on('connection', function(client) {
        var message = {type : 'score-update', data : {home : 1, away: 2}};
        client.on('message', MessageHandler);
    });

    var MessageHandler = function(message) {
        console.log('message received: '  + message);
        socket.broadcast(JSON.stringify(message));
    }
});

