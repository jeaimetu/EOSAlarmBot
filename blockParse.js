function getAccountInfo(data){
 let account = null;
 
 if(("to" in data) == 0)
  account = data.to;
 if(("from" in data) == 0)
  account = data.from;
 if(("account" in data) == 0)
  account = data.account;
 if(("owner" in data) == 0)
  account = data.owner;
 if(("voter" in data) == 0)
  account = data.voter;
 if(("receiver" in data) == 0)
  account = data.receiver;
 if(("poster" in data) == 0)
  account = data.poster;
 
 return account; 
}


//Exporting functions
module.exports.getAccountInfo = getAccountInfo;
