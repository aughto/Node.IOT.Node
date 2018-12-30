/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

// Generic Module Base
function module(name) 
{
	const  MODULE = "          ";
	
	var module = {};			
	
	module.name = name;
	module.current = false;
	
	// Public Interface
	module.init = null;
	module.load = null;
	module.unload = null;
	module.update = null;
	module.second = null;	

	return module;
}





