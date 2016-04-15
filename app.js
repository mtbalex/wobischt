/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------


// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
console.log("port:" + appEnv.port);

/*
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() 
{
   // print a message when the server starts listening
   console.log("server starting on " + appEnv.url);
});
*/

/*
//With ws
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ host: 'nodejshello.mybluemix.net', port: appEnv.port, path: '/ws/bikestations' });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
 
  ws.send('something');
});
*/


/*
ws.on('open', function open() {
  ws.send('onopen');
});
 
ws.on('message', function(data, flags) {
   ws.send('onmessage'); 
});
*/


//With socket.io

var http = require('http');

var io = require('socket.io')
    (http.createServer(app).listen(appEnv.port));


var clientLocations = {};

io.sockets.on('connection', function(socket) {

	console.log("connection");
   socket.on('query', function(data)
   { 
		console.log('got query data' + data);

	   http.get(
	   {
	           host: 'www.citibikenyc.com',
	           path: '/stations/json'
	   }, function(response) 
	   {
	   	// Continuously update stream with data
	      var body = '';
	      response.on('data', function(d) 
	      {
	      	body += d;
	      });
	      response.on('end', function() 
	      {
	      	// Data reception is done, do whatever with it!
	         //var parsed = JSON.parse(body);
				socket.emit('answer', body);
	      });
	   });
	}); 
	
	socket.on('my_coordinates', function(data)
   { 	
	   console.log('got coordinates' + data);
	   	   
	   //console.log(JSON.parse(data));
	   //var loc = JSON.parse(data);
	   console.log('got fingerprint:' + data.fingerprint);
	   console.log('got latitude:' + data.latitude);
	   console.log('got longitude:' + data.longitude);

		var clientLocation = {latitude 	: data.latitude,
     		                longitude 	: data.longitude,	 
				id_string : data.id_string};
	    		          
	    		          
	   clientLocations[data.fingerprint] = clientLocation;
	   console.log(clientLocations);
	   
	   for(var aClientLocation in clientLocations){
	   	console.log(aClientLocation);
    		console.log('Found client lat:' + clientLocations[aClientLocation].latitude);
	   	console.log('Found client long:' + clientLocations[aClientLocation].longitude);
	   	io.sockets.emit('other_users_location', clientLocations[aClientLocation]);
		}
	   
	   io.sockets.emit('other_users_location', data);
	});
});

/*

var port = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');



var server = http.createServer( serverHandler );
console.log("listening");
server.listen(port,host);

*/
