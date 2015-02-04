var os = require('os');
var http = require('http');
var express = require('express');
var connect = require("connect");
var blessed = require('blessed');
var bodyParser = require('body-parser');
var app = express();
var my_ip = "192.168.0.107";
var ipLock = "";
var available = 1;
var local  = "127.0.0.1";

app.use(bodyParser.urlencoded());

// Create a screen object.
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

app.set('port', process.env.PORT || 5000);

var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
box.setContent('This node is  ' + my_ip + '  Lock');
screen.render();


function PostObject(post_data,ip_addr) {
    // An object of options to indicate where to post to
       
    var post_options = {
        host: ip_addr,
        port: '5000',
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
        res.on('data', function(chunk) {
            // clean the queue......
            // console.log('Response: ' + chunk);
        });
    });

    post_req.on('error', function(e, post_data) {
        console.log("Problem with sending" + post_data);
    });

    post_req.write(post_data);
    post_req.end();
}

// handle POST requests
app.post('/do_post', function(req, res) {    
   var the_body = req.body;   
   
   var sender_ip = the_body.ip;
   var msg_type = parseInt(the_body.lock);
   console.log("Got message :" + msg_type);

  if( msg_type === 1){
      box.setContent("Received a request for the lock ");
	   if( available === 1){
           box.insertBottom("lock is available for " +sender_ip);	    
    	   available = 0;
    	   ipLock = sender_ip;
    	   var post_data = querystring.stringify({
                acquired:1
            });
    		//console.log("acquired " + sender_ip + " lock" );
    		//console.log("sending message to " + sender_ip + "that they aquired lock")
    	    PostObject(post_data, sender_ip);
   
	   }else if(available === 0){
	    
	        box.insertBottom("lock is unavailable " + sender_ip);
            /*
    	   //send message back if it is the lock holder 
           if( ipLock.localeCompare(sender_ip) === 0){
                //console.log("sender is current owner of the lock \n");
    			//send message lock is true
    			//set lock to unavailable
    			available = 0;
    			ipLock = sender_ip;			
    			//console.log("sending " + sender_ip + " message that they own lock\n")
    			var post_data = querystring.stringify({
                        acquired:1
                    });
    				
    				PostObject(post_data, sender_ip);
    			
    	   }else{
    	       //console.log(sender_ip + " sender does not own the lock ");
    	       //console.log("sending message to " + sender_ip + " lock request denied\n");
              */ 
    	     var post_data = querystring.stringify({
                        aquired:0
                    });
    				
    				PostObject(post_data, sender_ip);
	   
	       }


    }
  }else if( msg_type === 0){
      box.insertBottom("Relasing Lock");
	  available = 1;
	  ipLock = "";  
  }

 res.json({
            "body": the_body,
            "ip": JSON.stringify(current_ip)
    });
  
});


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

