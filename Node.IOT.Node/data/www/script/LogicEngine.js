/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

var enagle_log = true;

// Logic editor init
function logic_init()
{
	console.log("Logic init");
	cpu_init();
		
	logic_test();	
}


// Assemble, compute memory and save logic to device
function logic_download()
{
	console.log("Saving logic:");
	
	logic_assemble();
		
	store_nodelist();
		
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



// Save bytecode to device
function store_nodelist()
{
	console.log("Saving nodelist ");

	
	var tmp_list = {};
	tmp_list.nodes = [];
	
	// Build temp variable list

	console.log(nodes);
	
	for (var i = 0; i < nodes.length; i++)
	{
		var n = {t:nodes[i].type,
				 x:nodes[i].x,
				 y:nodes[i].y};
							
		if (nodes[i].op1 != -1) n.o1 = nodes[i].op1;
		if (nodes[i].op2 != -1) n.o2 = nodes[i].op2;
							
		tmp_list.nodes[i] = n;
	}
	
	var list_str = JSON.stringify(tmp_list);
	
	console.log("Node list string: " + list_str);

	var XHR = get_request();

    XHR.addEventListener("load", function(event) 
	{
      console.log(event.target.responseText);
    });

    XHR.addEventListener("error", function(event) 
	{
      alert('Unable to save logic to device');
    });

	XHR.open("POST", "/save_variablelist"); 
		
    XHR.send(list_str);
}


function load_nodelist(list)
{
	console.log("Loading nodelist ");
	
	clear_nodes();
	
	//console.log(list);
	
	for (var i = 0; i < list.nodes.length; i++)
	{
		//function add_node(x, y, type, op1, op2)
		
		var n = list.nodes[i];
		
		add_node(n.x, n.y, n.t, n.o1, n.o2);
	}
	
	logic_assemble();	
}



	
	