require('./bot');
require('./eos');
require('./price');

var http = require('http'); 

// Create a function to handle every HTTP request
function handler(req, res){
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
	//console.log('test',tarot.threeCardReading());
    //res.end("<html><body><h1>Hello</h1></body></html>");
	var r1 = "<html><body><h1>";
	var r2 = "</h1></body></html>";
	var r3 = "telegram test";
	var answer = r1+r2+r3;
	res.end(answer);
};

http.createServer(handler).listen(process.env.PORT, function(err){
  if(err){
    console.log('Error starting http server');
  } else {
    console.log("Server running at http://127.0.0.1:8000/ or http://localhost:8000/");
  };
});
