/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

/* Core init */
function init()
{
	console.log("System Init");
	
	load_page("live.html");
	
	console.log("Host: " + location.host)
	
	weblogix_init();
	
	websocket_init();
	
	logic_init();
}

 
