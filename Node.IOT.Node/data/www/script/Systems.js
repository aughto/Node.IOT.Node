/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

// Support for systems 
var systems = (function () 
{
	const  MODULE = "Systems   ";
	
	var local = main.register_module("systems");			
	
	// Public Interface
	local.init = init;
	local.load = load;
	local.unload = unload;
		
	local.add_system = add_system;				// Add system clicked
	local.remove_system = remove_system;		// Remove system clicked

	// Private variables

	
	// Called on startup
	function init()
	{
		console.log(`${MODULE} Init`);
		ajax.add_target("variables", load);
	}

	// Called when variable editor is clicked
	function load()
	{
		console.log(`${MODULE} Load`);	

		show_module(local.name);
		create_system_table();
		
	}
		
	// Called when to hide
	function unload()
	{
		console.log(`${MODULE} Unload`);	

		hide_module(local.name);
	}		
	
	/* 
		Add / Delete 
	*/

	// Check is char is a numerical digit 
	function isValidNum(c) { return c >= '0' && c <= '9' }

	// Check is char is valid alphanumeric value
	function isValidAlpha(c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') }

	// Check is charchar is valid symbol
	function isValidSymbol(c) { return c == '_' }


	// Check name for valid format. Fails if name invalid
	// Ignores case for check but case conserved
	// Valid format
	// is_valid(n) = n[0] in (['a'..'z'] || ['A'..'Z'] || '_') and n[1..N-1] in (['a'..'z'] || ['A'..'Z'] || ['0'..'9'] || '_')
	function checkVariableName(name)
	{
		console.log("name (" + name + ") " + "  len: " + name.length);

		// Need a name
		if (name == "")
		{	
			alert("No name supplied");
			return true;
		}

		// Make sure first char is not a number
		if (isValidNum(name[0]))
		{
			alert("First letter of variable cannot be a number (" +name[0] + ")");
		
			return true;
		}

		// Make sure all chars in name are valid
		for (var i = 0; i < name.length; i++)
		{
			if (!isValidAlpha(name[i]) && !isValidNum(name[i]) && !isValidSymbol(name[i]))
			{
				alert("Invalid character in name (" + name[i] + ")");
				return true;
			}
		}
		
		if (project.variable_exists(name))
		{
			alert("Variable name already exists");
			return true;
			
		}
		
		return false;
	}


	// Add variable click
	function add_system()
	{
		// Need to go offline if change was made
		//project.set_offline();

		// Get form values
		var sys_name = document.getElementById("sys_name").value;	
		var sys_type = document.getElementById("sys_type").value;	
		var sys_ip = document.getElementById("sys_ip").value;	
		
		//var var_value = document.getElementById("var_val").value;	
		
		//console.log("Add variable: " + var_name + " " + var_type + " " + var_value);

		// Remove trailing spaces
		// TODO
		
		// Turn spaces into underscores
		sys_name = sys_name.replace(/ /g, "_");
		
		// Make sure name is valid
		if (checkVariableName(sys_name)) return;
			
		// Add to project
		project.add_system(sys_name, sys_type, sys_ip);
			
		// Need to recreate variable table
		create_system_table();	
	}


	// Add variable click
	function remove_system(index)
	{
		// Need to go offline if change was made
		//project.set_offline();
			
		// Remove from project
		//project.remove_variable(index);
		
		// Need to recreate variable table
		//create_variable_table();
		
		project.remove_system(index);
		
		create_system_table();	
				
	}


	/* 
		End of Add / Delete 
	*/

	/* 
		Display 
	*/
	
	// Convert variable type into string
	function get_var_type_string(v)
	{
		if (v.type == VAR_TYPES.VAR_DIN)  return "Digial Input";
		if (v.type == VAR_TYPES.VAR_DOUT) return "Digial Output";
		if (v.type == VAR_TYPES.VAR_AIN)  return "Analog Input";
		if (v.type == VAR_TYPES.VAR_AOUT) return "Analog Output";		
		if (v.type == VAR_TYPES.VAR_BIT) return "Bit";
		if (v.type == VAR_TYPES.VAR_TMR) return "Timer";
		
		return "x";	
	}

	// Convert variable type into string
	function get_var_val_string(v)
	{
		//if (v.type == VAR_TYPES.VAR_TMR)
		//	return  `Val: ${v.value.value}<br>Base: ${v.value.base}<br>Pre:${v.value.pre}<br>Acc:${v.value.acc}`;
		
		//return v.value;
	}
	
	
	// Create variable table 
	function create_system_table()
	{
		// Get temporary variable list sorted by name
		var system_list = project.get_system_list();
		
		var out = "";
		
		out += `<h2>Systems</h2>`;
		out += `<table border=1>`;
		out += `<tr><th>Name</th><th>IP</th><th>Type</th><th>+/-</th></tr>`;

		for (var i = 0; i < system_list.length; i++)
		{
			// Pull data to make generation code cleaner
			var s = system_list[i];
			var type = "x";//get_var_type_string(v);
			//var value = get_var_val_string(v);
			//var value = cpu.get_byte(v.offset);
			//var value = v.value;
			
			out += `<tr>`;
			out += `<td><b>${s.name}</b></td>`;
			out += `<td><b>${s.ip}</b></td>`;			
			out += `<td><b>${type}</b></td>`;
			//out += `<td>${value}</td>`;
			//out += `<td>${v.index}</td>`;
			//out += `<td>${v.offset}</td>`;
			out += `<td><input type=button class=var_button value='(-)' onclick='systems.remove_system(${i});'></td>`;
			out += `</tr>`;
		}

		out += `<tr>`;
		out += `<td><input type=text id=sys_name></td>` ;
		out += `<td><input type=text size=16 id=sys_ip></td>`;
		
		out += `<td><select id=sys_type>`;
		out += `  <option value='0'> Node.IOT </option> \n`;
		out += `</select></td>`;
		
		//out += `<td>&nbsp</td>`;
		out += `<td><input type=button class=var_button value='(+)' onclick='systems.add_system();'></td>`;
		out += `</tr>`;

		out += `</table>`;
		out += `<br><br>`;
		
		
		document.getElementById("systemlist").innerHTML = out;
	}

	return local;
}());




