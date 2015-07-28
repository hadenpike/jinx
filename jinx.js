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
Jinx.addHandler = function(method, path, handler) {
    this.routes[method][path] = handler;
};

/**
    * Serve a static file.
    *
    * @param {String} filename
    * @api public
*/
Jinx.serveStatic = function(res, filename) {
    var fileToServe = path.join(__dirname, filename);
    var stream = fs.createReadStream(fileToServe);
    // Do not pipe the contents until the stream is open
    stream.on('open', function() {
	stream.pipe(res);
    });
    // Handles errors when the stream is created
    stream.on('error', function(err) {
	throw err;
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
	return handler(req, res);
    }
    this.serveStatic(res, pathname);
}

/**
    * Convenience method for adding a get handler.
    *
    * @param {String} path
    * @param {function} handler
    * @api public
*/
Jinx.get = function(path, handler) {
    this.addHandler('get', path, handler);
};

/**
    * Start the server.
    *
    * You can call listen instead of start,
    * if you need to do anything special.
    *
    * @api public
*/
Jinx.start = function() {
    this.listen(9999, function() {
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
    Jinx.get('/', function(req, res) {
	Jinx.serveStatic(res, 'test.html');
    });
    Jinx.start();
}
