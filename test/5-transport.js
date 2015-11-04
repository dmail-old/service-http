import Request from '../../lib/request.js';
import ResponseGenerator from '../../lib/response-generator.js';

var fetch = function(request){
	return ResponseGenerator.create(request);
};

var hostname = '127.0.0.1';
var port = 8000;
var server;
var url = 'http://' + hostname + ':' + port;

export function beforeAll(){
	server = require('http').createServer(function(request, response){
		response.writeHead(200, {'content-type': 'application/javascript'});
		response.end('export default true');
	});

	return new Promise(function(resolve, reject){
		server.listen(port, hostname, function(error){
			if( error ) reject(error);
			else resolve();
		});
	});
}

export function afterAll(){
	return new Promise(function(resolve, reject){
		server.close(function(error){
			if( error ) reject(error);
			else resolve();
		});
	});
}

export function suite(add){
	add("node transportRequest", function(test){
		var request = Request.create({url: url});

		return test.resolveWith(fetch(request).then(function(response){
			return response.text();
		}), 'export default true');
	});
}