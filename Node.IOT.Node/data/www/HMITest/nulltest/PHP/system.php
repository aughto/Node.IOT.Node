<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     system.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
  */
  
  register_command("config_showsystems",       "cmd_config_showsystems");
  register_command("config_systemdetail",      "cmd_config_systemdetail");
  register_command("config_addsystem",         "cmd_config_addsystem");
  register_command("config_deletesystem",      "cmd_config_deletesystem");
  register_command("config_savesystemdetail",  "cmd_config_savesystemdetail");
  
  register_command("show_system",      "cmd_show_system");
  
  // Show system list be module
  function cmd_show_system()
  {
    verify_login();
		$fname = "Show System";
		
    $html = "";
    $link = open_database('main');
	
    $query = $link->prepare(
        "SELECT module_id,systems.system_id,
                modules.name as module_name, 
								modules.rack_id as rack_id,
								racks.name as rack_name,
								racks.rack_id as rack_id,
                crops.name as c_name, crops.season as season,
	                         light_zones.name as lz_name, light_zones.enabled as lz_enabled, 
							 water_zones.name as wz_name, water_zones.enabled as wz_enabled,
							 systems.name as system_name, planted
		     FROM modules 
							 left join main.crops on main.modules.crop_id=main.crops.crop_id
							 left join main.light_zones on main.modules.light_id=main.light_zones.light_id
							 left join main.water_zones on main.modules.water_id=main.water_zones.water_id
							 left join main.racks on main.modules.rack_id=main.racks.rack_id
							 
							 left join main.systems on main.modules.system_id=main.systems.system_id order by system_name,rack_name,module_name ");

	
          /*$query = $link->prepare("SELECT modules.system_id,modules.module_id, modules.name, system.light_zones.name  as lz_name , water_zones.name as wz_name 
	                                FROM main.modules 
									left join light_zones on light_zones.light_id = modules.light_id
									left join water_zones on water_zones.water_id = modules.water_id
									
									");*/
										 
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
    $result = $query ->get_result();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

		
    $query ->close();

    $html .= "<h4>Module View</h4>\n";
	
    $html .= "<table class='table system_table table-striped' border=1>\n";
    $html .= "<tr>\n";
    $html .= "<td><b>System</b></td>\n";
		$html .= "<td><b>Rack</b></td>\n";
    $html .= "<td><b>Module</b></td>\n";
    $html .= "<td><b>Crop</b></td>\n";
    $html .= "<td><b>Light Zone</b></td>\n";
    $html .= "<td><b>Water Zone</b></td>\n";
    $html .= "<td><b>Planted</b></td>\n";
    $html .= "<td><b>Harvest</b></td>\n";
    $html .= "<td><b>Remaining</b></td>\n";
    $html .= "</tr>\n";
	
	date_default_timezone_set('America/New_York');
    $current = new DateTime("now");
    $current->setTime(0, 0, 0);			// Make nice round days
	
    if ($result ->num_rows == 0) return log_error("No Systems");
      
    
      while ($row = $result ->fetch_assoc()) 
      {
        $module_id = $row["module_id"];
        $system_id = $row["system_id"];
				$rack_id = $row["rack_id"];
        
        $system_name =  sanitize_output($row["system_name"]);	
				$rack_name = sanitize_output($row["rack_name"]);
				$module_name = sanitize_output($row["module_name"]);
			
        $lz_name =  sanitize_output($row["lz_name"]);		
        $lz_enabled = $row["lz_enabled"];		
        $lz_color = ($lz_enabled != 0) ? "blue" : "red";
      
        $wz_name =  sanitize_output($row["wz_name"]);		
        $wz_enabled = $row["wz_enabled"];		
        $wz_color = ($wz_enabled != 0) ? "blue" : "red";
		
        $c_name =  sanitize_output($row["c_name"]);	
		
        $planted = $row["planted"];
        $season = $row["season"];	

        $planted_str = "";
        $harvest_str = "";
        $remaining = "";
		
      //if ($season > 0)
      {
        $planted_date = new DateTime($planted );
        $planted_str = $planted_date->format('Y-m-d');
			
        if ($season > 0)
        $planted_date->add(new DateInterval('P' . $season . 'D'));
		
        $harvest_str = $planted_date->format('Y-m-d') ;
		
		
        $remaining = $current->diff($planted_date)->format('%r%a');;
			
        if ($remaining <= 0) 
          $remaining = "<font color=red>$remaining days</font>";
        else
          $remaining = "<font color=blue>$remaining days</font>";
      }
		
      $html .= "<tr>\n";
      $html .= "<td><a href='index.php?cmd=config_systemdetail&system_id=$system_id&return=system'>" .$system_name. "</a></td>\n";				

      $html .= "<td><a href='index.php?cmd=config_rackdetail&rack_id=$rack_id&system_id=$system_id&return=system'>" .$rack_name. "</a></td>\n";	
      
      $html .= "<td><a href='index.php?cmd=config_moduledetail&rack_id=$rack_id&id=$module_id&system_id=$system_id&return=system'>" .$module_name. "</a></td>\n";	
    
      $html .= "<td>$c_name</td>\n";	
      $html .= "<td><font color=$lz_color>$lz_name</font></td>\n";			
      $html .= "<td><font color=$wz_color>$wz_name</font></td>\n";	
			
      $html .= "<td>$planted_str</td>\n";	
      $html .= "<td>$harvest_str</td>\n";	

      $html .= "<td>$remaining</td>\n";	
				
      $html .= "</tr>\n";
	  }
	

    $html .= "</table >\n";

    return $html;
  }
	  

  
  
  function make_systemtype_list()
  {
    $list["0"] = "Undefined";
		$list["1"] = "Sim";
    $list["2"] = "Emulator";
		$list["3"] = "Modbus";
		$list["4"] = "RSLogix";
  
    return $list;
  }
  
  
  
  
  // Show all systems
  function cmd_config_showsystems()
  {
		$fname = "Show Systems";
    verify_login();
    
    $html = "";
    $link = open_database('main');
    
		$ret = get_value("return");
		
    $query = $link->prepare("SELECT * FROM main.systems");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		
      
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		

    $result = $query ->get_result();
    $query ->close();

    
    $html .= "<div class=header_text>Systems <a href='index.php?cmd=config_addsystem&return=$ret'> <b>(+)</b> </a> </div>\n";	

    if ($result ->num_rows == 0) return log_error("No Systems");
    
    $html .= "<table border=1>\n";
    $html .= "<tr>\n";
    $html .= " <td><b>System</b></td>\n";
    $html .= " <td><b>Host</b></td>\n";
    $html .= " <td><b>Type</b></td>\n";
    $html .= " <td><b>Enabled</b></td>\n";
    $html .= " <td><b>Option</b></td>\n";
    $html .= "</tr>\n";
    
    $systemtype_list = make_systemtype_list();
    
    while ($row = $result ->fetch_assoc()) 
    {
      $system_id = $row["system_id"];
      $name = sanitize_output($row["name"]);
      $host = sanitize_output($row["host"]);
      $type = $row["type"];
      $enabled = $row["enabled"];
      
      // Convert to string
      if (isset($systemtype_list[$type])) $type = $systemtype_list[$type];
      
      
      $html .= "<tr>\n";
      $html .= "<td><a href='index.php?cmd=config_systemdetail&system_id=$system_id'>$name</a></td>\n";				
      $html .= "<td>$host</td>\n";				
      $html .= "<td>$type</td>\n";				
      
      
      if ($enabled == 1)
        $html .= "<td><font color=blue>Enabled</font></td>\n";				
      else
        $html .= "<td><font color=red>Disabled</font></td>\n";				
      
      $html .= "<form action='index.php?cmd=config_deletesystem' method='post' onsubmit=\"return confirm('Delete system?');\">\n";
      $html .= "<td>\n";
      $html .= "<input type=hidden name=system_id value='$system_id'>\n";
      $html .= "<input id='submit' type=submit value='Remove'>\n";
      $html .= "</td>\n";
      $html .= "</form>\n";				
      $html .= "</tr>\n";
   }
      
    $html .= "</table >\n";

    return $html;
  }
	  
    
  // Detail for a specific system
  function cmd_config_systemdetail()
  {
    $fname = "System Detail ";
    $html = "";
    $link = open_database('main');
	
    $system_id  = sanitize_input(get_value('system_id'));
    $ret        = sanitize_input(get_value('return'));
		
    
    if ($system_id == "") return log_error($fname."No System ID");
	
    $query = $link->prepare("SELECT * FROM main.systems where system_id=?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();    
    
    $query ->bind_param('i', $system_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $result = $query ->get_result();
    $query ->close();


    
    if ($result ->num_rows == 0) return log_error($fname."Unable to load data for system " . $system_id);

  
    $systemtype_list = make_systemtype_list();
  
    $row = $result ->fetch_assoc();
    
    $name = sanitize_output($row["name"]);
    $host  = sanitize_output($row["host"]);
    $type = $row["type"];
	  $enabled = $row["enabled"] ;
	
    $html .= "<div class=header_text>System Detail - $name</div>\n";
    $html .= "<b>System Options</b>\n";	
    $html .= "<table border=1>\n";
    $html .= "<tr>\n";
    $html .= "<td><b>Parameter</b></td>\n";
    $html .= "<td><b>Value</b></td>\n";
    $html .= "</tr>\n";
				
		$html .= "<form action='index.php?cmd=config_savesystemdetail&return=$ret' method='post'>\n";

		$html .= "<tr><td>Name</td><td> <input type=text name=name value='$name'> </td></tr>\n";
		$html .= "<tr><td>Host</td><td> <input type=text name=host value='$host'> </td></tr>\n";

		$html .= "<tr><td>Type</td><td> " . generate_select_str($systemtype_list, "type", $type) . "</td></tr>\n";

      
		$value_checked = ($enabled == 1) ? "checked" : "";				
		$html .= "<tr><td>Enabled</td><td><input type=checkbox name='enabled' value='1' $value_checked> </td></tr>";				
						
			
		$html .= "<tr>\n";	
		$html .= "  <td>\n";
		$html .= "    <input type=hidden name=system_id value='$system_id'>\n";
		$html .= "    <input id='submit' type=submit value='Save'>\n";
		$html .= "    </form>";
		$html .= "  </td>";
		$html .= "  </tr>\n"; 
		
    $html .= "</table>\n";
	
    $html .= "<br>\n";
	
	//echo $html;
  
  //cmd_rack_showlist()
		$html .= system_racklist();
  
	//system_modulelist();
	
//	system_lightlist();
	
//	system_waterlist();
	
		$html .= system_taglist();
	
		return $html;
  
  
  }
	    
		
		
		
	  
  function cmd_config_addsystem()
  {
		// header("location: index.php?cmd=config_showsystems");		
		$fname = "Add System";
		
		$link = open_database('main');
	
		$name = escape(get_value('name'));
	
	
		if ($name == "") $name = "System";
	
    $post = $link->prepare("INSERT INTO systems (name) VALUES(?)");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
				
    $post->bind_param('s', $name);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
  
		$system_id = $link->insert_id;
	
	
		// Need to get number of light zones and number oif water zones from PLC
	
	
		// Add Light Zones
		$num_light_zones = 2;
		$num_water_zones = 2;
	
		$default_waterzone_period = 240;
		$default_waterzone_runtime = 0;
	
		$default_start = "06:00:00";
		$default_duration = 8 * 60;
	
	
		// Create default light zones
		for ($i = 0; $i < $num_light_zones; $i++)
		{
			$zname = "Light Zone " . ($i+1);
	
      $post = $link->prepare("INSERT INTO light_zones (name,system_id,start_time,duration, out_channel,enabled) VALUES(?,?,?,?,?,0)");
			$out_channel = $i + 1;
	  
	  
      $post->bind_param('sssss', $zname, $system_id, $default_start, $default_duration, $out_channel);
			$post->execute();
    
			if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

		}

		// Create default water zones
		for ($i = 0; $i < $num_water_zones; $i++)
		{
			$zname = "Water Zone " . ($i+1);

      $post = $link->prepare("INSERT INTO water_zones (name,system_id,period,runtime,out_channel,enabled) VALUES(?,?,?,?,?,0)");

			$out_channel = $i + $num_light_zones + 1;

      $post->bind_param('sssss', $zname, $system_id, $default_waterzone_period, $default_waterzone_runtime, $out_channel);
			$post->execute();
			if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

		}
	  
	  log_action($fname, "System ID: $system_id");
		
    header("location: index.php?cmd=config_systemdetail&system_id=$system_id");		
	}
	
	
  function cmd_config_deletesystem()
  {
    header("location: index.php?cmd=config_showsystems");		
		$fname = "Delete System";
		
    $link = open_database('main');
	
    $system_id = escape(get_value('system_id'));
		  
	if ($system_id == "") return;
		  		
    $post = $link->prepare("DELETE from modules where system_id=?");
		$post->bind_param('s', $system_id);
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    
	
		$post = $link->prepare("DELETE from light_zones where system_id=?");
		$post->bind_param('s', $system_id);
    $post->execute();		
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

	
		$post = $link->prepare("DELETE from water_zones where system_id=?");
		$post->bind_param('s', $system_id);
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

				
		// Delete System
		$post = $link->prepare("DELETE from systems where system_id=?");
		$post->bind_param('s', $system_id);
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

		
		log_action($fname, "System ID: $system_id");

  }

  
  	  
  function cmd_config_savesystemdetail()
  {
    $link = open_database('main');
		$fname = "Save System";

    $system_id  = sanitize_input(get_value('system_id'));
    $name       = sanitize_input(get_value('name'));
    $host       = sanitize_input(get_value('host'));
    $type       = sanitize_input(get_value('type'));
    $enabled    = sanitize_input(get_value('enabled'));
    $ret        = sanitize_input(get_value('return'));
  
    if ($system_id == "") return log_error("No System ID");
    if ($name == "")		return log_error("No name provided");
    
    // Clean up
    if ($enabled == "1") $enabled = 1; else $enabled = 0;

    $post = $link->prepare("UPDATE systems set name=?,host=?,type=?,enabled=? where system_id=?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    
    $post->bind_param('ssiii', $name, $host,$type, $enabled, $system_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();


    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    
    if ($ret == "system")
      header("location: index.php?cmd=show_system");				
    else		
      header("location: index.php?cmd=config_showsystems");	
		
		log_action($fname, "System ID: $system_id");
  }
  		
		
  /* Generic property lists */
  
  function create_property($display, $name, $type, $option)
  {
  
  		$property = new stdClass;
		
		$property->display = $display; 
		$property->name = $name;
		$property->type = $type;
		$property->option = $option;
		
		return $property;
  		
  }
  
  
  function display_property_edit_list($property)
  {
		
	$link = open_database('main');
	
    $id = escape(get_value('id'));
    $system_id = escape(get_value('system_id'));
		  
	if ($id == "") return;		  
	  
	$module_query = $link->prepare("SELECT * FROM ".$property->table ." where  ". $property->table_id  . "=?");
    
    $module_query ->bind_param('s', $id);

	$module_query ->execute();
	$module_result = $module_query ->get_result();
	$module_query ->close();

  if (mysqli_error($link) != "") return log_error("Mysql error: " . mysqli_error($link));
  
	if ($module_result ->num_rows== 0) 
	{
		return log_error("Problem with water zone data\n");
	}
		
	$row = $module_result ->fetch_assoc();
	  
	$html= "";
	  
	$html .= $property->header;
	  
	$html .= "<table border=1>";
		
    $html .= "<tr>";
    $html .= "<td><b>Parameter</b></td><td><b>Value</b></td>";
	$html .= "</tr>";
						
	$html .= "<form action='index.php?cmd=".$property->save_command.   "' method='post'>";
		
	for ($i = 0; $i < count($property->property_list); $i++)
	{
		
		//echo "index: $i<br>";
		
		//echo $property->property_list[$i]->display . " " . 
     	//	$property->property_list[$i]->name  . " " . 
		//	$property->property_list[$i]->type .      "<br>";
			
		$html .= "<tr><td>". $property->property_list[$i]->display . "</td>";
			
		if ($property->property_list[$i]->type == "text")
		{
			$value = stripslashes($row[$property->property_list[$i]->name]) ;
			$html .= "<td> <input type=text name='".$property->property_list[$i]->name."' value='$value'> </td></tr>";
		}
		
		if ($property->property_list[$i]->type == "time")
		{
			$value = stripslashes($row[$property->property_list[$i]->name]) ;
			$html .= "<td> <input type=text name='".$property->property_list[$i]->name."' value='$value'> </td></tr>";
		}		
			
		if ($property->property_list[$i]->type == "number")
		{
			$value =  number_format($row[$property->property_list[$i]->name], 2, '.', '');
			$html .= "<td> <input type=text name='".$property->property_list[$i]->name."' value='$value'> </td>";
		}

		
		if ($property->property_list[$i]->type == "integer")
		{
			$value =  $row[$property->property_list[$i]->name];
			$html .= "<td> <input type=text name='".$property->property_list[$i]->name."' value='$value'> </td>";
		}
		
		if ($property->property_list[$i]->type == "checkbox")
		{
			//echo "CHECK";
			$value = $row[$property->property_list[$i]->name];
			$value_checked = ($value == 1) ? "checked" : "";				
			$html .= "<td><input type=checkbox name='".$property->property_list[$i]->name."' value='1' $value_checked> </td>";				
		}
			
		if ($property->property_list[$i]->type == "duration")
		{
			$value = number_format($row[$property->property_list[$i]->name]  / 60.0, 2, '.', '');
			
			//number_format($row[$property->property_list[$i]->name], 2, '.', '');
			
			
			$html .= "<td><input  type=text name='".$property->property_list[$i]->name."' value='$value'> </td>";				
		}			
			
			
			
			
			
			
		if ($property->property_list[$i]->type == "channellist")
		{
			$value = number_format($row[$property->property_list[$i]->name]  / 60.0, 2, '.', '');
			
			//number_format($row[$property->property_list[$i]->name], 2, '.', '');
			$value =$row[$property->property_list[$i]->name];
			
			
				$html .= "<td><select name='".$property->property_list[$i]->name."' style='width:160px'>";
	
				$list_names[] = "None";
				$list_ids[] = "-1";
				
				$num_channels = 16;
				
				
				for ($j = 1; $j <= $num_channels ; $j++)
				{
					$list_names[] = $j;
					$list_ids[] = $j;
				}

	
				for ($j = 0; $j < count($list_names); $j++)
				{
					$html .= "Name: " . $list_names[$j] . "<br>";
			
					if ($value == $list_ids[$j])
					$html .= " <option value='".$list_ids[$j]."' selected>".$list_names[$j]."</option>";
					else
					$html .= " <option value='".$list_ids[$j]."'>".$list_names[$j]."</option>";
				}
				
				$html .= "</select></td>";
				$html .= "</tr>";		
			
			}			
			
			
			
			
			
			
			
		$html .= "</tr>";
	}
		
	$html .= "<tr><td  colspan=2>";
	$html .= "<input type=hidden name=id value='$id'>";
	$html .= "<input type=hidden name=system_id value='$system_id'>";
	$html .= "<input id='submit' type=submit value='Save'>";
	$html .= "</form>";
	$html .= "</td>";
	$html .= "</tr>\n"; 		
	$html .= "</table >";

	return $html; 
  }
  
  /* End of generic property lists */
		
		
		
		
    
    
  
?>