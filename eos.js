Eos = require('eosjs') // Eos = require('./src')
var bithumbapi = require('bithumbapi');
var bithumb = new bithumbapi();
 
config = {
httpEndpoint: "http://mainnet.eoscalgary.io"
}
 
eos = Eos(config) // 127.0.0.1:8888

const balance = eos.getCurrencyBalance("gyydoojzgige","gyydoojzgige")
console.log('currency balance', balance);

/*
bithumb.ticker('EOS').then(function(response){
  console.log(response.data)
})
*/

 
// All API methods print help when called with no-arguments.
eos.getBlock()
 
// Next, you're going to need nodeosd running on localhost:8888 (see ./docker)
 
// If a callback is not provided, a Promise is returned
eos.getBlock(1).then(result => {console.log(result)})
 
// Parameters can be sequential or an object
eos.getBlock({block_num_or_id: 1}).then(result => console.log(result))
 
// Callbacks are similar
callback = (err, res) => {err ? console.error(err) : console.log(res)}
eos.getBlock(1, callback)
eos.getBlock({block_num_or_id: 1}, callback)
 
// Provide an empty object or a callback if an API call has no arguments
eos.getInfo({}).then(result => {console.log(result)})

eos.getAccount("gyydoojzgige").then(result => {console.log(result)})


console.log("calling getAcion");
eos.getActions("gyydoojzgige", 1000, 0).then(result => {
 console.log(result)
 console.log(result.actions)
 eos.getBlock(5000, callback);
})
