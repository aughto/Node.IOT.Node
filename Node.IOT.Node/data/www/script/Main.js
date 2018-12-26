/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
	
	File: Main.js
*/

"use strict";

/*
	Main system object
*/

var main = (function () 
{
	// Private variables
	var local = {};
	
	const MODULE = "Main      ";
	const DEFAULT_PAGE = "live.html";
	
	// Public Interface
	local.init = init;

	// Deal with console not present
	if (!console) { console = {log: ()=>{}} }
		
	/* Core init */
	function init()
	{
		console.log(`${MODULE} Init`);
		
		// Enforce init order here
		
		ajax.init();
	
		// Load default pages
		
		ajax.load_page(DEFAULT_PAGE);
		
		console.log(`${MODULE} Host: ${location.host}`);
		
		weblogix_init();
		
		websocket.init();
		
		project.init();
	
		
		//logic_init();
	}

	return local;
}());


 
