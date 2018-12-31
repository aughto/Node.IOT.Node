
/* 
    JS Vector Engine
	2015 Jason Hunt
	
	File: Utility.js
*/

"use strict";






/* 
	System
*/

function hex_string_to_array(str) 
{ 
	var result = [];
	while (str.length >= 2) 
	{ 
        result.push(parseInt(str.substring(0, 2), 16));

        str = str.substring(2, str.length);
	}

	return result;
}


function get_hex(num) 
{
	num = Math.floor(num);
	if (num > 255) num = 255;
	if (num < 0) num = 255;
	
	var len = 2;
    var str = num.toString(16);
    return "0".repeat(len - str.length) + str;
}


// Get 2 digit hex from integer
function get_hex8(num) 
{
	num = parseInt(num);
	
	var len = 2;
    var str = num.toString(16);
	
	//console.log("Geth8 " + num + " str: " + str + "\n");
	
	
    return "0".repeat(len - str.length) + str;
}

// Get 4 digit hex from integer
function get_hex16(num) 
{
	num = parseInt(num);
	
	//console.log("Geth32 " + num + "\n");
	
	var len = 4;
    var str = num.toString(16);
    return "0".repeat(len - str.length) + str;
}

// Get 8 digit hex from integer
function get_hex32(num) 
{
	num = parseInt(num);
	
	//console.log("Geth32 " + num + "\n");
	
	var len = 8;
    var str = num.toString(16);
    return "0".repeat(len - str.length) + str;
}




// Attached to system event
function hookEvent(element, eventName, callback)
{
	if (typeof(element) == "string")
		element = document.getElementById(element);

	if (element == null) return;
  
	if (element.addEventListener)
	{
		if (eventName == 'mousewheel')
			element.addEventListener('DOMMouseScroll', callback, false);  
		
		if (eventName == 'keypress')
			element.addEventListener('keypress', callback, true);  
		
		
		element.addEventListener(eventName, callback, false);
	} else
	if (element.attachEvent)
		element.attachEvent("on" + eventName, callback);
}

// Fake event
function cancelEvent(e)
{
	e = e ? e : window.event;

	if(e.stopPropagation) e.stopPropagation();
	if(e.preventDefault) e.preventDefault();

	e.cancelBubble = true;
	e.cancel = true;
	e.returnValue = false;
	
	return false;
}

// Escape for post
function escapeHtml(str) 
{
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}
 
// Unescape for post
function unescapeHtml(escapedStr) 
{
	var div = document.createElement('div');
	div.innerHTML = escapedStr;
	var child = div.childNodes[0];
	return child ? child.nodeValue : '';
}



function set_html(element, text)
{
	//var edit_area = document.getElementById(element);	
	//edit_area.innerHTML = text;
	
}



function get_ms()
{
	return +new Date();;
}


function get_element(id)
{
	return document.getElementById(id);
}


// Activate module div section
function show_module(m)
{
	get_element(m + "_container").style.display = "block";
}

	
// Deactivate module div section
function hide_module(m)
{
	get_element(m + "_container").style.display = "none";
}
		
	



/* Set mode status area */
function mode(t)
{
	get_element("status_mode").innerHTML = t;
	console.log("Mode: " + t);
}

/* Set mode status area */
function connection(t)
{
	get_element("status_connection").innerHTML = t;
	console.log("Connection: " + t);
}


/* Set mode error area */
function error(t)
{
	var s = "OK";
	if (t != undefined) s = t;
	
	get_element("status_error").innerHTML = s;
	console.log("Status: " + s);
}

/* Set mode notice area */
function notice(t)
{
	get_element("status_notice").innerHTML = t;
	console.log("Notice: " + t);
}


