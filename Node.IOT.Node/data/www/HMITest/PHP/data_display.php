<html>
<head>
<script type="text/javascript" src="../Script/graph.js"></script>
</head>

<body>

<?php

  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     graph.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */

   
   require_once("utility.php");
   require_once("../config.php");
   
   require_once("user.php");
   require_once("database.php");
   
   
   
   
  //register_command("show_graph", "cmd_show_graph");

  // Show a graph test
  function show_graph()
  {
    $fname = "Show Log"; 
    $html = "";
    
    $tag_id = get_value("tag_id");
    
    verify_login();
	
	//$html .= "<b>Data Log</b>";	
    
	

	
	
	
	
	
	
	// Get tag name.
	// Should this be passed?
	
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


	// Date math 

    		
	$days = get_value("days");
	$offset = get_value("offset");
	
	if ($days == "") $days = 1;
	if ($offset == "") $offset = 0;
	
	
	//echo "Days: $days<br>";
	//echo "Offset: $offset<br>";
	
	$date_options = ["Day", "Week", "Month", "Quarter", "Year"];
	$date_days   = [1, 7, 30, 90, 180, 360];
		
	
	$prev_range = $offset - $days;
	$next_range = $offset + $days;
	
	if ($next_range > 0) $next_range = 0;
	
    
	$start_day = $offset - $days;
	$end_day = $offset;
	
	//echo "Start: $start_day <Br>";
	//echo "End: $end_day <br>";
	
	
	// Get data for range
    
    $query = $link->prepare("SELECT * from data_log where tag_id=? and " .
	                        "timestamp >= DATE_ADD(NOW(), INTERVAL ? DAY) and ".
							"timestamp <= DATE_ADD(NOW(), INTERVAL ? DAY)  ". 
							" order by timestamp ASC");
	

	if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $query ->bind_param('iii', $tag_id, $start_day, $end_day);
	if (mysql_check_error($link, $fname) != "")	return mysql_get_error();          
    
    $query ->execute();
	if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $result = $query ->get_result();

	$x_vals = Array();
	$y_vals = Array();
   
   
    $start_date = "";
    $end_date = "";
   
   
    $rows = $result ->num_rows;
   
   
    $index = 0;
      while($r = mysqli_fetch_assoc($result)) 
      {
        //$tag_id			= sanitize_output($r['tag_id']);
        $value			= sanitize_output($r['value']);
        //$timestamp	= sanitize_output($r['timestamp']);
    
		if ($index == 0) $start_date = sanitize_output($r['timestamp']);
		if ($index == $rows - 1) $end_date = sanitize_output($r['timestamp']);
	
	
        $x_vals[] = $index;
        $y_vals[] = $value;
    
        $index++;
	}
    
    //echo "Values: (" . $index .")";
    
    mysqli_close($link);


    //var_dump ($x_vals);
    //var_dump($y_vals);
	
    $x_str = implode($x_vals, ",");
    $y_str = implode($y_vals, ",");
	
    $html .= "<br>";
	
	$graph_title = $tag_name . " " . $start_date  . " - " .  $end_date;
	
	//echo $graph_title;
	
	    
    $html .=  "<canvas id='graph_canvas'></canvas>\n";
    $html .=  "<script>add_graph('$graph_title','graph_canvas', 'Point', 'Value',[$x_str],[$y_str]);</script>\n";
  
  
    //$html .= "Date Range: $start_date  - $end_date<br>";
  
  
  	
	$html .= "<table>";
	
	$html .= "<tr>";
	

	
	
	
	$html .= "<form action='?days=$days'>";
	

      $html .= "<td>\n";

      $html .= "<input type=hidden name=tag_id value='$tag_id'>\n";
      $html .= "<input type=hidden name=offset value='0'>\n";


      

	$html .= "<td><select name=days style=''>";
		
	$num_channels = 16;
				
	
	for ($j = 0; $j < count($date_options); $j++)
	{
		$html .= "Name: " . $date_options[$j] . "<br>";
		
		
		if ($days == $date_days[$j])
			$html .= " <option value='".$date_days[$j]."' selected>".$date_options[$j]."</option>";
		else
			$html .= " <option value='".$date_days[$j]."'>".$date_options[$j]."</option>";
		}
				
	$html .= "</select>";
	
	
      $html .= "<input id='submit' type=submit value='Update'></td>\n";

	
      $html .= "</form>\n";				
	
	
		$html .= "<form action='?days=$days'>";
      $html .= "<input type=hidden name=tag_id value='$tag_id'>\n";
      $html .= "<input type=hidden name=offset value='$prev_range'>\n";
	 $html .= "<input type=hidden name=days value='$days'>\n";
	$html .= "<td><input id='submit' type=submit value='Prev'></td>";
	  $html .= "</form>\n";	
	
	$html .= "<form action='?days=$days'>";
      $html .= "<input type=hidden name=tag_id value='$tag_id'>\n";
      $html .= "<input type=hidden name=offset value='$next_range'>\n";
	  $html .= "<input type=hidden name=days value='$days'>\n";
	$html .= "<td><input id='submit' type=submit value='Next'></td>\n";
	  $html .= "</form>\n";	
	
	$html .= "</tr>";
	
	$html .= "</table>";
	
  
  
  
  
  
  
  
  
  
  
  
  
    return $html;
  }
  
  
  
  
  
  echo show_graph();
  
  
  
  
  
  
  
  
  
 ?>
 </body>
 </html>
 