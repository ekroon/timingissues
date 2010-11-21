var clientRegistry = function () {
    var config = require('configuration');
    var tree = {clients : []};
    
    var reg = function () {};
    
    function removeClient(clients, client) {
    	for (var i = 0; i < clients.length; i++) {
    		if (clients[i] == client) {
    			//if (config.debug) console.log('client ' + client.sessionId + ' removed');
    			clients.splice(i,1);
    			i--;
    		}
    	}
    }
    
    function cleanClients(clients) {
    	//if (config.debug) console.log('start clean for ' + clients.length + ' clients');
    	for (var i = 0; i < clients.length; i++) {
    		if (!clients[i] || !clients[i].connected) {
    			//var cId = '<unknown>';
    			//if (clients[i]) cId = clients[i].sessionId;
    			//if (config.debug) console.log('client ' + cId + ' cleaned');
    			clients.splice(i,1);
    			i--;
    		}
    	}
    }
    
    function getCleanedClients(clients) {
    	//if (config.debug) console.log('getting cleaned clients for ' + clients.length + ' clients');
    	var tmp = clients.slice(0);
    	cleanClients(tmp);
    	//if (config.debug) console.log('returning ' + tmp.length + ' clients');
    	return tmp;
    }
    
    function getKeys(uri) {
    	return uri.split("/");
    }
    
    function getLeafs(uri, set) {
    	//if (config.debug) console.log('get leafs for : ' + uri);
    	
    	var path = [];
    	var leafs = 0;
    	
    	leafs = path.push(tree);
    	
    	var keys = getKeys(uri);
    	if (keys.length == 1 && keys[0] == "") {
    		return path;
    	}
    	
    	for (var i = 1, l = keys.length; i < l; i++) {
    		if (!(keys[i] in path[leafs - 1])) {
    			if (set) {
    				//if (config.debug) console.log('create leaf: ' + keys[i]);
    				path[leafs - 1][keys[i]] = {clients : []};
    			}
    			else {
    				return path;
    			}
    		}
    		if (set) cleanClients(path[leafs - 1].clients);
    		leafs = path.push(path[leafs - 1][keys[i]]);
    	}
    	
    	return path;
    }
    
    function getLeaf(uri, set) {
    	var path = getLeafs(uri, set);
    	return path[path.length - 1];
    }
    
    reg.subscribe = function(uri, client) {
    	//if (config.debug) console.log('subscribing');
    	var leaf = getLeaf(uri, true);
    	//if (config.debug) console.log('push client: ' + client.sessionId);
    	leaf.clients.push(client);
    }
    
    reg.unsubscribe = function(uri, client) { 	
    	var leaf = getLeaf(uri, true);
    	removeClient(leaf.clients, client);
    }
    
    reg.getClients = function(uri) {
    	//if (config.debug) console.log('getting clients for: ' + uri);
    	var leafs = getLeafs(uri, false);
    	var clients = [];
    	for (var i = 0, l = leafs.length; i < l; i++) {
    		clients = clients.concat(getCleanedClients(leafs[i].clients));
    	}
    	//if (config.debug) console.log('found clean clients: ' + clients.length);
    	return clients;
    }
    
    return reg;
    
};
module.exports = clientRegistry();