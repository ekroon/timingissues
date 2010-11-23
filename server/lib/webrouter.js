//var messagehandler = require('messagehandler');
var router = function router(app) {
    var config = require('configuration'),
    sys = require('sys');;
    app.configure(function() {
        app.set('views', config.viewsRoot);
        app.register('.html', require('ejs'));
        app.use(require('express').staticProvider(config.publicRoot));
    });

    app.get('/scoreboard/:field?', function(req, res) {
        res.render('scoreboard.html', {layout: false});
    });
    app.get('/scorer/:field?', function(req, res) {
        res.render('scorer.html', {layout: false});
    });
    app.get('/time', function(req, res) {
        res.send(JSON.stringify(new Date()));
    });
};
module.exports = router;