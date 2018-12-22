/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

				   
/*function add_device()
{
	
	io_list.num_remotedevice++;
	load_variables()
}
				   
				   
function remove_device(i)
{
	
	//io_list.
	
	
	io_list.num_remotedevice--;
	
	
	load_variables();
}
	

function generate_iolist()
{


	
}*/


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
		
	// Check existing names
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		if (variable_list.variables[i].name.toUpperCase() == name.toUpperCase())
		{
			alert("Variable name already exists");
			return true;
		}
	}
	
	return false;
}


function remove_variable(index)
{
	
	// need to null all node refernces
	
	
	//var index = find_variable_index(offset);
	
	
	
	
	var v = variable_list.variables[index];
	
	if (v.type == VAR_TYPES.VAR_DIN ||
		v.type == VAR_TYPES.VAR_DOUT ||
		v.type == VAR_TYPES.VAR_AIN ||
		v.type == VAR_TYPES.VAR_AOUT)
	{
		alert("Cannot delete IO");
		return;	
	}
	

	cpu_remove_variable(index);
	logic_remove_variable(index);
		
	
	load_variables();	
	
}



function add_variable()
{
	var var_name= document.getElementById("var_name").value;	
	var var_type = document.getElementById("var_type").value;	
	var var_value = document.getElementById("var_val").value;	
	
	console.log("Add variable: " + var_name + " " + var_type + " " + var_value);

	// Remove trailing spaces
	
	// Turn spaces into underscores
	var_name = var_name.replace(/ /g, "_");
	
	
	if (checkVariableName(var_name)) return;

		
	logic_add_variable(var_name, var_type);
		
	load_variables();	
}





function load_variables()
{
	
	// sort variable list by name for display
	variable_list.variables.sort(variable_compare_name);
	
	
	var out = "";

	
	out += "<h2>Variables</h2>";

	
	
	
	//variable_list
	
	
	out += "<table border=1>";
	out += "<tr><th>Variable</th><th>Type</th><th>Value</th><th>Index</th><th>Offset</th><th>+/-</th></tr>";

	for (var i = 0; i < variable_list.variables.length; i++)
	{
		out += "<tr>";
		
		out += "<td> <b>" + variable_list.variables[i].name + "</b></td>";
		out += "<td> <b>" + get_var_type_string(variable_list.variables[i]) + "</b></td>";
		
		out += "<td>x</td>";

		out += "<td>"+variable_list.variables[i].index+"</td>";
		out += "<td>"+variable_list.variables[i].offset+"</td>";
		
		var index = variable_list.variables[i].index;
		
		out += "<td><input type=button class=var_button value='(-)' onclick='remove_variable("+index+");'></td>";
		
		out += "</tr>";
	}

	out += "<tr>";

	out += "<td><input type=text id=var_name></td> ";

	out += "<td><select id=var_type>";
		
	out += "<option value='" + VAR_TYPES.VAR_BIT + "'> Bit </option> \n";
	out += "<option value='" + VAR_TYPES.VAR_TMR + "'> Timer </option> \n";
	
	out += "</select></td>";
	
	out += "<td><input type=text size=4  id=var_val></td> ";
	out += "<td>&nbsp</td> ";
	
	
	out += "<td><input type=button class=var_button value='(+)' onclick='add_variable();'></td>";
	
	out += "</tr>";

	out += "</table>";
	
	var  a= document.getElementById("variablelist");
	a.innerHTML = out;
	
		// sort variable list by type for system use
	variable_list.variables.sort(variable_compare_type);
}

