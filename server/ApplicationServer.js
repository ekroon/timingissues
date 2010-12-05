var path = require('path');
var applicationRoot = path.normalize(__dirname + '/..');
require.paths.unshift(applicationRoot + '/server/lib');
require.paths.unshift(applicationRoot + '/config');

var config = require('configuration');

var pubsubhub = require('pubsubhub');
var hub = pubsubhub.createHub({db: config.redisdb});

var serverName = 'applicationServer';
hub.init( function (err, result) {
  if(err) throw Error;
  hub.subscribe(serverName, '/scorer', scoreUpdate, function (err, result) {});
  
});

var scoreUpdate = function (err, sender, msgId, body) {
  var updateJoke = ['updated', 'not updated']; 
  hub.reply(serverName, sender, msgId, {result : updateJoke[Math.floor (Math.random() * updateJoke.length)] }, function() {});
}