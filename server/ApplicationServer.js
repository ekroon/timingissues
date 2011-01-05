var path = require('path');
var applicationRoot = path.normalize(__dirname + '/..');
require.paths.unshift(applicationRoot + '/server/lib');
require.paths.unshift(applicationRoot + '/config');

var config = require('configuration');

var pubsubhub = require('pubsubhub');
var hub = pubsubhub.createHub({db: config.redisdb});

var cradle = require('cradle');
var couch = new(cradle.Connection)().database('timingissues');

var serverName = 'applicationServer';
hub.init( function (err, result) {
  if(err) throw Error;
  hub.subscribe(serverName, '/scorer', scoreUpdate, function (err, result) {});
  hub.subscribe(serverName, '/scoreboard', returnMatches, function(err, result) {});
  hub.subscribe(serverName, '/clock', returnMatches, function(err, result) {});
  console.log('started');
  
});

var scoreUpdate = function (err, sender, msgId, body) {
  //console.log('score update');
  var updateJoke = ['updated', 'not updated']; 
  hub.reply(serverName, sender, msgId, {result : updateJoke[Math.floor (Math.random() * updateJoke.length)] }, function() {});
}

var returnMatches = function (err, sender, msgId, body) {
  //console.log('return matches');
  var d = new Date();
  couch.view('views/matches', {startkey : ["tournament/" + body.tournament, body.field, jsonDate(d)], endkey : ["tournament/devilsheaven2011","1",{}]}, function (err, res) {
    console.log(body.tournament + ", " + body.field + ", " + jsonDate(d) + " -> " + res.rows.length);
    hub.reply(serverName, sender, msgId, {matches : res.rows}, function() {});
  });
}

var jsonDate = function(date) {
  var ret = date.getFullYear() + "-" + addZero(date.getMonth()+1) + "-" + addZero(date.getDate()) + "T" + addZero(date.getHours()) + ":" + addZero(date.getMinutes());
  return ret;
}

var addZero = function (number) {
  return (number < 10 ? "0" + number : "" + number);
}