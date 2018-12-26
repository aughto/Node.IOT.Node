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


// Save bytecode to device
/*function store_bytecode(bytecode)
{
	console.log("Saving bytecode ");
	console.log("Bytecode: " + bytecode);

	var req = get_request();

	
	req.loaded = function(event) 
	{ 
		console.log("store_bytecode: loaded"); 
	};
	
	req.error = function() 
	{ 
		console.log("Unable to save logic to device");	
	};
	


	req.open("POST", "/save_bytecode"); 
		
	req.data = bytecode;
		
    ajax_add_request(req);
	//XHR.send(bytecode);
}*/



// Return a string representing the entire project
function project_get_string()
{
	var p = {}; // Temp project that will contain stripped down node and variable data
	
	p.nodes = project_get_nodes();			// Load nodes
	//project.vars = generate_vardata(); // Load variables
	
	return JSON.stringify(p);
	
}




function save_project()
{
	console.log("Saving project to device");	
	
	// Save project file
	var str = project_get_string();
	//console.log("Project string: " + str);	
	ajax_save_systemfile("logic.txt", "logic", str)
		
	// Save bytecode file
	str = generate_bytecode();
	ajax_save_systemfile("bytecode.txt", "bytecode", str)
	

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
	/*var req = get_request();

	req.overrideMimeType("text/plain");
		
	req.loaded = function(event) 
	{ 
		console.log("load_logic: loaded"); 
		parse_logic(req, event);
	};
	
	req.error = function() 
	{ 
		//console.log("Unable to save logic to device");	
		load_page_error();
	};	
	
	
	req.tag = "Load logic";
	
	req.open("get", "/get_logic"); 
	
	var params = "filetype=logic";

	req.data = params;
	
	ajax_add_request(req);*/
	
	// Request logic system file from device
	// Need to refort callback
	ajax_load_systemfile("logic.txt", "", function (event, req, type) { parse_logic(req, event); } );
	
	
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
		//function add_node(x, y, type, op1, op2)
		
		var n = list.nodes[i];
		
		add_node(n.x, n.y, n.t, n.o1, n.o2);
	}
	
	logic_assemble();	
}



	
	