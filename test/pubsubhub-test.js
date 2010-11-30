var vows = require('vows'),
    assert = require('assert');
require.paths.unshift(__dirname + '/../server/lib');

var redis = require('redis-node').createClient();
redis.select(15);
//redis.flushdb(function (err, result) {
//   tests.run();
//});

var tests = vows.describe('Pubsubhub Test').addBatch({
    'pubsubhub': {
        topic: require('pubsubhub').createHub({db : 15}),
        'should not be empty' : function (hub) {
            assert.isNotNull(hub);
        },
        'after init' : {
                topic : function (hub) {
                var self = this;
                hub.init(this.callback);
            },
            'we get no error': function(err, result) {
                assert.isNull(err);
            },
        
        
            'after subscribing client1': {
                topic: function (a, hub) {
                    var self = this;
                    hub.subscribe('c1', 'uri1', function (err, msg) {}, self.callback);
                },
        
                'should return no error': function (err, result) {
                    assert.isNull(err);
                },
                
                'should have 1 subscription' : {
                    topic : function (a,b, hub) {
                        var self = this;
                        hub.getSubscriptionsForClient('c1', self.callback);
                    },
                    'that is exactly the input' : function (err, result) {
                        assert.deepEqual(result, ['uri1']);
                    },
                    
                    'and after unsubscribe' : {
                        topic : function (a,b,c,hub) {
                            var self = this;
                            hub.unsubscribe('c1', 'uri1', self.callback);
                        },
                        
                        'which should return no error': function (err, result) {
                            assert.isNull(err);
                        },
                        
                        'subscriptions' : {
                            topic : function (a,b,c,d,hub) {
                                var self = this;
                                hub.getSubscriptionsForClient('c1', self.callback);
                            },
                            'should be empty' : function (err, result) {
                                assert.deepEqual(result, []);
                            }
                        }
                    }
                }
            },
            
            'after subscribing 2 uris for client2': {
                topic: function (a,hub) {
                    var self = this;
                    hub.subscribe('c2', 'uri1', function (err, msg) {}, function () {
                        hub.subscribe('c2', 'uri2', function (err, msg) {}, self.callback)
                    });
                },
        
                'should return no error': function (err, result) {
                    assert.isNull(err);
                },
                
                'should have 2 subscription' : {
                    topic : function (a,b, hub) {
                        var self = this;
                        hub.getSubscriptionsForClient('c2', self.callback)
                    },
                    
                    'that are exactly the input' : function (err, result) {
                        assert.deepEqual(result, ['uri1', 'uri2']);
                    },
                    
                    'and after unsubscribe client' : {
                        topic : function (a,b,c,hub) {
                            var self = this;
                            hub.unsubscribeClient('c2', self.callback);
                        },
                        
                        'which should return no error': function (err, result) {
                            assert.isNull(err);
                        },
                        
                        'subscriptions' : {
                            topic : function (a,b,c,d,hub) {
                                var self = this;
                                hub.getSubscriptionsForClient('c2', self.callback);
                            },
                            'should be empty' : function (err, result) {
                                assert.deepEqual(result, []);
                            }
                        }
                    }
                }
            }
        }
    }
}).addBatch({
    'pubsubhub2': {
        topic: require('pubsubhub').createHub({db : 15}),
        'should not be empty' : function (hub) {
            assert.isNotNull(hub);
        },
        'after init' : {
                topic : function (hub) {
                var self = this;
                hub.init(this.callback);
            },
            'we get no error': function(err, result) {
                assert.isNull(err);
            },
            
            'after subscribing client': {
                topic: function (a, hub) {
                    hub.subscribe('c1', 'uri1', this.callback, function(err, result){
                        hub.publish('uri1', { msg : 'test'}, function (err, result){});
                    });
                },
        
                'should get message': function (err, result) {
                    assert.isNull(err);
                    assert.deepEqual(result, {msg : 'test'});
                } 
            }
        }
    }
})
.export(module); // Export the Suite
