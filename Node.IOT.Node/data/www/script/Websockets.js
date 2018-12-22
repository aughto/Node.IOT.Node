/*
	MQTT Test
	2018 Nulluser
*/

"use strict";

const UPDATE_TIME = 1000;
const KEEPALIVE_TIMEOUT = 5;
const PING_TIMEOUT = 2;

var websocket_ip = ''; // '162.235.73.4';
var websocket_port = 80;  

var connected = false;			// True if connected
var socket = null;						// Websocke

var ping_time = 0;
var keepalive_time = 0;


/* Init websocket and connect */
function websocket_init()
{
	console.log("Websocket Init");	

	//log("Websocket Start");
	
	setInterval(function(){ websocket_timer() }, 1000);
	
	keepalive_time = 0;
	ping_time = 0;
	
	websocket_connect();
}


/* Timer is used to make sure we are connected */
function websocket_timer()
{
	check_keepalive();
	check_ping();
}



function check_keepalive()
{
	keepalive_time++;
	
	if (keepalive_time >= KEEPALIVE_TIMEOUT)
	{
		console.log("Timeout\n");
		websocket_connect();
	}
}


function check_ping()
{
	ping_time++;
	
	if (ping_time >= PING_TIMEOUT)
	{
		ping_time = 0;
		send_ping();
	}		
}


/* Connect to socket server */
function websocket_connect()
{
	// Do not try to reconnect if we are already connecting 
	//if (connecting == true) return;
	
	//connecting = true;
	connected = false;	
	
	keepalive_time = 0;

	if (socket)
	{
		
		socket.close();
	}
	
	socket = null;
	
	console.log("WebSocket Connecting...");

	// Check for IP override
	if (websocket_ip == '')
		websocket_ip = location.host;
	
	var websocket_host = 'ws://' + websocket_ip + ':' + websocket_port+ '/ws';

	console.log("Host: " + websocket_host  );
		
	// Create socket.  websocket_host assigned dynamically by server
	try 
	{
		socket = new WebSocket( websocket_host );
	}
	catch(exception) 
	{
		console.log("Unable to connect: " + exception);
		return;
	}
		
	try 
	{
	    socket.onerror = function() 
		{
			//socket = null;
		    //connected = false;
			////connecting = false;
			console.log("WebSocket Error");
			//location.reload(true);
		}
			
	    socket.onclose = function() 
		{
			//socket = null;
		    //connected = false;
			//connecting = false;
			console.log("WebSocket Disconnected");
		}	
		
	    socket.onopen = function() 
		{
			keepalive_time = 0;
		    connected = true;
			//connecting = false
			console.log("WebSocket Connected");
			
		
		}
		
		socket.onmessage = function(msg) 
		{
			websocket_message(msg);
		}
				
	}
	
	catch(exception) 
	{
		console.log(exception);
		//socket = null;
		//connected = false;
		//connecting = false;
	}
}

/* Send data to server */
function websocket_send(data) 
{
	if (connected == false) return;
	
	try 
	{
		socket.send(data);
	}
	
	catch(exception) 
	{
		connected == false;
		console.log(exception);
		return;
	}
	
}


/* Deal with server message */
function websocket_message(msg) 
{
	//console.log("Websocket message\n");
	//console.log(msg.data);
	
	try
	{
		var data = JSON.parse(msg.data);
	}
	
	catch (e)
	{
		console.log("Bad JSON: " + msg.data);
		return;
	}
			
	//log("action: " + data.action);
			
	// Todo need to be able to register actions 			
	if (data.cmd == "ping")	 recv_ping(); else
	if (data.cmd == "set")	 set_command(data);         else
	
	{
		console.log("Unknown action: " + data.action);
	}
}



// Parse MQTT message
function set_command(message)
{
	console.log("Set command " + message.item + " " +message.value);

	
	if (message.item == "Input1") variable_update(0, message.value);
	if (message.item == "Input2") variable_update(1, message.value);
	if (message.item == "Input3") variable_update(2, message.value);
	if (message.item == "Input4") variable_update(3, message.value);

	if (message.item == "Output1") variable_update(64, message.value);
	if (message.item == "Output2") variable_update(65, message.value);
	if (message.item == "Output3") variable_update(66, message.value);
	if (message.item == "Output4") variable_update(67, message.value);
	
	
	update_value(message.item, message.value);
}

function recv_ping()
{
	keepalive_time = 0;
	
	console.log("Ping Response\n");
}

function send_ping()
{
	var str = '{"cmd":"ping"}';
	
	//console.log('Message str: ' +str);
	websocket_send(str) 
}




function send_message(item, value)
{
	var message = {};

	message.cmd = "set";
	message.item = item;
	message.value = value;
	
	var str = JSON.stringify(message);
	
	//console.log('Message str: ' +str);
	websocket_send(str) 
}





