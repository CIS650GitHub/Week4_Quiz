var os = require('os');
var http = require('http');
var express = require('express');
var connect = require("connect");
var blessed = require('blessed');
var bodyParser = require('body-parser');
var app = express();
var screen = blessed.screen();
var querystring = require('querystring');
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

box.setContent('This is VAR');
screen.render();

var current_count = 0;
var current_ip = "";
var lock_ip = "192.168.0.107";

app.set('port', process.env.PORT || 3000);


function PostObject(post_data, ip) {
    // An object of options to indicate where to post to

    // console.log('problem with request: ' + pendingQueue);
    var post_options = {
        host: ip,
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
        res.on('data', function(chunk) {
           
        });
    });

    post_req.on('error', function(e, post_data) {

        
        PostObject(querystring.stringify(post_data));
        //}
    });

    post_req.write(post_data);
    post_req.end();
}


// handle GET requests
app.get('/do_get', function(req, res) {
    var the_body = req.query;
    console.log("get body: " + the_body.n);
    box.setContent("Get with query: " + the_body);
    box.style.bg = 'green'; //green for get
    screen.render();
    res.json({
            "query": the_body,
            "id": JSON.stringify(my_group[my_index])
        });
});


function sendCurrentCount (num, recipient) {

	var post_data = querystring.stringify({
            count: num,
            read: 1,
            ip: recipient
        });

	//PostObject(post_data, recipient);
}

// handle POST requests
app.post('/do_post', function(req, res) {
    console.log(req);
	console.log(req.body);
    var the_body = req.body;
	
  
        
        if(the_body !== null && the_body.read !== null && parseInt(the_body.read) === 0) {
        	var ip = the_body.ip;
        	sendCurrentCount(current_count, ip);
        	console.log("Count read!");
        }
        else if(the_body !== null && the_body.writereq !== null && parseInt(the_body.writereq) === 0) {
        	current_count = parseInt(the_body.count) + 1;
        	console.log("Count updated!");
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
    // console.log("Express server listening on port " + app.get('port'));
});



