/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
	
	File: HMI.js
	
	Todo: Factor out as much in common with weblogix as possible
*/

"use strict";
			  

			 var view_mode = "edit";
	
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

	function init()
	{
		console.log(`${MODULE} Init`);

//		ajax.add_target("hmi", load);		
		
		//load_icons();

		
//		main.hook_update(update);
		
		//setInterval(update_timer, UPDATE_TIME);	// Setup timer
	}


	// Called when clicking on 
	function load()
	{
		console.log(`${MODULE} Load`);
		
		show_module(local.name);

		hmi_main.start();
		
				
		//setup_display();								// Canvas

		//render();									// Render
	}

	// Called when to hide
	function unload()
	{
		console.log(`${MODULE} Unload`);	

		hide_module(local.name);
	}	

	function update()
	{
		//console.log(`${MODULE} Update`);

		//render();
	}

	return local;
}());

	
	
	



	
	

