/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

// Support for variable editor
var vareditor = (function () 
{
	const  MODULE = "VarEditor ";
	var local = main.register_module("vareditor");			
	
	// Public Interface
	local.init = init;
	local.load = load;
	local.unload = unload;
	
	
	local.add_variable = add_variable;				// Add varaible clicked
	local.remove_variable = remove_variable;		// Remove variable clicked

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
		create_variable_table();
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
	function add_variable()
	{
		// Get form values
		var var_name = document.getElementById("var_name").value;	
		var var_type = document.getElementById("var_type").value;	
		var var_value = document.getElementById("var_val").value;	
		
		console.log("Add variable: " + var_name + " " + var_type + " " + var_value);

		// Remove trailing spaces
		// TODO
		
		// Turn spaces into underscores
		var_name = var_name.replace(/ /g, "_");
		
		// Make sure name is valid
		if (checkVariableName(var_name)) return;
			
		// Add to project
		project.add_variable(var_name, var_type);
			
		// Need to recreate variable table
		create_variable_table();	
	}


	// Add variable click
	function remove_variable(index)
	{
		// Remove from project
		project.remove_variable(index);
		
		// Need to recreate variable table
		create_variable_table();
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
		if (v.type == VAR_TYPES.VAR_TMR)
			return  `Val: ${v.value.value}<br>Base: ${v.value.base}<br>Pre:${v.value.pre}<br>Acc:${v.value.acc}`;
		
		return v.value;
	}
	
	
	// Create variable table 
	function create_variable_table()
	{
		// Get temporary variable list sorted by name
		var variable_list = project.get_sorted_variable_list();
		
		var out = "";
		
		out += `<h2>Variables</h2>`;
		out += `<table border=1>`;
		out += `<tr><th>Variable</th><th>Type</th><th>Value</th><th>Index</th><th>Offset</th><th>+/-</th></tr>`;

		for (var i = 0; i < variable_list.variables.length; i++)
		{
			// Pull data to make generation code cleaner
			var v = variable_list.variables[i];
			var type = get_var_type_string(v);
			var value = get_var_val_string(v);
			//var value = cpu.get_byte(v.offset);
			//var value = v.value;
			
			out += `<tr>`;
			out += `<td><b>${v.name}</b></td>`;
			out += `<td><b>${type}</b></td>`;
			out += `<td>${value}</td>`;
			out += `<td>${v.index}</td>`;
			out += `<td>${v.offset}</td>`;
			out += `<td><input type=button class=var_button value='(-)' onclick='vareditor.remove_variable(${v.index});'></td>`;
			out += `</tr>`;
		}

		out += `<tr>`;
		out += `<td><input type=text id=var_name></td>` ;
		out += `<td><select id=var_type>`;
		out += `  <option value='${VAR_TYPES.VAR_BIT}'> Bit </option> \n`;
		out += `  <option value='${VAR_TYPES.VAR_TMR}'> Timer </option> \n`;
		out += `</select></td>`;
		out += `<td><input type=text size=4 id=var_val></td>`;
		out += `<td>&nbsp</td>`;
		out += `<td><input type=button class=var_button value='(+)' onclick='vareditor.add_variable();'></td>`;
		out += `</tr>`;

		out += `</table>`;
		out += `<br><br>`;
		
		
		document.getElementById("variablelist").innerHTML = out;
	}

	return local;
}());




