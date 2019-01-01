<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     module.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
  */
  
  register_command("config_moduledetail",      "cmd_config_moduledetail");
  register_command("config_addmodule",         "cmd_config_addmodule");
  register_command("config_deletemodule",      "cmd_config_deletemodule");
  register_command("config_savemodule",        "cmd_config_savemodule");	
	

  /* Modules */
  function system_modulelist()
  {
    $fname = "Module List";
    $html = "";
    $link = open_database('main');
	
    $system_id = escape(get_value('system_id'));	
	  $rack_id = escape(get_value('rack_id'));
    
    
    if ($rack_id == "") return log_error($fname , "No Rack ID");
    if ($system_id == "") return log_error($fname , "No System ID");
    
  
	//echo "systemid: {$system_id} <br>\n";
	
    $query = $link->prepare("SELECT modules.module_id, modules.name, 
	                               light_zones.name  as lz_name , water_zones.name as wz_name, crops.name as c_name 
	                          FROM main.modules 
                          left join crops on crops.crop_id = modules.crop_id									
                          left join light_zones on light_zones.light_id = modules.light_id
                          left join water_zones on water_zones.water_id = modules.water_id
                          where modules.rack_id=?");
													
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
													
    $query ->bind_param('i', $rack_id);		
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
		
    $result = $query ->get_result();
    $query ->close();

    
	
    $html .= "<b>Modules</b>\n";
	
    $html .=  "<a href='index.php?cmd=config_addmodule&system_id=$system_id&rack_id=$rack_id'> <b>(+)</b> </a> <br> " ;
	
    if ($result ->num_rows == 0) 
    {
      $html .= "No Modules";
    }
    else
    {
      $html .= "<table border=1>\n";
      $html .= "<tr>\n";
      $html .= "<th><b>Name</b></th>";
      $html .= "<th><b>Crop</b></th>";
      $html .= "<th><b>Light Zone</b></th>";
      $html .= "<th><b>Water Zone</b></th>";
      $html .= "<th><b>Option</b></th>\n";
      $html .= "</tr>\n";
	
      //echo "System id($system_id) <br>";
	
      while ($row = $result ->fetch_assoc()) 
      {
        $module_id = $row["module_id"];
        $name = sanitize_output($row["name"]);
        $c_name = sanitize_output($row["c_name"]);
        $lz_name = sanitize_output($row["lz_name"]);
        $wz_name = sanitize_output($row["wz_name"]);
				
        $html .= "<tr>";
        $html .= "<td><a href='index.php?cmd=config_moduledetail&id=$module_id&system_id=$system_id&rack_id=$rack_id'>$name</a></td>";				
		
        $html .= "<td>$c_name</td>";				
        $html .= "<td>$lz_name</td>";				
        $html .= "<td>$wz_name</td>";				
	
        $html .= "<form action='index.php?cmd=config_deletemodule' method='post' onsubmit=\"return confirm('Delete Module?');\"  >";
        $html .= "<td>";
        $html .= "<input type=hidden name=id value='$module_id'>";
        $html .= "<input type=hidden name=system_id value='$system_id'>";
        $html .= "<input type=hidden name=rack_id value='$rack_id'>";
        $html .= "<input id='submit' type=submit value='Remove'>";
        $html .= "</form>";		
        $html .= "</td>";			
		
        $html .= "</tr>";
      }

      $html .= "</table >\n";
    }
	
    $html .= "<br>";
	
    return $html;
  }
	  
  function cmd_config_moduledetail()
  {
	$html = "";
	$link = open_database('main');
	
  $id = escape(get_value('id'));
  $system_id = escape(get_value('system_id'));
  $rack_id = escape(get_value('rack_id'));
  
		  
	$ret =  escape(get_value('return'));
	
	
	if ($id == "") return;	
	
	
	// Get Module Data
	$query = $link->prepare("SELECT * FROM main.modules where module_id=?");
    
    $query ->bind_param('s', $id);

	$query ->execute();
	$result = $query->get_result();
	$query ->close();
	
	if ($result ->num_rows == 0) die("Problem getting module data");
	
	$row = $result ->fetch_assoc();
	
	$module_id = $row["module_id"];
	$light_id = $row["light_id"];
	$water_id = $row["water_id"];
	$crop_id = $row["crop_id"];
	$planted= $row["planted"];
	
		
	$name = sanitize_output($row["name"]) ;	
	
			
	// Build light zone list
	$query = $link->prepare("SELECT * FROM main.light_zones where system_id=?");
    $query ->bind_param('s', $system_id);		
		
	$query ->execute();
	$result = $query->get_result();
	$query ->close();

  if (mysqli_error($link) != "") die("Mysql error: " . mysqli_error($link));
  
	$light_names[] = "None";
	$light_ids[] = -1;
	
	while ($row = $result ->fetch_assoc()) 
	{
	  $id = $row["light_id"];
	  $enabled =  $row["enabled"];

	  $light_names[] = sanitize_output($row["name"]);
	  $light_ids[] = $row["light_id"];
	}			
			
			
	// Build water zone list
	$query = $link->prepare("SELECT * FROM main.water_zones where system_id=?");
    $query ->bind_param('s', $system_id);		
		
	$query ->execute();
	$result = $query->get_result();
	$query ->close();
if (mysqli_error($link) != "") die("Mysql error: " . mysqli_error($link));
  
	$water_names[] = "None";
	$water_ids[] = -1;
	
	while ($row = $result ->fetch_assoc()) 
	{
	  $id = $row["water_id"];
	  $enabled =  $row["enabled"];

	  $water_names[] = sanitize_output($row["name"]);
	  $water_ids[] = $row["water_id"];
	}	
			
			
		
	// Build crop list list
	$query = $link->prepare("SELECT * FROM crops ");
    //$query ->bind_param('s', $system_id);		
		
	$query ->execute();
	$result = $query->get_result();
	$query ->close();

  if (mysqli_error($link) != "") die("Mysql error: " . mysqli_error($link));
  
	$crop_names[] = "None";
	$crop_ids[] = -1;
	
	while ($row = $result ->fetch_assoc()) 
	{
	  $id = $row["crop_id"];
	  //$enabled =  $row["enabled"];

	  $crop_names[] = sanitize_output($row["name"]);
	  $crop_ids[] = $row["crop_id"];
	}		
			
			
		
			
	$html .= "<div class=header_text>Module Detail</div>\n";
	    
	$html .= "<table class='table system_table table-striped table-hover' border=1>";
	//$html .= "<a href=index.php?cmd=config_systemdetail&system_id=$system_id>Back</a><br>\n";
	

    $html .= "<tr>";
    $html .= "<td><b>Parameter</b></td><td><b>Value</b></td>";
	$html .= "</tr>";
			
	
	$html .= "<form action='index.php' method='post'>";
		
	$html .= "<tr><td> Name</td><td><input type=text name=name value='$name'  style='width:200px'> </td> </tr>";
			
			
		$html .= "<tr> <td>Crop</td>";
			
	$html .= "<td><select name=crop_id  style='width:200px'>";
	
	for ($i = 0; $i < count($crop_names); $i++)
	{
		$html .= "Name: " . $crop_names[$i] . "<br>";
			
		if ($crop_id == $crop_ids[$i])
    	  $html .= " <option value='".$crop_ids[$i]."' selected>".$crop_names[$i]."</option>";
		else
		  $html .= " <option value='".$crop_ids[$i]."'>".$crop_names[$i]."</option>";
	}
	
	$html .= "</select></td>";
	$html .= "</tr>";		
			
	
			
			
	$html .= "<tr> <td>Light Zone</td>";
			
	$html .= "<td><select name=light_id  style='width:200px'>";
	
	for ($i = 0; $i < count($light_names); $i++)
	{
		$html .= "Name: " . $light_names[$i] . "<br>";
			
		if ($light_id == $light_ids[$i])
    	  $html .= " <option value='".$light_ids[$i]."' selected>".$light_names[$i]."</option>";
		else
		  $html .= " <option value='".$light_ids[$i]."'>".$light_names[$i]."</option>";
	}
	
	$html .= "</select></td>";
	$html .= "</tr>";
	
			
			
			
	$html .= "<tr> <td>WaterZone</td>";
			
	$html .= "<td><select name=water_id  style='width:200px'>";
	
	for ($i = 0; $i < count($water_names); $i++)
	{
		$html .= "Name: " . $water_names[$i] . "<br>";
			
		if ($water_id == $water_ids[$i])
    	  $html .= " <option value='".$water_ids[$i]."' selected>".$water_names[$i]."</option>";
		else
		  $html .= " <option value='".$water_ids[$i]."'>".$water_names[$i]."</option>";
	}
	
	$html .= "</select></td>";
	$html .= "</tr>";
				
				$html .= "<tr><td> Planted</td><td><input type=text name=planted value='$planted'  style='width:200px'> </td> </tr>";
			
		
		
		$html .= "<tr>";		
		$html .= "<td colspan=2>";
    $html .= "<input type=hidden name=cmd value='config_savemodule'>";
    $html .= "<input type=hidden name=return value='$ret'>";
		$html .= "<input type=hidden name=id value='$module_id'>";
		$html .= "<input type=hidden name=system_id value='$system_id'>";
		$html .= "<input type=hidden name=rack_id value='$rack_id'>";
		
    $html .= "<input id='submit' type=submit value='Save'>";
    $html .= "</form>";
    $html .= "</td>";
	
		$html .= "</tr>\n";
	
	
    $html .= "</tr>\n"; 
	
	
    $html .= "</table >";

    return $html;
  }
	    
		
		
		
  function cmd_config_addmodule()
  {
    $fname = "Add Module ";
    $link = open_database('main');
	
    $name = sanitize_input(get_value('name'));
    $system_id = escape(get_value('system_id'));
    $rack_id = escape(get_value('rack_id'));

	
    if ($rack_id == "")   die($fname . "No Rack ID");
    if ($system_id == "") die($fname . "No Rack ID");
    
    
    if ($name == "") $name = "Module";
    
	
    $post = $link->prepare("INSERT INTO modules (name,system_id, rack_id, planted) VALUES(?,?,?,NOW())");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $post->bind_param('sii', $name, $system_id, $rack_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $module_id = $link->insert_id;
	
	  Header("Location: index.php?cmd=config_moduledetail&id=$module_id&system_id=$system_id&rack_id=$rack_id");	 
    
		log_action($fname, "Module ID: $module_id");
    
  }
	
	
  function  cmd_config_deletemodule()
  {
		$fname = "Delete Module";
    
    $link = open_database('main');
	
    $module_id = escape(get_value('id'));
    $system_id = escape(get_value('system_id'));
	  $rack_id = escape(get_value('rack_id'));

    if ($msodule_id == "") return log_error($fname, "No ID");
		  		  
    $post = $link->prepare("DELETE from modules where module_id=?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $post->bind_param('s', $module_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
	
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    		
    header("location: index.php?cmd=config_rackdetail&system_id=$system_id&rack_id=$rack_id");		
		
		log_action($fname, "Module ID: $module_id");
  }

  
  	
  
  function  cmd_config_savemodule()
  {
		$fname = "Save Module ";
    $link = open_database('main');
	
    $name = escape(get_value('name'));
    $module_id = escape(get_value('id'));
    $system_id = escape(get_value('system_id'));	
    $rack_id = escape(get_value('rack_id'));
    $crop_id = escape(get_value('crop_id'));	
    $light_id = escape(get_value('light_id'));	
    $water_id = escape(get_value('water_id'));	
    $planted = escape(get_value('planted'));	
      
    $ret = escape(get_value('return'));	
	
    if ($name == "")      die($fname . "No Name");
    if ($module_id == "") die($fname . "No module id");
    if ($system_id == "") die($fname . "No system id");
    if ($rack_id == "")   die($fname . "No rack id");
    
    //http://192.168.56.101/index.php?cmd=config_rackdetail&rack_id=1&system_id=36
    //var_dump($_POST);

    $post = $link->prepare("UPDATE modules set name=?,crop_id=?,light_id=?,water_id=?,planted=? where module_id=?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $post->bind_param('ssssss', $name, $crop_id, $light_id, $water_id, $planted, $module_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
        
  	if ($ret == "system")
      header("location: index.php?cmd=show_system");				
    else
      header("location: index.php?cmd=config_rackdetail&system_id=$system_id&rack_id=$rack_id");		
		
		log_action($fname, "Module ID: $module_id Module Name: $name");
  }
  
  
?>