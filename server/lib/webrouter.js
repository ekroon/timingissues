//var messagehandler = require('messagehandler');
var router = function router(app) {
    var config = require('configuration'),
    sys = require('sys');;
    app.configure(function() {
        app.set('views', config.viewsRoot);
        app.register('.html', require('ejs'));
        app.use(require('express').staticProvider(config.publicRoot));
    });

    app.get('/scoreboard/:tournament/:field', function(req, res) {
        res.render('scoreboard.html', {layout: false, locals : {field : req.params.field, tournament : req.params.tournament}});
    });
    app.get('/clock/:tournament/:field', function(req, res) {
        res.render('clock.html', {layout: false, locals : {field : req.params.field, tournament : req.params.tournament}});
    });
    app.get('/scorer/:field?', function(req, res) {
        res.render('scorer.html', {layout: false});
    });
    app.get('/time', function(req, res) {
        res.send(JSON.stringify(new Date()));
    });
    app.get('/admin/:tournament', function(req, res) {
        res.render('admin.html', {layout: false, locals : {tournament : req.params.tournament}});
    });
};
module.exports = router;