/*
	MQTT Test
	2018 Nulluser
*/

"use strict";

const BGCOLOR_VALUES = ["#404040", "#5555ff"];
const FGCOLOR_VALUES = ["#ffffff", "#ffffff"];
const UPDATE_TIME = 1000;
const KEEPALIVE_TIMEOUT = 5;
const PING_TIMEOUT = 2;

var websocket_ip = ''; // '162.235.73.4';
var websocket_port = 80;  

var connected = false;			// True if connected
var socket = null;						// Websocke

var ping_time = 0;
var keepalive_time = 0;

var values = []; // local copy of current values


function init()
{
	load_page("live.html");
	
	console.log("Host: " + location.host)
	
	websocket_init();
	
}


function log(s)
{
	console.log(s);
//	var a = document.getElementById("data_area");
//	a.innerHTML = s + "<br>" + a.innerHTML ;
}


/* 
	AJAX 
*/

/* Get an XMLHttpRequest object */
function get_request()
{
	var req;
	if (window.XMLHttpRequest) 
	{ // Mozilla, Safari, ...
		req = new XMLHttpRequest();
	} else 
	if (window.ActiveXObject) 
	{ // IE
		try 
		{
			req = new ActiveXObject('Msxml2.XMLHTTP');
		} 
		catch (e) 
		{
			try 
			{
				req = new ActiveXObject('Microsoft.XMLHTTP');
			} 
			catch (e) {}
		}
	}
	
	return req;
}







function load_page(page, target)
{
	var req = get_request();

	//req = new XMLHttpRequest();
	req.overrideMimeType("text/plain");
//	req.addEventListener("load", function (evt) {ajax_parse(evt, target)});
	req.addEventListener("load", function (evt) {load_page_result(req, target);});
	
	
	req.addEventListener("error", load_page_error, false); 
	
	var url =  "html/" + page;
	
	console.log("Load URL: " + url);
	
	req.open("get", url);
	req.send();
}


function load_page_result(data, target)
{
	//.responseText
	//console.log(data);
	//console.log("Resp: " + data.responseText);

	document.getElementById("maincontent").innerHTML = data.responseText;
	
	// Need to request more data for some targets
	if (target=="mainconfig") load_config("mainconfig"); else
	if (target=="ioconfig") load_config("ioconfig"); else
	if (target=="liveview") load_liveview(); else
	if (target=="variables") load_variables(); else
	if (target=="weblogix") load_weblogix(); 

}


function load_page_error(data)
{
	//.responseText
	console.log("Unable to load page");
	
	//document.getElementById("page").innerHTML = "";
}


/* 
	End of AJAX  
*/








/* Init websocket and connect */
function websocket_init()
{
	//log("Websocket Start");
	
	setInterval(function(){ websocket_timer() }, 1000);
	
	keepalive_time = 0;
	ping_time = 0;
	
	websocket_connect();
}


/* Timer is used to make sure we are connected */
function websocket_timer()
{
	check_keepalive();
	check_ping();
}



function check_keepalive()
{
	keepalive_time++;
	
	if (keepalive_time >= KEEPALIVE_TIMEOUT)
	{
		console.log("Timeout\n");
		websocket_connect();
	}
}


function check_ping()
{
	ping_time++;
	
	if (ping_time >= PING_TIMEOUT)
	{
		ping_time = 0;
		send_ping();
	}		
}


/* Connect to socket server */
function websocket_connect()
{
	// Do not try to reconnect if we are already connecting 
	//if (connecting == true) return;
	
	//connecting = true;
	connected = false;	
	
	keepalive_time = 0;

	if (socket)
	{
		
		socket.close();
	}
	
	
	socket = null;
	
	log("WebSocket Connecting...");

	// Check for IP override
	if (websocket_ip == '')
		websocket_ip = location.host;
	
	var websocket_host = 'ws://' + websocket_ip + ':' + websocket_port+ '/ws';

	console.log("Host: " + websocket_host  );
		
	// Create socket.  websocket_host assigned dynamically by server
	try 
	{
		socket = new WebSocket( websocket_host );
	}
	catch(exception) 
	{
		log(exception);
		return;
	}
		
	try 
	{
	    socket.onerror = function() 
		{
			//socket = null;
		    //connected = false;
			////connecting = false;
			log("WebSocket Error");
			//location.reload(true);
		}
			
	    socket.onclose = function() 
		{
			//socket = null;
		    //connected = false;
			//connecting = false;
			log("WebSocket Disconnected");
		}	
		
	    socket.onopen = function() 
		{
			keepalive_time = 0;
		    connected = true;
			//connecting = false
			log("WebSocket Connected");
			
		
		}
		
		socket.onmessage = function(msg) 
		{
			websocket_message(msg);
		}
				
	}
	
	catch(exception) 
	{
		log(exception);
		//socket = null;
		//connected = false;
		//connecting = false;
	}
}

/* Send data to server */
function websocket_send(data) 
{
	if (connected == false) return;
	
	try 
	{
		socket.send(data);
	}
	
	catch(exception) 
	{
		connected == false;
		log(exception);
		return;
	}
	
}


/* Deal with server message */
function websocket_message(msg) 
{
	//console.log("Websocket message\n");
	//console.log(msg.data);
	
	try
	{
		var data = JSON.parse(msg.data);
	}
	
	catch (e)
	{
		console.log("Bad JSON: " + msg.data);
		return;
	}
			
	//log("action: " + data.action);
			
	// Todo need to be able to register actions 			
	if (data.cmd == "ping")	 recv_ping(); else
	if (data.cmd == "set")	 set_command(data);         else
	
	{
		console.log("Unknown action: " + data.action);
	}
}



// Parse MQTT message
function set_command(message)
{
	console.log("Set command " + message.item + " " +message.value);

	
	if (message.item == "Input1") variable_update(0, message.value);
	if (message.item == "Input2") variable_update(1, message.value);
	if (message.item == "Input3") variable_update(2, message.value);
	if (message.item == "Input4") variable_update(3, message.value);

	if (message.item == "Output1") variable_update(64, message.value);
	if (message.item == "Output2") variable_update(65, message.value);
	if (message.item == "Output3") variable_update(66, message.value);
	if (message.item == "Output4") variable_update(67, message.value);
	
	
	update_value(message.item, message.value);
}

function recv_ping()
{
	keepalive_time = 0;
	
	console.log("Ping Response\n");
}

function send_ping()
{
	var str = '{"cmd":"ping"}';
	
	//console.log('Message str: ' +str);
	websocket_send(str) 
}




function send_message(item, value)
{
	var message = {};

	message.cmd = "set";
	message.item = item;
	message.value = value;
	
	var str = JSON.stringify(message);
	
	//console.log('Message str: ' +str);
	websocket_send(str) 
}





/*
  Live View 
*/

// Display all current values 
function load_liveview()
{
	for (var i in values) refresh_value(i);
}

// Get curretn value from memory 
function get_value(item) 
{ 
	return values[item] || 0;
}


// Apply current state to UI item 
function refresh_value(item)
{
	var value = values[item];
	
	var el = document.getElementById(item); 

	if (el) 
	{
		el.style.backgroundColor = BGCOLOR_VALUES[value];
		el.style.color = FGCOLOR_VALUES[value];
	}
}



// Apply new value to item
function update_value(item, value) 
{ 
	log(`Update ${item} = ${value}`);

	
	
	//variable_update
	
	
	
	values[item] = value;
	refresh_value(item);
}


// Set local value and publish
function set_value(item, value)
{
	//console.log(`SET ${item} ${value}`);
	
	
	
	
	update_value(item, value);	// local update
	
	send_message(item, value.toString());
}

// Area was clicked
function area_click(item)
{
	// Make sure item is an output
	if (item.toLowerCase().indexOf("output") == -1) return;
	
	//console.log("Get value: " + get_value(item));
	
	var v = get_value(item) == 1 ? 0 : 1;
	
	//console.log("v: " + v);
	// Toggle cell
	set_value(item, v);
}



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



var VAR_TYPES = 	{VAR_BIT		: 0x01, 
					 VAR_TMR		: 0x10 };


var io_list = {num_inputs:4, 
				   inputs:[{name:"Input 1"}, {name:"Input 2"}, {name:"Input 3"}, {name:"Input 4"}, ],
				   num_outputs:4, num_remotedevice:1};


var variable_list = [{name:"Bit 1", type:VAR_TYPES.VAR_BIT},
					 {name:"Bit 2", type:VAR_TYPES.VAR_BIT},
					 {name:"Bit 3", type:VAR_TYPES.VAR_BIT},
					 {name:"Bit 4", type:VAR_TYPES.VAR_BIT},
					 {name:"Bit 5", type:VAR_TYPES.VAR_BIT}, 
					 {name:"Tmr 1", type:VAR_TYPES.VAR_TMR}, 
					 {name:"Tmr 2", type:VAR_TYPES.VAR_TMR}, 
					 {name:"Tmr 3", type:VAR_TYPES.VAR_TMR}];
					
				 

				   
function add_device()
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


	
}


function get_var_type_string(v)
{
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
	for (var i = 0; i < variable_list.length; i++)
	{
		if (variable_list[i].name.toUpperCase() == name.toUpperCase())
		{
			alert("Variable name already exists");
			return true;
		}
	}
	
	return false;
}


function remove_variable(i)
{
	
	
	
	variable_list.splice(i, 1);
	
	assign_variable_list();
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

	
	var v = {};
	
	v.name = var_name;
	v.type = var_type;
		
	variable_list.push(v);
		
	assign_variable_list();
	
		
	load_variables();	
		
}



// Name compare for variables
function variable_compare_type(a,b) 
{
	// Sory by type first
	
	if (a.type < b.type) return -1;
	if (a.type > b.type) return 1;
	
	// Then sort by name	
		
	
  if (a.name.toUpperCase()  < b.name.toUpperCase() )    return -1;
  if (a.name.toUpperCase()  > b.name.toUpperCase() )    return 1;
  return 0;
}

// Name compare for variables
function variable_compare_name(a,b) 
{
	
	//  sort by name	
		
	
  if (a.name.toUpperCase()  < b.name.toUpperCase() )    return -1;
  if (a.name.toUpperCase()  > b.name.toUpperCase() )    return 1;
  return 0;
}



function assign_variable_list()
{
// Variables are sorted by type and then by name to assign index

	variable_list.sort(variable_compare_type);
	
	
	for (var i = 0; i < variable_list.length; i++)
		variable_list[i].index = i;
	
	
	// Sort by name for display
	variable_list.sort(variable_compare_name);
	
	
}













function load_variables()
{
	
	assign_variable_list();
	

	
	
	var out = "";

	
	out += "<h2>Variables</h2>";

	
	
	
	//variable_list
	
	
	out += "<table border=1>";
	out += "<tr><th>Variable</th><th>Type</th><th>Value</th><th>Index</th><th>+/-</th></tr>";

	for (var i = 0; i < variable_list.length; i++)
	{
		out += "<tr>";
		
		out += "<td> <b>" + variable_list[i].name + "</b></td>";
		out += "<td> <b>" + get_var_type_string(variable_list[i]) + "</b></td>";
		
		out += "<td>x</td>";

		out += "<td>"+variable_list[i].index+"</td>";
		
		out += "<td><input type=button class=var_button value='(-)' onclick='remove_variable("+i+");'></td>";
		
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
	
	
	
	
	
}






/* 
	End of Config 
*/




