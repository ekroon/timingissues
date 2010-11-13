var http = require('http');

var showMembers = function(object) {
	var output = '';
	for (var member in object) { 
		output = output + ' Name: '  + member + ' Type: ' + typeof(object[member]) + '\n';
	}
	return output;
};

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  var output = '';
  
 output = showMembers(req);
  
  res.end('Hello World\n' + output);
}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');