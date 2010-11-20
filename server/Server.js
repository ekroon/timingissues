var path = require('path');
var applicationRoot = path.normalize(__dirname + '/..');
require.paths.unshift(applicationRoot + '/server/lib');
require.paths.unshift(applicationRoot + '/config');

var sys = require("sys"),
http = require("http"),
url = require("url"),
fs = require("fs"),
express = require("express");

var config = require('configuration');
config.applicationRoot = applicationRoot;
config.publicRoot = applicationRoot + '/public';
config.viewsRoot = applicationRoot + '/views';

var portNumber = parseInt(process.argv[2], 10);
if ('NaN' == portNumber.toString()) {
    portNumber = config.portNumber || 8080;
}
config.portNumber = portNumber;

// safety check for services already listening on localhost only
var server = http.createServer(function(request, response) {});
if ((config.listen || null) == null) {
    server.listen(portNumber, 'localhost');
    server.close();
}

var app = express.createServer();
require('appconfig')(app);
