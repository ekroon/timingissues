var cradle = require('cradle');
var fs = require('fs');

var db = new(cradle.Connection)().database('timingissues');

var callbackHandler = function (numCallbacks, fn) {
    
    var ret = function (err, result) {
        numCallbacks--;
        if (numCallbacks == 0 && typeof(fn) == 'function') fn();
    }
    
    return ret;
}



db.all(function (err, result) {
  var cb = new callbackHandler(result.length, importFiles);
  for (var i = 0; i < result.length; i++) {
    db.remove(result[i].id, result[i].value.rev, cb);
  }
});



var path = __dirname + '/in/';

var importFiles = function () {
  var files = fs.readdirSync (__dirname + '/in', importFiles);
  files.forEach( function(file) {
    if (fs.statSync(path+file).isFile() && !file.match('^\\.')) {
      data = fs.readFileSync(path+file, 'utf8');
      var json = eval(data);
      db.save(json, function (err, result) {
      });
      
      fs.renameSync(path+file, path + 'done/'  + file);
    }   
  })
}

