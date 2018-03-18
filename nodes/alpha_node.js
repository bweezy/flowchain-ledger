var fs = require('fs');

// Import the Flowchain library
var Flowchain = require('../libs');

// Import Websocket server
var server = Flowchain.WoTServer;

// Utils
var crypto = Flowchain.Crypto;

// Database
var Database = Flowchain.DatabaseAdapter;
var db = new Database('nedb');

var g_tx = null;

function AlphaNode() {
	this.server = server;
    var prime_length = 60;
    this.dh = crypto.createDiffieHellman(prime_length);
    this.dh.generateKeys('hex')

    this.privateKey = fs.readFileSync('alpha_private.txt', 'utf8');
    this.alphaPublicKey = fs.readFileSync('alpha_public.txt', 'utf8');
  
	this.properties = {"name":"node", "permissions":"temp", "public_key": this.dh.getPublicKey('hex')}

	this.transactions = []
}

/*
 * req { tlNode, node, payload, block }
 * res ( save, read, send )
 */
var onmessage = function(req, res) {
	var payload = req.payload;
	var block = req.block;
	var node = req.node;
	var tlNode = req.tlNode;

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

			console.log('received join key from alpha');

			this.transactions.push(hash)
			console.log(this.transactions)
			//validate signature
			const verify = crypto.createVerify('SHA256');
			verify.update(info.key)


			if(verify.verify(tlNode.alphaPublicKey, info.signature, 'hex')){
				
				console.log('verified');

				//Need to change this to use block
				var hash = crypto.createHmac('sha256', info.name)
                        .update( info.key )
                        .digest('hex');

                db.get(hash, function (err, value){
                	
                	if(value.length === 0){
		                db.put(hash, {'name': info.name, permissions: info.permissions, 'key': info.key }, function(err) {
		                	
		                	if(err) throw err;
		                	console.log('placed data');

		                	res.save(info)
		                });
		            }else{
		            	console.log('value already exists');
		            }

                });




			}else{
				console.log('verify failed');
			}


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
	return true;

}

/*
 * req { tlNode, node, data }
 * res { save, read }
 */
var ondata = function(req, res) {

	//console.log(req.data);

	var tlNode = req.tlNode;
	var data = req.data;
    var put = res.save;
   	if(typeof data.message === 'undefined' && typeof data.type === 'undefined')
   	{	
   		console.log('received data: ', data);
    	data.type = 'data';
   	}

   	// This block goes in alpha node only
   	if(data.type === 'join key')
   	{
   		var sign = crypto.createSign('SHA256');
    	sign.update(data.key);
    	data.signature = sign.sign(tlNode.privateKey, 'hex');
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
	}, this);
}; 

AlphaNode.prototype.clearTransactions = function() {
	this.transactions = [];
}

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
    module.exports = AlphaNode;

