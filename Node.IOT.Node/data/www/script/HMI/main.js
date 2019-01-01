/* 
    Vector
	2015 Jason Hunt
	Jason Hunt
	
	File: Main.js	
*/

"use strict";

var hmi_main = (function () 
{
	var local = {};
	
	// Public
	local.start 	= function() { start(); } ;
	local.get_debug = function() { return enable_debug; };
	
	local.set_loaded = function() { loaded  =1; };
	
	
	// Private
	
	var TIMER_INTERVAL = 1000;
	
	var timer_count  = 0;							// Test number 
	var enable_debug = 1;
	var loaded = 0;
	
	// Main init
	function start()
	{	
		// Start subsystems in order
		graphics.start();
		objects.start();
		ui.start();
		properties.start();
		object_types.start(); // Need to choose order
	
		//ajax_taglist();									// Request tag list

		setInterval(timer, TIMER_INTERVAL);	// Setup timer
	
		timer();											// Initial update of timer
	
		graphics.render();									// Render
	
		//websocket.start(websocket_host);

		
		//camera_request_image(); // request first image.  TODO, need a timeout check, 
		//setInterval(
		
	}
	
	


	// One second timer
	function timer()
	{
		//camera_request_image();
		
		//camera_test();
		

	
		// Poll objects	
		//ajax_get_data(1488, 1);		// Request data
	}

	return local;
}());

