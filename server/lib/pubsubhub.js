var sys = require('sys');
var EventEmitter = require("events").EventEmitter;
var redis = require("redis-node");

var hub = function hub (options) {
    EventEmitter.call(this);
    
    this._config = {
        prefix : 'pubsubhub',
        keySeperator : ':',
        uriSeperator : '/',
        hubIdSequence : 'hubIdSequence',
        clientPrefix : 'client',
        uriPrefix : 'uri',
        hubId : 0, // will be overwritten
        db : 0,
        host : '127.0.0.1',
        port : 6379
    }
    
    if (options != undefined) {
        combine(this._config, options);
    }
    
};

var combine = function (target, source) {
    for (name in source) {
        target[name] = source[name];
    }
}

sys.inherits(hub, EventEmitter);

var callbackHandler = function (numCallbacks, fn) {

    var error = null;
    
    var ret = function (err, result) {
        if (err && !error) error = err;
        numCallbacks--;
        if (numCallbacks == 0) fn(error, result);
    }
    
    return ret;
}

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
    var values = [this._config.prefix].concat(Array.prototype.slice.call(arguments));
    return this._createKey.apply(this,values);
}

hub.prototype._getUriTree = function (uri) {
    var parts = uri.split(this._config.uriSeperator);
    var uriSet = [parts[0]];
    for (var i = 1; i < parts.length; i++) {
        uriSet.push(parts[i-1] + this._config.uriSeperator + parts[i]);
    }
    
    return parts;
}

hub.prototype._getUriParent = function(uri) {
    var parts = uri.split(this._config.uriSeperator);
    if (parts.length > 1) {
        parts.pop();
        return parts.join(this._config.uriSeperator);
    }
    return null;
}

hub.prototype.init = function(fn) {
    
    this._sub = redis.createClient(this._config.port, this._config.host);
    this._sub.select(this._config.db);
    this._pub = redis.createClient(this._config.port, this._config.host);
    this._pub.select(this._config.db);
    
    var self = this;
    this._sub.incr(this._globalKey(this._config.hubIdSequence), function(err, val) {
        self._config.hubId = val;
        fn(err, val);
    });
    return this;
}

hub.prototype.sendMessage = function(message) {
    var self = this;
    return function(clientId) {
        self.emit('message:for:' + clientId, null, message);
    }
}

hub.prototype.messageHandler = function (channelName, message, channelPattern) {
    //for all subscriptions send message
    this.forSubscriptions(channelName, channelPattern, this.sendMessage(JSON.parse(message)));
}

hub.prototype.forSubscriptions = function (channelName, channelPattern, fn) {
    var returnClientIds = [];
    var self = this;
    var uris = this._getUriTree(channelName);
    var cb = new callbackHandler(uris.length, fn);
    uris.forEach(function(uri) { // for uri and each ancestor
        self._pub.smembers(self._hubKey(self._config.uriPrefix, uri), function (err, clientIds){ // get clients
            clientIds.forEach(function (clientId) { // for each client
                //execute fn
                fn(clientId);
            });
        });
    });
}

hub.prototype.subscribe = function(clientId, uri, handler, fn) {
    
    
    if (clientId != undefined && uri != undefined && fn != undefined) {
        
        var cb = new callbackHandler(2, fn);
        
        // push uri to clientkey
        this._pub.sadd(this._hubKey(this._config.clientPrefix, clientId), uri, cb);
        //push client to urikey
        this._pub.sadd(this._hubKey(this._config.uriPrefix, uri), clientId, cb);
        
        
        //subscribe
        this.on('message:for:' + clientId, handler);
        this._sub.subscribeTo(uri, this.messageHandler.bind(this));
        
    }
}

hub.prototype.getSubscriptionsForClient = function (clientId, fn) {
    if (clientId != undefined) {
        // get uri for clientkey
        this._pub.smembers(this._hubKey(this._config.clientPrefix, clientId), fn);
        
    }
}

hub.prototype.unsubscribe = function(clientId, uri, fn) {
    
    if (clientId != undefined && uri != undefined) {
        var cb = new callbackHandler(2, fn);
            
        // remove uri from clientkey
        this._pub.srem(this._hubKey(this._config.clientPrefix, clientId), uri, cb);
        //remove client from urikey
        this._pub.srem(this._hubKey(this._config.uriPrefix, uri), clientId, cb);
        
    }
    
}

hub.prototype.unsubscribeClient = function(clientId, fn) {
    
    var self = this;
    if (clientId != undefined) {
        this._pub.smembers(this._hubKey(this._config.clientPrefix, clientId), function (err, uris) { // get client uris
           if (err) {throw err;}
           var cb = new callbackHandler(uris.length, fn);
           uris.forEach(function(uri) { //for each uri
                self.unsubscribe(clientId, uri, cb);
                //if urikey empty --> remove? redis does this automatically
           });
        });
    }
}

hub.prototype.publish = function(uri, msg, fn) {
    this._pub.publish(uri, JSON.stringify(msg), fn);
}


exports.createHub = function (options) { return new hub(options)}; 