var util = require('util');
var express = require('express');
console.log('Hejsa');
var fs = require('fs');
var sys = require("util");
var url = require("url");
var Db = require('mongodb').Db,
  Conn = require('mongodb').Connection,
  Server = require('mongodb').Server;

/* iisnode
var apppath = '/postnumre';
var appport = process.env.PORT;
*/

/* andre */
var apppath = '';
var appport = 3000;


var app = module.exports = express.createServer();

//process.on('uncaughtException',function(err) {
//  console.log('uncaughtException, stack:'+err.stack);
//  process.exit(1);
//});

// Configuration

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.enable('jsonp callback');
  app.use(express.methodOverride());
  app.use(express.logger('dev'));
  //app.use(express.logger({format: 'default', stream: fs.createWriteStream(__dirname + '/logs/log', {flags: 'a'})}));
  app.use(express.bodyParser());
  app.use(express.staticCache());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function () {
  console.log('development');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  console.log('production');
  var oneDay = 86400;
  app.use(express.static(__dirname + '/public'), { maxAge: oneDay });
  app.use(express.errorHandler());
});

// Routes

app.get(apppath + "/", function (req, res) {
  res.render('home.jade');
});

app.get(apppath + "/advsearch", function (req, res) {
  res.render('advsearch.jade');
});

app.get(apppath + "/webapi", function (req, res) {
  res.render('webapi.jade');
});

app.get(apppath + "/about", function (req, res) {
  res.render('about.jade');
});

function wildcard(s) {
  s = '^' + s + '$';
  return s.replace(/\*/g, '(.*)')
}

app.get(apppath + '/hej', auth, function (req, res) {
  res.writeHead(200);
  res.end('protected page');
});

app.get(apppath + '/postnumre/:id', function (req, res) {
  var urlquery = url.parse(req.url, true).query;
  var id = req.params.id;
  console.log('id: ' + id);
  var query = {};
  query.postnr = id;
  db.collection('postnumre', function (err, collection) {
    if (err) {
      console.warn(err.message);
      res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      res.end();
      return;
    }
    var cursor = collection.find(query, { _id: 0 }, {});
    cursor.toArray(function (err, docs) {
      if (err) {
        console.warn('err: ' + err);
        res.json('Fejl: ' + err, 500);
        return;
      }
      else {
        if (docs.length === 0) {
          console.log('Postnummer findes ikke');
          res.json('Ukendt postnummer', 404);
          return;
        }
        else {
          res.statusCode = 200;
          res.setHeader("Cache-Control", "public, max-age=86400");
          res.json(docs);
        }
      }
    });
  });
});

app.get(apppath + '/postnumre', function (req, res) {
  var urlquery = url.parse(req.url, true).query;
  var query = {};
  if (urlquery.q) {
    var reg = new RegExp(wildcard('*' + urlquery.q + '*'), 'gi');
    query.$or = [];
    query.$or.push({ 'postnr': reg });
    query.$or.push({ 'gade': reg });
    query.$or.push({ 'navn': reg });
    query.$or.push({ 'firma': reg });
    // console.log(util.inspect(query, true, null));
  }
  else {
    if (urlquery.gade) {
      query.gade = new RegExp(wildcard(urlquery.gade), 'gi');
    }
    if (urlquery.postnr) {
      query.postnr = new RegExp(wildcard(urlquery.postnr), 'gi');
    }
    if (urlquery.navn) {
      query.navn = new RegExp(wildcard(urlquery.navn), 'gi');
    }
    if (urlquery.firma) {
      query.firma = new RegExp(wildcard(urlquery.firma), 'gi');
    }
    if (urlquery.land) {
      query.land = new RegExp(wildcard(urlquery.land), 'gi');
    }
    if (urlquery.provins) {
      query.provins = new RegExp(wildcard(urlquery.provins), 'gi');
    }
  }
  db.collection('postnumre', function (err, collection) {
    if (err) {
      console.warn(err.message);
      res.json("fejl: " + err, 500);
      return;
    }
    var cursor = collection.find(query, { _id: 0 }, urlquery.maxantal ? { limit: urlquery.maxantal } : {});
    cursor.toArray(function (err, docs) {
      if (err) {
        console.warn('err: ' + err);
        res.json("fejl: " + err, 500);
        return;
      }
      else {
        res.statusCode = 200;
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.json(docs);
      }
    });
  });
});

var auth = express.basicAuth(function (user, pass, next) {
  console.log('user: ' + user + ', password: ' + pass);
  db.collection('brugere', function (err, collection) {
    if (err) {
      console.warn(err.message);
      next(new Error('Forkert brugernavn eller password'));
    }
    else {
      var query = {};
      query.navn = user;
      collection.find(query).toArray(function (err, docs) {
        console.log('docs.length: ' + docs.length);
        if (err) {
          console.warn('err: ' + err);
          next(new Error('Forkert brugernavn eller password'));
        }
        else if (docs.length === 0) {
          console.warn("forkert brugernavn");
          next(new Error('Forkert brugernavn eller password'));
        }
        else if (docs[0].password !== pass) {
          console.warn("forkert password");
          next(new Error('Forkert brugernavn eller password'));
        }
        else {
          console.log('user ok');
          next(null, { name: docs[0].navn });
        }
      });
    }
  });
}, 'Admin area');

app.get(apppath + '/hej', auth, function (req, res) {
  res.render('upload.jade', { antal: 7, title: 'Postnumre' })
});

app.get(apppath + "/upload", function (req, res) {
  res.render('upload.jade', { opdateret: ''});
});

app.post(apppath + '/upload', auth, function (req, res) {
  var nr = 0,
      lnr = 0;
  console.log(util.inspect({ body: req.body, files: req.files }));
  db.dropCollection('postnumre', function (err, result) {
    console.log('efter dropcollection');
    console.log(err);
    //	if (err) {
    //		errorresponse(err,res,'dropCollection');
    //		return;
    //	}
    db.collection('postnumre', function (err, collection) {
      console.log('efter collection');
      if (err) {
        errorresponse(err, res, 'collection');
        return;
      }
      console.log("efter open. err: " + err + "db: " + db);
      console.log("file: " + req.files.upload.path);
      fs.readFileSync(req.files.upload.path, 'utf8').split('\r\n').forEach(function (line) {
        if (lnr++ < 2) { return }; // skip overskrifter
        console.log("line: " + line);
        var fields = line.split(';');
        console.log('fields: ', util.inspect({ fields: fields }));
        console.log("fields.length: " + fields.length);
        if (fields[0] !== 'Postnr.' && fields.length === 6) {


          var firma = fields[3].replace(/""/g, "'").replace(/"/g, "").replace(/'/g, '"');
          var land = landenavn(fields[5]);
       /*   res.write(nr.toString());
          res.write(':');
          res.write(fields[0]);
          res.write(',');
          res.write(fields[1]);
          res.write(',');
          res.write(fields[2]);
          res.write(',');
          res.write(firma);
          res.write(',');
          res.write(fields[4]);
          res.write(',');
          res.write(land);
          res.write('\n'); */ 
          console.log("fields[0]: " + fields[0]);
          nr++;
          collection.insert({ 'postnr': fields[0], 'navn': fields[1], 'gade': fields[2], 'firma': firma, 'provins': fields[4], 'land': land }, { safe: true }, function (err, objects) {
            if (err) {
              errorresponse(err, res, 'collection.insert');
              return;
            }
            if (err && err.message.indexOf('E11000 ') !== -1) {
              // this _id was already inserted in the database
            }
          });
        };
      });
      res.render('upload.jade', { opdateret: 'Web sitet er nu opdateret og rummer ' + nr.toString() + ' postnumre' })
      //				res.write(nr + " postnumre uploaded");
      //				res.render('upload', {antal: nr});
    });
  });
});

app.get('*', function (req, res) {
  res.send('what???', 404);
  res.end();
});

function errorresponse(err, res, text) {
  console.log(text + ': ' + err.message);
  res.writeHead(500);
  res.end("Fejl på web sitet (" + err.message + ') - prøv igen senere');
}

function landenavn(kode) {
  var navn = "";
  switch (kode) {
    case '1':
      land = "Danmark";
      break;
    case '2':
      land = "Grønland";
      break;
    case '3':
      land = "Færøerne";
      break;
  }
  return land;
}

console.log('Før new Db');
var conn = new Db('postdanmark', new Server("localhost", 27017, {}), {});
var db;
conn.open(function (err, database) {
  if (err) {
    console.warn('Database ikke åbnet: ' + err.message);
  }
  else {
    db = database;
    // app.listen(3000);
    app.listen(appport);
    console.log("Express server listening on port %d", appport);
    console.log('NODE_ENV: ' + appport);
  }
});
