var sys = require('sys');
var EventEmitter = require("events").EventEmitter;
var redis = require("redis-node");
var config = require('configuration');

var hub = function hub () {
    EventEmitter.call(this);
    
    this._options = {
        prefix : 'pubsubhub',
        keySeperator : ':',
        uriSeperator : '/',
        hubIdSequence : 'hubIdSequence',
        clientPrefix : 'client',
        uriPrefix : 'uri',
        hubId : 0
    }
    
};

sys.inherits(hub, EventEmitter);

hub.prototype._createKey = function() {
    if (arguments.length > 0) {
        return arguments.join(this._options.keySeperator);
    }
    return null;
}

hub.prototype._hubKey = function (arg) {
    var values = [this._options.prefix, this._options.hubId].concat(arguments);
    return this._createKey.apply(values);
}

hub.prototype._globalKey = function (arg) {
    var values = [this._options.prefix].concat(arguments);
    return this._createKey.apply(values);
}

hub.prototype._getUriTree = function (uri) {
    var parts = uri.split(this._options.uriSeperator);
    var uriSet = [parts[0]];
    for (var i = 1; i < parts.length; i++) {
        uriSet.push(parts[i-1] + this._options.uriSeperator + parts[i]);
    }
    
    return parts;
}

hub.prototype._getUriParent = function(uri) {
    var parts = uri.split(this._options.uriSeperator);
    if (parts.length > 1) {
        parts.pop();
        return parts.join(this._options.uriSeperator);
    }
    return null;
}

hub.prototype.init = function() {
    this._sub = redis.createClient();
    this._sub.select(config.redisdb);
    this._pub = redis.createClient();
    this._pub.select(config.redisdb);
    
    var self = this;
    
    this._sub.incr(this._globalKey(this._options.hubIdSequence), function(err, val) {self._options.hubId = val; self.emit('initialized');});
    return this;
}

hub.prototype.handleMessage = function (channelName, message, channelPattern) {
    //for all uris send message to clients
    this._getUriTree(channelName).forEach(function(uri) {
        this._pub.smembers(hubKey(this._options.uriPrefix, uri), function (err, clientIds){
            clientIds.forEach(function(clientId) {
                this._emit('message', clientId);
            });
        });
    });
}

hub.prototype.subscribe = function(clientId, uri) {
        
    if (clientId != undefined && uri != undefined) {
    
        // push uri to clientkey
        this._pub.sadd(hubKey(this._options.clientPrefix, clientId), uri);
        //push client to urikey
        this._pub.sadd(hubKey(this._options.uriPrefix, uri), clientId);
        
    }
}

hub.prototype.unsubscribe = function(clientId, uri) {
    
    if (clientId != undefined && uri != undefined) {
        
        // remove uri from clientkey
        this._pub.srem(hubKey(this._options.clientPrefix, clientId), uri);
        //remove client from urikey
        this._pub.srem(hubKey(this._options.uriPrefix, uri), clientId);
        
    }
    
}

hub.prototype.unsubscribeClient = function(clientId) {
    
    if (clientId != undefined) {
        this._pub.smembers(hubKey(this._options.clientPrefix, clientId), function (err, uris) { // get client uris
           uris.forEach(function(uri) { //for each uri
                //remove client from urikey
                this._pub.srem(hubKey(this._options.uriPrefix, uri), clientId);
                // remove uri from clientkey
                this._pub.srem(hubKey(this._options.clientPrefix, clientId), uri);
                
                //if urikey empty --> remove? expensive i/o
           });
           // delete clientkey
            this._pub.del(hubKey(this._options.clientPrefix, clientId));
        });
    }
}


exports.createHub = function () { return new hub()}; 