<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     rack.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
  */
  
  register_command("config_rackdetail", "cmd_config_rackdetail");
  register_command("config_addrack",    "cmd_config_addrack");
  register_command("config_deleterack", "cmd_config_deleterack");
  register_command("config_saverack",   "cmd_config_saverack");
  
  function make_system_list()
  {
    $list = Array();
    
    $fname  = "Rack List";;
    
    $html = "";
    $link = open_database('main');
	
    $system_id = get_value('system_id');
  
  
    $query = $link->prepare("SELECT * FROM systems");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
  
    //$query->bind_param('i', $system_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

  
    $query->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

  
    $result = $query ->get_result();

    $query ->close();

      
      while ($row = $result ->fetch_assoc()) 
      {
        $id = $row["system_id"];
        $name = sanitize_output($row["name"]);

        $list[$id] = $name;
	  }
		

  
  return $list;
  
  

    
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  function make_rack_menu()
  {
   // echo "test";//
    
    


    
    
    $html = "";
    
    $html .= "<ul>";
    $systems = make_system_list();
    
    foreach($systems as $system_id => $system_name)
    {
     // unset($racks);
      
      $html .= "<li><a href='#'>$system_name</a>";
      
      $racks = make_rack_list($system_id);
     $racks = Array();
     
     $racks[1] = "test";
    
      $html .= "<ul>";
      
      foreach($racks as $rack_id => $rack_name)
      {
        //objects.ui_add(\"rack\",'$rack_id');
        
          //$html .= "<li><a href='#' onclick='objects.ui_add(\"rack\",\"$rack_id\", \"$rack_name\");'>  $rack_name </a> </li>";
       
       
       $html .= "<li><a href=''>  $rack_name </a> </li>";
             
      }
      $html .= "</ul>";
      $html .="</li>";
    }
    $html .= "</ul>";

    
    //$html = "test";
    
   //echo "start";
    
    //print_r( $html);
    
    //echo "end";
    
    return $html;
 
    
    //return 
    
  }
  
  
  
  function make_rack_list($system_id)
  {
    $list = Array();
    
    $fname  = "Rack List";;
    
    $html = "";
    $link = open_database('main');
	
    //$system_id = get_value('system_id');
    //echo "$system_id";

    $query = $link->prepare("SELECT * from racks where system_id = ?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
  
    $query->bind_param('i', $system_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

  
    $query->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

  
    $result = $query ->get_result();

    $query ->close();

    while ($row = $result ->fetch_assoc()) 
    {
      $rack_id = $row["rack_id"];
		
      $name = sanitize_output($row["name"]);
        
      $list[$rack_id] = $name;
	  }
return null;
//    return $list;
  }
  
  function system_racklist()
  {
    $fname  = "Rack List";;
    
    $html = "";
    $link = open_database('main');
	
		$ret = get_value("return");
    $system_id = get_value('system_id');
  
	
  
  	// Get Module Data
    //$query = $link->prepare("SELECT * FROM main.modules where module_id=?");
    
    //$query ->bind_param('s', $id);
  
    $query = $link->prepare("SELECT * FROM main.racks where system_id=?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

  
    $query->bind_param('i', $system_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

  
    $query->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

  
    $result = $query ->get_result();

    $query ->close();

    $html .= "<b>Racks</b>\n";
	
    //	$html .= "<a href=index.php?cmd=system_showlist>Back</a><br>\n";
	
    $html .=  "<a href='index.php?cmd=config_addrack&system_id=$system_id&return=$ret'> <b>(+)</b> </a> <br> " ;
	

	
    if ($result ->num_rows == 0) 
    {
      $html .= "No Racks";
      
    }
    else
    {
      $html .= "<table class='table system_table table-striped' border=1>\n";
      $html .= "<tr>\n";
      $html .= "<th>Name</th>\n";
      $html .= "<th>Option</th>\n";
      $html .= "</tr>\n";
      
      while ($row = $result ->fetch_assoc()) 
      {
        $rack_id = $row["rack_id"];
				
        $name = sanitize_output($row["name"]);
        
        $html .= "<tr>";
        $html .= "<td><a href='index.php?cmd=config_rackdetail&rack_id=$rack_id&system_id=$system_id'>$name</a></td>";				
        $html .= "<form action='index.php' method='post' onsubmit=\"return confirm('Delete Rack?');\"  >";
        $html .= "<td>";
        
        $html .= "<input type=hidden name=cmd value='config_deleterack'>";
        $html .= "<input type=hidden name=rack_id value='$rack_id'>";
        $html .= "<input type=hidden name=system_id value='$system_id'>";
        $html .= "<input id='submit' type=submit value='Del'>";
        $html .= "</td>";
        
        $html .= "</form>";				
        $html .= "</tr>\n";
	  }
		
    $html .= "</table >\n";    
    
	}


	$html .= "<br><br>\n";

	return $html;
  }
	  
  function cmd_config_rackdetail()
  {
    $fname = "Rack Detail ";
    $html = "";
    $link = open_database('main');
	
		$return = get_value('return');
	
    $system_id = get_value('system_id');
    $rack_id = escape(get_value('rack_id'));
		  
    if ($rack_id == "") return log_error($fname . "No Rack ID");
	
    $rack_query = $link->prepare("SELECT * FROM main.racks where rack_id=?");
    
    $rack_query ->bind_param('s', $rack_id);

    $rack_query ->execute();
    $rack_result = $rack_query ->get_result();
    $rack_query ->close();

    
    if ($rack_result->num_rows == 0) return log_error("No rack data");

    $row = $rack_result ->fetch_assoc();

    $name = sanitize_output($row["name"]) ;
    
  	$html .= "<div class=header_text>Rack Detail</div>\n";
  
    $html .= "<table border=1>";
  
    $html .= "<tr>";
    $html .= "<th>Parameter</th><th>Value</th>";
    $html .= "</tr>";
	
    $html .= "<tr>";
    $html .= "<td>Name</td>";

    //<td>Option</td>";
    //$html .= "</tr>";
				
    $html .= "<form action='index.php?cmd=config_saverack' method='post'>";
    //$html .= "<tr>";
    $html .= "<td> <input type=text name=name value='$name'> </td>";
    $html .= "</tr>";
          
    $html .= "<tr>";
      
    $html .= "<td colspan=2>";
		
    $html .= "<input type=hidden name=rack_id value='$rack_id'>";
    $html .= "<input type=hidden name=system_id value='$system_id'>";
    $html .= "<input type=hidden name=return value='$return'>";
		
    $html .= "<input id='submit' type=submit value='Save'>";
    $html .= "</form>";
    $html .= "</td>";
    $html .= "</tr>\n"; 
		
    $html .= "</table >";
	
    $html .= "<br>";
	
    

    $html .= system_modulelist();
    
		return $html;
		
	//module_showlist();
  }
	    

	  
  function cmd_config_addrack()
  {
		$fname = "Add Rack";
    
    $link = open_database('main');
	
		$ret = get_value('return');
    $system_id = get_value('system_id');
    
	//$name = escape(get_value('name'));
	
    $name = "Rack";
	
    $post = $link->prepare("INSERT INTO racks (system_id,name) VALUES(?,?)");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $post->bind_param('is', $system_id, $name);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
    
    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    
    $rack_id = $link->insert_id;
    
    
    Header("location: index.php?cmd=config_rackdetail&system_id=$system_id&rack_id=$rack_id&return=$ret");		
    
  }
	
	
  function cmd_config_deleterack()
  {
		$fname = "Delete Rack";
    
    $link = open_database('main');
	
		$ret = get_value('return');
    $rack_id = escape(get_value('rack_id'));
    $system_id = escape(get_value('system_id'));
		  
    if ($rack_id == "") return;
		  		  
    $post = $link->prepare("DELETE from racks where rack_id=?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $post->bind_param('i', $rack_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();


    //$post = $link->prepare("DELETE from modules where rack_id=?");
    //$post->bind_param('i', $rack_id);
    //$post->execute();
	
  
  
    
    Header("location: index.php?cmd=config_systemdetail&system_id=$system_id&return=$ret");		
    
    
  }

  
  	  
  function cmd_config_saverack()
  {
		$fname = "Update Rack";
    
    $link = open_database('main');
	
		$ret = sanitize_input(get_value('return'));
	
    $name = sanitize_input(get_value('name'));
    $rack_id = escape(get_value('rack_id'));
    $system_id = escape(get_value('system_id'));
		
    if ($name == "") return log_error("Must supply name");
    if ($rack_id == "") return log_error("No Rack ID");
    if ($system_id == "") return log_error("No System ID");
		
    $post = $link->prepare("UPDATE racks set name=? where rack_id=?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
        
    $post->bind_param('ss', $name, $rack_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $post->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
		
		if ($ret == "system")
      header("location: index.php?cmd=show_system");				
    else
			Header("location: index.php?cmd=config_systemdetail&system_id=$system_id&return=$ret");	
      

    //Header("location: index.php?cmd=config_systemdetail&system_id=$system_id");	
    
  }
  
  
 ?>