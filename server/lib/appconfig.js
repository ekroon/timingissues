//var messagehandler = require('messagehandler');
var configure = function configure(app) {
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

    app.listen(config.portNumber, config.listen || null, function() {
        sys.puts("Server running at http://"+(config.listen || "INADDR_ANY")+":"+config.portNumber+"/");
        require('messagehandler')(app);
    });
};
module.exports = configure;