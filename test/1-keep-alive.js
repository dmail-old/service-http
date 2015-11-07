import Rest from '../node_modules/@dmail/rest/index.js';
import Server from '../node_modules/@dmail/server-node/index.js';

import httpService from '../index.js';

var url = 'http://127.0.0.1:8000';
var firstChunk = new Buffer('foo');
var secondChunk = new Buffer('bar');
var server = Server.create(function(request, response){
	response.writeHead(200, {'content-type': 'text/plain'});
	response.write(firstChunk);
	response.write(secondChunk);
});

export function beforeAll(){
	return server.open(url);
}

export function afterAll(){
	return server.close();
}

export function suite(add){
	
	add("keep server side opened", function(test){
		var rest = Rest.create();

		rest.use(httpService);

		return rest.fetch(url).then(function(response){
			var writableInterface = {
				write: test.spy()
			};

			response.body.pipeTo(writableInterface);

			return Promise.all([
				test.calledWith(writableInterface.write.firstCall, firstChunk),
				test.calledWith(writableInterface.write.secondCall, secondChunk)
			]);
		});
	});

}