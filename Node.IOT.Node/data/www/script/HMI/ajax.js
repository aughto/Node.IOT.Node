
/* 
    JS Vector Engine
	2015 Jason Hunt
	
	File: ajax.js	
*/

"use strict";

/* 
	AJAX 
*/


function makeRequest(url, param) 
{
	var httpRequest;
		
    if (window.XMLHttpRequest) 
	{ // Mozilla, Safari, ...
		httpRequest = new XMLHttpRequest();
    } else 
	if (window.ActiveXObject) 
	{ // IE
		try { httpRequest = new ActiveXObject("Msxml2.XMLHTTP"); } 
		catch (e) 
		{
			try { httpRequest = new ActiveXObject("Microsoft.XMLHTTP"); }
			catch (e) {}
      }
    }

    if (!httpRequest) 
	{
		alert('Cannot create an XMLHTTP instance');
		return false;
    }
	
    httpRequest.onreadystatechange = function()
	{
		if (httpRequest.readyState === 4) 
		{
			if (httpRequest.status === 200) 
			{
				if (httpRequest.responseText == "") return;
				//console.log("Res: " + httpRequest.responseText);

				//check result code
				
				try
				{
					var data = JSON.parse(httpRequest.responseText);
				}
				catch (e)
				{
					console.log("Parse error: " + httpRequest.responseText);
					return;
				}
				
				
				if(data.error != null)
				{
					if (data.error != "")
						console.log("AJAX Error: " + data.error);
				}
				

				// Deal with object data
				if (data.result == "error") alert("Error: " + data.errormsg); else
				if (data.result == "list")	ajax_parse_list(data); else 
				if (data.result == "taglist")	ajax_parse_taglist(data); else 
				
				if (data.result == 'add')   ajax_process_add(data); else
					console.log("Unknown: " + data.result);
				
			} 
			else 
			{
				alert('There was a problem with the request.');
			}
		}
	}

    httpRequest.open('POST', url);
	
	httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	httpRequest.setRequestHeader("Content-length", param.length);
	httpRequest.setRequestHeader("Connection", "close");
	
	httpRequest.send(param);
}
  
function ajax_command(command, data)
{
	makeRequest("php/interface.php", "cmd=" + command + "&" + data);
}




/* 
	AJAX Calls 
*/


// Request object list
function ajax_list(index)
{
	ajax_command("list", "");
}

// Request object list
function ajax_taglist(index)
{
	ajax_command("taglist", "");
}



// Parse list data from object server
function ajax_parse_taglist(list)
{
	//var str = JSON.stringify(list);
	//console.log(str);
	// alert(str);
	//var prev = objects.length;
	//alert("prev: " + prev);
	
	var count = list.count;
			
	for (var i = 0; i < count; i++)
	{	
		var tmp = new Object;
	
		tmp.id        = +parseInt(list.data.object_name[i].id);
		tmp.name      = list.data.object_name[i].name;
		tmp.device_name      = list.data.object_name[i].device_name;
		tmp.type      = list.data.object_name[i].type;
	
		tags.push(tmp);
	}

	var str = JSON.stringify(tags);
	
	//console.log(str);
	
	graphics.render();
}




/*
	End of AJAX
*/