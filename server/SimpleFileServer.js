var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    io = require('socket.io');
var config = require(__dirname+'/../config/configuration.js');

var fileRoot = __dirname + '/../frontend';
var portNumber = parseInt(process.argv[2], 10);
if ('NaN' == portNumber.toString()) {
    portNumber = config.portNumber || 8080;
}

var server = http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    var filename = path.join(fileRoot, uri);
    path.exists(filename, function(exists) {
        if(!exists) {
                response.writeHead(404, {"Content-Type": "text/plain"});
                response.write("404 Not Found\n");
                response.end();
                return;
        }

        fs.readFile(filename, "binary", function(err, file) {
                if(err) {
                        response.writeHead(500, {"Content-Type": "text/plain"});
                        response.write(err + "\n");
                        response.end();
                        return;
                }

                response.writeHead(200);
                response.write(file, "binary");
                response.end();
        });
    });
});

// safety check for services already listening on localhost only
if ((config.listen || null) == null) {
    server.listen(portNumber, 'localhost');
    server.close();
}

server.listen(portNumber, config.listen || null, function() {
    sys.puts("Server running at http://"+(config.listen || "INADDR_ANY")+":"+portNumber+"/");
    var socket = io.listen(server);
    socket.on('connection', function(client) {
        var message = {type : 'score-update', data : {home : 1, away: 2}};
        client.on('message', MessageHandler);
    });

    var MessageHandler = function(message) {
        console.log('message received: '  + message);
        socket.broadcast(JSON.stringify(message));
    }
});


