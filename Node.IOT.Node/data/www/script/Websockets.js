/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
	
	Implements WebSocket 
	
	File: Websockets.js
*/

"use strict";


// Global Websockets service object
var websocket = (function () 
{
	// Private variables
	var local = {};		

	const MODULE = "WebSocket ";
	
	const UPDATE_TIME = 1000;
	const KEEPALIVE_TIMEOUT = 5;
	const PING_TIMEOUT = 2;
	
	var host_ip = "";
	var host = "";
	var websocket_port = 80;  
	
	var connected = false;			// True if connected
	var socket = null;						// Websocke
	
	var ping_time = 0;
	var keepalive_time = 0;


	// Public Interface
	
	local.init = init;
	local.send_command = send_command;
	
	
	/* 
		Public 
	*/

	// Init websocket and connect 
	function init()
	{
		console.log(`${MODULE} Websocket Init`);	
		console.log(`${MODULE} Host: ${location.host}`);
		
		//log("Websocket Start");
	
		setInterval(update, UPDATE_TIME);
	
		keepalive_time = 0;
		ping_time = 0;
	
		connect();
	}


	// Timer is used to make sure we are connected 
	function update()
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
			connect();
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


	// Connect to socket server 
	function connect()
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
	
		console.log(`${MODULE} WebSocket Connecting`);

		// Check for IP override
		if (host_ip == '')
			host_ip = location.host;
	
		host = 'ws://' + host_ip + ':' + websocket_port+ '/ws';

		console.log(`${MODULE} Host  ${host}`);
		
		// Create socket.  websocket_host assigned dynamically by server
		try 
		{
			socket = new WebSocket( host );
		}
		catch(exception) 
		{
			console.log(`${MODULE} Unable to connect: ${exception}`);
			return;
		}
		
		try 
		{
			socket.onerror = on_error;
			socket.onopen = on_open;
			socket.onclose = on_close;
			socket.onmessage = on_recv;
		}
		catch(exception) 
		{
			console.log(exception);
			//socket = null;
			//connected = false;
			//connecting = false;
		}
	}
	
	
	function on_error()
	{
			
		//socket = null;
		//connected = false;
		////connecting = false;
		console.log("WebSocket Error");
		//location.reload(true);
	}
				
	
	function on_open()
	{
		keepalive_time = 0;
		connected = true;
		//connecting = false
		console.log("WebSocket Connected");
	}
			
	function on_close() 
	{
		//socket = null;
		//connected = false;
		//connecting = false;
		console.log("WebSocket Disconnected");
	}	
			
	
	// socket handlers
	// Message from server
	function on_recv(msg) 
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
		if (data.cmd == "set")	 project.ws_set_command(data);         else
		if (data.cmd == "setvar")project.ws_setvar_command(data);         else
	
		{
			console.log("Unknown action: " + data.cmd);
		}
	}


	// Send data to server
	function send(data) 
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

	function recv_ping()
	{
		keepalive_time = 0;
		
		console.log("Ping Response\n");
	}
	
	function send_ping()
	{
		var str = '{"cmd":"ping"}';
		
		//console.log('Message str: ' +str);
		send(str) 
	}


	function send_command(cmd, item, value)
	{
		var msg = {	cmd : cmd,
					item : item,
					value : value };
		
		var str = JSON.stringify(msg);
		
		console.log(`${MODULE} Send command: ${str}`);
		
		send(str) 
	}


	return local;
}());





