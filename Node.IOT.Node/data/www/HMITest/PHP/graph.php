<?php

  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     graph.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */

  register_command("show_graph", "cmd_show_graph");

  // Show a graph test
  function cmd_show_graph()
  {
    $fname = "Show Log"; 
    $html = "";
    
	$html .= "test";
	
    $tag_id = get_value("tag_id");
    
    verify_login();
	
		//$html .= "<b>Data Log</b>";	
    
    $link = open_database('main');
    
    $query = $link->prepare("SELECT * from tags where id = ?");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		
      
    $query ->bind_param('i', $tag_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
      
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();		

    $result = $query ->get_result();
    $query ->close();

    if ($result ->num_rows != 1) return log_error($fname, "Bad Tag data");
       
    $r = mysqli_fetch_assoc($result); 

    //print_r($r);
    
    $tag_name	= sanitize_output($r['name']); 
    
    //return "";
    
    
    $query = $link->prepare("SELECT * from data_log where tag_id=? order by timestamp ASC");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $query ->bind_param('i', $tag_id);
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
          
    
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $result = $query ->get_result();
   

   $x_vals = Array();
   $y_vals = Array();
   
   
    $index = 0;
      while($r = mysqli_fetch_assoc($result)) 
      {
        $tag_id			= sanitize_output($r['tag_id']);

        $value			= sanitize_output($r['value']);
        //$timestamp	= sanitize_output($r['timestamp']);
    
        $x_vals[] = $index;
        $y_vals[] = $value;
    
        $index++;
			}
    
    //echo "Values: (" . $index .")";
    
    mysqli_close($link);

  
  
  
  
  
  
  
  
    //$x_vals = array(0,1,2,3, 4,5);
    //$y_vals = array(0,1,0,0,99,0);

    //var_dump ($x_vals);
    //var_dump($y_vals);
	
    $x_str = implode($x_vals, ",");
    $y_str = implode($y_vals, ",");
	
    $html .= "<br>";
	    
    $html .=  "<canvas id='graph_canvas'></canvas>\n";
    $html .=  "<script>add_graph('$tag_name','graph_canvas', 'Point', 'Value',[$x_str],[$y_str]);</script>\n";
  
    return $html;
  }
  
 ?>