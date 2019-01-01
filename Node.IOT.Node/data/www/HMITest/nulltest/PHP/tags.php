<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     tags.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */

		
		/* Tags */
    
    	
  register_command("tag_list",        "cmd_tag_list"); 
  register_command("tag_devicelist",  "cmd_tag_devicelist"); 
	register_command("tag_detail",      "cmd_tag_detail"); 
  register_command("tag_add",         "cmd_tag_add");
  register_command("tag_update",      "cmd_tag_update"); 
  register_command("tag_delete",      "cmd_tag_delete");

		
 function system_taglist()
 {
    $fname = "Tag List"; 
    $html = "";
  
		$system_id = escape(get_value('system_id'));	
  
		$html .= "<b>Tags </b><a href='index.php?cmd=tag_add&system_id=$system_id'> <b>(+)</b> </a></br>";	
    
    $link = open_database('main');
    
    $tagtype_list = make_tagtype_list();
		$dir_list = make_dir_list();
    
    $query = $link->prepare("SELECT * FROM main.tags where system_id=? order by direction,type,name ");
    if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
      
    $query ->bind_param('i', $system_id);
    if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $query ->execute();
    if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $result = $query ->get_result();
   
   
    if ($result ->num_rows == 0) 
    {
      $html .= "No Tags";
    }
    else
    {
      $html .= "<table class='table system_table table-striped' border=1>\n";      
    
      $html .= "<tr>";
      $html .= "<th>Name</th>";
      $html .= "<th>Type</th>";    
      $html .= "<th>Direction</th>";    		
      $html .= "<th>Address</th>";    		
      $html .="<th>Bit</th>";    		
		
      $html .="<th>Min</th>";    
      $html .= "<th>Max</th>";    
      $html .= "<th>PLC Min</th>";    
      $html .= "<th>PLC Max</th>";    
      $html .= "<th>Warn Min</th>";    
      $html .= "<th>Warn Max</th>";   
      $html .= "<th>Log Interval</th>";   
      
      //    $html .= "<th>Address</th>";    
      //    $html .= "<th>Index</th>";

      $html .= "<th colspan=2>Option</th>";
      $html .= "</tr>";
    
    
      while($r = mysqli_fetch_assoc($result)) 
      {
        $id= $r['id'];
        $name = sanitize_output($r['name']);
        $tagtype = $r['type'];
        $direction = $r['direction'];
			
        $address = $r['address'];
        $bit = $r['bit'];

        $min = $r['min'];
        $max = $r['max'];
    
        $plc_min = $r['plc_min'];;
        $plc_max = $r['plc_max'];
    
        $warn_min = $r['warn_min'];    
        $warn_max = $r['warn_max'];    

        $log_interval = $r['log_interval'];    
        
    
        $html .= "<tr>";
        $html .= "<td><a href='index.php?cmd=tag_detail&id=$id&system_id=$system_id'>$name</a></td>";	
				
        $tagtype_text = "";
			
        if (isset($tagtype_list[$tagtype]))
          $tagtype_text = $tagtype_list[$tagtype];
		
        $html .= "<td>". $tagtype_text . "</td>";
    
        $direction_text = "";
			
        if (isset($dir_list[$direction]))
          $direction_text = $dir_list[$direction];
		
        $html .= "<td>". $direction_text . "</td>";
			
        $html .= "<td>$address</td>";
        $html .= "<td>$bit</td>";
        $html .= "<td>$min</td>";
        $html .= "<td>$max</td>";
        $html .= "<td>$plc_min</td>";
        $html .= "<td>$plc_max</td>";
        $html .= "<td>$warn_min</td>";
        $html .= "<td>$warn_max</td>";
        $html .= "<td>$log_interval</td>";
        
        
        $html .= "<form action=index.php  method='post' onsubmit=\"return confirm('Delete Tag?');\"  >";
        $html .= "<input type=hidden name=cmd value=tag_delete>";
        $html .= "<input type=hidden name=id value=$id>";
        $html .= "<input type=hidden name=system_id value=$system_id>";
    
        $html .= "<td><input type=submit value=Remove></td>";
        $html .= "</form>";
    
        $html .= "</tr>";
      }
    
      $html .= "</table >\n"; 
    }
    mysqli_close($link);

    $html .= "<br><br>\n";
    
    return $html;
  }
		
		
	function cmd_tag_detail()
  {
		
	/*$properties = new stdClass;
		
	$properties->save_command = "tag_update";
	$properties->header =  "<div class=header_text>Tag Detail</div>\n";
	$properties->table = "tags";
	$properties->table_id = "id";
		
		
	$properties->property_list = array();		
		
	$properties->property_list[] = create_property("Name",    "name",        "text", 8);
	
	
	$properties->property_list[] = create_property("Type",  "min",      "number", 2);
	$properties->property_list[] = create_property("Direction",  "min",      "number", 2);
	
	$properties->property_list[] = create_property("Min",  "min",      "number", 2);
	$properties->property_list[] = create_property("Max",  "max",      "number", 2);
	$properties->property_list[] = create_property("PLC Min",  "min",      "number", 2);
	$properties->property_list[] = create_property("PLC Max",  "max",      "number", 2);
	$properties->property_list[] = create_property("Warn Min",  "warn_min",      "number", 2);
	$properties->property_list[] = create_property("Warn Max",  "warn_max",      "number", 2);
	
	$properties->property_list[] = create_property("Address",  "address",      "number", 0);
	$properties->property_list[] = create_property("Bit",      "bit",      "number",0);
	
	//$properties->property_list[] = create_property("Period",  "period",      "number", 2);
	//$properties->property_list[] = create_property("Runtime", "runtime",     "number", 2);
	//$properties->property_list[] = create_property("Channel", "out_channel", "channellist",  2);
	//$properties->property_list[] = create_property("Enabled", "enabled",     "checkbox", "");	
	
	//var_dump($properties);

	display_property_edit_list($properties);*/
	
		$fname = "Tag Detail";
	
    $html = "";
  
    $link = open_database('main');
	
		$system_id = escape(get_value('system_id'));	
  
		$id = escape(get_value('id'));	
	
		$html .= "<b>Tags </b><a href='index.php?cmd=tag_add&system_id=$system_id'> <b>(+)</b> </a></br>";	
	 
    $html .= "<table border=1>\n";      
    
    $html .= "<tr>";
    
    $html .= "<th>Parameter</th>";
    $html .= "<th>Value</th>";    
    $html .= "</tr>";
    
    $link = open_database('main');
    
    $tagtype_list = make_tagtype_list();
		$dir_list = make_dir_list();
    
    $query = $link->prepare("select * from tags where id = ? order by name ");
    if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
      
    $query ->bind_param('i', $id);
    if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $query ->execute();
    if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $result = $query ->get_result();
   
    
    $r = mysqli_fetch_assoc($result);
		
    
    //$id= $r['id'];
    $name = $r['name'] ;
    $tindex= $r['tindex'] ;
    $tagtype = $r['type'];
		$direction = $r['direction'];
				
		$address = $r['address'];
		$bit = $r['bit'];

    $min = $r['min'];
    $max = $r['max'];
    
    $plc_min = $r['plc_min'];
    $plc_max = $r['plc_max'];
    
    $warn_min = $r['warn_min'];   
    $warn_max = $r['warn_max'];   
    
		$log_interval = $r['log_interval'];   
    
    $html .= "<tr>";
    $html .= "<form action=index.php>";    
    
		$html .= "<tr>";
		$html .= "<td>Name</td>";	
		$html .= "<td><input type=text name=name size=20 value='$name'></td>";	
		$html .= "</tr>";

		$html .= "<tr>";
		$html .= "<td>Type</td>";	
    $html .= "<td>";
    $html .= generate_select_str($tagtype_list, "type", $tagtype);
    $html .= "</td>";
    $html .= "</tr>";
     		
		$html .= "<tr>";
		$html .= "<td>Direction</td>";					
    $html .= "<td>";
    $html .= generate_select_str($dir_list, "direction", $direction);
    $html .= "</td>";		 
		$html .= "</tr>";	
		
		$html .= "<tr>";
		$html .= "<td>Min</td>";	
		$html .= "<td><input type=text name=min size=20 value='$min'></td>";	
		$html .= "</tr>";
		
		$html .= "<tr>";
		$html .= "<td>Max</td>";	
		$html .= "<td><input type=text name=max size=20 value='$max'></td>";	
		$html .= "</tr>";	
		
		$html .= "<tr>";
		$html .= "<td>PLC Min</td>";	
		$html .= "<td><input type=text name=plc_min size=20 value='$plc_min'></td>";	
		$html .= "</tr>";	
			
		$html .= "<tr>";
		$html .= "<td>PLC Max</td>";	
		$html .= "<td><input type=text name=plc_max size=20 value='$plc_max'></td>";	
		$html .= "</tr>";	
			
		$html .= "<tr>";
		$html .= "<td>Warn Min</td>";	
		$html .= "<td><input type=text name=warn_min size=20 value='$warn_min'></td>";	
		$html .= "</tr>";	
				
		$html .= "<tr>";
		$html .= "<td>Warn Max</td>";	
		$html .= "<td><input type=text name=warn_max size=20 value='$warn_max'></td>";	
		$html .= "</tr>";		
		
		$html .= "<tr>";
		$html .= "<td>Address</td>";	
		$html .= "<td><input type=text name=address size=20 value='$address'></td>";	
		$html .= "</tr>";
		
		$html .= "<tr>";
		$html .= "<td>Bit</td>";	
		$html .= "<td><input type=text name=bit size=20 value='$bit'></td>";	
		$html .= "</tr>";
	
	
    $html .= "<tr>";
		$html .= "<td>Log Interval</td>";	
		$html .= "<td><input type=text name=log_interval size=20 value='$log_interval'></td>";	
		$html .= "</tr>";
	
      //$html .= "<td> <input type=text name=min size=4 value='$min'> </td>";
      //$html .= "<td> <input type=text name=max size=4 value='$max'> </td>";
      //$html .= "<td> <input type=text name=plc_min size=4 value='$plc_min'> </td>";
      //$html .= "<td> <input type=text name=plc_max size=4 value='$plc_max'> </td>";
      //$html .= "<td> <input type=text name=warn_min size=4 value='$warn_min'> </td>";
      //$html .= "<td> <input type=text name=warn_max size=4 value='$warn_max'> </td>";
    
      //$html .= "<td> <input type=text name=tindex size=4 value='$tindex'> </td>";
      
    
    
    $html .= "<input type=hidden name=cmd value=tag_update>";
      
     // $html .= "<input type=hidden name=device_id value=$tdevice_id>";
  
      //$html .= "<input type=hidden name=return value=tag_list>";

    
      //$html .= "<input type=hidden name=device_id value=$device_id>";
    
		$html .= "<input type=hidden name=id value=$id>";
    $html .= "<input type=hidden name=system_id value=$system_id>";

		$html .= "</tr>";

    $html .= "<td colspan=2> <input type=submit value=Save></td>";
    $html .= "</form>";
			
    $html .= "</tr>";

    $html .= "</tr>";
    
  
    return $html;
  
  }
 
		
		
		
		
			
	function cmd_tag_add()
	{
		$fname = "Add Tag";
    $name      = get_value("name");
		$system_id = get_value("system_id");
		
    if ($name == "") $name  = "Undefined";
	
    $link = open_database('main');    

    $query = $link->prepare("insert into tags (name, system_id) values (?,?);");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
		$query->bind_param("si", $name, $system_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $query->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
		$id = mysqli_insert_id($link);

		mysqli_close($link); 
		
		Header("Location: index.php?cmd=tag_detail&id=$id&system_id=$system_id");	
	}
  	
		  
  // Update Item in database
	function cmd_tag_update()
	{
		$fname = "Update Tag";
		
    $system_id  = get_value("system_id");
		$id         = get_value("id");		
    $name       = sanitize_input(get_value("name"));
    $type			  = get_value("type");
		$direction  = get_value("direction");
		$min        = get_value("min");
		$max        = get_value("max");
		$plc_min    = get_value("plc_min");
		$plc_max    = get_value("plc_max");
		$warn_min   = get_value("warn_min");
		$warn_max   = get_value("warn_max");
		    
		$address = get_value("address");
		$bit = get_value("bit");

		$log_interval = get_value("log_interval");
    
    $ret = get_value("return");
		
		if ($id    == "") return log_error("ERROR: Must supply id\n");			 
    if ($name  == "") return log_error("ERROR: Must supply name\n");			 

    //if ($device_id == "") $device_id = -1;
    
    //$link = database_connect();
    $link = open_database('main');
      
    $query = prepare($link, "update tags set " .
														"name=?,type=?,direction=?, min=?, max=?, " .
														"plc_min=?, plc_max=?, warn_min=?, warn_max=?, " .
														"address=?, bit=?,log_interval=? " .
														"where id = ?");
        
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();						
				
    $query->bind_param("siiddiidddddd", $name, $type, $direction, 
		                   $min, $max, $plc_min, $plc_max, $warn_min, $warn_max, 
											 $address, $bit, $log_interval, $id);

 	  if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $query->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
	
		mysqli_close($link); 
       
    Header("Location: index.php?cmd=config_systemdetail&system_id=$system_id");
	}
  
  // Remove item from database
	function cmd_tag_delete()
	{
		$fname = "Delete Tag";
		
		$id         = get_value("id");			
    $device_id  = get_value("device_id");			
		$system_id  = get_value("system_id");
		
		if ($id == "") return log_error("ERROR: Must supply id\n");
	
    $link = open_database('main');

    $query= $link->prepare("delete from tags where id = ? limit 1");
 	  if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
    $query->bind_param("i", $id);
 	  if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
	
    $query->execute();
 	  if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		
    
    mysqli_close($link);    
	
		Header("Location: index.php?cmd=config_systemdetail&system_id=$system_id");	
	}
		

		

    
    
    
  
    // Make list of device types
  /*function make_device_list($link)
  {
  	$sql = "select id,name from devices";
	
		$result = $link->query($sql) or return log_error("Query Failed" . mysqli_error($link));
    
    $list = array();
    
    $list["-1"] = "Undefined";
    
    while($r = mysqli_fetch_assoc($result)) 
    {
      
      $list[$r['id']] = $r['name'];
    }      

    return $list;
  }*/
  
  
	
	  
  // Make list of device types
  function make_dir_list()
  {
    $list = array();
    
    //$list["0"] = "Undefined";
    $list["1"] = "Read";
    $list["2"] = "Write";
    
    return $list;
  }
	
	
	
  
      // Make list of device types
  function make_tagtype_list()
  {
    $list = array();
		
	//$list["0"] = "Undefined";
	$list["20"] = "Integer";
    $list["10"] = "Bit";
	$list["30"] = "Float";
		
    
    return $list;
  }
  

  
  
  /*function cmd_tag_list()
  {
    $html .= "<b><font size=6>Tags</font></b>  <br>";
   
    $html .= "<table border=1>\n";      
    
    $html .= "<tr>";
    $html .= "<th>Device</th>";
    
    $html .= "<th>Name</th>";
    
    //$html .= "<th>Hardware</th>";
    $html .= "<th>Type</th>";    
    $html .= "<th>Index</th>";
    $html .= "<th colspan=2>Option</th>";
    
    $html .= "</tr>";
    
    //$link = database_connect();
    $link = open_database('main');    
      
    
    $datablock_list = make_datablock_list($link);
    $device_list =  make_device_list($link);
    $tagtype_list = make_tagtype_list($link);

    $sql = "select tags.id,tags.name,tags.tindex,tags.device_id,type,devices.datablock_id,devices.name as dname from tags 
            left join devices on tags.device_id = devices.id  order by devices.name,tags.tindex ";
    
    
  
    //$sql = "select tags.name as name, devices.name as device_name from tags inner join devices where tags.device_id = devices.id";
    
    $result = $link->query($sql) or return log_error("Query Failed" . mysqli_error($link));
   
    
    while($r = mysqli_fetch_assoc($result)) 
    {
      $id= $r['id'];
 
      $name = $r['name'] ;
      $tdevice_id= $r['device_id'] ;
      $datablock_id = $r['datablock_id'] ;
      $tindex= $r['tindex'] ;

      $tagtype = $r['type'];
      $dname = $r['dname'];
    
      $html .= "<tr>";
      $html .= "<form action=index.php>";    
    
      $html .= "<td>$dname</td>";
      //$html .= "<td>" . $device_list[$tdevice_id] . "</td>";
      
      $html .= "<td> <input type=text name=name size=24 value='$name' size=8> </td>";
    
      $html .= "<td>";
      generate_select_str($tagtype_list, "type", $tagtype);
      $html .= "</td>";
    
      $html .= "<td> <input type=text name=tindex size=4 value='$tindex'> </td>";
    
      $html .= "<input type=hidden name=cmd value=tag_update>";
      $html .= "<input type=hidden name=id value=$id>";
      $html .= "<input type=hidden name=device_id value=$tdevice_id>";
  
      $html .= "<input type=hidden name=return value=tag_list>";

    
      //$html .= "<input type=hidden name=device_id value=$device_id>";
    
      $html .= "<td><input type=submit value=Save></td>";
      $html .= "</form>";

      $html .= "<form action=index.php>";
      $html .= "<input type=hidden name=cmd value=tag_delete>";
      $html .= "<input type=hidden name=id value=$id>";
      //$html .= "<input type=hidden name=device_id value=$device_id>";
    
      $html .= "<td><input type=submit value=Del></td>";
      $html .= "</form>";
    
      $html .= "</tr>";
    }
    

	
    mysqli_close($link);
  }*/
    
    
    
  /*
  
  function cmd_tag_devicelist()
  {
    $device_id = get_value('device_id');
    
    $html .= "<b><font size=3>Tags</font></b> <br>";

    //$link = database_connect();
  $link = open_database('main');

    $sql = "select * from devices where id = $device_id ";
 
  
    //$sql = "select tags.name as name, devices.name as device_name from tags inner join devices where tags.device_id = devices.id";
	
    $result = $link->query($sql) or return log_error("Query Failed" . mysqli_error($link));
   
    
    $r = mysqli_fetch_assoc($result);
 
    $name = $r['name'] ;
    $datablock_id = $r['datablock_id'] ;
           
    
    //if ($device_id != "")
//      $html .= "<a href=index.php?cmd=device_list>Back to devices</a><br>";    
    
    
    $datablock_list = make_datablock_list($link);
    $device_list =  make_device_list($link);
    $tagtype_list = make_tagtype_list($link);
       
       
    //$html .= "<b>Device:</b> " . $name ."<br>";
//    $html .= "<b>IO Type</b> " . $datablock_list[$type_id]. "<br>";
   
   
    $html .= "<table border=1>\n";      
    
    $html .= "<tr>";
    $html .= "<th>Name</th>";
    
    if ($device_id == "")
      $html .= "<th>Device</th>";
    
    $html .= "<th>Type</th>";
    
    $html .= "<th>Index</th>";
    
    $html .= "<th colspan=2>Option</th>";
    
    $html .= "</tr>";
    
  
    $sql = "select tags.id,tags.name,tags.tindex,tags.device_id,type,devices.datablock_id,devices.name as dname from tags 
            left join devices on tags.device_id = devices.id where device_id = $device_id order by tags.name,tags.tindex ";
  
  
// ref     $sql = "select tags.id,tags.name,tags.tindex,tags.device_id,type,devices.datablock_id,devices.name as dname from tags 
            //left join devices on tags.device_id = devices.id  order by devices.name,tags.tindex ";
    
  
  
  
	
    $result = $link->query($sql) or return log_error("Query Failed" . mysqli_error($link));
    
    
    while($r = mysqli_fetch_assoc($result)) 
    {
      $id= $r['id'];
 
      $name = $r['name'] ;
      $tdevice_id= $r['device_id'] ;
      $type_id= $r['datablock_id'] ;
      $tindex= $r['tindex'] ;

      $tagtype = $r['type'];

    
      $html .= "<tr>";
      $html .= "<form action=index.php>";    
    
      $html .= "<td> <input type=text name=name size=24 value='$name' size=8> </td>";

      //$html .= "<td>";
      //generate_select_str($device_list, "device_id", $device_id);
      //      $html .= "</td>";
    
      //if ($type_id == "") $type_id = -1;
    
      //$html .= "type: $type_id<br>";
    

    
      $html .= "<td>";
      generate_select_str($tagtype_list, "type", $tagtype);
      $html .= "</td>";
    
      $html .= "<td> <input type=text name=tindex size=4 value='$tindex'> </td>";
      
      $html .= "<input type=hidden name=cmd value=tag_update>";
      $html .= "<input type=hidden name=id value=$id>";
      $html .= "<input type=hidden name=device_id value=$device_id>";
    
      $html .= "<input type=hidden name=return value=tag_devicelist>";    
    
      $html .= "<td><input type=submit value=Save></td>";
      $html .= "</form>";

      $html .= "<form action=index.php>";
      $html .= "<input type=hidden name=cmd value=tag_delete>";
      $html .= "<input type=hidden name=id value=$id>";
      $html .= "<input type=hidden name=device_id value=$device_id>";
    
      $html .= "<td><input type=submit value=Del></td>";
      $html .= "</form>";
    
      $html .= "</tr>";
    }
    
    $html .= "</table>";
    
    $html .= "<a href=index.php?cmd=tag_add&device_id=$device_id>Add Tag</a> ";
    
    mysqli_close($link);
  }*/
    
    

	// Add item to database
	/*function cmd_tag_add()
	{
    $device_id = get_value('device_id');
    $name      = get_value("name");

    if ($name == "") $name  = "Undefined";
	
    //$link = database_connect();
    $link = open_database('main');

    $query = $link->prepare("insert into tags (name, device_id) values (?,?);");

    $query->bind_param("si", $name, $device_id);
  
    $query->execute();
	
		//$last_id = mysqli_insert_id($link);

    mysqli_close($link); 
  
		//$html .= json_encode(array('result'=>'add', 'index'=>$index, 'id'=>$last_id));
    
    Header("Location: index.php?cmd=device_detail&device_id=$device_id");
	}*/
  

  
  
?>