/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


/* 
	Project 
*/




// Global current project container
// The project owns all of the node, gui element and config data 
var project = (function () 
{
	const MODULE = "Project   ";		
	var local = {};						

	// Public Interface

	/* General */
	local.init = init;					// Global init
	local.save_project = save_project;	// Save project to device
	local.assemble = assemble;			// Assemble project
	
	/* Mode Control */
	local.set_online = set_online;
	local.set_offline = set_offline;
	local.get_online = get_online;
	
	/* Nodes */
	local.iterate_nodes = iterate_nodes;
	local.get_node = get_node;			// Return node at location
	local.set_node = set_node;
	//local.find_node = find_node;		// Get node list
	local.toggle_node = toggle_node		// Toggle a node

	/* Variables */
	local.variable_exists = variable_exists;
	local.get_sorted_variable_list = get_sorted_variable_list; // Temporary list for variable editor
	local.get_variable_by_index = get_variable_by_index;
	local.set_variable = set_variable;	// Set variable value by name

	local.remove_variable = remove_variable;
	local.add_variable = add_variable;
	
	local.ws_set_command = ws_set_command;
	local.ws_setvar_command = ws_setvar_command;
	
	
	// Private variables
	
	const MODE_ONLINE = 1;
	const MODE_OFFLINE = 2;

	var variable_list = {};  	// Variable name list
	var nodes = [];				// Editor UI nodes
	var bytecode = "";			// Assembly bytecode
	var inst_list = [];			// Instruction list
	
	var logic_mode = MODE_ONLINE;
	

	
	// Project Init
	function init()
	{
		console.log("Logic init");

		cpu.init();

		// Load test data in case load from device fails
		load_project_object(project_test_data);
		
		test_set_variables();
		
		
		request_load();
	}


	/* 
		Project saving 
	*/



	// Save project to device
	function save_project()
	{
		assemble();		
		
		console.log("Saving project to device");	
		
		// Save project file
		var str = get_project_string();
		console.log("Project string: " + str);	
		ajax.save_systemfile("project.txt", "logic", str)
			
		// Save bytecode file
		//str = generate_bytecode();
		// Save current bytecode to file
		console.log("Bytecode string: " + bytecode);
		ajax.save_systemfile("bytecode.txt", "bytecode", bytecode)
	}
	
	
	// Return a string representing the entire project
	function get_project_string()
	{
		var p = {}; // Temp project that will contain stripped down node and variable data
		
		p.node_data = nodes_get_export_object();			// Load nodes
		p.var_data = variables_get_export_object(); // Load variables
		
		return JSON.stringify(p);
		
	}
	
	
	
	// TODO needs to be moved to project
	// Create node list obect
	// Only extract needed elements for rebuilding
	function nodes_get_export_object()
	{
		var node_data = {nodes:[]};
		
		// node order does not matter
		for (var i = 0; i < nodes.length; i++)
		{
			var n = {t:nodes[i].type, x:nodes[i].x, y:nodes[i].y};
								
			if (nodes[i].op1 != -1) n.o1 = nodes[i].op1;
			if (nodes[i].op2 != -1) n.o2 = nodes[i].op2;
								
			node_data.nodes.push(n);
		}
		
		return node_data;
	}
	
	/* 
		End of project saving 
	*/
	
	
	
	/* 
		Project Loading 
	*/


	// Request config data load
	function request_load()
	{
		// Request logic system file from device
		// Need to reformat callback
		ajax.load_systemfile("project.txt", "", function (event, req, type) { parse_project(req, event); } );
	}


	// Deal with logic data response from device
	function parse_project(data, evt)
	{
		console.log("Parsing Logic file");
		console.log("Logic: " + data.responseText);
	
		var p = {};
			
		try
		{
			p = JSON.parse(data.responseText)
		}
		catch(ex)
		{
			console.log("Unable to parse nodelist " + ex );
			return;
		}
		
		
		load_project_object(p);
	}
	
	
	function load_project_object(p)
	{
		
		console.log("Load project data");
		console.log(p);
		
		
		// Clean out project
		nodes = [];
		variable_list = {};
		variable_list.variables = [];	
		
		load_node_list(p.node_data);			
		load_variable_list(p.var_data);
		
		assign_variable_list();
		assemble();		
	}
	
	
	
	// Load nodelist from JSON data
	function load_node_list(node_data)
	{
		console.log("Loading nodelist ");
		
		nodes = [];
		
		//console.log(list);
		
		for (var i = 0; i < node_data.nodes.length; i++)
		{
			var n = node_data.nodes[i];
			
			add_node(n.x, n.y, n.t, n.o1, n.o2);
		}
	}
	
	
	// Load variable ist from JSON data
	function load_variable_list(var_data)
	{
		console.log("Loading variables ");
		console.log(var_data);
		
		variable_list = {};
		variable_list.variables = [];
		
		//console.log(list);
		
		for (var i = 0; i < var_data.vars.length; i++)
		{
			var v = {name : var_data.vars[i].name, 
					type : var_data.vars[i].type};
		
			variable_list.variables.push(v)
		}
	
		console.log("Variable list");
		console.log(variable_list);
	}
	
	/* 
		End of Project Loading 
	*/
	
	
	/* Assembly */
	
	function assemble()
	{
		console.log("Assemble project");
		
		cpu.set_logic_ok(false);

		
		inst_list = assembler.assemble(nodes, variable_list);
		
		bytecode = assembler.generate_bytecode(inst_list);
		
		console.log("Instruction list");
		console.log(inst_list);
		
		console.log("Bytecode");
		console.log(bytecode);
		
		cpu.load_inst_list(inst_list);
		
		assembler.show_inst_list(inst_list);
		
		cpu.set_logic_ok(true);
	
		cpu.solve(100);
		
	}
	
	
	
	/* Nodes */
	
	function find_node(x, y)
	{
		for (var i = 0; i < nodes.length; i++)
			if (nodes[i].x == x && nodes[i].y == y) return i;
			
		return -1;
	}	
	
	function get_node(x, y)
	{
		for (var i = 0; i < nodes.length; i++)
			if (nodes[i].x == x && nodes[i].y == y) return nodes[i];
			
		return null;
	}	
		
		
	// Preform operaton over nodes
	function iterate_nodes(callback)
	{
		for	(var i = 0; i < nodes.length; i++)
			callback(nodes[i], i);
	}	
		
		
		
	
		
	function add_node(x, y, type, op1, op2)
	{
		if (op1 == undefined) op1 = -1;
		if (op2 == undefined) op2 = -1;
		
		var n = create_node(x, y, type, op1, op2);
		nodes.push(n);
		
		return nodes.length - 1;		
	}


	// Set node symbol at location
	function set_node(x, y, s)
	{
		// Get node index for location
		var ni = find_node(x, y);
		
		// Delete whatever is there, if anything
		if (ni != -1) nodes.splice(ni, 1);

		// Just return if we are deleting a node
		if (s == SYM.NONE) return;
		
		// Create new node at location
		add_node(x, y, s, 0);
	}



	// Toggle node value
	// Should this be in logic?
	function toggle_node(ix, iy)
	{
		var ni = find_node(ix, iy);
		
		if (ni < 0) return;
			
		var n = nodes[ni];
		
		if (n.op1 == -1) return;

		//var f = variable_find(n.op1);
			
		//if (f == -1) return;

		//variable_table[f].value = variable_table[f].value == 0 ? 1 : 0;
		
		cpu.toggle_byte(n.op1);
		
		
		// Only send toggle if live
		if (logic_mode == MODE_ONLINE)
		{	
			var v = cpu.get_byte(n.op1);
			
			send_setvariable(n.op1, v);
		}
			
		//variables[n.op1] = variables[n.op1]  == 0 ? 1 : 0;
		
		
		cpu.solve(100);
	}
		



		

	function show_node_list(nodes)
	{
		for(var i = 0; i < nodes.length; i++)
		{
			var n = nodes[i];
			
			var s = "";
			s += "N " + i + " " + n.type_text + " (" + n.x + "," + n.y + ") ";
			
			s += "Next: " + nodes[i].next + " " ;
			
			if (nodes[i].branch != -1)
				s += "Branch: " + nodes[i].branch + " " ;

			if (nodes[i].branch != -1)
				s += "Type: " + nodes[i].branch_type + " " ;
			
			if (nodes[i].prev != -1)
				s += "Prev: " + nodes[i].prev + " " ;
			
			s += "Op1: " + nodes[i].op1 + " " ;
				//s += "Op1_index: " + nodes[i].op1_index + " " ;
			
			console.log(s);
		}
		
		console.log(nodes);
	}







/* End of nodes */
	
	
	
	
	
	
	/* Websockets updates */
	function send_setvariable(index, value)
	{
		websocket.send_command("setvar", index, value);
	}


	// Parse MQTT message
	function ws_set_command(message)
	{
		console.log("Set command " + message.item + " " +message.value);
	
		
		if (message.item == "Input1") cpu.variable_update(0, message.value);
		if (message.item == "Input2") cpu.variable_update(1, message.value);
		if (message.item == "Input3") cpu.variable_update(2, message.value);
		if (message.item == "Input4") cpu.variable_update(3, message.value);
	
		if (message.item == "Output1") cpu.variable_update(4, message.value);
		if (message.item == "Output2") cpu.variable_update(5, message.value);
		if (message.item == "Output3") cpu.variable_update(6, message.value);
		if (message.item == "Output4") cpu.variable_update(7, message.value);
		
		
		liveview.update_value(message.item, message.value);
	}
	
	// Parse MQTT message
	function ws_setvar_command(message)
	{
		console.log("Setvar command " + message.item + " " + message.value);
	
		
		/*if (message.item == "Input1") variable_update(0, message.value);
		if (message.item == "Input2") variable_update(1, message.value);
		if (message.item == "Input3") variable_update(2, message.value);
		if (message.item == "Input4") variable_update(3, message.value);
	
		if (message.item == "Output1") variable_update(4, message.value);
		if (message.item == "Output2") variable_update(5, message.value);
		if (message.item == "Output3") variable_update(6, message.value);
		if (message.item == "Output4") variable_update(7, message.value);*/
		
		
		update_value(message.item, message.value);
	}
	




	/* Variables */
	
	
	
	

		
		
	// Find index for variable by name
	function find_variable_index(n)
	{
		console.log("find_variable_index");
		
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			if (variable_list.variables[i].name == n)
				return i;
			
		}
			
		return -1;
	}		
			
			
			

	// Find index of variable by offset
	// used for node linking		
	/*function find_variable_index(offset)
	{
		
		// Compute memory offsets
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			
			if (variable_list.variables[i].offset == offset) return i;
		}
		
		return -1;
	}
	*/









	function assign_variable_list()
	{
	// Variables are sorted by type and then by name to assign index


		console.log("Assign variable table");

		// Sort variable list by type to assign offsets correctly
		variable_list.variables.sort(variable_compare_type);
		
		
		variable_list.num_din = 0;
		variable_list.num_dout = 0;
		variable_list.num_ain = 0;
		variable_list.num_aout = 0;
		variable_list.num_bit = 0;
		variable_list.num_tmr = 0;
		
		var offset = 0;
		// Compute memory offsets
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];

			v.index = i; // Save index for when list is sorted for viewing
			v.offset = offset;
			
			// Decode type and increment offset
			if (v.type == VAR_TYPES.VAR_DIN)  {variable_list.num_din++;  offset += VAR_SIZE.VAR_DIN;  } else
			if (v.type == VAR_TYPES.VAR_DOUT) {variable_list.num_dout++; offset += VAR_SIZE.VAR_DOUT; } else
			if (v.type == VAR_TYPES.VAR_AIN)  {variable_list.num_ain++;  offset += VAR_SIZE.VAR_AIN;  } else
			if (v.type == VAR_TYPES.VAR_AOUT) {variable_list.num_aout++; offset += VAR_SIZE.VAR_AOUT; } else
			if (v.type == VAR_TYPES.VAR_BIT)  {variable_list.num_bit++;  offset += VAR_SIZE.VAR_BIT;  } else
			if (v.type == VAR_TYPES.VAR_TMR)  {variable_list.num_tmr++;  offset += VAR_SIZE.VAR_TMR;  } else
			{
				console.log(`Unknown variable type: ${v.type}`);
				//return;
			}
		}
		
		variable_list.mem_size = offset;
		
		
		cpu.resize_variable_data(variable_list.mem_size);
		

		
		
		//console.log(nodes);

		set_variable_values();
	}



	// Name compare for variables
	function variable_compare_type(a,b) 
	{
		// Sory by type first
		if (a.type < b.type) return -1;
		if (a.type > b.type) return 1;
		
		// Then sort by name	
		if (a.name.toUpperCase() < b.name.toUpperCase() )    return -1;
		if (a.name.toUpperCase() > b.name.toUpperCase() )    return 1;
		return 0;
	}

	// Name compare for variables
	function variable_compare_name(a,b) 
	{
		//  sort by name	
		if (a.name.toUpperCase() < b.name.toUpperCase() )    return -1;
		if (a.name.toUpperCase() > b.name.toUpperCase() )    return 1;
		return 0;
	}



	// Save bytecode to device
	function variables_get_export_object()
	{
		// Will be moved to project save
		
		//console.log("Saving variablelist ");
		
		var var_data = {vars:[]};
		
		// Build temp variable list
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var_data.vars[i] = {name:variable_list.variables[i].name, type:variable_list.variables[i].type};
		}
		
		var_data.config = {};
		var_data.num_din = variable_list.num_din;
		var_data.num_dout = variable_list.num_dout;
		var_data.num_ain = variable_list.num_ain;
		var_data.num_aout = variable_list.num_aout;
		var_data.num_bit = variable_list.num_bit;
		var_data.num_tmr = variable_list.num_tmr;
		
		return var_data;
	}



	function set_variable_values()
	{
		//load_test_variables();
	}
		
		/* End of Variables */
		

	
	
	function get_variable_by_index(index)
	{
		return variable_list.variables[index];
	}
	
	
	
	
	
	
	
	
	// Set variable value be name
	function set_variable(name, value)
	{
		console.log("set_variable");
		console.log(variable_list);
		
//		name = "bit1";
		
		var fields = name.split("."); // Split into fields for variable options
		
		var i = find_variable_index(fields[0]);
		
		if (i == -1)
		{
			console.log(`Unable to find variable for set variable ${name}`);
			return;
		}

		var v = variable_list.variables[i];
		
		// Determine type
		if (v.type == VAR_TYPES.DIN) cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.DOUT) cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.AIN) cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.AOUT) cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.BIT) cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.TMR) 
		{
			fields[1] = fields[1].toUpperCase();
			
			if (fields[1] == "ACC") cpu.set_word(v.offset + 2, value); else
			if (fields[1] == "PRE") cpu.set_word(v.offset + 4, value); 
			
			
		} else
		{
			console.log("Unknown type for set variable");
			
		}

		
		
	}
	
	
	
	function get_variable_list()
	{
		return variable_list;
	}
	
	
	function get_sorted_variable_list()
	{
		var tmp = {};
		tmp.variables = [];
		
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			
			tmp.variables.push({name:v.name, type:v.type, index:v.index, offset:v.offset});
		}

		// sort variable list by name for display
		tmp.variables.sort(variable_compare_name);
	
		return tmp;
	}
	
	
	function variable_exists(name)
	{
		// Check existing names
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			if (variable_list.variables[i].name.toUpperCase() == name.toUpperCase())
				return true;
		}	
		return false;
	}
	
	
	// Merge in a new variable
	// Must be able to keep existing links and values
	function add_variable(name, type)
	{
		var v = {};
		
		v.name = name;
		v.type = type;
			
		
		// Find splice point
		
		var splice = 0;
		
		for (var i = 0; i < variable_list.variables.length && splice==0; i++)
		{

			if (variable_compare_type(v, variable_list.variables[i]) < 0)
			{
				splice = i;
			}
		}
			
		console.log("Splice: " + splice);
			
			
		// adjust all indexes after splice
		
		for (var i = 0; i < nodes.length; i++)
		{
			
			if (nodes[i].op1 >= splice)
				nodes[i].op1 += 1;
			
		}
					
			
		variable_list.variables.splice(splice, 0, v);
			
			

		assign_variable_list();
		
		project.assemble();		

	}

		
	function remove_variable(index)
	{
		
			
		var v = variable_list.variables[index];
		
		if (v.type == VAR_TYPES.VAR_DIN ||
			v.type == VAR_TYPES.VAR_DOUT ||
			v.type == VAR_TYPES.VAR_AIN ||
			v.type == VAR_TYPES.VAR_AOUT)
		{
			alert("Cannot delete IO");
			return;	
		}
		
		
		variable_list.variables.splice(index, 1);
		
		assign_variable_list();
		
		
		
		for (var i = 0; i < nodes.length; i++)
		{
			if (nodes[i].op1 == index)
			{
				
				nodes[i].op1 = -1;
				
			}else
			// reassign variable indexes to account for missing variable
			if (nodes[i].op1 > index)
				nodes[i].op1--;
			
		}
			
		project.assemble();				
	//	n.op1_index = find_variable_index(n.op1);
		
		
		
	}
		
		
		
	
	
	
	
	
	
	
		/*
	// Load some timer data
	var i = find_variable_index("Tmr_1")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_2")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_3")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_4")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_5")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );
	
	
	*/
	
	
	
	
	/* Logic mode control */
	
	function set_online()
	{
		
		logic_mode = MODE_ONLINE;
	}
	
	function set_offline()
	{
		
		logic_mode = MODE_OFFLINE;
	}
	
	function get_online()
	{
		
		return logic_mode == MODE_ONLINE;
	}
	

	
	
	
	
	
	
	

	return local;
}());

	