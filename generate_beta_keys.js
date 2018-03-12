var keypair = require('keypair');
var fs = require('fs');

var pair = keypair();


fs.writeFile('beta_public.txt', pair.public, function(err) {
	if(err) throw err;
});

fs.writeFile('beta_private.txt', pair.private, function(err) {
	if(err) throw err;
});