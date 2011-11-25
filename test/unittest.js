var http = require('http');
var assert = require('assert');

var hostname= 'localhost',
		port= 3000;
		
//var hostname= 'postnumre.oiorest.dk',
//		port= 3000;

function testpostnummer(postnummer) {
	var postnr= postnummer.postnr;
	assert.ok(postnr !== undefined, 'postnr undefined');
	var navn= postnummer.navn;
	assert.ok(navn !== undefined, 'navn undefined');
	var gade= postnummer.gade;
	assert.ok(gade !== undefined, 'gade undefined');
	var firma= postnummer.firma;
	assert.ok(firma !== undefined, 'firma undefined');
	var provins= postnummer.provins;
	assert.ok(provins !== undefined, 'provins undefined');
	var land= postnummer.land;
	assert.ok(land !== undefined, 'land undefined');	
}

function getpostnumre() {
  return function(done){
    http.get({hostname: hostname, port: port, path: '/postnumre'}, function(res){
      var buf = '';
		  assert.equal(res.statusCode,200);
      res.setEncoding('utf8');
      res.on('data', function(chunk){
	 			buf += chunk 
			});
      res.on('end', function(){
				var postnumre= JSON.parse(buf);
				assert.ok(postnumre.length > 1000,'Der er færre postnumre end 1000 som opfylder søgekriteriet');
				for (var i = 0; i<postnumre.length; i++)
					testpostnummer(postnumre[i]);
        done();
      });
    })
  }
}

function getquery(query,antal) {
  return function(done){
    http.get({hostname: hostname, port: port, path: '/postnumre?'+query}, function(res){
      var buf = '';
		  assert.equal(res.statusCode,200);
      res.setEncoding('utf8');
      res.on('data', function(chunk){
	 			buf += chunk 
			});
      res.on('end', function(){
				var postnumre= JSON.parse(buf);
				assert.ok(postnumre.length > antal, 'Der er færre postnumre end '+antal+' som opfylder søgekriteriet');
				for (var i = 0; i<postnumre.length; i++)
					testpostnummer(postnumre[i]);
        done();
      });
    })
  }
}

function get3450() {
  return function(done){
    http.get({hostname: hostname, port: port, path: '/postnumre/3450'}, function(res){
      var buf = '';
		  assert.equal(res.statusCode,200);
      res.setEncoding('utf8');
      res.on('data', function(chunk){
	 			buf += chunk 
			});
      res.on('end', function(){
				var postnumre= JSON.parse(buf);
				assert.ok(postnumre.length === 1);
				testpostnummer(postnumre[0]);
        done();
      });
    })
  }
}

describe('API test', function(){
	it('alle postnumre', getpostnumre());
  it('postnummer 3450', get3450());
  it('fritekstsøgning efter alle', getquery('q=*alle*',20));
  it('søgning efter navne, som starter med p', getquery('navn=p*',5));
});