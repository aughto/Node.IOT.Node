/* 
    Vector
	2015 Jason Hunt
	Jason.Hunt@fcagroup.com
	
	File: Main.js	
*/

"use strict";

var main = (function () 
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

		setInterval(function() {timer()}, TIMER_INTERVAL);	// Setup timer
	
		timer();											// Initial update of timer
	
		graphics.render();									// Render
	
		websocket.start(websocket_host);
		
		
		
		

		
		//camera_request_image(); // request first image.  TODO, need a timeout check, 
		//setInterval(
		
	}
	
	
	

	
	
	
	
	
	
	
	
	

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
	// One second timer
	function timer()
	{
		//camera_request_image();
		
		//camera_test();
		
		return;
		if (loaded == 0) return;
		
		timer_count++;
	
		//if (getRandomInt(0, 1000) > 500) return;
		
		
		
		//log("c");
		
		var i = getRandomInt(0, graphics.get_num_objects());
		var o = graphics.get_object(i);
			
		if (o.type == "module")
		{
			
			//var s = "None";
			var c = "#000000";
			
			var s = o.custom_properties.state;
			
			
			if (s == "Lost") s = "Unused"; else
			if (s == "Unused") s = "Cleaned"; else
			if (s == "Cleaned") s = "Planted"; else
			if (s == "Planted") s = "Ready"; 
			//if (s == "Ready") s = "Cleaned"; 
			
			var r = getRandomInt(0, 100);
			if (r == 0) s = "Lost";

			if (s == "Unused")   c = "#222222"; else
			if (s == "Cleaned")  c = "#ff4400"; else
			if (s == "Planted")  c = "#4444ff"; else
			if (s == "Ready")    c = "#44ff44"; else
			if (r == "Lost")     c = "#ff1111";	

			o.disp_properties.color = c;
			o.custom_properties.state = s;
			graphics.render();
		}
			
			
	
	
	
	
		// Poll objects	
		//ajax_get_data(1488, 1);		// Request data
	}

	return local;
}());

