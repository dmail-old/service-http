import rest from '../node_modules/@dmail/rest/index.js';

// no specific headers to set, browser will auto set content-length, user-agent and some others

function transport(request){
	var xhr = new XMLHttpRequest();

	var promise = (request.body ? request.text() : Promise.resolve()).then(function(text){
		return new Promise(function(resolve, reject){
			xhr.onerror = function(e){
				reject(e);
			};

			var responseBody = rest.createBody(), offset = 0;
			xhr.onreadystatechange = function(){
				if( xhr.readyState === 2 ){
					resolve({
						status: xhr.status,
						headers: xhr.getAllResponseHeaders(),
						body: responseBody
					});
				}
				else if( xhr.readyState === 3 ){
					var data = xhr.responseText;

					if( offset ) data = data.slice(offset);
					offset+= data.length;

					responseBody.write(data);
				}
				else if( xhr.readyState === 4 ){
					responseBody.close();
				}
			};

			var url = String(request.url);
			// avoid browser cache by adding a param
			if( request.cacheMode === 'no-cache' || request.cacheMode === 'no-store' ){
				var searchParams = new global.URLSearchParams(url.search);
				searchParams.set('r', String(Math.random() + 1).slice(2));

				url =  new URL(url); // don't modify the request url, create a new one
				url.search = searchParams.toString();
			}

			xhr.open(request.method, url);

			request.headers.forEach(function(headerName, headerValue){
				xhr.setRequestHeader(headerName, headerValue);
			});

			xhr.send(request.body ? text : null);
		});
	});

	promise.abort = function(){
		xhr.abort();
		xhr.onreadystatechange = null;
		xhr.onerror = null;
	};

	return promise;
}

export default transport;