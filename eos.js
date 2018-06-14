Eos = require('eosjs') // Eos = require('./src')

var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

 
config = {
httpEndpoint: "http://mainnet.eoscalgary.io"
}
 
eos = Eos(config) // 127.0.0.1:8888

//getting starting block id
var idx = 0;
eos.getInfo({}).then(result => {
 console.log(result);
 startIndex = result.last_irreversible_block_num;
 idx = startIndex;
});
 

 
function saveBlockInfo(){
 eos.getBlock(idx).then(result => {
  //console.log(result.transactions[0].trx.transaction.actions[0]);
  //save data to Mongo DB with block number
  MongoClient.connect(url, function(err, db) {
   if (err) throw err;
   var dbo = db.db("heroku_9cf4z9w3");
   var myobj = { bno : idx, info : result.transactions[0].trx.transaction.actions[0] }
   dbo.collection("eosblockinfo").insertOne(myobj, function(err, res) {
        if (err) throw err;
          console.log("1 document inserted");
              db.close();
    }); //end of insert one
   }); //end of connect
   idx++;
  }); // end of getblock
} //end of function
                        


setInterval(saveBlockInfo, 5000);




return;

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
