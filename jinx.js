/**
    * Module dependencies.
*/

var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    url = require('url');

/**
    * Expose the Jinx variable.
*/
var Jinx = exports = module.exports = http.createServer(onRequest);

/**
    * The root directory of the server.
*/
Jinx.serverRoot = process.cwd();

/**
    * Server routes.
*/
Jinx.routes = {
    'get': {}
};

/**
    * Add a handler to the routing table.
    *
    * @param {String} method
    * @param {String} path
    * @param {function} handler
    * @api private
*/
Jinx.addRoute = function(method, path, handler) {
    this.routes[method][path] = handler;
};

/**
    * Serve a static file.
    *
    * @param {String} filename
    * @api public
*/
Jinx.serveStatic = function(req, res, filename) {
    var fileToServe = path.join(this.serverRoot, filename);
    var stream = fs.createReadStream(fileToServe);
    // Do not pipe the contents until the stream is open
    stream.on('open', function() {
	stream.pipe(res);
    });
    // Handles errors when the stream is created
    stream.on('error', function(err) {
	Jinx.emit('error', req, res, err);
    });
};

/**
    * Route request to handler
    *
    * @param {request} req
    * @param {response} res
    * @api private
*/
function onRequest(req, res) {
    var method = req.method.toLowerCase();
    var pathname = url.parse(req.url).pathname;
    var handler = this.routes[method][pathname];
    console.log(method + ' ' + pathname);
    if (typeof(handler) === 'function') {
	try {
	    return handler(req, res);
	}
	catch(err) {
	    this.emit('error', req, res, err);
	}
    }
    this.serveStatic(req, res, pathname);
}

Jinx.on('error',  function(req, res, err) {
    res.writeHead(404, {'content-type': 'text/plain'});
    res.end('404 Not Found');
});

/**
    * Convenience method for adding a get handler.
    *
    * @param {String} path
    * @param {function} handler
    * @api public
*/
Jinx.get = function(path, handler) {
    this.addRoute('get', path, handler);
};

/**
    * Default handler for the / route.
*/
Jinx.get('/', function(req, res) {
    fs.readdir(Jinx.serverRoot, function(err, files) {
	if (!files) {
	    err = new Error("No files in directory");
	}
	if (err) {
	    return this.emit('error', req, res, err);
	}
	var fileRegexp = /index.x*html*/;
	for (var i = 0; i < files.length; ++ i) {
	    if (files[i].match(fileRegexp)) {
		return Jinx.serveStatic(req, res, files[i]);
	    }
	}
    });
});

/**
    * Start the server.
    *
    * You can call listen instead of start,
    * if you need to do anything special.
    *
    * @api public
*/
Jinx.start = function(port) {
    port = port || 9999;
    this.listen(port, function() {
	console.log('Server started!');
    });
};

/**
    * Run module directly.
    *
    * If this module is run directly,
    * setup and run a basic server.
*/
if (require.main === module) {
    Jinx.start();
}
