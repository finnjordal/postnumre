/**
 * Module dependencies.
 */
var util = require('util');
var express = require('express');
var fs = require('fs');
var formidable = require("formidable");
var sys = require("sys");
var url = require("url");
var Db = require('mongodb').Db,
  Conn = require('mongodb').Connection,
  Server = require('mongodb').Server;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
	//app.favicon(__dirname + '/public/favicon.ico'); 
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
	app.enable('jsonp callback');
  app.use(express.methodOverride());
});

app.configure('development', function(){
	app.use(express.logger('dev'));
  app.use(require('connect').bodyParser());
	app.use(app.router);
	app.use(express.staticCache());
	app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	console.log(process.env);
});

app.configure('production', function(){
	var oneDay = 86400000;
	app.use(express.logger({format: 'default', stream: fs.createWriteStream(__dirname + '/logs/log', {flags: 'a'})}));
  app.use(require('connect').bodyParser());
  app.use(app.router);
	app.use(express.staticCache());
	app.use(express.static(__dirname + '/public'), { maxAge: oneDay });
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
	res.sendfile(__dirname + '/public/index.html');
//	fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
//       res.end(text);
//   });
});

function wildcard(s) {
	s= '^' + s + '$';
	return s.replace(/\*/g,'(.*)')
}
app.get('/hej', auth, function(req,res) {
	res.writeHead(200);
	res.end('protected page');
});

app.get('/postnumre/:id', function(req, res){
	var urlquery= url.parse(req.url, true).query;
	var id= req.params.id;
	console.log('id: '+id);
	var query= {};
	query.postnr= id;
	db.collection('postnumre', function(err, collection) {
		if (err) {
			console.warn(err.message);
			res.writeHead(500, {'content-type': 'application/json; charset=utf-8'});
			res.end();
			return;
		}
		var cursor = collection.find(query, {_id:0}, {});
		cursor.toArray(function(err, docs) {
			if (err) {
				console.warn('err: ' + err);
				res.json('Fejl: '+err, 500);
				return;
			}
			else {					
				if (docs.length === 0) {	
					console.log('Postnummer findes ikke');
					res.json('Ukendt postnummer',404);
					return;
				}
				else {					
						res.json(docs);
				}
			}
		});
	});
});

app.get('/postnumre', function(req, res){
	var urlquery= url.parse(req.url, true).query;
	var query= {};
	if (urlquery.q) {
		var reg= new RegExp(wildcard('*'+urlquery.q+'*'),'gi');
		query.$or= [];
		query.$or.push({'postnr':reg});
		query.$or.push({'gade':reg});
		query.$or.push({'navn':reg});
		query.$or.push({'firma':reg});
		console.log(util.inspect(query, true, null));
	}
	else {
		if (urlquery.gade) {
			query.gade= new RegExp(wildcard(urlquery.gade),'gi');
		}
		if (urlquery.postnr) {
			query.postnr= new RegExp(wildcard(urlquery.postnr),'gi');
		}
		if (urlquery.navn) {
			query.navn= new RegExp(wildcard(urlquery.navn),'gi');
		}	
		if (urlquery.firma) {
			query.firma= new RegExp(wildcard(urlquery.firma),'gi');
		}
		if (urlquery.land) {
			query.land= new RegExp(wildcard(urlquery.land),'gi');
		}	
		if (urlquery.provins) {
			query.provins= new RegExp(wildcard(urlquery.provins),'gi');
		}
	}
	db.collection('postnumre', function(err, collection) {
		if (err) {
			console.warn(err.message);
			res.json("fejl: "+err,500);
			return;
		}
		var cursor = collection.find(query, {_id:0}, urlquery.maxantal?{limit:urlquery.maxantal}:{});
		cursor.toArray(function(err, docs) {
			if (err) {
				console.warn('err: ' + err);
				res.json("fejl: "+err,500);
				return;
			}
			else {					
					res.json(docs);
			}
		});
	});
});

var auth = express.basicAuth(function(user,pass,next) {
	console.log('user: '+user+', password: '+pass);
	db.collection('brugere', function(err, collection) {
		if (err) {
			console.warn(err.message);
			next(new Error('Forkert brugernavn eller password'));
		}
		else {		
			var query= {};
			query.navn= user;
			collection.find(query).toArray(function(err, docs) {
				console.log('docs.length: '+docs.length);
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
					next(null,{name: docs[0].navn});
					console.log('user ok');
				}
			});
		}
	});
}, 'Admin area');

app.get('/hej',auth,function(req,res){
	res.writeHead('200');
	res.end('protected area');
});

app.post('/upload', auth, function(req, res){
	console.log('/upload');
	var nr= 0;
	var form = new formidable.IncomingForm();
	console.log('éfter formidable');
	form.keepExtensions = true;
	console.log('før parse');
	form.parse(req, function(err, fields, files) {
		if (err) {
			console.warn(err.message);
			res.json("fejl: "+err,500);
			return;
		}
	 	db.dropCollection('postnumre',function(err, result) {
			if (err) {
				console.warn(err.message);
				res.json("fejl: "+err,500);
				return;
			}
	   	db.collection('postnumre', function(err, collection) {
				if (err) {
					console.warn(err.message);
					res.json("fejl: "+err,500);
					return;
				}
	 			res.writeHead(200, {'content-type': 'text/plain; charset=utf-8'});
				console.log("efter open. err: "+err+"db: "+db);
				console.log("file: "+files.upload.path);
				fs.readFileSync(files.upload.path).toString().split('\n').forEach(function (line) {
					console.log("line: "+line);
					var fields= line.split(';');
					if (fields[0] !== 'Postnr.' && fields.length === 6) {	
						console.log("fields[0]: "+fields[0]);							
			   		res.write(nr.toString());
						res.write(':');
						res.write(fields[0]);
						res.write(',');
						res.write(fields[1]);
						res.write(',');
						res.write(fields[2]);
						res.write(',');
						var firma= fields[3].replace(/""/g,"'").replace(/"/g,"").replace(/'/g,'"');
						res.write(firma);
						res.write(',');
						res.write(fields[4]);
						res.write(',');
						var land= landenavn(fields[5]);
						res.write(land);
			 			res.write('\n');
						nr++;
						collection.insert({'postnr':fields[0], 'navn':fields[1], 'gade':fields[2], 'firma':firma, 'provins':fields[4], 'land':land}, {safe:true}, function(err, objects) {
						  if (err) {
								console.warn(err.message);
								res.write('Fejl i skrivning: ' + err.message);
							}
						  if (err && err.message.indexOf('E11000 ') !== -1) {
						     // this _id was already inserted in the database
						  }
						});
					};
				});
				console.log("før end");
				res.end();
				console.log("efter end");
			});
		});
	});
});

function landenavn(kode) {
	var navn= "";
	switch (kode) {	
	case '1':	
		land= "Danmark";
		break;
	case '2':
		land= "Grønland";
		break;
	case '3':
		land= "Færøerne";
		break;
	}
	return land;
}

var conn = new Db('postdanmark', new Server("localhost", 27017, {}), {});
var db;
conn.open(function(err, database) {
	 if (err) {
		console.warn('Database ikke åbnet: ' + err.message);
	}
	db= database;
	app.listen(3000);
	console.log("Express server listening on port %d", app.address().port);
});
