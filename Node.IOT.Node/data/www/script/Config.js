/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


/* 
	Config 
*/


// Config manager
var config = (function () 
{
	const MODULE = "Config    ";
	var local = {};				

	// Public Interface
	local.init = init;
	local.save_click = save_click;
	local.load_config = load_config;
	
	// Private variables	

	// Parameters types
	var PARAM_TYPE = {NAME:1, INT:2, IP:3, HOST:4};

	function init()
	{
		console.log(`${MODULE} Init`);
		
		//ajax.add_target("mainconfig", load_main);	
		//ajax.add_target("ioconfig", load_io);	
	}
	
	/*function load_io(config_type)
	{
		load_config("ioconfig")
	}
	
	function load_main(config_type)
	{
		load_config("mainconfig")
	}*/
	
	// Validate a parameter
	function validate(name, item, type)
	{
		if (item == undefined) 
		{
			console.log("Invalid item name");
			return true;
		}
		
		if (type == PARAM_TYPE.NAME)
		{
			if (item.length == 0)
			{	
				alert(name + " Must be set");
				return true;
			}
		}
		else
		{
			console.log("Unknown variable type for form\n");
			return true;
		}
		
		return false;
	}


	// Check all config paramaters
	function validate_config(config_type, params)
	{
		if (config_type == "mainconfig")
		{
			if (validate("Node Name", params["network_node_name"], PARAM_TYPE.NAME)) return true;

			if (params["aws_enabled"])
			{
				if (validate("AWS Client ID", params["aws_client_id"], PARAM_TYPE.NAME)) return true;
			}
		}
		
		if (config_type == "ioconfig")
		{
			
			
		}
		
		return false;
	}

	 
	 // Save config to device
	/*function save_config(config_type, config_str)
	{
		console.log("Uploading config for "+config_type+": " + config_str);
		 
		
		var filename = "";
		
		if (config_type == "mainconfig") filename = "mainconfig.txt"; else
		if (config_type == "ioconfig") filename = "ioconfig.txt"; else
		{
			console.log("upload_config: invalid config type");
			return;
		}

		ajax.save_systemfile(filename, "config", config_str)
		
		//   XHR.send(config_str);
	}*/


	// Save form data to device
	function save_click(config_type)
	{
		console.log("Saving config for " + config_type + "\n");
		
		// Access the form element...
		var form = document.getElementById(config_type);
		
		// Pack form data into object
		var formdata = new FormData(form);
		var params = {};
		
		formdata.forEach(function(value, key)
		{
			params[key] = value;
		});
		
		if (validate_config(config_type, params))
		{
			console.log("Config invalid\n");
			return;
		}
		
		//save_config(config_type, JSON.stringify(params));	
		
		//if (config_type == "ioconfig") project.set_config(config_type, params);
		//if (config_type == "mainconfig") project.set_mainconfig(params);
		
		project.set_config(config_type, params);
		
		return false;
	}


	// Load config data from project
	function load_config(config_type)
	{
		var config_data = project.get_config(config_type);
		
	/*		
		
		if (config_type == "ioconfig")
			config_data = project.get_ioconfig();
		
		if (config_type == "mainconfig") 
			config_data = project.get_mainconfig();*/
		

		//console.log(config_data);
		
		var form = document.getElementById(config_type);
		
		var formdata = new FormData(form);
		
		//config_data.forEach(function(value, key)
		for (var key in config_data) 
		{
			//console.log("name: " + key);
			//console.log("value: " + config_data[key]);
			
			if (key in form.elements)
			{			
				// check for checkbox
				if (config_data[key] == "on")
					form.elements[key].checked = true;	
				
				form.elements[key].value = config_data[key];	
			}
		};
		
		
	}



	return local;
}());




/* 
	End of Config 
*/




