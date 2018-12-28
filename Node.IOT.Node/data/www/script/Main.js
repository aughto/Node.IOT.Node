/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
	
	File: Main.js
*/

"use strict";

/*
	Main
*/

// Main system object
var main = (function () 
{
	const MODULE = "Main      ";
	var local = {};

	// Public Interface
	local.init = init;

	// Private variables
	const DEFAULT_PAGE = "live.html";

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
		
		
		config.init();
		
		liveview.init();
		
		vareditor.init();
		
		weblogix.init();
		
		websocket.init();
		
		project.init();
	
		
		//logic_init();
	}

	return local;
}());


 
