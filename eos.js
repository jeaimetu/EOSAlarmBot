Eos = require('eosjs') // Eos = require('./src')

var mongo = require('mongodb');

var botClient = require('./bot.js');


var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

 
eosConfig = {
httpEndpoint: "http://mainnet.eoscalgary.io"
}
 
eos = Eos(eosConfig) // 127.0.0.1:8888

//getting starting block id
idx = 0;

var previousReadBlock = -1;


//set initial block
function getLatestBlock(){
 
 eos.getInfo({}).then(result => {
  //console.log(result);
  startIndex = result.head_block_num;
  if(previousReadBlock < startIndex){
   idx = startIndex;
   //read block
   saveBlockInfo();
  }else{
   ;//do nothing
  }
 });
 
}

function formatData(data, type){
  if(type == "transfer"){
   msg = "송금 이벤트 발생";
   msg += "\n";
   msg += "받는 계정 : " + data.to;
   msg += "\n";
   msg += "송금 수량 : " + data.quantity;
   msg += "\n";
   msg += "송금 메모 : " + data.memo
  }else if(type == "newaccount"){
   msg = "신규 계정 생성 이벤트 발생";
   msg += "\n";
   msg += "생성한 계정 : " + data.name;
  }else if(type == "voteproducer"){
   msg = "투표 이벤트 발생";
   msg += "\n";
   msg += "투표한 곳"
   msg += "\n";
   for(i = 0;i < data.producers.length;i++){
    msg += data.producers[i] + ", ";
   }
  }else if(type == "undelegatebw"){
   msg = "EOS 점유 해제 이벤트 발생";
   msg += "\n";
   msg += "점유해제한 네트워크 : " + data.unstake_net_quantity
   msg += "\n";
   msg += "점유해제한 CPU : " + data.unstake_cpu_quantity
   
  }else if(type == "delegatebw"){
   msg = "EOS 점유 이벤트 발생";
   msg += "\n";
   msg += "점유한 네트워크 : " + data.stake_net_quantity
   msg += "\n";
   msg += "점유한 CPU : " + data.stake_cpu_quantity
  }else if(type == "ddos"){
   msg = "DDOS 이벤트 발생";
   msg += "\n";
   msg += "메모 : " + data.memo
  }else if(type == "bidname"){
   msg = "이름 경매 이벤트 발생";
   msg += "\n";
   msg += "이름 : " + data.newname   
   msg += "\n";
   msg += "입찰금액 : " + data.bid
  }else if(type == "awakepet"){
   msg = "펫을 깨우셨습니다.";
  }else if(type == "createpet"){
   msg = data.pet_name;
   msg += "펫을 만드셨습니다.";
  }else if(type == "feedpet"){
   msg = "펫에게 먹이를 주셨습니다.";
  }else if(type == "refund"){
   msg = "Refund 이벤트 발생";
  }else if(type == "updateauth"){
   msg = "권한정보 갱신 이벤트 발생";
   msg += "\n";
   msg += "공개 키 " + data.auth.keys[0].key;
  }else{
   console.log("need to be implemented");
   msg = "곧 지원 예정입니다.(현재 미지원 이벤트)";
   msg += type;
   msg += "\n";
   msg += data;
  }
 
 return msg;
 
}

function saveData(block, account, data, type){
  MongoClient.connect(url, function(err, db) {
   var dbo = db.db("heroku_dtfpf2m1");
   var fData = formatData(data, type);
   botClient.sendAlarm(account, fData);
   var myobj = { block : block, account : account, data : fData, report : false };
   dbo.collection("alarm").insertOne(myobj, function(err, res){
    if (err) throw err;
    //console.log("1 document inserted");
    db.close();   
   });
  }); 
}
 
function checkAccount(result){
   //idx++;
 if(result.transactions.length == 0){
  return;
 }else{
  for(i = 0;i<result.transactions.length;i++)
  //check transaction type
  var trx = result.transactions[i].trx.transaction;
  if(trx == undefined)
   return;
  var type = trx.actions[i].name;
  var data = trx.actions[i].data;
  var account = null;
  if(type == "transfer"){
   account = data.from;
  }else if(type == "newaccount"){
   account = data.creator;
  }else if(type == "voteproducer"){
   account = data.voter;  
  }else if(type == "undelegatebw"){
   account = data.from;
  }else if(type == "delegatebw"){
   account = data.from;
  }else if(type == "ddos"){
   account = trx.actions[0].account;
  }else if(type == "bidname"){
   account = data.bidder;
  }else if(type == "awakepet"){
   account = trx.actions[0].authorization[0].actor;
  }else if(type == "feedpet"){
   account = trx.actions[0].authorization[0].actor;
  }else if(type == "createpet"){
   account = trx.actions[0].authorization[0].actor;
  }else if(type == "refund"){
   account = data.owner;
  }else if(type == "updateauth"){
   account = data.xxxxxxoooooo;
  }else{
   account = "unknown";
   console.log("need to be implemented", type);
  }
  
  //save data to proper account or new table?
  if(account != null){
   //save data to database
   saveData(result.block_num, account, data, type);
  }
 }//end of for
 }//end of else
 
}

 
function saveBlockInfo(){
 //console.log("saveBlockInfo for ",idx);
 eos.getBlock(idx).then(result => {
  //console.log(result);
  //console.log(result.transactions[0].trx.transaction.actions[0]);
  //save data to Mongo DB with block number
  console.log("read Block info ", idx);
  checkAccount(result);
  previousReadBlock = idx;

  /* save raw data
  MongoClient.connect(url, function(err, db) {
   
   if (err){
    console.log(err);
    throw err;
   }
   var dbo = db.db("heroku_dtfpf2m1");
   //var myobj = { bno : idx, info : result.transactions[0].trx.transaction.actions[0] }
   var myobj = { bno : idx, info : result }
   
   dbo.collection("eosblockinfo").insertOne(myobj, function(err, res) {
        if (err) throw err;
          //console.log("1 document inserted");
       idx++;
              db.close();
    }); //end of insert one
   }); //end of connect
  */
  })
 .catch((err) => {
  idx++;
  console.log(err);
 }); // end of getblock

} //end of function
                        
 setInterval(getLatestBlock, 100);


