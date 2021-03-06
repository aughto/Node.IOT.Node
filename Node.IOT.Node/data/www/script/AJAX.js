/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
	
	Implements AJAX global service object
	Serializes AJAX requests
	
	File: AJAX.js
*/

"use strict";

/* 
	AJAX 
*/

// Global AJAX service object
var ajax = (function () 
{
	const MODULE = "AJAX      ";	
	var local = main.register_module("ajax");			
	
	// Public Interface
	
	// Standard
	local.init = init;
	local.second = second;
	
	local.save_systemfile = save_systemfile;
	local.load_systemfile = load_systemfile;
	local.load_http = load_http;
	local.add_target = add_target;
	
	
	// Private variables

	//const AJAX_UPDATE = 1000;		// Update time for housekeeping in ms
	const AJAX_TIMEOUT = 5000;	// Request timeout
	
	var requests = [];			// List of pending requests
	var next_id = 100; 			// ID of next request

	var targets = [];
	
	/* 
		Public 
	*/
	
	// Init object
	function init()
	{
		console.log(`${MODULE} Init`);

		//main.hook_second(update);
		
		//setInterval(update, AJAX_UPDATE);	// Setup timer
	}	
		
	
	
	// Periodic check for hanging requests
	function second()
	{
		//console.log(`${MODULE} Update`);
		
		var d = new Date();
		var cur_time = d.getMilliseconds();
		
		for (var i = 0; i < requests.length; i++)
		{
			var req = requests[i];
			var dt = cur_time - req.reqtime;
			
			if (dt >= AJAX_TIMEOUT)
			{
				console.log(`${MODULE} Timeout on request ID ${red.id}`);
				
				// remove
				requests.splice(i, 1);
				i--;
			}
		}
	};
		
	
	
	
	
	// Add callback for processing results, if needed
	function add_target(name, func)
	{
		targets.push({name:name, func:func});
	}
	
	
	// Save generic data as system file on device
	function save_systemfile(filename, filetype, data)
	{
		console.log(`${MODULE} Saving system file ${filename} type ${filetype}`);
		//console.log("Data: " + data);
	
		var req = get_request();
		
		req.loaded = function() { console.log(`${MODULE} Save_systemfile ${filename}: Saved`); };
		req.error = function()  { console.log(`${MODULE} Save_systemfile ${filename}: Error`); };
		
		req.tag = `Save system file ${filename}`;
		
		var cmd = `/save_systemfile?filename=${filename}&filetype=${filetype}`;
	
		console.log(`${MODULE} Store command: ${cmd}`);
		
		req.open("POST", cmd ); 
			
		req.setRequestHeader("filetype", filetype);		
		req.setRequestHeader("filename", `/${filename}`);		
	
		req.data = data;
		
		add_request(req); // Add to request buffer
	}
	

	// Save generic data as system file 
	function load_systemfile(filename, filetype, load_callback, error_callback)
	{
		console.log(`${MODULE} Loading system file ${filename} type ${filetype}`);
		//console.log("Data: " + data);
	
		var req = get_request();
			
		req.loaded = function(event) 
		{ 
			console.log(`${MODULE} get_systemfile ${filename}: loaded`); 
	
			if (load_callback != undefined)
			if (load_callback != null)
				load_callback(req.responseText);
		};		
		
		req.error = function()  
		{ 
			console.log(`${MODULE} load_systemfile ${filename}: Error`); 
			
			if (error_callback != undefined)
			if (error_callback != null)
				error_callback();
		};
		
		req.tag = `Load system file ${filename}`;
		
		var cmd = `/get_systemfile?filename=${filename}`;
	
		console.log(`${MODULE} Get command: ${cmd}`);
		
		req.open("POST", cmd ); 
			
		req.setRequestHeader("filename", `/${filename}`);			
	
		add_request(req); // Add to request buffer
	}

	// Load html
	// Need to replace with callback
	function load_http(url, target, load_callback, error_callback) 
	{
		var req = get_request();

		req.overrideMimeType("text/plain");
	
		req.loaded = function(event)
		{ 
			//load_page_result(req, target);
			//document.getElementById("maincontent").innerHTML = req.responseText;
	
			// Need to preform special actions for some targerts
			var found = false;
			for (var i = 0; i < targets.length && !found; i++)
			{
				if (target == targets[i].name)
				{
					targets[i].func(req.responseText);
					found = true;
				}
			}
			
			if (load_callback != undefined)
			if (load_callback != null)
				load_callback(req.responseText);
				
			
			
		};
				
		req.error = function() 
		{ 
			console.log(`${MODULE} Unable to load page`);
			
			if (error_callback != undefined)
			if (error_callback != null)
				error_callback(req);

			
			//document.getElementById("page").innerHTML = "";
		};
	
		//var url =  `html/${page}`;
	
		req.tag = url;
	
		console.log(`${MODULE} Load URL: ${url}`);
	
		req.open("get", url);
		add_request(req);
	}
		
	
	/* 
		Private 
	*/	

	// Preform next ajax request if any are pending 
	function request_next()
	{
		// Done if no more requests
		if (requests.length == 0) return;
	
		//console.log("AJAX requesting " + ajax_requests[0].id);
		
		//Preform request on next pending request
		var r = requests[0];
		r.sent = true;
		r.send(r.data);
	}	

	// Called when a requests completes or errors
	function request_complete(req)
	{
		//console.log("AJAX Request complete");
		//console.log(req);	
		
		// Remove from list
		for (var i = 0; i < requests.length; i++)
		{
			if (req.id == requests[i].id)
			{
				requests.splice(i, 1);
				break;
			}
		}

		// Send next request
		request_next();
	}

	// Add a request to the pending list
	function add_request(req)
	{
		//console.log("AJAX add Request " + req.id);
		//console.log(req);
	
		// Add to list for later
		requests.push(req);	
		
		// Send right away if this was the only request
		if (requests.length == 1)
			request_next();
	}
	
	
	// Get an XMLHttpRequest object
	function get_request()
	{
		//console.log("Ajax get request");
	
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
		
		req.sent = false;
		req.id = next_id++;
		req.data = "";
		req.tag = "";
		
		req.reqtime = get_ms();
		
		//console.log("Request ID: " + req.id);
		// Need to add all event listeners so that we don't miss a completion
		
		// Need to add genereic callbacks to keep stack straight
		req.addEventListener("load", function(event) 
		{
			//console.log(`Save_systemfile File: $(filename) Type: $(filetype) Resp $(event.target.responseText)`);
	
			var time = get_ms() - req.reqtime;
		
			//console.log('AJAX requst loaded ' +req.id);
	  
			console.log(`${MODULE} Req ${req.tag} loaded in ${time} ms`);
	  
			request_complete(req); // Signal complete;
	  
			// Call
			if (req.loaded != undefined)	
				req.loaded(event); // callback
	  
		});
		
		req.addEventListener("error", function(event) 
		{
			console.log(`${MODULE} AJAX requst error ${req.id}`);
				
			error(`Unable to load file: ${req.tag}`);
			project.set_offline();
		
			request_complete(req); // Signal complete;
		
			if (req.error != undefined)
				req.error(event);
		
		});
	
		
		req.addEventListener("abort", function(event) 
		{
			console.log(`${MODULE} AJAX requst abort ${req.id}`);
		
			error(`Unable to load file: ${req.tag}`);
			project.set_offline();		
		
			request_complete(req); // Signal complete;
		
			if (req.error != undefined)
				req.error(event);
		
		});	
		
		return req;
	}
	

	
	return local;
}());



/* 
	End of AJAX  
*/




