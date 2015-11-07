import transport from './lib/transporter-#{platform-type}.js';
import rest from './node_modules/@dmail/rest/index.js';

var HttpService = rest.createService({
	name: 'http',

	requestHandler(request){
		if( request.url.protocol === 'http:' || request.url.protocol === 'https:' ){
			var promise = transport(request);

			// how to abort response generation ? 
			promise.onabort = function(){

			};

			return promise;
		}		
	}
});

export default HttpService;