// Import the Flowchain library
var Flowchain = require('../libs');

// Import Websocket server
var server = Flowchain.WoTServer;

// Utils
var crypto = Flowchain.Crypto;

// Database
var Database = Flowchain.DatabaseAdapter;
var db = new Database('picodb');

var g_tx = null;

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
			res.read(g_tx)

		}else if(info.type === 'data'){

			console.log('received data');

			var key = message.id;
			var tx = message.data;

			if(!block) return;

		    var hash = crypto.createHmac('sha256', block.hash)
		                .update( key )
		                .digest('hex');


			var asset = {
				type: 'key',
				key: key
			};

			res.save(asset);

			console.log('placing data ');

			db.put(hash, tx, function(err){
				if (err)
						return console.log('Database put error = ', err);
			});
		}else if(info.type === 'join key'){

			console.log('received join request');


			//validate signature

			//if valid
				//place in db
				//send to successor
			//else
				//nothing?


		}else if(info.type === 'key'){
			console.log('received key');
			g_tx = key;
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
 *
 *
 */
var onjoin = function(req, res) {

}

/*
 * req { node, data }
 * res { save, read }
 */
var ondata = function(req, res) {

	//console.log(req.data);

	var data = req.data;
    var put = res.save;
   	if(typeof data.message === 'undefined' && typeof data.type === 'undefined')
   	{	
   		console.log('received data: ', data);
    	data.type = 'data';
   	}
    put(data);

}




AlphaNode.prototype.start = function() {
	this.server.start({
		onstart: onstart,
		onmessage: onmessage,
		onquery: onquery,
		ondata: ondata,
		onjoin: onjoin
	});
};

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
    module.exports = AlphaNode;

