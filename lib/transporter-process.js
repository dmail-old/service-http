import http from 'node/http';
import https from 'node/https';

import rest from '../node_modules/@dmail/rest/index.js';

var defaultHeaders = {
	'user-agent': 'node',
	'origin': process.cwd()
};

function transport(request){
	var httpRequest;
	var aborted = false;

	var promise = new Promise(function(resolve, reject){
		var url, isHttps, headers, options;

		url = request.url;
		isHttps = url.protocol === 'https:';
		headers = request.headers.toJSON();

		for(var key in defaultHeaders){
			if( false === key in headers ){
				headers[key] = defaultHeaders[key];
			}
		}

		options = {
			method: request.method,
			host: url.hostname,
			port: url.port || (isHttps ? 443 : 80),
			path: url.pathname + url.search,
			headers: headers
		};

		httpRequest = (isHttps ? https : http).request(options);

		httpRequest.on('response', function(incomingMessage){
			resolve({
				status: incomingMessage.statusCode,
				headers: incomingMessage.headers,
				body: rest.createBody(incomingMessage)
			});
		});

		httpRequest.on('abort', function(){
			promise.onabort();
		});

		function handleError(e){
			if( e && e.code === 'ECONNRESET' ){
				if( aborted ) return e;
				promise.abort();
			}
			else{
				console.log('error', e);
				reject(e);
			}
		}

		if( request.body ){
			request.body.pipeTo(httpRequest).then(
				function(){
					httpRequest.end();
				},
				handleError
			);
		}
		else{
			httpRequest.on('error', handleError);
			httpRequest.end();
		}
	});

	promise.httpRequest = httpRequest;

	promise.onabort = function(){
		aborted = true;
	};

	promise.abort = function(){
		aborted = true;
		if( httpRequest ){
			httpRequest.abort();
			httpRequest.removeAllListeners('response');
		}
	};

	return promise;
}

export default transport;