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

    var prime_length = 60;
    this.dh = crypto.createDiffieHellman(prime_length);
    this.dh.generateKeys('hex')

	console.log("Public Key : " ,this.dh.getPublicKey('hex'));
	console.log("Private Key : " ,this.dh.getPrivateKey('hex'));
	this.properties = {"name":"node", "permissions":"none", "public_key": this.dh.getPublicKey('hex')}
}

/*
 * req { node, payload, block }
 * res ( save, read, send )
 */
var onmessage = function(req, res) {
	var payload = req.payload;
	var block = req.block;
	var node = req.node;

	var data = JSON.parse(payload.data);
	var message = data.message;
	var from = data.from;
	var info = message.data;

	if(typeof info.type !== 'undefined')
	{
		if(info.type === 'query')
		{
			console.log('received query');

			



		}else if(info.type === 'data'){

			console.log('received data');

			var key = message.id;
			var tx = message.data;

			if(!block) return;

		    var hash = crypto.createHmac('sha256', block.hash)
		                .update( key )
		                .digest('hex');


			var asset = {
				key: key
			};

			res.send(asset);

			console.log('placing data ');

			db.put(hash, tx, function(err){
				if (err)
						return console.log('Database put error = ', err);
			});
		}
	}




		
}

/*
 * req { node }
 * res { save, read}
 */
var onstart = function(req, res) {

}

/*
 * req { node, payload, block, tx }
 * res ( save, read, send )
 */
var onquery = function(req, res) {

}

/*
 * req { node, data }
 * res { save, read }
 */
var ondata = function(req, res) {

	var data = req.data;
    var put = res.save;
   	if(typeof data.message === 'undefined' && typeof data.type === 'undefined')
    	data.type = 'data';
    put(data);

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

