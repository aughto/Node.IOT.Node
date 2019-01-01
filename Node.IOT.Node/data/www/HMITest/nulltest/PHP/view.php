<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     view.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
  */ 
 
  register_command("view_show", "cmd_view_show");

  
  
  function cmd_view_show()
  {
   // require("viewheader.php");
    
     // Dynamically inform the client of the server ip for websocket
    global $websocket_port;    
    global $websocket_host;    
	global $view_mode;	
	
	$view_mode = "run";
   
	if(get_value("view_mode") == "edit")
		$view_mode = "edit";
		
	$html = "";
		
	$html .= "<div id=\"canvas_box\" tabindex=0>\n";
	$html .= "<canvas id=\"maincanvas\"></canvas>\n";
	$html .= "</div>\n";
	
	
	$html .= "<div id=\"edit_box\"></div>\n";
	
	$html .= "<script>\n";
	$html .= "  var view_mode = '$view_mode';\n";		// Map view mode
	//$html .= "alert('(' + view_mode +')');";

	$html .= "  var websocket_host = 'ws://$websocket_host:$websocket_port/server';\n";
	$html .= "  main.start();\n";
	$html .= "</script>\n";
	
	return $html;
  }
  
?>