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
		
	save_project();
	
	
	//store_variablelist();
}




// Return a string representing the entire project
function project_get_string()
{
	var p = {}; // Temp project that will contain stripped down node and variable data
	
	p.nodes = project_get_nodes();			// Load nodes
	//project.vars = generate_vardata(); // Load variables
	
	return JSON.stringify(p);
	
}



// Save project to device
function save_project()
{
	console.log("Saving project to device");	
	
	// Save project file
	var str = project_get_string();
	//console.log("Project string: " + str);	
	ajax.save_systemfile("logic.txt", "logic", str)
		
	// Save bytecode file
	str = generate_bytecode();
	ajax.save_systemfile("bytecode.txt", "bytecode", str)
}





// TODO needs to be moved to project
// Create node list obect
// Only extract needed elements for rebuilding
function project_get_nodes()
{
	var node_list = [];
	
	// node order does not matter
	for (var i = 0; i < nodes.length; i++)
	{
		var n = {t:nodes[i].type, x:nodes[i].x, y:nodes[i].y};
							
		if (nodes[i].op1 != -1) n.o1 = nodes[i].op1;
		if (nodes[i].op2 != -1) n.o2 = nodes[i].op2;
							
		node_list.push(n);
	}
	
	return node_list;
}









// Request config data load
function load_logic()
{
	// Request logic system file from device
	// Need to reformat callback
	ajax.load_systemfile("logic.txt", "", function (event, req, type) { parse_logic(req, event); } );
	
}



// Deal with logic data response from device
function parse_logic(data, evt)
{
	console.log("Parsing Logic file");
	//console.log("Logic: " + data.responseText);

	var nodelist = {};
		
	try
	{
		nodelist = JSON.parse(data.responseText)
	}
	catch(ex)
	{
		console.log("Unable to parse nodelist " + ex );
		return;
	}
	
	load_nodelist(nodelist);			
}


// Load nodelist from JSON data
function load_nodelist(list)
{
	console.log("Loading nodelist ");
	
	clear_nodes();
	
	//console.log(list);
	
	for (var i = 0; i < list.nodes.length; i++)
	{
		var n = list.nodes[i];
		
		add_node(n.x, n.y, n.t, n.o1, n.o2);
	}
	
	logic_assemble();	
}



	
	