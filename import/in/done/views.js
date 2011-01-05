[{
   "_id": "_design/views",
   "language": "javascript",
   "views": {
       "matches": {
           "map": "function(doc) {\u000a if (doc.type == 'match')\u0009\u000a  emit([doc.tournament, doc.field] , \u000a\u0009{\u000a\u0009starttime : doc.starttime,\u000a\u0009stoptime : doc.stopttime}\u000a\u0009);\u000a}",
           "reduce": "function (keys, values, rereduce) {\u000a\u000a var sort = function(a,b) {\u000a   if (a.starttime < b.starttime) return -1;\u000a   if (a.starttime > b.starttime) return 1;\u000a   return 0;\u000a }\u000a\u000a var games = {};\u000a if (rereduce) {\u000a      for (var i = 0; i < values.length; i++) {\u000a\u0009 for (field in values[i]) {\u000a\u0009  if (games[field] == undefined) {\u000a\u0009   games[field] = values[i][field];\u000a\u0009  }\u000a\u0009  else {\u000a\u0009\u000a\u0009   games[field] = games[field].concat(values[i][field]);\u000a\u0009  }\u000a\u0009  games[field].sort(sort);\u000a\u0009 }\u000a\u0009}\u000a  }\u000a else {\u000a\u000a \u0009for (var i = 0; i < keys.length; i++) {\u000a \u000a\u0009 if (!games[keys[i][1]]) {\u000a\u0009  games[keys[i][1]] = [values[i]];\u000a\u0009 }\u000a\u0009 else {\u000a\u0009  games[keys[i][1]].push(values[i]);\u000a\u0009 }\u000a   \u0009}\u000a }\u000a return games;\u000a}"
       }
   }
}]