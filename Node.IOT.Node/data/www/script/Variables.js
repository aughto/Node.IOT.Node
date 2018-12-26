/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";



/* memory */

var variable_list = {};  // Variable name list




function send_setvariable(index, value)
{
	websocket.send_command("setvar", index, value);
}


// Parse MQTT message
function set_command(message)
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
	
	
	update_value(message.item, message.value);
}

// Parse MQTT message
function setvar_command(message)
{
	console.log("Setvar command " + message.item + " " +message.value);

	
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





// Merge in a new variable
// Must be able to keep existing links and values
function logic_add_variable(name, type)
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
	logic_assemble();

}

	
function logic_remove_variable(index)
{
	
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
		
	logic_assemble();		
//	n.op1_index = find_variable_index(n.op1);
	
	
	
}
	
	
function cpu_remove_variable(index)
{
	
	variable_list.variables.splice(index, 1);
	
	assign_variable_list();
	
	
}
	
	

// Find offset for variable by index
function find_variable_offset(index)
{
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		if (variable_list.variables[i].index == index)
			return variable_list.variables[i].offset;
		
	}
		
	return -1;
}
		
		
// Find index for variable by name
function find_variable_index(n)
{
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
		variable_list.variables[i].index = i; // Save index for when list is sorted for viewing
		variable_list.variables[i].offset = offset;
		
		if (variable_list.variables[i].type == VAR_TYPES.VAR_DIN)  {variable_list.num_din++; offset += VAR_SIZE.VAR_DIN; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_DOUT) {variable_list.num_dout++; offset += VAR_SIZE.VAR_DOUT; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_AIN)  {variable_list.num_ain++; offset += VAR_SIZE.VAR_AIN; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_AOUT) {variable_list.num_aout++; offset += VAR_SIZE.VAR_AOUT; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_BIT)  {variable_list.num_bit++; offset += VAR_SIZE.VAR_BIT; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_TMR)  {variable_list.num_tmr++; offset += VAR_SIZE.VAR_TMR; } 
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
function store_variablelist()
{
	// Will be moved to project save
	
	/*
	
	console.log("Saving variablelist ");
	
	var tmp_list = {};
	tmp_list.vars = [];
	
	// Build temp variable list
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		tmp_list.vars[i] = {name:variable_list.variables[i].name, type:variable_list.variables[i].type};
	}
	
	tmp_list.config = {};
	tmp_list.config.num_din = variable_list.num_din;
	tmp_list.config.num_dout = variable_list.num_dout;
	tmp_list.config.num_ain = variable_list.num_ain;
	tmp_list.config.num_aout = variable_list.num_aout;
	tmp_list.config.num_bit = variable_list.num_bit;
	tmp_list.config.num_tmr = variable_list.num_tmr;
	
	var variable_list_str = JSON.stringify(tmp_list);
	
	console.log("Variable list string: " + variable_list_str);

	var req = ajax.get_request();

	
	req.loaded = function() { console.log("store_variablelist: Saved"); };
	
	req.error = function() { console.log("store_variablelist: Error"); };
	

	req.open("POST", "/save_variablelist"); 
		
	req.data = variable_list_str;
	ajax_add_request(req);
	//XHR.send(variable_list_str);
	*/
	
}



function set_variable_values()
{
	load_test_variables();
}

	
/* End of memory */
	
	
	
	

	
	