/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

const BGCOLOR_VALUES = ["#404040", "#5555ff"];
const FGCOLOR_VALUES = ["#ffffff", "#ffffff"];

var values = []; // local copy of current values

/*
  Live View 
*/

// Display all current values 
function load_liveview()
{
	console.log("Liveview Init");	
		
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
	//console.log(`SET ${item} ${value}`);
	
	update_value(item, value);	// local update
	
	send_message(item, value.toString());
}

// Area was clicked
function area_click(item)
{
	// Make sure item is an output
	if (item.toLowerCase().indexOf("output") == -1) return;
	
	//console.log("Get value: " + get_value(item));
	
	var v = get_value(item) == 1 ? 0 : 1;
	
	//console.log("v: " + v);
	// Toggle cell
	set_value(item, v);
}




