/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


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




