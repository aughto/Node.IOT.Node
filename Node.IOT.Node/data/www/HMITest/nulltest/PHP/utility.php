<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     utility.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
  */

  $command_names = array();

  register_command("config_showactionlog",  "actionlog_show");
  register_command("config_showdatalog",  "datalog_show");

	 register_command("config_restartserver",  "cmd_config_restartserver");
  

  function register_module($module_name)
  {
    global $module_list;  
    $module_list[] = $module_name;
    
    //echo "Register: " . $module_name;
    
  }

	
	     
     
	// Return get or post value
	function get_value($name)
	{
		if (isset($_POST[$name])) return $_POST[$name];
		if (isset($_GET[$name])) return $_GET[$name];

		return "";
	}
  
  function register_command($command, $function)
  {
    global $command_names;
    $command_names[] = array($command, $function);  
  }
  
	
  // Parse client command
  function parse_command($cmd) 
  {
    global $command_names;

    for ($i = 0; $i < count($command_names); $i++)
    {
      if ($cmd == $command_names[$i][0])
      {
        return $command_names[$i][1](); // Call linked function
      }
    }

    return "Could not find [$cmd]";
  }
	
	
	
	
	
	
	
	
	
  /*function register_command($command, $function)
  {
    global $command_names;
    $command_names[] = array($command, $function);  
  }*/
  
  function register_menu($menu_item)
  {
    global $menu_items;
    $menu_items[] = $menu_item;
  }
  
  
  function create_menu()
  {
    global $plant;
    global $plant_list;
    global $menu_items;
    global $level;
    global $cmd;

    
    
  //    echo "Create Menu";
    $level = 1;
    //echo  $level;
    
    if ($level < 1) return;

    
    //echo "test";
    //print_r($menu_items);
    //echo "test";

    $menu = "";
    
    $menu .= "<ul>\n";
    
    // Add module menu items
    for ($i = 0; $i < count($menu_items); $i++)
      $menu .=  "<li>" . $menu_items[$i] . "</li>\n";
  
  		$menu .=  "</ul>\n";
  
    echo $menu;
  
  
    //set_menu($menu_items);
  }

  
  
  
  function make_menu_link($title, $cmd)
  {
    //return "<a id='nav_link' href='index.php?" . $cmd . " '>$title</a>";
    return "<a  href='index.php?" . $cmd . " '>$title</a>";
    
  }  
  
  function get_time()
  {
    $now = getdate();

    $hour = $now['hours'];
    $min = $now['minutes'];

    $mon = $now['mon'];
    $day = $now['mday'];
    $year = $now['year'];

    $ampm = "AM";

    if ($hour >= 12) { $hour -= 12; $ampm = "PM";}
    if ($hour == 12) $ampm = "PM";
    if ($hour == 0) $hour = 12;

    // Correct for min less than 10
    if ($min < 10)
      $min = "0$min";

    return ("$mon/$day/$year $hour:$min $ampm");
  }
  
  /*function get_value($index)
  {
    if (isset($_GET[$index])) return $_GET[$index];
    if (isset($_POST[$index])) return $_POST[$index];
    if (isset($_SESSION[$index])) return $_SESSION[$index];
    return"";
  }*/

  //source: DocExport
  // File: user.php

  // Return the username from the session data
  function get_user()
  {
    if (isset($_SESSION['username']))
      return(escape($_SESSION['username']));
    else
      return("guest");
  }
  
  // Return the user level from the session data
  function get_level()
  {
    if (isset($_SESSION['level']))
      return(escape($_SESSION['level']));
    else
      return(0);
  }

  // Get the fullname from the session data
  function get_fullname()
  {
    if (isset($_SESSION['fullname']))
      return(escape($_SESSION['fullname']));
    else
      return("Guest");
  }

  function log_text($text)
  {
    /*$log_file_name = 'c:\wamp\www\logs\log.txt';

    $timestamp = get_time(); 
    $username = get_user();

    if (!$handle = fopen($log_file_name, 'a')) 
      die ("Unable to write log data");
    
    if (fwrite($handle, $timestamp." | ".$username." | ".$text."\n") === FALSE) 
      die ("Unable to write log data");
       
    fclose($handle);   */
  }
  
	
	
	function log_error($error)
	{
		log_action("Error", $error);
		return $error;
	}
	
	
	function log_action($action, $detail)
	{
		$fname = "Log Action";
	
		if ($action == "") return;

		$action = sanitize_input($action);
		$detail = sanitize_input($detail);
		
    $link = open_database('main');

		$user = get_user();
		
    $query = $link->prepare("insert into action_log (user, action, detail, timestamp) values (?,?,?,NOW());");
		
		// Can not check errors in log action because logging is used for errors
		//mysql_check_error1($link, $fname. " 1");					 
		
    $query->bind_param("sss", $user, $action, $detail);
		//mysql_check_error1($link, $fname. " 2");					 
    
		$query->execute();
		//mysql_check_error1($link, $fname. " 3");					 

		mysqli_close($link); 
	}


	function actionlog_show()
	{
    $fname = "Show Log"; 
    $html = "";
	
		$html .= "<b>Action Log</b>";	
    
    $link = open_database('main');
    
    $query = $link->prepare("SELECT * FROM action_log order by id DESC");
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
      
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $result = $query ->get_result();
   
    if ($result ->num_rows == 0) 
    {
      $html .= "Log Empty";
    }
    else
    {
      $html .= "<table border=1>\n";      
    
      $html .= "<tr>\n";
      $html .= "<th>Timestamp</th>\n";
			$html .= "<th>User</th>\n";
      $html .= "<th>Action</th>\n";    
      $html .= "<th>Detail</th>\n";    		
      $html .= "</tr>\n";
    
      while($r = mysqli_fetch_assoc($result)) 
      {
        $user				= sanitize_output($r['user']);
        $action			= sanitize_output($r['action']);
        $detail			= sanitize_output($r['detail']);
        $timestamp	= sanitize_output($r['timestamp']);
    
				$html .= "<tr>\n";
    		$html .= "<td>$timestamp</td>\n";
				$html .= "<td>$user</td>\n";
				$html .= "<td>$action</td>\n";
				$html .= "<td>$detail</td>\n";
        $html .= "</tr>\n";
			}
    
      $html .= "</table>\n"; 
    }

    mysqli_close($link);

    $html .= "<br>\n";
    
    return $html;
	}
	
	function datalog_show()
	{
    $fname = "Show Log"; 
    $html = "";
	
		$html .= "<b>Data Log</b>";	
    
    $link = open_database('main');
    
    $query = $link->prepare("SELECT data_log.tag_id, data_log.timestamp, data_log.value, tags.name as tag_name FROM data_log left join tags on data_log.tag_id = tags.id  order by data_log.timestamp DESC");
    
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
      
    $query ->execute();
		if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    $result = $query ->get_result();
   
    if ($result ->num_rows == 0) 
    {
      $html .= "Log Empty";
    }
    else
    {
      $html .= "<table border=1>\n";      
    
      $html .= "<tr>\n";
      $html .= "<th>Timestamp</th>\n";
			//$html .= "<th>User</th>\n";
      $html .= "<th>Tag</th>\n";    
      $html .= "<th>Value</th>\n";    		
      $html .= "</tr>\n";
    
      while($r = mysqli_fetch_assoc($result)) 
      {
        $tag_id			= sanitize_output($r['tag_id']);
        $tag_name			= sanitize_output($r['tag_name']);
        $value			= sanitize_output($r['value']);
        $timestamp	= sanitize_output($r['timestamp']);
    
				$html .= "<tr>\n";
    		$html .= "<td>$timestamp</td>\n";
				$html .= "<td><a href=\"index.php?cmd=show_graph&tag_id=$tag_id\"> $tag_name </a></td>\n";
				$html .= "<td>$value</td>\n";
        $html .= "</tr>\n";
			}
    
      $html .= "</table>\n"; 
    }

    mysqli_close($link);

    $html .= "<br>\n";
    
    return $html;
	}
	
	
	
	
  /*function get_row($result)
  {
    $link = $GLOBALS['link'];
    
    return(mysqli_fetch_assoc($result));
  }*/
  
  
    
  
    
  function escape($str)
  {
//    return mysqli_real_escape_string($GLOBALS['link'], $str);	


      return $str;

    
  }
  
  
  
  
  
  
  function sanitize_input($s)
  {
    
    $s=  trim($s ) ;
    
    
   //$s = stripslashes($s) ;
   
    
    return $s;
    
    
    
  }
  
  
    
  
  function sanitize_output($s)
  {
    
    
    return htmlspecialchars($s,ENT_QUOTES );
    
    
    
  }
    
    
  
  
    
  function generate_select($list, $name, $selected)
  {
    echo "<select name=$name>";
          
    foreach($list as $sid => $name)
    {
      $sel = ($sid == $selected) ? " selected" : "" ;
      echo "sel:" . $sel . "<br>";
      echo "<option value=$sid " . $sel . ">$name</option>\n";
    }

    echo "</select>";
    
  }
  
  function generate_select_str($list, $name, $selected)
  {
    $out = "";
    
    $out .= "<select name=$name>";
          
    foreach($list as $sid => $name)
    {
      $sel = ($sid == $selected) ? " selected" : "" ;
      //$out .= "sel:" . $sel . "<br>";
      $out .= "<option value=$sid " . $sel . ">$name</option>\n";
    }

    $out .= "</select>";
    
    return $out;
  }
  
  
  
  
  
  
  function fix_quotes($str)
  {
    $str=  str_ireplace("'",  "&apos;", $str);
    $str=  str_ireplace("\\", "&bsol;", $str);
    $str=  str_ireplace('"',  "&quot;", $str);

    return $str;
  }
       
    
  function cmd_config_restartserver()
  {
	log_action("Notice", "Request server restart");
	
	//system("sudo -u justin /project/Server/restart > /dev/null");
	
	system("/project/Server/restart > /dev/null");
	
	return "Requested server restart";
  }
  

  
?>