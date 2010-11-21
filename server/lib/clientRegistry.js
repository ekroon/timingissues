var clientRegistry = function () {
    var config = require('configuration');
    var tree = {clients : []};
    
    var reg = function () {};
    
    function removeClient(clients, client) {
    	for (var i = 0, l = clients.length; i < l; i++) {
    		if (clients[i] == client) {
    			if (config.debug) console.log('client ' + client.sessionId + ' removed');
    			clients.splice(i,1);
    		}
    	}
    }
    
    function cleanClients(clients) {
    	for (var i = 0, l = clients.length; i < l; i++) {
    		if (!clients[i] || !clients[i].connected) {
    			if (config.debug) console.log('client cleaned');
    			clients.splice(i,1);
    		}
    	}
    }
    
    function getKeys(uri) {
    	return uri.split("/");
    }
    
    function getLeaf(uri) {
    	if (config.debug) console.log('get leafs for : ' + uri);
    	var keys = getKeys(uri);
    	if (keys.length == 1 && keys[0] == "") {
    		return tree;
    	}
    	
    	var leaf = tree;
    	for (var i = 1, l = keys.length; i < l; i++) {
    		if (!(keys[i] in leaf)) {
    			if (config.debug) console.log('create leaf: ' + keys[i]);
    			leaf[keys[i]] = {clients : []};
    		}
    		leaf = leaf[keys[i]];
    	}
    	
    	return leaf;
    }
    
    reg.subscribe = function(uri, client) {
    	if (config.debug) console.log('subscribing');
    	var leaf = getLeaf(uri);
    	if (config.debug) console.log('push client: ' + client.sessionId);
    	leaf.clients.push(client);
    }
    
    reg.unsubscribe = function(uri, client) { 	
    	var leaf = getLeaf(uri);
    	removeClient(leaf.clients, client);
    }
    
    reg.getClients = function(uri) {
    	if (config.debug) console.log('getting clients for: ' + uri);
    	var leaf = getLeaf(uri);
    	cleanClients(leaf.clients);
    	if (config.debug) console.log('found clients: ' + leaf.clients.length);
    	return leaf.clients;
    }
    
    return reg;
    
};
module.exports = clientRegistry();