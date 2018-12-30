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

	local.hook_update = hook_update;	// Add callback to udpate timer
	local.hook_second = hook_second;		// Add callback to second timer
	
	// Private variables
	const DEFAULT_PAGE = "liveview";

	const UPDATE_RATE = 100;
	const SECOND_RATE = 1000;

	var update_callback = [];		// List of functions called one per second
	var second_callback = [];		// List of functions called at update rate
		
	// Deal with console not present
	if (!console) { console = {log: ()=>{}} }
		
	console.log(`${MODULE} Node.IOT System Start`);		
		
		
		
	/* Core init */
	function init()
	{
		console.log(`${MODULE} Init`);
		
		// Enforce init order here
		
		ajax.init();
		cpu.init();
		config.init();
		liveview.init();
		vareditor.init();
		weblogix.init();
		hmi.init();
		websocket.init();
		project.init();
	
		project.load_page(DEFAULT_PAGE);
		
		// Setup timers
		
		setInterval(second, SECOND_RATE);
		setInterval(update, UPDATE_RATE);
		
	}
	
	// Add update timer hook
	function hook_update(callback)
	{
		update_callback.push(callback);
	}
	
	// Add second timer hook
	function hook_second(callback)
	{
		second_callback.push(callback);
	}
	
	// Update timer function
	function update()
	{
		//console.log(`${MODULE} Update`);
		
		for (var i = 0; i < update_callback.length; i++)
			update_callback[i]();
	}
		
	// Second timer function
	function second()
	{
		//console.log(`${MODULE} Second`);
		
		for (var i = 0; i < second_callback.length; i++)
			second_callback[i]();
	}
	

	

	return local;
}());
