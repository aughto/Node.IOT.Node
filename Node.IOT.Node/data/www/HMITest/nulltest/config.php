<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     config.php
    Purpose:  Config Options
    
    Edit:     
      3-12-2017 JH Initial
   */

    //$prog_name = "VectorFarm";
    $prog_name = "Automation Engine";
  
    $database_name = "main";
    $websocket_port = "8080";      
  
   //$local_host = gethostname();
   //$server_ip = gethostbyname($local_host);
    
	$websocket_host = "growlab.ddns.net";  
  
	$plant_list = array("P1", "P2");

  $location_name = "System 18";
  $location_desc = "";
  
  //172.31.9.233
  $greeting = "";

  $site_salt = "3ab3983aaebe12d5da38eeebfc1b213be650498df8419194d5a26c7e0a50af156853c794";
  $site_user = "demo";
  $site_pass = "99aedd362994298408753f9428e0ed87d6b39bcd6ec2da15a926b76befe11427b4a144bfe50d18b119c319af5b0b1702c5a7bf551d4f8ae07fc1f6013cfcbdfd";  // SHA512 of default password
 
 
	$database_server = "localhost";
	$database_dbase  = "main";
	$database_user   = "dblocal";
	$database_pass   = "def#SFDEDFFd3edfgd3dSF";
?>