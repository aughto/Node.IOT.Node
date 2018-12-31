/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

// Support 
var system = (function () 
{
	const MODULE = "System    ";
	
	var local = main.register_module("system");			
	
	// Public Interface
	local.init = init;
	local.load = load;
	local.unload = unload;
	
	// System
	local.restart = restart;

	// Private variables

	
	// Called on startup
	function init()
	{
		console.log(`${MODULE} Init`);
		
		// Link in callback for reloader
		ajax.add_target("reloader", reloader);
	}

	// Called when variable editor is clicked
	function load()
	{
		console.log(`${MODULE} Load`);	

		show_module(local.name);
	}
		
	// Called when to hide
	function unload()
	{
		console.log(`${MODULE} Unload`);	

		hide_module(local.name);
	}		
	
	/* 
		System 
	*/
	
	// Request System Restart 
	function restart()
	{
		console.log(`${MODULE} System restart`);
		
		ajax.load_http("/system_restart", "reloader");
		
	}
	
	// Keep reloading page to wait for reboom
	function reloader()
	{
		console.log(`${MODULE} Reloader`);
		
		setInterval(function() {document.location.reload(true);}  , 3000);
	}
	
			
	/* 
		End of System 
	*/	
	
	
	return local;
}());




