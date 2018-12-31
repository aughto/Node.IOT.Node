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

	// Module Control
	local.register_module = register_module;		// Called by modules to register
	local.load_module = load_module;	// Called by interface to load a module
	local.is_current = is_current;
	
	// Menu 
	local.menu_goonline = menu_goonline;
	local.menu_gooffline = menu_gooffline;
	local.menu_assemble = menu_logic_assemble;
	local.menu_file_save = menu_file_save;
	local.menu_file_saveas = menu_file_saveas;
	local.menu_file_load  = menu_file_load;
	
	// System
	local.system_restart = system_restart;
	
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
	
		// Link in callback for reloader
		ajax.add_target("reloader", reloader);
	
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
			modules[i].init();
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
			if (modules[i].second != null) modules[i].second();
	}

	/* 
		End of Timers
	*/
		
	/* 
		Module control 
	*/

	// Returns true if current module is the the passed module
	function is_current(m)
	{
		return cur_module == m;
	}
	
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
		End of Module control 
	*/
	
	
	/* 
		Menu items 
	*/	

	// Go offline menu item
	function menu_gooffline()
	{
		console.log("menu_logic_simulate()");
		project.set_offline();
	}

	// Go online menu item
	function menu_goonline()
	{
		console.log("menu_logic_live()");
		
		if (websocket.get_connected() == false)
		{
			error("Unable to go online: Not Connected");
			return;
		}
		
		project.set_online();
	}

	// Go Assemble Menu Item
	function menu_logic_assemble()
	{
		console.log("menu_logic_assemble()");
		project.assemble();		
	}

	// Save menu Item
	function menu_file_save()
	{
		console.log("menu_file_save()");
		project.save_project();
	}

	// Save as menu item
	function menu_file_saveas()
	{
		console.log("menu_file_saveas()");
	}

	// Go load menu item
	function menu_file_load()
	{
		console.log("menu_file_load()");
		project.load_project();
	}
	
	/* 
		End of Menu items 
	*/	
	
			
	/* 
		System 
	*/
	
	// Request System Restart 
	function system_restart()
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
