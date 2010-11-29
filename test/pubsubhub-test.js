var vows = require('vows'),
    assert = require('assert');
require.paths.unshift(__dirname + '/../server/lib');

var redis = require('redis-node').createClient();
redis.select(15);
redis.flushdb(function (err, result) { tests.run();});

var testset = function () {
    return require('assert');
}

var ts = new testset();

var tests = vows.describe('Pubsubhub Test').addBatch({
    'when making a hub': {
        topic: require('pubsubhub').createHub(15).init(),
        
        'we get no error': function(hub) {
            assert.isNotNull(hub);
        },
        
        
        'when subscribing a client': {
            topic: function (hub) {
                var self = this;
                hub.subscribe('c12345', 'test uri', self.callback);
            },
    
            'should return 1': function (err, result) {
                assert.equal(result, 1);
            }
        },
            
        'after subscribing getSubscriptionsForClient' : {
            topic : function (hub) {
                var self = this;
                hub.getSubscriptionsForClient('c12345', self.callback)
            },
            'should return exactly input' : function (err, result) {
                var check = result[0] === 'test uri2';
                assert.isTrue(check);
            }
        }   
    }
}); // Export the Suite