<?php

  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     crops.php
    Purpose:  Crop Configuration Options
    
    Edit:     
      3-12-2017 JH Initial
   */

  /* Crops */
  
  register_command("config_showcrops",         "cmd_config_showcrops");
  register_command("config_cropdetail",        "cmd_config_cropdetail");
  register_command("config_addcrop",           "cmd_config_addcrop");
  register_command("config_deletecrop",        "cmd_config_deletecrop");
  register_command("config_savecrop",          "cmd_config_savecrop");
		
  function cmd_config_showcrops()
  {
		$fname = "Show Crops";
    $html = "";
    
    $link = open_database('main');
	
    $query = $link->prepare("SELECT * FROM main.crops");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		
		
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		
		
    $result = $query ->get_result();
    $query ->close();
	
    $html .= "<div class=header_text>Crops <a href='index.php?cmd=config_addcrop'> <b>(+)</b> </a> </div>";	
		
    if ($result ->num_rows == 0) 
    {
      $html .= "No Crops";
    }
    else
    {
      $html .= "<table class='table system_table table-striped table-hover' border=1>\n";
      $html .= "<tr>\n";
      $html .= "<td><b>Crop</b></td> <td><b>Season</b></td> <td><b>Option</b></td>\n";
      $html .= "</tr>\n";
    
      while ($row = $result ->fetch_assoc()) 
      {
        $crop_id =  $row["crop_id"];
        $name = sanitize_output($row["name"]);
        $season =  $row["season"];
				
        $html .= "<tr>";
        $html .= "<td><a href='index.php?cmd=config_cropdetail&crop_id=$crop_id'>$name</a></td>";	
        
        $html .= "<td>$season</a></td>";				
		
        $html .= "<form action='index.php?cmd=config_deletecrop' method='post' onsubmit=\"return confirm('Delete Crop?');\">";
        $html .= "<td>";
		
        $html .= "<input type=hidden name=crop_id value='$crop_id'>";
		
        $html .= "<input id='submit' type=submit value='Remove'>";

        $html .= "</td>";
        $html .= "</form>";				
        $html .= "</tr>\n";
      }
      $html .= "</table >\n";
    }

    return $html;
  }
	  
  function cmd_config_cropdetail()
  {
		$fname = "Crop Detail";
    $html = "";
    
    $link = open_database('main');
	
    $crop_id = escape(get_value('crop_id'));
		  
    if ($crop_id == "") return;	
	
    $query = $link->prepare("SELECT * FROM main.crops where crop_id=?");
    
    $query ->bind_param('s', $crop_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		

    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		

    $result = $query ->get_result();
    $query ->close();

    
    if ($result ->num_rows == 0) return log_error ("Problem getting crop data");
	
	  $row = $result ->fetch_assoc();
	  $name = sanitize_output($row["name"]);
	  $season = $row["season"] ;
	
    $html .= "<div class=header_text>Crop Detail - $name</div>\n";
	
    $html .= "<table border=1>\n";
    
    $html .= "<tr>\n";
    $html .= "<td><b>Parameter</b></td>\n";
    $html .= "<td><b>Value</b></td>\n";
    $html .= "</tr>\n";
				
		$html .= "<form action='index.php?cmd=config_savecrop' method='post'>\n";

		$html .= "<tr><td>Name</td><td> <input type=text name=name value='$name'> </td></tr>\n";
		$html .= "<tr><td>Season</td><td> <input type=text name=season value='$season'> </td></tr>\n";
			
		$html .= "<tr>\n";	
		$html .= "<td>\n";
		
		$html .= "<input type=hidden name=crop_id value='$crop_id'>\n";
		$html .= "<input id='submit' type=submit value='Save'>\n";
		$html .= "</form>\n";
		$html .= "</td>\n";
		$html .= "</tr>\n"; 
		
    $html .= "</table>\n";
	
    $html .= "<br>";
	
    return $html;
	
  }
		
	  
  function cmd_config_addcrop()
  {
		$fname = "Add Crop";
    $link = open_database('main');
	
    //$name = escape(get_value('name'));

    $name = "Crop";
	
    //if ($name == "") return;
	
    $post = $link->prepare("INSERT INTO crops (name) VALUES(?) ");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $post->bind_param('s', $name);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
	    
    $crop_id = $link->insert_id;
    
    header("location: index.php?cmd=config_cropdetail&crop_id=$crop_id");	
  }
	
	
  function cmd_config_deletecrop()
  {
		$fname = "Delete Crops";
    $link = open_database('main');
	
    $crop_id = escape(get_value('crop_id'));
		  
    if ($crop_id == "") return;

    // Delete System
    $post = $link->prepare("DELETE from crops where crop_id=? limit 1");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
    $post->bind_param('s', $crop_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
				
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
	  
    header("location: index.php?cmd=config_showcrops");		
  }

  
  	  
  function cmd_config_savecrop()
  {
		$fname = "Save Crop";
    $link = open_database('main');
	
    $name = sanitize_input(get_value('name'));
    $crop_id = get_value('crop_id');
    $season= get_value('season');
    
    if ($crop_id == "") return log_error("Update crop: No Crop id");
    if ($name == "") return log_error("Update crop: Name needed");
		
    $post = $link->prepare("UPDATE crops set name=?,season=? where crop_id=? limit 1");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $post->bind_param('sis', $name, $season, $crop_id );
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		

   
    Header("Location: index.php?cmd=config_showcrops");
  }
  
?>