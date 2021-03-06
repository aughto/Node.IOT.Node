/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
	
	File: Project.js
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
	var local = main.register_module("project");						

	// Public Interface

	// Standard 
	local.init = init;					// Global init
	local.update = update;
	local.second = second;
	
	// General
	local.save_project = save_project;	// Save project to device
	local.load_project = load_project;	// Save project to device
	
	local.assemble = assemble;			// Assemble project
	
	// Mode Control 
	local.set_online = set_online;
	local.set_offline = set_offline;
	local.get_online = get_online;
	
	// Nodes 
	local.iterate_nodes = iterate_nodes;
	local.get_node = get_node;			// Return node at location
	local.set_node = set_node;
	//local.find_node = find_node;		// Get node list
	local.toggle_node = toggle_node		// Toggle a node

	
	// Variables 
	local.variable_exists = variable_exists;
	local.get_sorted_variable_list = get_sorted_variable_list; // Temporary list for variable editor
	local.get_variable_by_index = get_variable_by_index;
	local.set_variable = set_variable;	// Set variable value by name
	local.set_variable_index = set_variable_index;
	local.remove_variable = remove_variable;	
	local.add_variable = add_variable;
	local.send_setvariable = send_setvariable;
	
	//System
	local.get_system_list = get_system_list; 
	local.remove_system = remove_system
	local.add_system = add_system; 		
	
	// Websockets 
	local.ws_set_command = ws_set_command;
	local.ws_setvar_command = ws_setvar_command;
	local.ws_getvars_command = ws_getvars_command;
	
	// Config 
	local.get_config = get_config
	local.set_config = set_config
	
	// Private variables
	const UPDATE_RATE = 250;	// Update period
	
	const MODE_ONLINE = 1;
	const MODE_OFFLINE = 2;
	
	var variable_list = {variables:[]};  	// Variable name list
	var nodes = [];				// Editor UI nodes
	var cpu_bytecode = "";			// Assembly bytecode
	var inst_list = [];			// Instruction list
	
	var main_config = {};
	var io_config = {};
	var system_list = [];
	
	var logic_mode = MODE_ONLINE;
	
	var getvars_pending = 0;
	var var_updates = 0;	
	var last_update = 0;
	
	// Project Init
	function init()
	{
		console.log(`${MODULE} Init`);

		cpu.set_update_callback(cpu_updated);
		
		load_project();
		
		error();
	}

	// Logic update timer
	function update()
	{
		//console.log(`${MODULE} Var update`);
		
		// Rate limit remote variable update
		if (get_ms() - last_update > UPDATE_RATE)
		{
			if (logic_mode == MODE_ONLINE)
				send_getvars();

			last_update = get_ms();
		}
	}

	// Second timer
	function second()
	{
		console.log("Var update rate: " + var_updates);
			
		var_updates = 0;
		last_update = get_ms();
	}	
	

	/* 
		CPU
	*/
	
	// Called when CPU update completes to map memory values
	function cpu_updated()
	{
		// Do not update variables in online mode
		if (logic_mode == MODE_ONLINE) return;
	
		// Load updated variable data from CPU
		get_variable_values();
	}
	

	/* 
		Project saving 
	*/

	// Save project to device
	function save_project()
	{
//		assemble();		
		
		console.log("Saving project to device");	
		
		// Save project file
		var proj_str = get_project_string();
		console.log("Project string: " + proj_str);	
		ajax.save_systemfile("project.txt", "logic", proj_str)
			
		// Save bytecode file
		//str = generate_bytecode();
		// Save current bytecode to file
		
		var mem_bytecode = generate_variable_bytecode();
		var proj_bytecode = cpu_bytecode + mem_bytecode;
		
		console.log("CPU Bytecode string: " + cpu_bytecode);
		console.log("Mem Bytecode string: " + mem_bytecode);
		
		console.log("Project Bytecode string: " + proj_bytecode);
		
		ajax.save_systemfile("bytecode.txt", "bytecode", proj_bytecode)
		
		var cfg_str = get_config_string();
		console.log("Config string: " + cfg_str);
		ajax.save_systemfile("config.txt", "config", cfg_str)
	}
	
	// Loads current project or test data if no project found 
	function load_project()
	{
		set_offline();
		// Load test data in case load from device fails
		//load_project_object(project_test_data);
		request_load();
	}
	
	// Return a string representing the entire project
	function get_project_string()
	{
		var p = {}; // Temp project that will contain stripped down node and variable data
		
		p.node_data = nodes_get_export_object();			// Load nodes
		p.var_data = variables_get_export_object(); // Load variables
		
		p.io_config = ioconfig_get_export_object();
		p.main_config = mainconfig_get_export_object();
		
		p.systems = systems_get_export_object();
		
		
		p.hmi = hmi.get_export_object();
		
		var tmp = hmi.get_export_object();
		console.log("HMI Data");
		console.log(JSON.stringify(tmp));
		
		return JSON.stringify(p);
	}
	
	/* 
		End of project saving 
	*/
	
	
	
	/* 
		Project Loading 
	*/

	
	function project_loaded_online(data)
	{
		set_online();
		parse_project(data);
	}
	
	function project_loaded_offline(data)
	{
		set_offline();
		parse_project(data);
	}
	
	
	// Unable to load main project, load default project
	function project_load_fail()
	{
		ajax.load_http("files/defaultproject.txt", "", project_loaded_offline, null);	
	}
	

	// Request config data load
	function request_load()
	{
		// Request logic system file from device
		// Need to reformat callback
		ajax.load_systemfile("project.txt", "", project_loaded_online, project_load_fail);
	}


	// Deal with logic data response from device
	function parse_project(data)
	{
		console.log("Parsing Logic file");
		console.log("Logic: " + data);
	
		var p = {};
			
		try
		{
			p = JSON.parse(data)
		}
		catch(ex)
		{
			console.log("Unable to parse nodelist " + ex );
			return;
		}
		
		load_project_object(p);
	}
	
	// Load passed object into current project 
	function load_project_object(p)
	{		
		//console.log("Load project data");
		//console.log(p);
		
		// Clean out project
		nodes = [];
		variable_list = {};
		variable_list.variables = [];	
		
		// Load node list into project
		load_node_list(p.node_data);			
		
		// Load variable list into project
		load_variable_list(p.var_data);
		
		// Copy config data
		main_config = p.main_config;
		io_config = p.io_config;
		
		system_list = p.systems;
		
		hmi.set_import_data(p.hmi);
		
		
		// Reassign variable list
		assign_variable_list();
		
		// Assemble loaded project
		assemble();		
	}
	
	/* 
		End of Project Loading 
	*/


	
	/* 
		Config 
	*/

	
	
	// Converts a flat json object into a string for the config file
	// Each {"key":"value"} json string is store on it's own line
	// This is done to make loading the config on the device less complex
	function get_config_json_string(obj)
	{
		var str = "";
		
		for (var key in obj) 
			str += get_keyvalue_sring(key, obj[key]) + "\n";
		
		return str;
	}
	
	// Return a string representing the device version of the project
	function get_config_string()
	{
		var config_str = "";

		config_str += get_config_json_string(mainconfig_get_export_object());
		config_str += get_config_json_string(ioconfig_get_export_object());
		//config_str += get_config_json_string(systems_get_export_object());
		config_str += systems_get_config_string();
		
		return config_str;
	}	
	
	// Return config object. Used by config editors
	function get_config(config_type)
	{
		if (config_type == "ioconfig") return io_config;
		if (config_type == "mainconfig") return main_config;

		return {};
	}
	
	// Set config object. Used by config editors
	function set_config(config_type, data)
	{
		if (config_type == "ioconfig") io_config = data;
		if (config_type == "mainconfig") main_config = data;
	}
	
	function mainconfig_get_export_object()
	{
		return main_config;
	}
	
	function ioconfig_get_export_object()
	{
		return io_config;
	}

	/* 
		End of Config 
	*/
	
	
	/* 
		Assembly 
	*/
	
	function assemble()
	{
		console.log("Assemble project");
		
		
		
		cpu.set_logic_ok(false);
		
		inst_list = assembler.assemble(nodes, variable_list);
		
		if (inst_list.length == 0)
		{
			error("Unable to assemble project");
			return;
		}
		
		cpu_bytecode = assembler.generate_bytecode(inst_list);

		if (cpu_bytecode.length == 0)
		{
			error("Unable to generate bytecode");
			return;
		}
		
		//console.log("Instruction list");
		//console.log(inst_list);
		
		//console.log("Bytecode");
		//console.log(bytecode);
		
		cpu.load_inst_list(inst_list);
		
		//assembler.show_inst_list(inst_list);
		
		cpu.set_logic_ok(true);
	
		cpu.solve(100);
		
		notice("Project Assembled");
		
		// Need to save project
		//save_project();
		
	}
	
	
	/* 
		End of Assembly 
	*/
	
	
	/* 
		Nodes 
	*/

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
			
	
	
	// Return node index at location
	function find_node(x, y)
	{
		for (var i = 0; i < nodes.length; i++)
			if (nodes[i].x == x && nodes[i].y == y) return i;
			
		return -1;
	}	
	
	// Return node at location
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
	
	// Add new node to node list
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
		project.set_offline();
		
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
	function toggle_node(ix, iy)
	{
		var ni = find_node(ix, iy);
		
		if (ni < 0) return; // Not found
			
		var n = nodes[ni];
		
		if (n.op1 == -1) return; // Does not have an operand

		var v = variable_list.variables[n.op1];
				
	//	console.log("toggle: " + v.offset);
	
		// Only send toggle if live
		if (logic_mode == MODE_ONLINE)
		{	
			if (v.type == VAR_TYPES.VAR_DIN || v.type == VAR_TYPES.VAR_DOUT ||
				v.type == VAR_TYPES.VAR_AIN || v.type == VAR_TYPES.VAR_AOUT)
			{
				error("Cannot toggle IO in online mode");
				return;
			}	
			// Toggle in value in memory list
			v.value = v.value ? 0 : 1;
			
			// Send update to device
			console.log("Send set");
			send_setvariable(v.offset, v.value);
		}
		if (logic_mode == MODE_OFFLINE)
		{
			// Toggle in cpu and variable table for online mode
			v.value = v.value ? 0 : 1;
			
			// Map into cpu
			cpu.set_byte(v.offset, v.value);
			//cpu.toggle_byte(v.offset);
		}
		
		cpu.solve(100);
	}
		
	// Display node list
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

	/* 
		End of nodes 
	*/



	/* 
		Variables 
	*/
	
	// Get variable data
	function variables_get_export_object()
	{
		// Will be moved to project save
		
		//console.log("Saving variablelist ");
		
		var var_data = {vars:[]};
		
		// Build temp variable list
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			var_data.vars[i] = {name:v.name, type:v.type, value:v.value};
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
	
	
		// Load variable ist from JSON data
	function load_variable_list(var_data)
	{
		//console.log("Loading variables ");
		//console.log(var_data);
		
		variable_list = {};
		variable_list.variables = [];
		
		//console.log(list);
		
		for (var i = 0; i < var_data.vars.length; i++)
		{
			var v = {name : var_data.vars[i].name, 
					type : var_data.vars[i].type, 
					value : var_data.vars[i].value};
		
			variable_list.variables.push(v)
		}
	
		console.log("Variable list");
		console.log(variable_list);
	}
	

		
		
	// Find index for variable by name
	function find_variable_index(n)
	{
		//console.log("find_variable_index");
		
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
	}*/
	

	
	// Sort and compute variable offsets
	function assign_variable_list()
	{
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



	// Type and Name compare for variables
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


	/* TODO, Has to be a better way to manage the variables in the list and cpu *.
	
	/* Getting and setting values */
	function generate_variable_bytecode()
	{
		var out = "";
		var offset = 0;

		// Compute memory bytecode from current variable values
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
		
			// Decode type and increment offset
			if (v.type == VAR_TYPES.VAR_DIN)  {out += get_hex8(v.value); offset += VAR_SIZE.VAR_DIN;  } else
			if (v.type == VAR_TYPES.VAR_DOUT) {out += get_hex8(v.value); offset += VAR_SIZE.VAR_DOUT; } else
			if (v.type == VAR_TYPES.VAR_AIN)  {out += get_hex8(v.value); offset += VAR_SIZE.VAR_AIN;  } else
			if (v.type == VAR_TYPES.VAR_AOUT) {out += get_hex8(v.value); offset += VAR_SIZE.VAR_AOUT; } else
			if (v.type == VAR_TYPES.VAR_BIT)  {out += get_hex8(v.value); offset += VAR_SIZE.VAR_BIT;  } else
			if (v.type == VAR_TYPES.VAR_TMR)  
			{
				out += get_hex8(v.value.value);			
				out += get_hex8(v.value.base);			
				out += get_hex16(v.value.pre);			
				out += get_hex16(v.value.acc);		
				offset += VAR_SIZE.VAR_TMR;				
			}
		}
			
		return get_hex32(offset) + out;
	}
		
	
	// Return variable by index
	function get_variable_by_index(index)
	{
		return variable_list.variables[index];
	}
	
	
	
	// Set CPU values from memory_list
	function set_variable_values()
	{
		
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			set_variable_index(v.index, v.value)
		}
		
		//load_test_variables();
	}
		
	/* Get variable values from CPU */	
	function get_variable_values()
	{
		
		// Load new values into memory list
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			v.value = cpu.get_value(v.offset, v.type);
		}		
		
		/*for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			set_variable_index(v.index, v.value)
		}*/
		
		//load_test_variables();
	}
	
	function set_variable_data(data)
	{
		//console.log(data);
		
		// Set variable data into CPU
		
		cpu.set_variable_data(data);
		
		// Local values back variable list
		get_variable_values();
		
		// Extract CPU data into variables
		
		
		/*for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			
			if (v.type == VAR_TYPES.VAR_TMR)
			{
				
				
			}


			v.value = data[v.offset];
		}*/
		
	}	
	
	
	/*function load_cpu_variables()
	{	
		
		// Load new values into memory list
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			v.value = cpu.get_value(v.offset, v.type);
		}
	}*/
	
	
	// Set variable value be name
	function set_variable_index(i, value)
	{
		var v = variable_list.variables[i];
		
		// Determine type
		if (v.type == VAR_TYPES.VAR_DIN)  cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.VAR_DOUT) cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.VAR_AIN)  cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.VAR_AOUT) cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.VAR_BIT)  cpu.set_byte(v.offset, value);
		if (v.type == VAR_TYPES.VAR_TMR) 
		{
			//fields[1] = fields[1].toUpperCase();
			
			cpu.set_timer(v.offset, {value:value.value, base:value.base, pre:value.pre, acc:value.acc});
			
			//if (fields[1] == "ACC") cpu.set_word(v.offset + 2, value); else
			//if (fields[1] == "PRE") { console.log("pre " + v.offset); cpu.set_word(v.offset + 4, value);  }
			
			
		} else
		{
			console.log("Unknown type for set variable " + get_hex(v.type));
			
		}
		
	}
	

	
	
	// Set variable value be name
	function set_variable(name, value)
	{
		console.log("set_variable name: " + name + " value: " + value);
		
		var i = find_variable_index(fields[0]);
		
		if (i == -1)
		{
			console.log(`Unable to find variable for set variable ${name}`);
			return;
		}

		set_variable_index(i, value);
		
	}
	
	
	
	
	/* End of Getting and setting values */

	
	
	// Get temporaty variable list sorted by name for editing
	function get_sorted_variable_list()
	{
		var tmp = {};
		tmp.variables = [];
		
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var v = variable_list.variables[i];
			
			tmp.variables.push({name:v.name, type:v.type, value:v.value, index:v.index, offset:v.offset});
		}

		// sort variable list by name for display
		tmp.variables.sort(variable_compare_name);
	
		return tmp;
	}
	
	// Return true if variable name exists
	//TODO Need to change name to ident_exists
	function variable_exists(name)
	{
		// Check existing names
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			if (variable_list.variables[i].name.toUpperCase() == name.toUpperCase())
				return true;
		}	
		
		for (var i = 0; i < system_list.length; i++)
		{
			if (system_list[i].name.toUpperCase() == name.toUpperCase())
				return true;
		}	
		
		
		return false;
	}
	
	
	// Merge in a new variable
	// Must be able to keep existing links and values
	// Assumes that name is valid
	function add_variable(name, type)
	{
		var v = {};
		
		v.name = name;
		v.type = type;
		v.value = 0;
		
		// Composite types
		if (v.type == VAR_TYPES.VAR_TMR)
		{
			v.value = {value:0, base:0, pre:0, acc:0};
		}
		
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
		
		assemble();		

	}

	
	// Remove variable from list by index	
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
			
		assemble();				
	//	n.op1_index = find_variable_index(n.op1);
		
	}
		

	/* 
		End of Variables 
	*/
	
	
	/* 
		Systems 
	*/
	
	
	
		// Get temporaty variable list sorted by name for editing
	function get_system_list()
	{
		//var tmp = {};
		//tmp.variables = [];
		
		//for (var i = 0; i < variable_list.variables.length; i++)
		//{
//			var v = variable_list.variables[i];
			
			//tmp.variables.push({name:v.name, type:v.type, value:v.value, index:v.index, offset:v.offset});
		//}

		// sort variable list by name for display
		//tmp.variables.sort(variable_compare_name);
	
		return system_list;
	}
	
	
	
	function add_system(name, type, ip)
	{
		var s = {name:name, type:type, ip:ip};
		
		system_list.push(s);
	}
	
	function remove_system(index)
	{
		system_list.splice(index, 1);
		
	}
	
	function systems_get_export_object()
	{
		return system_list;
	}
	

	
	// Return config string for project list
	// This format is used to make loading easier on the device
	function systems_get_config_string()
	{
		var s = "";
		
		// Generic config options up here
		
		// Add the systems
		for (var i = 0; i < system_list.length; i++)
		{
			var o = {};

			o["module"] = "systems";			// Module
			o["cmd"] = "add";					// Add System
			o["name"] = system_list[i].name;	// System name
			o["ip"] = system_list[i].ip;		// System IP
			
			s += JSON.stringify(o) + "\n";
		}

		return s;
	}
	
	
	/* 
		End of Systems 
	*/

	
	
	
	/* 
		Websockets 
	*/
	
	
	function send_getvars()
	{
		if (getvars_pending > 0) 
		{
			//notice("Device responding slowly");
			return;
		}
		
		getvars_pending++;

		websocket.send_command("getvars");

		
	}
	
	// Websocket set var command
	function send_setvariable(index, value)
	{
		console.log("Send set: " + index + " " + value);
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
		
		
		liveview.update_value(message.item, message.value);
	}
	
	


// Parse MQTT message
	function ws_getvars_command(message)
	{
		getvars_pending--;
		
		
		//console.log("getvars command " + message.data);
		//console.log(message.data);
		
		var data = hex_string_to_array(message.data);
		
		
		
		set_variable_data(data);
		
		

		
		/*if (message.item == "Input1") variable_update(0, message.value);
		if (message.item == "Input2") variable_update(1, message.value);
		if (message.item == "Input3") variable_update(2, message.value);
		if (message.item == "Input4") variable_update(3, message.value);
	
		if (message.item == "Output1") variable_update(4, message.value);
		if (message.item == "Output2") variable_update(5, message.value);
		if (message.item == "Output3") variable_update(6, message.value);
		if (message.item == "Output4") variable_update(7, message.value);*/
		
		
		//liveview.update_value(message.item, message.value);
		
		var_updates++;
	}
		
	/* 
		End of Websockets 
	*/

	
	
	/* 
		Logic mode control 
	*/
	
	// Set online mode
	function set_online()
	{
		mode("<font color=green>Online</font>");
		logic_mode = MODE_ONLINE;
						
		getvars_pending = 0; // Clear pending
	}
	
	// Set offline mode
	function set_offline()
	{
		mode("Offline");
		logic_mode = MODE_OFFLINE;
	}
	
	// Return true if online
	function get_online()
	{
		return logic_mode == MODE_ONLINE;
	}
	
	/* 
		End of Logic mode control 
	*/
	
	return local;
}());

	