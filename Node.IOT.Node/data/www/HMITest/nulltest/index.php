<?php
  /* 
    AughtoFarm (C) 2017 Aughto Inc.
    
    File:     index.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */

  // Need to base includes on command table
  //phpinfo();
  
  session_start();
  
  require_once("PHP/utility.php");
  require_once("config.php");
  require_once("PHP/database.php");
  require_once("PHP/tags.php");
  require_once("PHP/view.php");
  require_once("PHP/crops.php");
    require_once("PHP/test.php");
  require_once("PHP/system.php");
  require_once("PHP/module.php");
  require_once("PHP/rack.php");

  require_once("PHP/view.php");
  require_once("PHP/config.php");
  
  require_once("PHP/admin.php");
  require_once("PHP/user.php");
  require_once("PHP/graph.php");
  
  $html = verify_login();
  
  if ($html == "")
  {
    $cmd = get_value("cmd");		

    if ($cmd == "") $cmd = "show_default_home"; // Default command, need config option

    $html .= parse_command($cmd);
  }
  
  // Only display html for function that returns data;
  if ($html != "")
  {
	require_once("PHP/header.php");
	
	echo $html;
		
	require_once("PHP/footer.php");     
  }
  
?>