import Rest from '../node_modules/@dmail/rest/index.js';

import httpService from '../index.js';

var rest = Rest.create();

rest.use(httpService);

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
		return test.resolveWith(rest.fetch(url).then(function(response){
			return response.text();
		}), 'export default true');
	});
}