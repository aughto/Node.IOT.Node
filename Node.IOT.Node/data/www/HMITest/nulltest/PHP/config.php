<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     system_config.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
  */
  
  register_command("config_showhome",          "cmd_config_showhome");
  
  function cmd_config_showhome()
  {
    $html = "";
    //$html .= "Config Home";
    $html .= "<img src=Images/SystemExample.png><br>";
    
    return $html;
  }
  
?>