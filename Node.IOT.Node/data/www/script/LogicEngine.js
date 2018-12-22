/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


var enagle_log = true;
//var log = false;

/* Assembly */
var INVALID_NODE = -1;
var stack = [];
var stack_ptr = 0;
var nodes = [];
var root_node = {};;

var variable_list = {};  // Variable name list


function logic_init()
{
	console.log("Logic init");
	cpu_init();
		
	logic_test();
	
	setInterval(function() {logic_update_timer()}, 100);	// Setup timer
}


function logic_update_timer()
{
	cpu_update(100);
	
}



// Assemble, compute memory and save logic to device
function logic_download()
{
	console.log("Saving logic:");

	
	logic_assemble();
		
	var bytecode = generate_bytecode();

	store_bytecode(bytecode);
	
	
	store_variablelist();
	
	
	
}


// Save bytecode to device
function store_bytecode(bytecode)
{
	console.log("Saving bytecode ");
	console.log("Bytecode: " + bytecode);

	var XHR = get_request();

    XHR.addEventListener("load", function(event) 
	{
      console.log(event.target.responseText);
    });

    XHR.addEventListener("error", function(event) 
	{
      alert('Unable to save logic to device');
    });

	XHR.open("POST", "/save_bytecode"); 
		
    XHR.send(bytecode);
}



	

	
	