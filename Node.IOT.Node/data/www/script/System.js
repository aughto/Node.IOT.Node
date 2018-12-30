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
	

	// Private variables

	
	// Called on startup
	function init()
	{
		console.log(`${MODULE} Init`);
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
	
	return local;
}());




