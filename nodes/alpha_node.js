// Import the Flowchain library
var Flowchain = require('../libs');

// Import Websocket server
var server = Flowchain.WoTServer;

// Utils
var crypto = Flowchain.Crypto;

// Database
var Database = Flowchain.DatabaseAdapter;
var db = new Database('picodb');

function AlphaNode() {
    this.server = server;
    this.chordNode = null;
}

/*
 * req { node, payload, block }
 * res ( save, read, send )
 */
var onmessage = function(req, res) {

}

/*
 * req { node }
 * res { save, read}
 */
var onstart = function(req, res) {
	this.chordNode = req.node;
}

/*
 * req { node, payload, block, tx }
 * res ( save, read, send )
 */
var onquery = function(req, res) {

}

/*
 * req { node, data: packet }
 * res { save, read }
 */
var ondata = function(req, res) {

}




AlphaNode.prototype.start = function() {
	this.server.start({
		onstart: onstart,
		onmessage: onmessage,
		onquery: onquery,
		ondata: ondata
	});
};

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
    module.exports = AlphaNode;

