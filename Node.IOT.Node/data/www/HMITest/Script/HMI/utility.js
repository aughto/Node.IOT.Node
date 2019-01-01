
/* 
    JS Vector Engine
	2015 Jason Hunt
	
	File: Utility.js
*/

"use strict";


/* 
	System
*/

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
	
	var s = encodeURIComponent(str);
	
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(s));
	return div.innerHTML;
}
 
 
// Unescape for post
function unescapeHtml(escapedStr) 
{
	var div = document.createElement('div');
	div.innerHTML = escapedStr;
	var child = div.childNodes[0];
	//return child ? child.nodeValue : '';
	var s= child ? child.nodeValue : '';
	
	
	return decodeURIComponent(s);
	
	
}

function unescapedisplay(s)
{
	s = "" + s; // Force string
	
	s = s.replace(/'/gi, "&apos;"); 
	s = s.replace(/\"/gi, "&quot;"); 
	
	return s;	
}
















function set_html(element, text)
{
	var obj = document.getElementById(element);	
	obj.innerHTML = text;
	obj.style.display = "";
	
	
}



function hide_html(element)
{
	var obj = document.getElementById(element);	

	obj.style.display = "none";
	

	
}


function log(s)
{
	//element = document.getElementById("data_area");
	//element.innerHTML = s + "<br>" + element.innerHTML;
	console.log(s);
}

function get_element_value(name, def)
{
	if (document.getElementById(name))
	{
		if (document.getElementById(name).value != "")
			return document.getElementById(name).value;
		
		return def;
	}

	return def;
}


function validate_number(name, item, min, max)
{
	if (isNaN(item)) 
	{
		console.log("Invalid entry for " + name);
		return 1;
	}

	if (item < min) 
	{
		console.log("Entry too small for " + name);
		return 1;
	}
		
	if (item > max) 
	{
		console.log("Entry too large for " + name);
		return 1;
	}
	
	return 0;
}


/* Load external */
function load_page(page)
{
	//alert(page);
	window.location = page;
}














