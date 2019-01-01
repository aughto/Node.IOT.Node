<?php

  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     database.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */
   
   
    $database_error = "";

    
    function mysql_check_error($link, $message)
    {
			global $database_error;
			
			$database_error = "";
			
      if (mysqli_error($link) != "") 
        $database_error = log_error("Database Check error " . $message. " Mysql error: " . mysqli_error($link));
			return $database_error;
			
			
    }
    
       function mysql_check_error1($link, $message)
    {
			echo "error";
			
      if (mysqli_error($link) != "") 
				//echo "test";
        echo "Check error", $message. " Mysql error: " . mysqli_error($link);
			
			
			
			
    }
	function mysql_get_error()
	{
		global $database_error;
	
		return $database_error;
	}


  
  
  
  
  
  
 

  function open_database($name)
  {
    global $database_server;
    global $database_user;
    global $database_pass;
    
    $link = mysqli_connect($database_server, $database_user, $database_pass, $name);
    //$link = mysqli_connect();
    
    if (!$link) 
    {
      echo "Error: Unable to connect to database (". $name .") <br>";
      echo "Debugging errno: " . mysqli_connect_errno() . "<br>";
      echo "Debugging error: " . mysqli_connect_error() . "<br>";
      
      //debug_print_backtrace();
      
      
      exit;
    }

    $GLOBALS['link'] = $link;

    // Select the database
    mysqli_select_db($link, $name) or die('Could not select $name');

    return($link); 
  }

  function close_database($link)
  {
    // Close connection
    $link = $GLOBALS['link'];
    mysqli_close($link);
  }

  function get_result($query)
  {
    $link = $GLOBALS['link'];
  
    $result = mysqli_query($link, $query) or 
      die( log_error("Query failed: " . mysql_error()));

    return($result);
  }

  





	// Connect to database and return connection
	/*function database_connect()
	{
    global $database_name;
    
    $link = mysqli_connect() or die('Could not connect to database: ' . mysql_error());
  
    if (mysqli_connect_errno())
      die("Failed to connect to MySQL: " . mysqli_connect_error());

		$GLOBALS['link'] = $link;

		// Select the database
		mysqli_select_db($link, $database_name) or die('Could not select ' . $database_name);
	
    return($link); 
		
		//return $conn;
	}*/
  
  
    
  function prepare ($link, $query_str)
  {
    if (!($query = $link->prepare($query_str)))
    {
      die ("Prepare failed:" . $link->errno . " <br> " . $link->error);
    }
    return $query;
  }     
      
      
      
      
	
	/*function log_action($user, $action, $item)
	{
		$conn = database_connect();
		
		$add = "INSERT INTO log (user, timestamp, action, item) VALUES ('". $user ."', NOW(), '". $action ."', '". $item ."')";
		$conn->query($add);
	}*/




	
?>