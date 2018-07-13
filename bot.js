const Telegraf = require('telegraf');   // Module to use Telegraf API.
const config = require('./config'); // Configuration file that holds telegraf_token API key.
const session = require('telegraf/session')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Composer = require('telegraf/composer')
const WizardScene = require('telegraf/scenes/wizard')
const Stage = require('telegraf/stage')
const tl = require('common-tags')
const partner = require('./partner.js');

// Mongo
let mongo = require('mongodb');
let MongoClient = require('mongodb').MongoClient;
let url = process.env.MONGODB_URI;

// EOS
Eos = require('eosjs')
eosconfig = {
 httpEndpoint: "https://mainnet.eoscalgary.io"
}
eos = Eos(eosconfig)

// Menu
const keyboard = Markup.inlineKeyboard([
 [ Markup.callbackButton('😎 EOS 계정 추가', 'id'),
   Markup.callbackButton('💰 EOS 잔고', 'balance') ],
 [ Markup.callbackButton('📈 EOS 거래소 시세', 'price'),
   Markup.callbackButton('🔮 토큰 잔고','token'),
   Markup.callbackButton('💾 램 시세','ram'),
   Markup.callbackButton('🔧 설정', 'setting') ]
])

// Reset
function reset(ctx){
 ctx.session.id = 'nil';
 ctx.session.transaction = 'nil';
}

// Initialization Message
function makeMessage(ctx){
  return `${ctx.session.id != 'nil' 
               ? '현재 계정: ' + ctx.session.id 
               : 'EOS계정을 추가해 주세요.'}

<b>eoscafeblock</b>, eosyskoreabp, <b>eosnodeonebp</b>, and acroeos12345 에 투표해 주세요.
© EOS Cafe Korea`
}

// Get token balance
async function getAddBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "eosadddddddd",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});
 if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getDacBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "eosdactokens",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getTokenBalanceEach(account, tokenCode){
 let bal = await eos.getTableRows({json : true,
                      code : tokenCode,
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getCetBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "eosiochaince",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}

async function getCetosBalance(account){
 let bal = await eos.getTableRows({json : true,
                      code : "gyztomjugage",
                 scope: account,
                 table: "accounts",
                 }).catch((err) => {
  return null});;
  if(bal.rows.length != 0)
 return bal.rows[0].balance;
 else
  return null;
}


async function getTokenBalance(account, cb){
 let [addBalance, dacBalance, cetosBalance,cetBalance, ednaBalance, horusBalance,eoxBalance, evrBalance, esbBalance, atdBalance,
      octBalance, iqBalance, pglBalance, poorBalance] = 
     await Promise.all([getAddBalance(account), 
                        getDacBalance(account), 
                        getCetosBalance(account),
                        getCetBalance(account),
                        getTokenBalanceEach(account, "ednazztokens"),
                        getTokenBalanceEach(account, "horustokenio"),            
                        getTokenBalanceEach(account, "eoxeoxeoxeox"),
                        getTokenBalanceEach(account, "eosvrtokenss"),
                        getTokenBalanceEach(account, "esbcointoken"),
                        getTokenBalanceEach(account, "eosatidiumio"),
                        getTokenBalanceEach(account, "octtothemoon"),
                        getTokenBalanceEach(account, "everipediaiq"),
                        getTokenBalanceEach(account, "prospectorsg"),
                        getTokenBalanceEach(account, "poormantoken")
                       ]);
console.log(addBalance, dacBalance, cetosBalance);
 msg = "현재 계정 : " + account;
 msg += "\n";
 msg += "<b>Token Balance</b>"; 
 msg += "\n";
 
 
   if(iqBalance != null){
  t = iqBalance.split(" ");
  msg += t[1] + " : " + t[0];}
 else
  msg += "IQ : 0";
 msg += "\n";
 
 if(addBalance != null){
  t = addBalance.split(" ");
 msg += t[1] + " : " + t[0];}
 else
  msg += "ADD : 0";
 msg += "\n";
 
   if(atdBalance != null){
    t = atdBalance.split(" ");
   msg += t[1] + " : " + t[0];}
 else
  msg += "ATD : 0";
   msg += "\n"; 
 
  if(cetBalance != null){
    t = cetBalance.split(" ");
   msg += t[1] + " : " + t[0];}
  else
   msg += "CET : 0";
   msg += "\n"; 
 

 
if(eoxBalance != null){
  t = eoxBalance.split(" ");
  msg += t[1] + " : " + t[0];}
 else
  msg += "EOX : 0";
 msg += "\n";
 
 if(evrBalance != null){
  t = evrBalance.split(" ");
  msg += t[1] + " : " + t[0];}
 else
  msg += "EVR : 0";
 msg += "\n";
 
 if(esbBalance != null){
  t = esbBalance.split(" ");
  msg += t[1] + " : " + t[0];}
 else
  msg += "ESB : 0";
 msg += "\n";
 



 
   if(octBalance != null){
  t = octBalanceOCT.split(" ");
  msg += t[1] + " : " + t[0];}
 else
  msg += "OCT : 0";
 msg += "\n";
 
   if(pglBalance != null){
  t = pglBalance.split(" ");
  msg += t[1] + " : " + t[0];}
 else
  msg += "PGL : 0";
 msg += "\n";
 
 
 
   if(ednaBalance != null){
   t = ednaBalance.split(" ");
 msg += t[1] + " : " + t[0];}
 else
  msg += "EDNA : 0";
 msg += "\n";
 
    if(poorBalance != null){
   t = poorBalance.split(" ");
 msg += t[1] + " : " + t[0];}
 else
  msg += "POOR : 0";
 msg += "\n";
 
 if(cetosBalance != null){
    t = cetosBalance.split(" ");
 msg += t[1] + " : " + t[0];}
else
  msg += "CETOS : 0"; 
    msg += "\n";
 
   if(horusBalance != null){
    t = horusBalance.split(" ");
    msg += t[1] + " : " + t[0];}
   else
    msg += "HORUS : 0";
   msg += "\n";
 


 
 if(dacBalance != null){
    t = dacBalance.split(" ");
 msg += t[1] + " : " + t[0];}
else
  msg += "EOSDAC : 0";


 cb(msg);
}
//Get token balance

function loadData(ctx, cb){
 MongoClient.connect(url, function(err, db) {
 var dbo = db.db("heroku_dtfpf2m1");
 var findquery = {chatid : ctx.chat.id, primary : true};
 dbo.collection("customers").findOne(findquery, function(err, result){
  if(result == null){
   //if result is null, then return -1
   var findqueryInTheLoop = {chatid : ctx.chat.id};
   dbo.collection("customers").findOne(findqueryInTheLoop, function(err, result){
    if(result == null){
   var msg = "설정 메뉴에서 주계정을 설정해 주세요.";
   ctx.telegram.sendMessage(ctx.from.id, msg)
   cb(-1);
    }else{
     cb(result.eosid);    
    }
    db.close();
   });
   
  }else{
   cb(result.eosid);
  }
  db.close();
 });
 });
}

function getRamPrice(ctx){
eos.getTableRows({json : true,
                 code : "eosio",
                 scope: "eosio",
                 table: "rammarket",
                 limit: 10}).then(res => {
 msg = "RAM Price : ";
 var a1 = res.rows[0].quote.balance.split(" ");
 var a2 = res.rows[0].base.balance.split(" ");
 var a3 = (parseFloat(a1[0]) / parseFloat(a2[0])) * 1024;
 msg += a3.toFixed(4);
 msg += " EOS per KiB";

 //console.log(res);
 //console.log(res.rows[0].base);
 //console.log(res.rows[0].quote);
 


 ctx.telegram.sendMessage(ctx.from.id, msg).then(payload => {
  msg = makeMessage(ctx);
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard));
 });
});
}

function saveData(ctx){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("heroku_dtfpf2m1");
 
   var findquery = {chatid : ctx.chat.id, eosid : ctx.session.id, primary : true};
   dbo.collection("customers").findOne(findquery, function(err, result){
    if(result == null){
     //insert
        var myobj = { chatid : ctx.chat.id, eosid : ctx.session.id, primary : true }
     dbo.collection("customers").insertOne(myobj, function(err, res) {
        if (err) throw err;
          console.log("1 document inserted");
              db.close();
        });
    }/*else{
     //update
     var newobj = {$set : {chatid : ctx.chat.id, eosid : ctx.session.id }};        
     dbo.collection("customers").updateOne(findquery, newobj, function(err, res) {
        if (err) throw err;
          console.log("1 document updated");
          db.close();
        });
    } //end else*/
   }); //end pf findquery
  }); //end MongoClient
}

function setPrimary(ctx, account){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("heroku_dtfpf2m1");
 //, eosid : ctx.session.id, primary : true};
   var updateQuery = {chatid : ctx.chat.id };
   var newvalues = {$set : {primary : false}};
   dbo.collection("customers").updateMany(updateQuery, newvalues,function(err, res){
    var findquery = {eosid : account};
    var pValue = {$set : {primary : true }};
    dbo.collection("customers").updateOne(findquery, pValue, function(err, result){
     console.log("Primary flag update completed", ctx.session.id);
     msg = account;
     msg += "<b>이 주계정으로 설정되었습니다.</b>";
     ctx.session.id = account;
     ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard))
     db.close();  
   }); //end of updateOne
   }); //end of updateMany query
   
  }); //end MongoClient
}

function deleteAccount(ctx, account){
 MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("heroku_dtfpf2m1");
  var deleteQuery = {eosid : account};
  dbo.collection("customers").deleteOne(deleteQuery, function(err, res){
   if(err) throw err;
   console.log("delete account", account);
   msg = account;
   msg += " is deleted";
   ctx.session.id = "nil";
   ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard))
   db.close
  });
 });
 
}

//check current step and save value to context
function stepCheck(ctx){
  if(ctx.session.step == 4){
    console.log("email",ctx.message.text);
    ctx.session.email = ctx.message.text;
  }else if(ctx.session.step == 3){
        ctx.session.etw = ctx.message.text;
  }else if(ctx.session.step == 2){
   ;
    
  }else if(ctx.session.step == 1){
    ctx.session.id = ctx.message.text;
    saveData(ctx);
    console.log("id",ctx.message.text);
   msg = ctx.session.id + " is successfuly registered";
    ctx.telegram.sendMessage(ctx.from.id, msg)
    //save id to mongo DB
  }else{
    console.log("other data");
  }
}

//bot init
const bot = new Telegraf(config.telegraf_token);    // Let's instantiate a bot using our token.
bot.use(session())
//bot.use(Telegraf.log())



module.exports.sendAlarm = function(account, msg){
 //get chatid
 MongoClient.connect(url, function(err, db) {
  var dbo = db.db("heroku_dtfpf2m1");
  var findquery = {eosid : account};
  dbo.collection("customers").find(findquery).toArray(function(err, result){
   if(result.length == 0){
    //console.log("no matched account for ", account);
    ;
   }else{
     //send message
    for(i = 0;i < result.length; i++){
     bot.telegram.sendMessage(result[i].chatid, msg);
    }
   }
   db.close();
  });//end of findOne
   
 });//end of mongoclient
 
}



bot.start((ctx) => {
 
  // Save etc values
  ctx.session.telegram = ctx.message.chat.username
  ctx.session.language = ctx.message.from.language_code
 
  reset(ctx)
  let msg = makeMessage(ctx)
  
  loadData(ctx, id => {
   ctx.session.id = id;
   ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard))
  })
  
  ctx.reply('Hello')
})

bot.on('message', ctx => {
  stepCheck(ctx);

  let msg = makeMessage(ctx);
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard))
});

function price(ctx){

   // Get price
   MongoClient.connect(url, function(err, connection) {
     let db = connection.db("heroku_dtfpf2m1")
    
     db.collection("price").find().toArray(function(err, res){
       let partnetMessage = partner.makePartnerMessage();
       ctx.telegram.sendMessage(ctx.from.id, partnetMessage, Extra.HTML());
       let message = tl.stripIndents`현재 계정: ${ctx.session.id ? ctx.session.id : '선택안됨'}
                                     EOS 시세: $${(res[0].usd).toFixed(2)}
                                     EOS 시세: ${Math.floor(res[0].krw)}KRW
                                     Provided by: ${res[0].exchange}
                                     EOS 판매가격: ${res[1].krw}KRW
                                     EOS Buying Price: ${res[1].krwbuy}KRW
                                     Provided by: ${res[1].exchange}`

       ctx.telegram.sendMessage(ctx.from.id, message, Extra.HTML().markup(keyboard))
       ctx.session.step = 2
      
       // Close connection
       connection.close()
     })
   })
}

function balance(ctx){
 loadData(ctx, function(id){
  ctx.session.id = id;
 if(ctx.session.id == -1){
  msg = "EOS계정을 등록해 주세요.";
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard));
 }else{
  
  
    eos.getCurrencyBalance("eosio.token",ctx.session.id).then(result => {
     console.log("getCurrencyBalance", result)
     if(result[0] != undefined && result[0] != 'undefined' && result[0] != null){
      v3 = result[0].split(" ");
     }else{
      v3 = ["0", "EOS"];
     }
     console.log("calling getAccount", ctx.session.id);
     eos.getAccount(ctx.session.id).then(result => {
      console.log("getAccount", result);
      console.log(result.self_delegated_bandwidth.net_weight, result.self_delegated_bandwidth.cpu_weight, result.voter_info.unstaking)
      v1 = result.self_delegated_bandwidth.net_weight.split(" ");
      v2 = result.self_delegated_bandwidth.cpu_weight.split(" ");
     eos.getTableRows({json : true,
                 code : "eosio",
                 scope: ctx.session.id,
                 table: "refunds",
                 limit: 500}).then(res => {
        var refund;
       if(res.rows.length == 0){
        refund = 0;
       }else{
       var a = res.rows[0].net_amount.split(" ");
       var b = res.rows[0].cpu_amount.split(" ");
       refund = parseFloat(a[0]) + parseFloat(b[0]);
      }
 console.log("refund size", refund)
      //console.log(parseInt(v1[0],10) + parseInt(v2[0],10));
      msg = "<b>EOS 정보</b>" + "\n";
      msg += "전체 수량 : ";
      msg += (parseFloat(v1[0]) + parseFloat(v2[0]) + parseFloat(v3[0]) + refund).toFixed(4);
      msg += " EOS\n";      
      msg += "자유롭게 사용가능 : " + parseFloat(v3[0]);
      msg += " EOS\n";
      msg += "CPU에 잠김 : "
      msg += result.self_delegated_bandwidth.cpu_weight;
      msg += "\n";
      msg += "NET에 잠김 : "
      msg += result.self_delegated_bandwidth.net_weight;
      msg += "\n";
      msg += "언스테이킹중 : ";
      msg += refund + " EOS";
      msg += "\n";
      msg += "\n";
      msg += "<b>RAM 정보 </b>" + "\n";
      msg += "전체 RAM : " + result.ram_quota + " bytes" + "\n";
      msg += "사용한 RAM : " + result.ram_usage + " bytes" + "\n"
      var ramSellSize = result.ram_quota - result.ram_usage - 2048;
      msg += "팔아도 되는 양 : " + ramSellSize + " bytes" + "\n"
      ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard));
     });//end of getTableRow
     }); //end of get Account
  }); //end of getCurrencyBalance
   }//end if 계정정보
 }); //end of first load data

//console.log('currency balance', balance);
  ctx.session.step = 3;
}

function token(ctx){

 loadData(ctx, function(id){
  ctx.session.id = id;
  console.log("Token balance", ctx.session.id);
  getTokenBalance(ctx.session.id,(result)=>{
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard));
   });
 });
}

function account(ctx){
   ctx.reply("EOS계정을 입력해 주세요. EOS 공개키로 계정이 무엇인지 확인할수 있습니다. 다음 사이트에서 확인하세요. http://eosflare.io .");

  ctx.session.step = 1;
}

function setting(ctx){
 const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton('📝 주 계정 설정', 'primary'),
  Markup.callbackButton('♻️ 계정 삭제', 'delete'),
  Markup.callbackButton('🆔 전체 계정 보기', 'list')
], {column: 1});
 msg = "메뉴를 선택해 주세요.";
 ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard)); 
}

function listAccounts(ctx){
  var idListString = [];
      //get price
 console.log("before making ", idListString);
 console.log("setting chat id ", ctx.from.id);
   MongoClient.connect(url, function(err, db) {
    var dbo = db.db("heroku_dtfpf2m1");     
    var findquery = {chatid : ctx.from.id};
    dbo.collection("customers").find(findquery).toArray(function(err, res){
     console.log(res)
     //make id array

     for(i = 0;i<res.length;i++){
      console.log("setting push data", res[i].eosid);
      idListString.push({text : res[i].eosid, callback_data : res[i].eosid});
     }
         console.log("after making", idListString);
 
    var keyboardStr = JSON.stringify({
      inline_keyboard: [ idListString ]
      
   });
     const keyboardId = Markup.inlineKeyboard(idListString, {column: 3});     
    var msg = "등록한 계정은...";
     ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboardId));
      msg = makeMessage(ctx);
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard));
    
     //ctx.session.step = 2;
     db.close();
   });


  });
}

function accountAction(ctx){
  var idListString = [];
      //get price
 console.log("before making ", idListString);
 console.log("setting chat id ", ctx.from.id);
   MongoClient.connect(url, function(err, db) {
    var dbo = db.db("heroku_dtfpf2m1");     
    var findquery = {chatid : ctx.from.id};
    dbo.collection("customers").find(findquery).toArray(function(err, res){
     console.log(res)
     //make id array

     for(i = 0;i<res.length;i++){
      console.log("setting push data", res[i].eosid);
      idListString.push({text : res[i].eosid, callback_data : res[i].eosid});
     }
         console.log("after making", idListString);
 
    var keyboardStr = JSON.stringify({
      inline_keyboard: [ idListString ]
      
   });
     const keyboardId = Markup.inlineKeyboard(idListString, {column: 3});     
    var msg = "계정을 선택해 주세요.";
     ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboardId));
    
     //ctx.session.step = 2;
     db.close();
   });


  });
}

bot.on('callback_query', (ctx) => {
 const action = ctx.callbackQuery.data;
 let partnetMessage = partner.makePartnerMessage();
 switch(action) {
     case "price":
         ctx.reply("EOS가격을 조회 중입니다....")
         price(ctx)
         break
     case "balance":
         ctx.reply("EOS 계정 잔고를 조회 중입니다....")
         ctx.telegram.sendMessage(ctx.from.id, partnetMessage, Extra.HTML());
         balance(ctx)
         break
     case "token":
         ctx.reply("토큰 잔고를 조회 중입니다....")
         ctx.telegram.sendMessage(ctx.from.id, partnetMessage, Extra.HTML());
         token(ctx)
         break
     case "id":
         account(ctx);
         break
     case "ram":
         ctx.telegram.sendMessage(ctx.from.id, partnetMessage, Extra.HTML());    
         getRamPrice(ctx);
         
         break
     case "setting":
         setting(ctx)
         break
     case "primary":
         ctx.session.accountAction = "primary"
         accountAction(ctx)
         break
     case "delete":
         ctx.session.accountAction = "delete"
         accountAction(ctx)
         break
     case "list":
         listAccounts(ctx);
         break
     default:
         if (ctx.session.accountAction === "primary") {
           ctx.session.accountAction = "nil";
           console.log("set primary account case", action);
           setPrimary(ctx, action);
         } else {
           ctx.session.accountAction = "nil";
           console.log("delete account case", action);
           deleteAccount(ctx, action);
         }
 }
});

// We can get bot nickname from bot informations. This is particularly useful for groups.
bot.telegram.getMe().then((bot_informations) => {
    bot.options.username = bot_informations.username;
    console.log("Server has initialized bot nickname. Nick: "+bot_informations.username);
});

// Start bot polling in order to not terminate Node.js application.
bot.startPolling();
