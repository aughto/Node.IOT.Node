<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     user.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
  */

  register_command("user_login",          "cmd_login");
  register_command("user_logout",         "cmd_logout");
  register_command("user_showprofile",   "cmd_show_profile");
  
  register_command("save_profile",   "cmd_save_profile");
  register_command("save_pwd",       "cmd_save_pwd");
  register_command("show_msg_board", "cmd_show_msg_board");
  register_command("about",          "cmd_about");
 
  register_command("show_default_home",      "cmd_show_default_home");
  register_command("user_showwelcome",      "user_show_welcome");
 
 
 
 function user_show_welcome()
 {
       
    return "<h5>Welcome " . $_SESSION['fullname'] . ".</h5>";
 }
 
 function cmd_show_default_home()
 {
    global $location_name;
    global $greeting;
    global $plant;
    
    $html = "";

    if (!isset($_SESSION['username']))
    {
      return show_login();
    }
    

    $html .=  "<div style='display:inline-block; width:55%; margin-right:25px;'>"; 
    //$html .= "  <br><h7>Welcome to $location_name</h7>";
    //$html .= "  <p>$greeting</p>";
      
    $html .=  "Home";
    
	
   $html .=  "<div id='display_right'>\n";
	
    $html .=  "<div id='display_left'>\n";
      
    // These need to be configurable in config.php
   
       
   $html .=  "</div>\n";
	
	
    $html .=  "  <div id='display_left'>\n";

    $html .=  "  </div>\n";
	
    $html .=  "</div>\n";
    
    return $html;
    
 }
 
  function show_login()
  {
    $html = "";
     $html .=   "<h3>User Login</h3>\n
           <form id='form' action='index.php?cmd=user_login' method='post'>\n
             Username: <br> <input id='login_form' type='text' name='username'><br>\n
             Password: <br> <input id='login_form' type='password' name='password'>\n
             <br><input id='submit' type='submit' name='login' value='Login'>\n
           </form>\n";
           
           return $html;
  }
  
  function verify_login()
  {
    $html = "";
    
    // Check for login action
    $cmd = get_value("cmd");
    
    // Must be treated separately 
    if ($cmd == "user_login") 
    {
      $html .= cmd_login();
      
//      if (!isset("usernam"))
        //$html .= show_login();
      
      //..return $html;
      
      
    } 
    
    if (!isset($_SESSION['username'])) 
    {
    
      //$html .= "You are not logged in.";
      
      //$html .= show_login();
      $html .= show_login();
      
      //return 0;
    }
    
    return $html;
  }
  
  
  function cmd_login()
  {
    $fname = "User Login";
  	$html = "";
  
    global $site_salt, $site_user, $site_pass;

    $username = escape(get_value('username'));
    $password_clear = escape(get_value('password'));
    
    if ($username == "")       return log_error("No username");
    if ($password_clear == "") return log_error("No password");
    
    $password = hash('sha512', $site_salt . $password_clear);

    
    $first_name = "None";
    $last_name = "None";
    $level = 0;
    $clear = 0;
    
    // Override code
    if ($username == $site_user)
    {
     if ($password == $site_pass)
     {
        $first_name = "Demo";
        $last_name = "User";
        $level = 5;
        $clear = 1;
     }
    }
    else
    {  
      $link = open_database('main');  
    
      $query = $link->prepare("SELECT * FROM users where username=?");
    
      if (mysql_check_error($link, $fname) != "")	return mysql_get_error();    
    
      $query ->bind_param('s', $username);
      if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

      $query ->execute();
      if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

      $result = $query ->get_result();
      $query ->close();

      if ($result->num_rows != 1) 
      {
        return "<br> Login Incorrect <br>";
      }
    
      $row = $result ->fetch_assoc();
    
      $first_name   = sanitize_output($row["first_name"]);
      $last_name    = sanitize_output($row["last_name"]);
      $level        = sanitize_output($row["level"]);
      $db_password  = sanitize_output($row["password"]);
    
      close_database($link);
    
      if ($row['user_id'] != "" && $db_password == $password) $clear = 1;
    }
  
    $name = $first_name . " " . $last_name ;

    if ($clear == 0)
    {
        return "<br> Login Incorrect <br>";
    }
  
    // Save username and access level
    $_SESSION['username'] = $username;
    $_SESSION['fullname'] = $name;
    $_SESSION['level'] = $level;

    log_text("logged in");
    
    $html .= user_show_welcome();


    return $html;
  }
 
  function cmd_logout()
  {
    $html = "";
    
    header("location: index.php"); 
  
    // Remove all of the session variables
    unset($_SESSION['username']);
    unset($_SESSION['fullname']);
    unset($_SESSION['level']);

    //$html .=$html .= "<br>You have been logged off.<br>";
  
    session_destroy();
    
    return $html;
  
  }
  
  function cmd_show_profile()
  {
	$fname = "Show Profile";
  $html = "";
  
  verify_login();
  
	$link = open_database('main');
	$user = $_SESSION["username"];

	$query = $link->prepare("SELECT * FROM users WHERE username=?");
  if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
  
  $query ->bind_param('s', $user);
	if (mysql_check_error($link, $fname) != "")	return mysql_get_error();
  
	$query->execute();
	if (mysql_check_error($link, $fname) != "")	return mysql_get_error();

    
	$result = $query->get_result();
  
  
	$query->close();
		
	$row = $result->fetch_assoc();
    $fname =  stripslashes($row["first_name"]);
    $lname =  stripslashes($row["last_name"]);
    $pwd =    stripslashes($row["password"]);
    $uname =  stripslashes($row["username"]);
    $email =  stripslashes($row["email"]);
    $wphone = stripslashes($row["phone"]);
    $cphone = stripslashes($row["cell_phone"]);
    $id =     stripslashes($row["user_id"]);

	$html .= "<br><div id='profile'>";
	$html .= "<center><h6><img src='images/profile.png' style='height:75px;'><br>". $fname." ".$lname."</h6></center>";
	/*	"<br>".
		"Username: ".$uname."<br>".
		"Email: ".$email."<br>".
		"Extension: ".$wphone."<br>".
		"Phone Number: ".$cphone;
	$html .= "</div>";*/
  
		$html .= "<form action='index.php?cmd=save_profile' method='post'>".
		  "<br><table>".
		  "<tr><td>User Name</td><td>$uname</td></tr>".
		  "<tr><td>First Name</td><td><input type=text name=fname value='$fname'></td></tr>".
		  "<tr><td>Last Name</td><td><input type=text name=lname value='$lname'></td></tr>".
		  "<tr><td>Email</td><td><input type=text name=email value='$email'></td></tr>".
		  "<tr><td>Extension</td><td><input type=text name=wphone value='$wphone'></td></tr>".
		  "<tr><td>Phone Number</td><td><input type=text name=cphone value='$cphone'></td></tr>".
		  //"<tr><td>Password</td><td><input type=password name=pwd placeholder='Change Password'></td></tr>".
		  "</table>".
		  //"<input type=hidden name=pwd value='$pwd'>".
		  "<input type=hidden name=id value='$id'>".
		  "<center><input id='submit' type=submit value='SAVE'></center>".
		  "</form>".
		  "<form action='index.php?cmd=save_pwd' method='post'>".
		  "<br><table>".
		  "<tr><td>Password</td><td><input type=password name=pwd placeholder='Change Password'></td></tr>".
		  "</table>".
		  "<input type=hidden name=id value='$id'>".
		  "<center><input id='submit' type=submit value='CHANGE'></center>".
		  "</form>".
		  "</div>";
      
      return $html;
      
  }
  
  function cmd_save_profile() 
  {
	header("location: index.php?cmd=user_showprofile");
	verify_login();
	$link = open_database('docs');
	$id = escape(get_value("id"));
	$user = $_SESSION['username'];
	$sid = $_SESSION['username'];
	
	if ($sid = $id) {
		
	//PREPARED STATEMENT
	$update = $link->prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, cell_phone = ?
  	  WHERE user_id = '$sid'");
	$update->bind_param("sssss", $fname, $lname, $email, $wphone, $cphone);
	
	$fname = escape(get_value("fname"));
	$lname = escape(get_value("lname"));
	$email = escape(get_value("email"));
	$wphone = escape(get_value("wphone"));
	$cphone = escape(get_value("cphone"));
	$pwd = escape(get_value("pwd"));
	
	
	$update->execute();
	$update->close();
	$html .= "Changes saved successfully.";
	}
	else {$html .= "User mismatch!";}
  
  return $html;
  
  }
  
  function cmd_save_pwd() 
  {
	header("location: index.php?cmd=user_showprofile");
	verify_login();
	$link = open_database('docs');
	$id = escape(get_value("id"));
	$user = $_SESSION['username'];
	$sid = $_SESSION['username'];
	
	if ($sid = $id) {
		
	//PREPARED STATEMENT
	$update = $link->prepare("UPDATE users SET password = md5(?)
  	  WHERE user_id = '$sid'");
	$update->bind_param("s", $pwd);
	
	$pwd = escape(get_value("pwd"));
	
	
	$update->execute();
	$update->close();
	$html .= "Changes saved successfully.";
	}
	else {$html .= "User mismatch!";}
  
  return $html;
  
  
  }
  
  function cmd_about()
  {
	  verify_login();
 
	  $html .= "<br><center></center>";

    return $html;
  
  }
  
  
  
  
 
?>