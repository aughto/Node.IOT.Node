/* 
    Vector
	2015 Jason Hunt
	Jason Hunt
	
	File: Main.js	
*/

"use strict";

// TODO remove from global, make integer
var view_mode = "edit";
	
// TODO Static test data, add to file
var test_data = [{"type":"bitdisplay","id":-1,"disp_properties":{"type":"bitdisplay","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"","name":"","color":"#ee2222","tcolor":"#111111","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":118.5,"y":102.5,"w":35,"h":25,"display_name":"Bit Display","x_start":118,"y_start":102.5,"selected":0},"custom_properties":{"note":"","tag":"3"},"value":0},{"type":"rect","test":"zzz","id":-1,"disp_properties":{"type":"rect","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"Input 4","name":"","color":"#e0e0e0","tcolor":"#666666","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":10,"y":102,"w":100,"h":25,"display_name":"Rectangle","x_start":10.5,"y_start":102,"selected":0,"w_start":40,"h_start":40},"custom_properties":{"note":""}},{"type":"bitdisplay","id":-1,"disp_properties":{"type":"bitdisplay","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"","name":"","color":"#ee2222","tcolor":"#111111","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":118.5,"y":72,"w":35,"h":25,"display_name":"Bit Display","x_start":118.5,"y_start":72,"selected":0,"w_start":40,"h_start":40},"custom_properties":{"note":"","tag":"2"},"value":0},{"type":"rect","test":"zzz","id":-1,"disp_properties":{"type":"rect","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"Input 3","name":"","color":"#e0e0e0","tcolor":"#666666","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":10,"y":72,"w":100,"h":25,"display_name":"Rectangle","x_start":10.5,"y_start":72,"selected":0,"w_start":40,"h_start":40},"custom_properties":{"note":""}},{"type":"bitdisplay","id":-1,"disp_properties":{"type":"bitdisplay","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"","name":"","color":"#ee2222","tcolor":"#111111","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":118.5,"y":42,"w":35,"h":25,"display_name":"Bit Display","x_start":118.5,"y_start":42,"selected":0,"w_start":40,"h_start":40},"custom_properties":{"note":"","tag":"1"},"value":0},{"type":"rect","test":"zzz","id":-1,"disp_properties":{"type":"rect","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"Input 2","name":"","color":"#e0e0e0","tcolor":"#666666","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":10,"y":42,"w":100,"h":25,"display_name":"Rectangle","x_start":10,"y_start":42,"selected":0,"w_start":40,"h_start":40},"custom_properties":{"note":""}},{"type":"bitdisplay","id":-1,"disp_properties":{"type":"bitdisplay","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"","name":"","color":"#ee2222","tcolor":"#111111","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":118.5,"y":12.5,"w":35,"h":25,"display_name":"Bit Display","x_start":118.5,"y_start":12.5,"selected":0,"w_start":40,"h_start":40},"custom_properties":{"note":"","tag":"0"},"value":0},{"type":"rect","test":"zzz","id":-1,"disp_properties":{"type":"rect","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"Input 1","name":"","color":"#e0e0e0","tcolor":"#666666","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":10.5,"y":12.5,"w":100,"h":25,"display_name":"Rectangle","x_start":10.5,"y_start":14.5,"selected":0,"w_start":40,"h_start":40},"custom_properties":{"note":""}},{"type":"rect","test":"zzz","id":-1,"disp_properties":{"type":"rect","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"Timer","name":"","color":"#e0e0e0","tcolor":"#666666","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":170.5,"y":12.5,"w":100,"h":25,"display_name":"Rectangle","x_start":170.5,"y_start":12.5,"selected":0},"custom_properties":{"note":""}},{"type":"rect","test":"zzz","id":-1,"disp_properties":{"type":"rect","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"Enable","name":"","color":"#e0e0e0","tcolor":"#666666","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":170.5,"y":42,"w":100,"h":25,"display_name":"Rectangle","selected":0,"x_start":170.5,"y_start":42},"custom_properties":{"note":""}},{"type":"bitdisplay","id":-1,"disp_properties":{"type":"bitdisplay","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"","name":"","color":"#ee2222","tcolor":"#111111","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":274.5,"y":12.5,"w":35,"h":25,"display_name":"Bit Display","selected":0,"x_start":274.5,"y_start":12.5},"custom_properties":{"note":"","tag":"19"},"value":0},{"type":"bitdisplay","id":-1,"disp_properties":{"type":"bitdisplay","parent":-1,"machine":"","active":1,"layer":10,"locked":0,"text":"","name":"","color":"#22ee22","tcolor":"#111111","border":"1","parent_index":-1,"enabled":1,"tag":0,"param1":"","x":274.5,"y":42,"w":35,"h":25,"display_name":"Bit Display","selected":0,"x_start":114.5,"y_start":43},"custom_properties":{"note":"","tag":"23"},"value":1}];
	
// HMI container
var hmi = (function () 
{
	const MODULE = "HMI       ";
	var local = main.register_module("hmi");		

	// Public Interface 

	// Standard
	local.init = init;
	local.load = load;
	local.unload = unload;
	local.update = update;

	local.get_debug = function() { return enable_debug; };
	local.set_loaded = function() { loaded  =1; };
	local.get_export_object = get_export_object;
	local.set_import_data = set_import_data;
	
	
	local.set_mode = function(m) { view_mode = m; };
	
	// Private
	var TIMER_INTERVAL = 1000;
	
	var timer_count  = 0;							// Test number 
	var enable_debug = 1;
	var loaded = 0;
	

	
	
	function init()
	{
		console.log(`${MODULE} Init`);

//		ajax.add_target("hmi", load);		
		
		//load_icons();
		graphics.start();
		objects.start();
		ui.start();
		properties.start();
		object_types.start(); // Need to choose order
	
		
//		main.hook_update(update);
		
		//setInterval(update_timer, UPDATE_TIME);	// Setup timer
	}


	// Called when clicking on 
	function load()
	{
		console.log(`${MODULE} Load`);
		
		show_module(local.name);

	// Start subsystems in order

	
			//graphics.load_data(test_data);
		//objects.process_object_list(test_data);
	
		//ajax_taglist();									// Request tag list

		setInterval(timer, TIMER_INTERVAL);	// Setup timer
	
		timer();											// Initial update of timer
	
		graphics.render();									// Render
	
		//websocket.start(websocket_host);

		
		//camera_request_image(); // request first image.  TODO, need a timeout check, 
		//setInterval(								// Render
	}

	// Called when to hide
	function unload()
	{
		console.log(`${MODULE} Unload`);	

		hide_module(local.name);
	}	

	function update()
	{
		// Do not draw if not active
		if (!main.is_current(local)) return;
		
		//console.log(`${MODULE} Update`);

		graphics.render();
	}



	// One second timer
	function timer()
	{
		//camera_request_image();
		
		//camera_test();
		

	
		// Poll objects	
		//ajax_get_data(1488, 1);		// Request data
	}
	
	function set_import_data(data)
	{
		console.log("Set import data");
		console.log(data);
		
		objects.process_object_list(data);
	}
	
	
	function get_export_object()
	{
		// Do not draw if not active
		
		
		//console.log(`${MODULE} Update`);

		var objects = graphics.get_objects();
		
		//console.log("HMI Objects");
		//console.log(objects);
		
		return objects;
		
	}

	

	return local;
}());

	
	