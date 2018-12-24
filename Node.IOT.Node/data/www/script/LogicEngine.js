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
	
	//store_variablelist();
}


// Save bytecode to device
function store_bytecode(bytecode)
{
	console.log("Saving bytecode ");
	console.log("Bytecode: " + bytecode);

	var XHR = get_request();

    XHR.addEventListener("load", function(event) 
	{
      console.log("Save Bytecode: " + event.target.responseText);
    });

    XHR.addEventListener("error", function(event) 
	{
      alert('Unable to save logic to device');
    });

	XHR.open("POST", "/save_bytecode"); 
		
    XHR.send(bytecode);
}



// Create JSON string from node list
// Only extract needed elements for rebuilding
function get_nodelist_str()
{
	var tmp_list = {nodes:[]};
	
	for (var i = 0; i < nodes.length; i++)
	{
		var n = {t:nodes[i].type, x:nodes[i].x, y:nodes[i].y};
							
		if (nodes[i].op1 != -1) n.o1 = nodes[i].op1;
		if (nodes[i].op2 != -1) n.o2 = nodes[i].op2;
							
		tmp_list.nodes.push(n);
	}
	
	return JSON.stringify(tmp_list);
}


// Save bytecode to device
function store_nodelist()
{
	console.log("Saving nodelist ");
	
	// Build temp variable list

	var list_str = get_nodelist_str();
	
	if (list_str == "")
	{
		console.log("Unable to generate node list string");
		return;

	}

	
	console.log("Node list string: " + list_str);

	var XHR = get_request();

    XHR.addEventListener("load", function(event) 
	{
      console.log("Save logic: " + event.target.responseText);
    });

    XHR.addEventListener("error", function(event) 
	{
      alert('Unable to save logic to device');
    });

	XHR.open("POST", "/save_systemfile"); 
		
		
	XHR.setRequestHeader("FileType", "logic");		
	XHR.setRequestHeader("FileName", "/logic.txt");		
		
		
    XHR.send(list_str);
}






// Request config data load
function load_logic()
{
	var req = get_request();

	req.overrideMimeType("text/plain");
	
	req.addEventListener("load", function (evt) {parse_logic(req, evt);});
	
	req.addEventListener("error", load_page_error, false); 
	
	req.open("get", "/get_logic"); 
	
	
	var params = "filetype=logic";
	
	req.send(params);
}



// Deal with logic data response from device
function parse_logic(data, evt)
{
	console.log("Parsing Logic file");
	console.log("Logic: " + data.responseText);

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



	
	