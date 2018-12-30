/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


// Global AJAX service object
var liveview = (function () 
{
	const MODULE = "Liveview  ";
	var local = {};			

	// Public Interface
	local.init = init;

	//local.load = load;
	
	local.area_click = area_click;
	local.update_value = update_value;
	local.load = load;

	// Private variables		
	const BGCOLOR_VALUES = ["#404040", "#5555ff"];
	const FGCOLOR_VALUES = ["#ffffff", "#ffffff"];

	var values = []; // local copy of current values


	/*
		Live View 
	*/

		// Display all current values 
	function init()
	{
		console.log(`${MODULE} Init`);
		ajax.add_target("liveview", load);
	}
	
	// Display all current values 
	function load()
	{
		// Will need to generate page from IO data here

		for (var i in values) refresh_value(i);
	}

	// Get curretn value from memory 
	function get_value(item) 
	{ 
		return values[item] || 0;
	}


	// Apply current state to UI item 
	function refresh_value(item)
	{
		var value = values[item];
		
		var el = document.getElementById(item); 

		if (el) 
		{
			el.style.backgroundColor = BGCOLOR_VALUES[value];
			el.style.color = FGCOLOR_VALUES[value];
		}
	}


	// Apply new value to item
	function update_value(item, value) 
	{ 
		console.log(`Update ${item} = ${value}`);
		
		//variable_update
		
		values[item] = value;
		refresh_value(item);
	}


	// Set local value and publish
	function set_value(item, value)
	{

		update_value(item, value);	// local update
		
		var index = -1;
		
		if (item == "Input1") index = 0;
		if (item == "Input1") index = 1;
		if (item == "Input1") index = 2;
		if (item == "Input1") index = 3;
		
		if (item == "Output1") index = 4;
		if (item == "Output2") index = 5;
		if (item == "Output3") index = 6;
		if (item == "Output4") index = 7;
		

		console.log(`SET ${item} ${index} ${value}`);

		
		// Only send updates if live
		if (proget.get_online())
		{
			send_setvariable(index, parseInt(value));
		}
		
		
		//send_message(item, value.toString());
	}

	// Area was clicked
	function area_click(item)
	{
		
		// Only allow input and outputs changes if offline, or in overried
		//if (project.get_online())
		{
			//return;
			// Make sure item is an output
	//		if (item.toLowerCase().indexOf("output") == -1) 
				//return;
		}
		
		//console.log("Get value: " + get_value(item));
		
		var v = get_value(item) == 1 ? 0 : 1;
		
		//console.log("v: " + v);
		// Toggle cell
		set_value(item, v);
	}

	return local;
}());





