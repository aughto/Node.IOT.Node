/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
	
	Main Container
	This is loaded before modules.  Modules then register with main to get linked in
	
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
	var local = new module();

	// Public Interface
	local.init = init;					// Core init

	local.register_module = register_module;		// Called by modules to register
	local.load_module = load_module;	// Called by interface to load a module
	
	// Private variables
	const DEFAULT_PAGE = "liveview";	// Default Page

	const UPDATE_RATE = 100;			// Core update rate
	const SECOND_RATE = 1000;			// Second update rate
	
	var modules = [];					// Module list. Modules register themselves 
		
	var cur_module = null;				// Currently displayed module
	
	// Deal with console not present
	if (!console) { console = {log: ()=>{}} }
		
	console.log(`${MODULE} Node.IOT System Start`);		
		
	// Core init 
	function init()
	{
		console.log(`${MODULE} Init`);
			
		// Init all modules in the order they were registered
		init_modules();
	
		load_module(DEFAULT_PAGE);
		
		setup_timers();
	}
	
	// Add module to list
	function register_module(name)
	{
		var m = new module(name);		
		
		modules.push(m);
		
		return m;
	}

	// Init all modules
	function init_modules()
	{
		for (var i = 0; i < modules.length; i++)
		{
			if (modules[i].init != null)
				modules[i].init();
		}
	}				
	

	// Setup Timers. Main owns the timers so all modules using them are synchronized.
	function setup_timers()
	{
		setInterval(second, SECOND_RATE);
		setInterval(update, UPDATE_RATE);
	}
	

	// Update timer function
	function update()
	{
		//console.log(`${MODULE} Update`);
		
		for (var i = 0; i < modules.length; i++)
			if (modules[i].update != null) modules[i].update();
	}
		
	// Second timer function
	function second()
	{
		//console.log(`${MODULE} Second`);
		for (var i = 0; i < modules.length; i++)
			if (modules[i].second  != null) modules[i].second();
	}

	/* 
		End of Timers
	*/
		
	/* 
		Page control 
	*/

	
	
	/*function unload_modules()
	{
		// Unload all modules
		for (var i = 0; i < modules.length; i++)
		{
			if (modules[i].unload != null)
				modules[i].unload();
		}
	}*/
	
	function load_module(m, param)
	{
		// Unload current module
		if (cur_module != null)
			cur_module.unload();
		
		// Find module by name and load
		for (var i = 0; i < modules.length; i++)
		{
			if (modules[i].name == m) 
			{
				cur_module = modules[i];
				cur_module.load(param);
			}
		}
	}
	
	/* 
		End of Page control 
	*/

	return local;
}());
