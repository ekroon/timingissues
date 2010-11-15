var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    io = require('socket.io');
    
var fileRoot = '/Users/raymond/prog/timingissues/frontend/';

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
server.listen(8080);

var MessageHandler = function(message) {
	console.log('message received: '  + message);
	socket.broadcast(JSON.stringify(message));
}

var socket = io.listen(server);
socket.on('connection', function(client) {
// 	var message = {type : 'score-update', data : {home : 1, away: 2}}; 
// 	setTimeout(function() {client.send(JSON.stringify(message));}, 5000);
	client.on('message', MessageHandler);	
 });


sys.puts("Server running at http://localhost:8080/");
