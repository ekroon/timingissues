var vows = require('vows'),
    assert = require('assert');
require.paths.unshift(__dirname + '/../server/lib');

var redis = require('redis-node').createClient();
redis.select(15);
redis.flushdb(function (err, result) {
    tests.run();
});

var tests = vows.describe('Pubsubhub Test').addBatch({
    'pubsubhub': {
        topic: require('pubsubhub').createHub(15),
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
            }
        },
        
        'after subscribing a client': {
            topic: function (hub) {
                var self = this;
                hub.subscribe('c12345', 'test uri', self.callback);
            },
    
            'should return no error': function (err, result) {
                assert.isNull(err);
            },
            
            'should have subscriptions' : {
                topic : function (_, hub) {
                    var self = this;
                    hub.getSubscriptionsForClient('c12345', self.callback)
                },
                'that are exactly the input' : function (err, result) {
                    assert.deepEqual(result, ['test uri'])
                }
            }
        }
    }
}); // Export the Suite