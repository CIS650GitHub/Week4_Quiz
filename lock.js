var os = require('os');
var http = require('http');
var express = require('express');
var connect = require("connect");
var blessed = require('blessed');
var bodyParser = require('body-parser');
var app = express();
var screen = blessed.screen();

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
        top: 'center',
        left: 'center',
        width: '75%',
        height: '75%',
        content: '',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: '#f0f0f0'
            },
            hover: {
                bg: 'black'
            }
        }
    });

// Append our box to the screen.
screen.append(box);
var querystring = require('querystring');
var ipLock = "";
var available = 1;

app.set('port', process.env.PORT || 3000);

function PostObject(post_data,ip_addr) {
    var post_options = {
        host: ip_addr,
        port: '3000',
        path: '/do_post',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {});
    });

    post_req.on('error', function(e, post_data) {
        console.log('problem with request: ' + post_data);
    });

    post_req.write(post_data);
    post_req.end();
}

app.post('/do_post', function(req, res) {
    console.log("Received Message");
    console.log(req);
   var the_body = req.body;
   
   var sender_ip = the_body.ip;
   var msg_type = parseInt(the_body.lock);
  if( msg_type === 1){
      console.log("Received a request for the lock \n")
	if( available === 1){
       console.log("lock is available\n")
	    //send
	    available = 0;
		ipLock = sender_ip;
		var post_data = querystring.stringify({
                    acquired:1
        });
		console.log("acquired " + sender_ip + " lock" );
		console.log("sending message to " + sender_ip + "that they aquired lock")
	    PostObject(post_data, sender_ip);
   
	}else if(available === 0){
	    
	    console.log("lock is unavailable ");
	   //send message back if it is the lock holder 
       if( ipLock.localeCompare(sender_ip) === 0){
           console.log("sender is current owner of the lock \n");
			//send message lock is true
			//set lock to unavailable
			available = 0;
			ipLock = sender_ip;
			
			console.log("sending " + sender_ip + " message that they own lock\n")
			var post_data = querystring.stringify({
                    acquired:1
                });
				
				PostObject(post_data, sender_ip);
			
	   }else{
	       console.log(sender_ip + " sender does not own the lock ");
	       console.log("sending message to " + sender_ip + " lock request denied\n");
	     var post_data = querystring.stringify({
                    aquired:0
                });
				
				PostObject(post_data, sender_ip);
	   }
	}
  }else if( msg_type === 0){
      
	  available = 1;
	  ipLock = "";
  
  }
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});


