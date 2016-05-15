import http from '@node/http';
import https from '@node/https';

import rest from '../node_modules/@dmail/rest/index.js';

var defaultHeaders = {
    'user-agent': 'node',
    origin: process.cwd()
};

function transport(request) {
    var httpRequest;
    var aborted = false;

    var promise = new Promise(function(resolve, reject) {
        var uri;
        var isHttps;
        var headers;
        var options;

        uri = request.uri;
        isHttps = uri.protocol === 'https:';
        headers = request.headers.toJSON();

        for (var key in defaultHeaders) {
            if ((key in headers) === false) {
                headers[key] = defaultHeaders[key];
            }
        }

        options = {
            method: request.method,
            host: uri.hostname,
            port: uri.port || (isHttps ? 443 : 80),
            path: uri.pathname + uri.search,
            headers: headers
        };

        console.log(request.method, request.uri.href, request.headers.toString());

        httpRequest = (isHttps ? https : http).request(options);

        httpRequest.on('response', function(incomingMessage) {
            resolve({
                status: incomingMessage.statusCode,
                headers: incomingMessage.headers,
                body: rest.createBody(incomingMessage)
            });
        });

        httpRequest.on('abort', function() {
            promise.onabort();
        });

        function handleError(e) {
            if (e && e.code === 'ECONNRESET') {
                console.log('aborted request');
                if (aborted) {
                    return e;
                }
                promise.abort();
            } else {
                console.log('error', e);
                reject(e);
            }
        }

        if (request.body) {
            request.body.pipeTo(httpRequest).then(
                function() {
                    httpRequest.end();
                },
                handleError
            );
        } else {
            httpRequest.on('error', handleError);
            httpRequest.end();
        }
    });

    promise.httpRequest = httpRequest;

    promise.onabort = function() {
        aborted = true;
    };

    promise.abort = function() {
        aborted = true;
        if (httpRequest) {
            httpRequest.abort();
            httpRequest.removeAllListeners('response');
        }
    };

    return promise;
}

export default transport;
