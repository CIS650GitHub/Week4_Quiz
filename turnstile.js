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
//screen.append(box);

var lock_ip = "192.168.0.106";
var my_ip =  "192.168.0.101";
var var_ip = "192.168.0.100";

//box.setContent('This node is  ' + my_ip + '  East');
//screen.render();

var interval = 3000;




app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

function PostObject(post_data, sendto) {
    // An object of options to indicate where to post to
    console.log("Sending it to "+ sendto);
    console.log("Post data : " + post_data);
    // console.log('problem with request: ' + pendingQueue);
    var post_options = {
        host: sendto,
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
         console.log("Error connecting");
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

var poll;

// handle POST requests
app.post('/do_post', function(req, res) {
    console.log("Received Message");
    var the_body = req.body;
    console.log(the_body);
    if(the_body !== null && parseInt(the_body.acquired) === 1)
    {
	    console.log("Aquired Lock Sending Read request");
        clearInterval(poll);
        sendReadVar();
    }
    else if(the_body!==null && parseInt(the_body.acquired) === 0)
    {
        console.log("will poll again");
        poll =  setInterval(pollagain ,  2000);
    }
    else if(the_body!=null && parseInt(the_body.read) == 1 )
    {
        console.log("send write--");
        var n = the_body.count;
        sendWrite(n);
    }

    res.json({
            "body": the_body,
            "id": JSON.stringify(my_ip)
        });

});

newPerson();
//setInterval(newPerson, 3000);

function newPerson()
{
     console.log("Sending it to "+ lock_ip);
      var post_data1 = querystring.stringify({
                lock: 1,
                ip: my_ip
            });

        PostObject(post_data1,lock_ip);
}


function release()
{
      var post_data1 = querystring.stringify({
                lock: 0,
                ip: my_ip
            });

        PostObject(post_data1,lock_ip);
}

function sendReadVar(){
    
    var post_data1 = querystring.stringify({
                read: 0,
                ip: my_ip
            });
            
    PostObject(post_data1,var_ip);        

}
function sendWrite(n){
    if(n == 4)
     {
         n ==0;
     } 
    else
    {
     n = n+ 1;
    }
     var post_data1 = querystring.stringify({
                writereq:0,
                count: n,
                ip: my_ip
            });
            
    PostObject(post_data1,var_ip);     
    
    release();

}

// Focus our element.
box.focus();

// Render the screen.
screen.render();

http.createServer(app).listen(app.get('port'), function() {
    // console.log("Express server listening on port " + app.get('port'));
});


