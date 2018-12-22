/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";




/* 
	Config 
*/


// Parameters types
var PARAM_TYPE = {NAME:1, INT:2, IP:3, HOST:4};

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

 
 // Perform request to save config data
 // Config data is in JSON format
function upload_config(config_type, config_str)
{
	console.log("Uploading config for "+config_type+": " + config_str);
	 
	var XHR = get_request();

    XHR.addEventListener("load", function(event) 
	{
      console.log(event.target.responseText);
    });

    XHR.addEventListener("error", function(event) 
	{
      alert('Unable to save config');
    });

	
	if (config_type == "mainconfig") XHR.open("POST", "/set_mainconfig"); else
	if (config_type == "ioconfig") XHR.open("POST", "/set_ioconfig"); else
	{
		console.log("Invalid config type\n");
		return;
	}
		
    XHR.send(config_str);
}
	
/*
function toHex(str) {
	var hex = '';
	for(var i=0;i<str.length;i++) {
		hex += ''+str.charCodeAt(i).toString(16) + ' ';
	}
	return hex;
}*/


// Save form data to device
function save_config(config_type)
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
	
	upload_config(config_type, JSON.stringify(params));	
	
	return false;
}



// Request config data load
function load_config(config_type)
{
	if (config_type == "ioconfig")
	{
		//generate_iolist()
	}1
		
	
	
	var req = get_request();

	req.overrideMimeType("text/plain");
	req.addEventListener("load", function (evt) {parse_formdata(config_type, req, evt);});
	
	req.addEventListener("error", load_page_error, false); 
	
	
	if (config_type == "mainconfig")	req.open("get", "/get_mainconfig"); else
	if (config_type == "ioconfig")	req.open("get", "/get_ioconfig"); else
	{
		console.log("Unknown config type: " + config_type);
		return;
	}
	
	
	req.send();
}



// Universal form data parser. Loads ajax data into form
function parse_formdata(config_type, data, evt)
{
	console.log("Parse config: " + config_type);
	console.log("Form data Resp: " + data.responseText);
					
	var config_data = JSON.parse(data.responseText);
	
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


				 





/* 
	End of Config 
*/




