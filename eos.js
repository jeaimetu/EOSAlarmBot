const Eos = require('eosjs') // Eos = require('./src')
const blockParse = require('./blockParse');

const botClient = require('./bot.js');
const url = process.env.MONGODB_URI;

const chainLogging = false;

// EOS
eosConfig = {
 httpEndpoint: "https://mainnet.eoscalgary.io"
}
eos = Eos(eosConfig) // 127.0.0.1:8888

// Getting starting block id
//var idx = 0;
var previousReadBlock = -1;

//set initial block
function getLatestBlock(){
 eos.getInfo({}).then(result => {
  startIndex = result.head_block_num;

  if(chainLogging == true)
   console.log("getinfo block", previousReadBlock);
  if(previousReadBlock <  startIndex){
   //idx = startIndex;
   //read block
   if(chainLogging == true)
    console.log("callong saveBlockInfo for block number");
   saveBlockInfo(startIndex);
  }else{
   setTimeout(getLatestBlock, 50);
   if(chainLogging == true)
    console.log("Do nothing", "previousReadBlock", "startIndex", "idx",previousReadBlock,startIndex) ;//do nothing
  }
 });
}

function formatData(data, type){
  if(type == "transfer"){
   msg = "송금 이벤트";
   msg += "\n";
   msg += "받는계정 : " + data.to;
   msg += "\n";
   msg += "보낸계정 : " + data.from;
   msg += "\n";
   msg += "송금 수량 : " + data.quantity;
   msg += "\n";
   msg += "메모 : " + data.memo
  }else if(type == "newaccount"){
   msg = "신규 계정 생성 이벤트";
   msg += "\n";
   msg += "생성한 계정 : " + data.name;
  }else if(type == "voteproducer"){
   msg = "투표 이벤트";
   msg += "\n";
   msg += "투표한 곳"
   msg += "\n";
   for(i = 0;i < data.producers.length;i++){
    msg += data.producers[i] + ", ";
   }
  }else if(type == "undelegatebw"){
   msg = "EOS 언스테이크 이벤트";
   msg += "\n";
   msg += "네트웍에서 언스테이크 : " + data.unstake_net_quantity
   msg += "\n";
   msg += "CPU에서 언스테이크 : " + data.unstake_cpu_quantity
   
  }else if(type == "delegatebw"){
   msg = "EOS 스테이킹 이벤트";
   msg += "\n";
   msg += "네트웍에 스테이크 : " + data.stake_net_quantity
   msg += "\n";
   msg += "CPU에 스테이크 : " + data.stake_cpu_quantity
  }else if(type == "ddos"){
   msg = "DDOS 이벤트";
   msg += "\n";
   msg += "Memo : " + data.memo
  }else if(type == "issue"){
   msg = "이슈 이벤트";
   msg += "\n";
   msg += "수량 :" + data.quantity;
   msg += "메모 : " + data.memo
  }else if(type == "bidname"){
   msg = "계정 경매 이벤트";
   msg += "\n";
   msg += "계정 : " + data.newname   
   msg += "\n";
   msg += "경매 계정 : " + data.bid
  }else if(type == "awakepet"){
   msg = "펫을 깨웠습니다.";
  }else if(type == "createpet"){
   msg = "펫을 만들었습니다. ";
   msg += data.pet_name;   
  }else if(type == "refund"){
   msg = "리펀드 이벤트";
  }else if(type == "updateauth"){
   msg = "당신의 계정 권한이 변경되었습니다.";
   msg += "\n";
   msg += "공개 키 " + data.auth.keys[0].key;
  }else if(type == "sellram"){
   msg = "램을 팔았습니다.";
   msg += "\n";
   msg += "판매 양 " + data.bytes;
  }else if(type == "buyram"){
   msg = "램을 샀습니다.";
   msg += "\n";
   msg += "구매 량 " + data.quant + " 램 소유자 " + data.receiver;
  }else{
   //console.log("need to be implemented");
   msg = "이 이벤트는 곧 지원 에정입니다.)";
   msg += type;
   msg += "\n";
   msg += data;
  }
 
 return msg;
 
}

function saveData(block, account, data, type){
  var fData = formatData(data, type);
  botClient.sendAlarm(account, fData);
 /* Temporary disable saving data to MongoDB due to the size limit
  MongoClient.connect(url, function(err, db) {
   var dbo = db.db("heroku_9472rtd6");
   var fData = formatData(data, type);
   botClient.sendAlarm(account, fData);
   var myobj = { block : block, account : account, data : fData, report : false };
   dbo.collection("alarm").insertOne(myobj, function(err, res){
    if (err) throw err;
    //console.log("1 document inserted");
    db.close();   
   });
  }); 
  */
}
 
function checkAccount(result){
   //idx++;
 if(result.transactions.length == 0){
  return;
 }else{
  for(i = 0;i<result.transactions.length;i++){
  //check transaction type
  var trx = result.transactions[i].trx.transaction;
  if(trx == undefined)
   continue;
   for(j=0;j<trx.actions.length;j++){
    if(trx.actions[j] ==  undefined)
     continue;
    
  var type = trx.actions[j].name;
  var data = trx.actions[j].data;
    var accountTo = null;
  
  var account = null;
  if(type == "transfer"){
   account = data.from;
   accountTo = data.to;
  }else if(type == "newaccount"){
   account = data.creator;
  }else if(type == "issue"){
   account = data.to;
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
  }else if(type == "buyram"){
   account = data.payer;
  }else if(type == "sellram"){
   account = data.account;
  }else if(type == "updateauth"){
   account = data.account;
  }else{
   account = trx.actions[j].account //always exist
   //setting accountto from data with testing.
   accountTo = blockParse.getAccountInfo (data);
   //console.log("need to be implemented", type);
  }
  
  //save data to proper account or new table?
  if(account != null){
   //save data to database and sending notification message to telegram client
   saveData(result.block_num, account, data, type);
  }
  if(accountTo != null){
   saveData(result.block_num, accountTo, data, type);
  }
   }//end of for, actions
 }//end of for of transaction
 }//end of else
 
}


 
function saveBlockInfo(idx){
 //console.log("saveBlockInfo for ",idx);
 eos.getBlock(idx).then(result => {
  retryCount = 0;
  if(chainLogging == true)
   console.log("read block suceess for block number", idx);
  checkAccount(result);
  //saving the latest success block number.
  previousReadBlock = idx;
  idx++;
  setTimeout(getLatestBlock, 50);
  })
 .catch((err) => {

  if(chainLogging == true)
   console.log("getblockfailed");

  console.log(err);
  setTimeout(getLatestBlock, 50);
 }); // end of getblock
} //end of function
                        
 setTimeout(getLatestBlock, 50);
