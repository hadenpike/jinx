/**
    * Module dependencies.
*/
var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    url = require('url');

/**
    * Server routes.
*/
var routes = {
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
function addHandler(method, path, handler) {
    routes[method][path] = handler;
}

/**
    * Serve a static file.
    *
    * @param {String} filename
    * @api public
*/
function serveStatic(res, filename) {
    var fileToServe = path.join(__dirname, filename);
    var stream = fs.createReadStream(fileToServe);
    stream.pipe(res);
}

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
    var handler = routes[method][pathname];
    console.log(method + ' ' + pathname);
    if (typeof(handler) === 'function') {
	handler(req, res);
    }
    else {
	res.writeHead(404, {'content-type': 'text/plain'});
	res.end('404 Not Found');
    }
};

var Jinx = http.createServer(onRequest);

/**
    * Convenience method for adding a get handler.
    *
    * @param {String} path
    * @param {function} handler
    * @api public
*/
Jinx.get = function(path, handler) {
    addHandler('get', path, handler);
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
    * Expose the Jinx variable.
*/
exports = module.exports = Jinx;

/**
    * Run module directly.
    *
    * If this module is run directly,
    * setup and run a basic server.
*/
if (require.main === module) {
    Jinx.get('/', function(req, res) {
	serveStatic(res, 'test.html');
    });
    Jinx.start();
}
