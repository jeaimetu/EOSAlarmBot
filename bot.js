const Telegraf = require('telegraf');   // Module to use Telegraf API.
const config = require('./config'); // Configuration file that holds telegraf_token API key.
const session = require('telegraf/session')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Composer = require('telegraf/composer')
const WizardScene = require('telegraf/scenes/wizard')
const Stage = require('telegraf/stage')



var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

Eos = require('eosjs') // Eos = require('./src')
 
eosconfig = {
httpEndpoint: "http://mainnet.eoscalgary.io"
}
 
eos = Eos(eosconfig) // 127.0.0.1:8888


const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton('아이디', 'id'),
  Markup.callbackButton('EOS가격', 'price'),
  Markup.callbackButton('EOS보유량', 'balance'),
  Markup.callbackButton('토큰잔고', 'token')
  //Markup.callbackButton('History','history')
  //Markup.callbackButton('Confirm','confirm')
], {column: 3})


function makePriceMessage(res){
 
 msg = "EOS 가격 : " + "$" + res[0].usd;
 msg += "\n";
 msg += "EOS 가격 : " + Math.floor(res[0].krw) + "KRW";
 msg += "\n";
 msg += "Provided by ";
 msg += res[0].exchange;
 msg += "\n";
 msg += "EOS 팔때 가격 : " + res[1].krw + "KRW";
 msg += "\n";
 msg += "EOS 살때 가격 : " + res[1].krwbuy + "KRW";
  msg += "\n";
 msg += "Provided by " + res[1].exchange;
 diff =  res[0].krw - res[1].krw;
 msg += "\n";
 msg += "시세 차이 : " + Math.floor(diff) + "KRW";
 return msg;

 
}

function makeMessage(ctx){
  
  var finalResult;
 
 if(ctx.session.id != "nil"){
    finalResult = "eosnodeone에";
  finalResult += "\n";
 finalResult += "\n";
  finalResult += "eoscafeblock, eosyskoreabp, eosnodeonebp에 투표해 주세요.";
   finalResult += "\n";
  finalResult += "copyright EOS.Cafe Korea";
  
 }
 else{
  finalResult = "아이디를 눌러서 EOS 아이디를 입력해 주세요.";
  finalResult += "\n";
  finalResult += "자동 상태 알림 기능이 추가되었습니다.";
  finalResult += "\n";
 finalResult += "\n";
  finalResult += "eoscafeblock, eosyskoreabp, eosnodeonebp에 투표해 주세요.";
   finalResult += "\n\n";
    finalResult += "copyright EOS.Cafe Korea";
 }
  return finalResult;
}

function initMessage(ctx){
 ctx.session.id = 'nil';
}

function checkData(ctx){
  if(ctx.session.email == "nil")
    return false;
  if(ctx.session.etw == "nil")
    return false;
  if(ctx.session.bts == "nil")
    return false;
  if(ctx.session.ncafe == "nil")
    return false;
  if(ctx.session.email == null)
    return false;
  if(ctx.session.etw == null)
    return false;
  if(ctx.session.bts == null)
    return false;
  if(ctx.session.ncafe == null)
    return false;
  return true;
}

function setEosBalance(ctx){
//var setEosBalance = (ctx, callback) => {
  //get EOS balance


  var balance = 0;
  var eos = -1;
  
  //check result.
  balance.then(function(balanceData){
    console.log("setEosBalance", balanceData, balanceData.message);
    //if NOT, then set -1
    //if OK, then set the number after calculation
    if(balanceData.message.toString() == "NOTOK"){
      eos = -1;
    }else{
      eos = balanceData.result / 1000000000000000000;
      //update the EOS data to DB
      //saveData(ctx, eos);
    }
    ctx.session.eos = eos;  
  }, function(err){
    eos = -1;
    ctx.session.eos = eos; 
    console.log("setEosBalance error", err);
  });

}

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

async function getTokenBalance(account, cb){
 let [addBalance, dacBalance] = await Promise.all([getAddBalance(account), getDacBalance(account)]);
console.log(addBalance, dacBalance);
 msg = "토큰 잔고";
 msg += "\n";
 if(addBalance != null)
 msg += addBalance;
 else
  msg += " 0 ADD";
 msg += "\n";
 if(dacBalance != null)
 msg += dacBalance;
else
  msg += " 0 EOSDAC";
 cb(msg);
}



function loadData(ctx, cb){
 MongoClient.connect(url, function(err, db) {
 var dbo = db.db("heroku_dtfpf2m1");
 var findquery = {chatid : ctx.chat.id};
 dbo.collection("customers").findOne(findquery, function(err, result){
  if(result == null){
   //if result is null, then return -1
   cb(-1);
  }else{
   cb(result.eosid);
  }
  db.close();
 });
 });
}

function saveData(ctx){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("heroku_dtfpf2m1");
 
   var findquery = {chatid : ctx.chat.id};
   dbo.collection("customers").findOne(findquery, function(err, result){
    if(result == null){
     //insert
        var myobj = { chatid : ctx.chat.id, eosid : ctx.session.id }
     dbo.collection("customers").insertOne(myobj, function(err, res) {
        if (err) throw err;
          console.log("1 document inserted");
              db.close();
        });
    }else{
     //update
     var newobj = {$set : {chatid : ctx.chat.id, eosid : ctx.session.id }};        
     dbo.collection("customers").updateOne(findquery, newobj, function(err, res) {
        if (err) throw err;
          console.log("1 document updated");
          db.close();
        });
    } //end else
   }); //end pf findquery
  }); //end MongoClient
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
   msg = ctx.session.id + " 계정 입력이 완료되었습니다.";
    ctx.telegram.sendMessage(ctx.from.id, msg)
    //save id to mongo DB
  }else{
    console.log("other data");     
  }
}

//bot init
const bot = new Telegraf(config.telegraf_token);    // Let's instantiate a bot using our token.
bot.use(session())
bot.use(Telegraf.log())

module.exports.sendAlarm = function(account, msg){
 //get chatid
 MongoClient.connect(url, function(err, db) {
  var dbo = db.db("heroku_dtfpf2m1");
  var findquery = {eosid : account};
  dbo.collection("customers").findOne(findquery, function(err, result){
   if(result == null){
    console.log("no matched account for ", account);
   }else{
     //send message
    console.log("send message to ",account);
    bot.telegram.sendMessage(result.chatid, msg);
   }
   db.close();
  });//end of findOne
   
 });//end of mongoclient
 
}

bot.start((ctx) => {
  //parameter parsing
  

  //save etc values
  ctx.session.telegram = ctx.message.chat.username;
  ctx.session.language = ctx.message.from.language_code;
 ctx.session.step = 0;
  initMessage(ctx);

  var msg = makeMessage(ctx);
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard))
  
  //ctx.reply('Hello')
})

bot.help((ctx) => ctx.reply('Help message'))

bot.on('message', (ctx) => {
  stepCheck(ctx);

  var msg = makeMessage(ctx);
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard))
  })





bot.action('delete', ({ deleteMessage }) => deleteMessage())

bot.action('token',(ctx) => {
 ctx.reply("토큰 잔고를 조회하고 있습니다....");
 loadData(ctx, function(id){
  ctx.session.id = id;
  getTokenBalance(ctx.session.id,(result)=>{
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.HTML().markup(keyboard));
   });
 });
});

bot.action('id',(ctx) => {
  ctx.reply("EOS 아이디를 넣어주세요. http://eosflare.io 에서 EOS 퍼블릭키로 조회하실수 있습니다.");

  ctx.session.step = 1;
});

bot.action('price',(ctx) => {
  ctx.reply("EOS시세를 조회하고 있습니다....");
      //get price
   MongoClient.connect(url, function(err, db) {
    var dbo = db.db("heroku_dtfpf2m1");       
    dbo.collection("price").find().toArray(function(err, res){
     console.log(res)
     msg = makePriceMessage(res);
     ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
     ctx.session.step = 2;
     db.close();
    });
   });


});

bot.action('balance',(ctx) => {
 loadData(ctx, function(id){
  ctx.session.id = id;
 if(ctx.session.id == -1){
  msg = "계정 정보를 먼저 입력해 주세요";
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
 }else{
  ctx.reply("계정 정보를 조회하고 있습니다...");
  
    eos.getCurrencyBalance("eosio.token",ctx.session.id).then(result => {
     console.log(result)
     if(result[0] != undefined && result[0] != 'undefined' && result[0] != null){
      v3 = result[0].split(" ");
     }else{
      v3 = ["0", "EOS"];
     }
     console.log("calling getAccount", ctx.session.id);
     eos.getAccount(ctx.session.id).then(result => {
      if(result.self_delegated_bandwidth != undefined){
      console.log(result.self_delegated_bandwidth.net_weight, result.self_delegated_bandwidth.cpu_weight, result.voter_info.unstaking)
      v1 = result.self_delegated_bandwidth.net_weight.split(" ");
      v2 = result.self_delegated_bandwidth.cpu_weight.split(" ");
      }else{
       v1 = ["0", "EOS"];
       v2 = ["0", "EOS"];
      }
      //calling gettable rows
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
      
      //v4 = result.voter_info.unstaking.split(" ");
      //console.log(parseInt(v1[0],10) + parseInt(v2[0],10));
      msg = "총 잔고 : ";
      msg += parseFloat(v1[0]) + parseFloat(v2[0]) + parseFloat(v3[0]) + refund;   
      msg += " EOS\n";
      msg += "자유로운 거래 가능 양 : " + parseFloat(v3[0]);
      msg += " EOS\n";
      msg += "CPU에 잠겨있는 양 : "
      msg += v2
      msg += "\n";
      msg += "네트워크에 잠겨있는 양 : "
      msg += v1
      msg += "\n";
       if(refund == 0){
      msg += "잠김 해제중인 양 : ";
      msg += refund;
       }else{
              msg += "잠김 해제중인 양 : ";
      msg += refund;
       }
      ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
      });
     }); //end of get Account
  }); //end of getCurrencyBalance
   }//end if 계정정보
 }); //end of first load data

//console.log('currency balance', balance);

 

  ctx.session.step = 3;
}); //end of bot action

bot.action('ether',(ctx) => {
  ctx.reply("input Ethereum Wallet Address please");
  ctx.session.step = 3;
});

bot.action('confirm',(ctx) => {
  //ctx.reply("input bitshare ID please");
  //ctx.session.step = 1;
  //DB Transaction processing
  setEosBalance(ctx)
  if(checkData(ctx) == true){

                    saveData(ctx);

        //saveData(ctx, -1);
    var msg;
    msg = "Completed.";
    msg += "\n";
    msg += "Airdrop will be done in a few days.";
    msg += "\n";
    msg += "Please use this referal link";
    msg += "\n";
    msg += "https://t.me/eoscafebot?start=";
    msg += ctx.session.bts;
    ctx.reply(msg);


  }
  else{
    ctx.reply("Please input all data");
  }
});

    

const superWizard = new WizardScene('super-wizard',
  (ctx) => {

    

  ctx.session.step = 0;
    ctx.reply('1단계', Markup.inlineKeyboard([
      Markup.urlButton('카톡 오픈챗에 가입', 'https://open.kakao.com/o/gj8CwMH'),
      Markup.callbackButton('➡️ 다음', 'next')
    ]).extra())
  

  
    return ctx.wizard.next()
  },
  //stepHandler,
  (ctx) => {
  /*
      //check korean or not. If not, then just return to step 1
  if(ctx.message.from.language_code != "undefined")
  if(ctx.message.from.language_code != "ko-KR"){
    console.log("not Korean case");
    ctx.reply("Only Korean can apply the airdrop, please wait for your country turn");
    return ctx.scene.leave()
  }
  
  
  if(ctx.message.from.callback_query.from.language_code != "undefined")
  if(ctx.message.from.callback_query.from.language_code != "ko_KR"){
    console.log("not Korean case");
    ctx.reply("Only Korean can apply the airdrop, please wait for your country turn");
    return ctx.scene.leave()
  }
  */

  
    ctx.reply('2단계', Markup.inlineKeyboard([
      Markup.urlButton('네이버카페 가입', 'http://cafe.naver.com/eoscafekorea'),
      Markup.callbackButton('➡️ 다음', 'next')
    ]).extra())
    return ctx.wizard.next()
  },
  (ctx) => {
    ctx.reply('3단계', Markup.inlineKeyboard([
      Markup.urlButton('디스코드에 가입', 'https://discord.gg/BHEDGvx'),
      Markup.callbackButton('➡️ 다음', 'next')
    ]).extra())
    return ctx.wizard.next()
  },
    (ctx) => {
    ctx.reply('4단계 : email을 입력해주세요.')
    return ctx.wizard.next()
  },        
      (ctx) => {
  ctx.session.email = ctx.message.text;

    ctx.reply('5단계 : Bitshare id를 입력해주세요.')

    return ctx.wizard.next()
  },
        (ctx) => {
  ctx.session.bts = ctx.message.text;
    ctx.reply('6단계 : 이더리움 지갑 주소를 알려주세요.')

    return ctx.wizard.next()
  },         
          (ctx) => {
      ctx.session.etw = ctx.message.text;
    ctx.reply('7단계 : 네이버 ID를 알려주세요.')

    return ctx.wizard.next()
},
            (ctx) => {
  ctx.session.ncafe = ctx.message.text;
    ctx.reply('8단계 : 추천인 id를 알려주세요. 없으면 없음 이라고써주세요.')

    return ctx.wizard.next()
  },                                          
  (ctx) => {
    //console.log("birshare id", ctx.message.text);
  //save ethereum wallet address
    ctx.session.refer = ctx.message.text;
  
  
   finalResult = "\n"  
  finalResult += "입력하신 정보를 잘 확인해 주세요.";
      finalResult += "\n"  
  finalResult += "Your Email Address :"
  finalResult += ctx.session.email;
    finalResult += "\n"  
  finalResult += "Your Bitshare ID :"
  finalResult += ctx.session.bts
    finalResult += "\n"  
  finalResult += "Your Ethereum Wallet :"
  finalResult += ctx.session.etw
  finalResult += "\n"  
      finalResult += "Your Naver ID :"
  finalResult += ctx.session.ncafe
  finalResult += "\n"  
      finalResult += "Your referer :"
  finalResult += ctx.session.refer
  
  ctx.reply("마지막 단계" + "\n" + finalResult + "\n"+ "\n"+ "몇일안에 에어드랍이 완료 됩니다.");
/*
      ctx.reply('Final step' + finalResult + "Airdrop will be done in a few day", Markup.inlineKeyboard([
      //Markup.callbackButton('Go To First', 'first'),
      Markup.callbackButton('Confirm', 'confirm') //this trigger first step of wizard, so removed.
    ]).extra())
    */
  /* this prevent language detection so it goes to return state
  if(ctx.data == "first")
     return ctx.wizard.selectStep(ctx.session.step);
     */


    //ctx.reply('Done' + finalResult + "Airdrop will be done in a few day");
    console.log(ctx.session.etw, ctx.session.bts, ctx.session.email);
  
  
  
    return ctx.scene.leave()
  //This makes gurbage data and undefined issues
  //return;
  }
)






// We can get bot nickname from bot informations. This is particularly useful for groups.
bot.telegram.getMe().then((bot_informations) => {
    bot.options.username = bot_informations.username;
    console.log("Server has initialized bot nickname. Nick: "+bot_informations.username);
});

// Command example, pretty easy. Each callback passes as parameter the context.
// Context data includes message info, timestamp, etc; check the official documentation or print ctx.

//bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboard)))


//this did not work I think this need registration.
bot.on('/ddd', msg => {

    const id = msg.from.id;

    // Ask user name
    return bot.sendMessage(id, 'What is your email?', {ask: 'email'});

});

bot.command('custom', ({ reply }) => {
  //const stage = new Stage([superWizard], { default: 'super-wizard' })
  //bot.use(stage.middleware())
  return reply('Custom buttons keyboard', Markup
    .keyboard([
      ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
      ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
      ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
    ])
    .oneTime()
    .resize()
    .extra()
  )
})

// Hears, instead of command, check if the given word or regexp is CONTAINED in user input and not necessarly at beginning.
bot.hears('ymca', (ctx) => {
    console.log("saving session");
    ctx.session.date = new Date();
    ctx.reply("*sing* It's fun to stay at the Y.M.C.A.!")});

bot.command('test', (ctx) => {    
 console.log("calling test", ctx.session.id);
    eos.getCurrencyBalance(ctx.session.id, ctx.session.id, 'ADD').then(result => {
     console.log(result);
     var msg = "token balance is " + result;
    ctx.reply(msg);
    });
});

bot.hears(/torino/i, (ctx) => { 
    
    ctx.reply(`Someone said Torino!, ${ctx.session.date}?`)});

// Inline query support (@yourbot query). Can be used anywhere, even in groups. It works just like @gif bot.
bot.on('inline_query', ctx => {
    let query = ctx.update.inline_query.query;  // If you analyze the context structure, query field contains our query.
    if(query.startsWith("/")){  // If user input is @yourbot /command
        if(query.startsWith("/audio_src")){ // If user input is @yourbot /audio_src
            // In this case we answer with a list of ogg voice data.
            // It will be shown as a tooltip. You can add more than 1 element in this JSON array. Check API usage "InlineResultVoice".
            return ctx.answerInlineQuery([
                {
                    type: 'voice',  // It's a voice file.
                    id: ctx.update.inline_query.id,    // We reflect the same ID of the request back.
                    title: 'Send audio file sample.ogg',    // Message appearing in tooltip.
                    voice_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg',
                    voice_duration: 16, // We can specify optionally the length in seconds.
                    caption: '[BOT] Audio file sample.ogg!' // What appears after you send voice file.
                }
            ]);
        }
    }else{  // If user input is @yourbot name
        let name_target = query;    // Let's assume the query is actually the name.
        let message_length = name_target.length;    // Name length. We want to ensure it's > 0.
        if(message_length > 0){
            let full_message;
            let dice=Math.floor(Math.random()*8)+1; // Let's throw a dice for a random message. (1, 8)
            switch(dice){
                case 1: full_message = "IMHO, "+name_target+" sucks."; break;
                case 2: full_message = "IMHO, "+name_target+" is awesome"; break;
                case 3: full_message = name_target+" is not a nice people for me..."; break;
                case 4: full_message = name_target+" for me you are c- Eh! You wanted!"; break;
                case 5: full_message = "Whoa! "+name_target+" is very cool!"; break;
                case 6: full_message = "Grifondoro! No wait, "+name_target+" you're such a noob."; break;
                case 7: full_message = "Sometimes I ask myself why people like "+name_target+" dress up and walk around like that..."; break;
                case 8: full_message = "Watch him! Watch! "+name_target+" is so ugly!"; break;
            }
            // Let's return a single tooltip, not cached (In order to always change random value).
            return ctx.answerInlineQuery([{
                type: 'article',
                id: ctx.update.inline_query.id, 
                title: 'You have inserted: '+name_target, 
                description: 'What does '+bot.options.username+' thinks about '+name_target+'?',
                input_message_content: {message_text: full_message}
            }], {cache_time: 0});
        }
    }
})
//const stage = new Stage([superWizard], { default: 'super-wizard' })

// // Register session middleware

//bot.use(stage.middleware())


// Start bot polling in order to not terminate Node.js application.
bot.startPolling();
