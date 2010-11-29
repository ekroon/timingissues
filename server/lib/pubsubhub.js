var sys = require('sys');
var EventEmitter = require("events").EventEmitter;
var redis = require("redis-node");

var hub = function hub (db) {
    EventEmitter.call(this);
    
    this._config = {
        prefix : 'pubsubhub',
        keySeperator : ':',
        uriSeperator : '/',
        hubIdSequence : 'hubIdSequence',
        clientPrefix : 'client',
        uriPrefix : 'uri',
        hubId : 0, // will be overwritten
        db : db
    }
    
};

sys.inherits(hub, EventEmitter);

hub.prototype._createKey = function() {
    if (arguments.length > 0) {
        return Array.prototype.slice.call(arguments).join(this._config.keySeperator);
    }
    return null;
}

hub.prototype._hubKey = function () {
    var values = [this._config.prefix, this._config.hubId].concat(Array.prototype.slice.call(arguments));
    return this._createKey.apply(this, values);
}

hub.prototype._globalKey = function (arg) {
    var values = [this._config.prefix].concat(arguments);
    return this._createKey.apply(values);
}

hub.prototype._getUriTree = function (uri) {
    var parts = uri.split(this._config.uriSeperator);
    var uriSet = [parts[0]];
    for (var i = 1; i < parts.length; i++) {
        uriSet.push(parts[i-1] + this._config.uriSeperator + parts[i]);
    }
    
    return parts;
}

hub.prototype._defaultRedisCallback = function (err, status) {
    if (err) throw err;
    consolo.log(status);
}

hub.prototype._getUriParent = function(uri) {
    var parts = uri.split(this._config.uriSeperator);
    if (parts.length > 1) {
        parts.pop();
        return parts.join(this._config.uriSeperator);
    }
    return null;
}

hub.prototype.init = function() {
    this._sub = redis.createClient();
    this._sub.select(this._config.db);
    this._pub = redis.createClient();
    this._pub.select(this._config.db);
    
    var self = this;
    
    this._sub.incr(this._globalKey(this._config.hubIdSequence), function(err, val) {self._config.hubId = val; self.emit('initialized');});
    return this;
}

hub.prototype.handleMessage = function (channelName, message, channelPattern) {
    //for all subscriptions send message
    this.getSubscriptions(channelName, channelPattern).forEach(function(clientId) {
        this._emit('message', clientId);
    });
}

hub.prototype.getSubscriptions = function (channelName, channelPattern) {
    var returnClientIds = [];
    this._getUriTree(channelName).forEach(function(uri) { // for uri and each ancestor
        this._pub.smembers(this._hubKey(this._config.uriPrefix, uri), function (err, clientIds){ // get clients
            clientIds.forEach(function (clientId) { // for each client
                //push to return val
                returnClientIds.push(clientId);
            });
        });
    });
    return returnClientIds;      
}

hub.prototype.subscribe = function(clientId, uri, fn) {
        
    if (clientId != undefined && uri != undefined && fn != undefined) {
        
        // push uri to clientkey
        this._pub.sadd(this._hubKey(this._config.clientPrefix, clientId), uri, fn);
        //push client to urikey
        this._pub.sadd(this._hubKey(this._config.uriPrefix, uri), clientId, fn);
        
    }
}

hub.prototype.getSubscriptionsForClient = function (clientId, fn) {
    if (clientId != undefined) {
        // get uri for clientkey
        this._pub.smembers(this._hubKey(this._config.clientPrefix, clientId), fn);
        
    }
}

hub.prototype.unsubscribe = function(clientId, uri) {
    
    if (clientId != undefined && uri != undefined) {
        
        // remove uri from clientkey
        this._pub.srem(this._hubKey(this._config.clientPrefix, clientId), uri, _defaultRedisCallback);
        //remove client from urikey
        this._pub.srem(this._hubKey(this._config.uriPrefix, uri), clientId, _defaultRedisCallback);
        
    }
    
}

hub.prototype.unsubscribeClient = function(clientId) {
    
    if (clientId != undefined) {
        this._pub.smembers(this._hubKey(this._config.clientPrefix, clientId), function (err, uris) { // get client uris
           if (err) {throw err;}
           uris.forEach(function(uri) { //for each uri
                this.unsubscribe(clientId, uri);
                //if urikey empty --> remove? expensive i/o, however need unsubscribing from redis too.
           });
           // delete clientkey
            this._pub.del(this._hubKey(this._config.clientPrefix, clientId));
        });
    }
}


exports.createHub = function (db) { return new hub(db)}; 