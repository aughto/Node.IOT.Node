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
	var local = {};
	
	/* 
		Public 
	*/
	
	local.init = init
	local.save_systemfile = save_systemfile;
	local.load_systemfile = load_systemfile;
	local.load_page = load_page;
	
	// Init object
	function init()
	{
		console.log("AJAX Init");

		setInterval(update, AJAX_UPDATE);	// Setup timer
	}	
		
	
	// Save generic data as system file on device
	function save_systemfile(filename, filetype, data)
	{
		console.log(`Saving system file ${filename} type ${filetype}`);
		//console.log("Data: " + data);
	
		var req = get_request();
		
		req.loaded = function() { console.log(`save_systemfile ${filename}: Saved`); };
		req.error = function()  { console.log(`save_systemfile ${filename}: Error`); };
		
		req.tag = `Save system file ${filename}`;
		
		var cmd = `/save_systemfile?filename=${filename}&filetype=${filetype}`;
	
		console.log(`Store command: ${cmd}`);
		
		req.open("POST", cmd ); 
			
		req.setRequestHeader("filetype", filetype);		
		req.setRequestHeader("filename", `/${filename}`);		
	
		req.data = data;
		
		add_request(req); // Add to request buffer
	}
	

	// Save generic data as system file 
	function load_systemfile(filename, filetype, callback)
	{
		console.log(`Loading system file ${filename} type ${filetype}`);
		//console.log("Data: " + data);
	
		var req = get_request();
			
		req.loaded = function(event) 
		{ 
			console.log(`get_systemfile ${filename}: loaded`); 
	
			callback(filetype, req, event);
		};
		
		
		req.error = function()  
		{ 
			console.log(`load_systemfile ${filename}: Error`); 
		};
		
		req.tag = `Load system file ${filename}`;
		
		var cmd = `/get_systemfile?filename=${filename}`;
	
		console.log(`Get command: ${cmd}`);
		
		req.open("POST", cmd ); 
			
		req.setRequestHeader("filename", `/${filename}`);			
	
		add_request(req); // Add to request buffer
	}

	// Load html
	// Need to replace with callback
	function load_page(page, target) 
	{
		var req = get_request();

		req.overrideMimeType("text/plain");
	
		req.loaded = function(event)
		{ 
			//load_page_result(req, target);
			document.getElementById("maincontent").innerHTML = req.responseText;
	
			// Need to preform special actions for some targerts
			// TODO: Need to replace with hooks
			
			if (target=="mainconfig") load_config("mainconfig"); else
			if (target=="ioconfig")   load_config("ioconfig"); else
			if (target=="liveview")   load_liveview(); else
			if (target=="variables")  load_variables(); else
			if (target=="weblogix")   load_weblogix(); 
		};
		
		
		req.error = function() 
		{ 
			console.log("Unable to load page");
			//document.getElementById("page").innerHTML = "";
		};
	
		var url =  `html/${page}`;
	
		req.tag = page;
	
		console.log(`Load URL: ${url}`);
	
		req.open("get", url);
		add_request(req);
	}
	
	
	
	/* 
		Private 
	*/	
	
	/* Ajax request manager. This mainly a wrapper to seralizise ajax requests */
	var requests = [];		// List of pending requests
	var next_id = 100; 			// ID of next request

	var AJAX_UPDATE = 1000;		// Update time for housekeeping in ms
	var AJAX_TIMEOUT = 5000;	// Request timeout


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

	
	/* End of request manager */

	
	
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
	  
			console.log(`Req ${req.tag} loaded in ${time} ms`);
	  
			request_complete(req); // Signal complete;
	  
			// Call
			if (req.loaded != undefined)	
				req.loaded(event); // callback
	  
		});
		
		req.addEventListener("error", function(event) 
		{
			console.log(`AJAX requst error ${req.id}`);
		
			request_complete(req); // Signal complete;
		
			if (req.error != undefined)
				req.error(event);
		
		});
	
		
		req.addEventListener("abort", function(event) 
		{
			console.log(`AJAX requst abort ${req.id}`);
		
			request_complete(req); // Signal complete;
		
			if (req.error != undefined)
				req.error(event);
		
		});	
		
		return req;
	}
	
	// Periodic check for hanging requests
	function update()
	{
		console.log("Ajax Update");
		
		var d = new Date();
		var cur_time = d.getMilliseconds();
		
		for (var i = 0; i < requests.length; i++)
		{
			var req = requests[i];
			var dt = cur_time - req.reqtime;
			
			if (dt >= AJAX_TIMEOUT)
			{
				console.log(`Timeout on request ID ${red.id}`);
				
				// remove
				requests.splice(i, 1);
				i--;
			}
		}
	};
	
	
	return local;
}());



/* 
	End of AJAX  
*/




