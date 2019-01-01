<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     admin.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */

   
   /*
   
   THis is all old from reference code
   Need to fully update
   
   
   */
   
   
   
  register_command("show_admin",  "cmd_show_admin");
  register_command("show_user",   "cmd_show_user");
  register_command("save_msg",    "cmd_save_msg");
  register_command("post_msg",    "cmd_post_msg");
  register_command("show_msg",    "cmd_show_msg");
  register_command("delete_msg",  "cmd_delete_msg");
  register_command("edit_msg",    "cmd_edit_msg");
  register_command("update_msg",  "cmd_update_msg");
  register_command("save_user",   "cmd_save_user");
  register_command("edit_user",   "cmd_edit_user");
  register_command("insert_user", "cmd_insert_user");
  register_command("add_user",    "cmd_add_user");
  register_command("delete_user", "cmd_delete_user");  
    
  function cmd_show_admin()
  {
    verify_login();
    global $level;
    $link = open_database('archive');
    $plant = escape(get_value('plant'));
	
    //Use this to display functions which the user is authorized to see
	
    //User needs to be at least level 6 to see any of the admin menu
    if ($level >= 6) 
    {
      echo "<div style='display:inline-block; max-width:50%;'>";
	
      cmd_post_msg();
      cmd_show_msg();
      echo "</div>";
	
	//To see the users table, user needs even higher privileges
	//Further checks are made if user tries to access one of the user
	//functions, will need privilege level of 8
	if ($level >= 8){
	cmd_show_user();
	 }
	}
	else {echo "You are not authorized to use these resources.";}
  }
  
  function cmd_show_msg()
  {
	verify_login();
    $plant = escape(get_value('plant'));
    $link = open_database('archive');
	
	//PREPARED STATEMENTS
	$get_msg = $link->prepare("SELECT * FROM msg_board ORDER BY date desc");
	$msg_mgmt = $link->prepare("DELETE FROM msg_board WHERE date < date_sub(CURDATE(), INTERVAL 7 day)");

	//EXECUTE AND STORE RESULTS
	$get_msg->execute();
	$messages = $get_msg->get_result();
	$get_msg->close();
	
	$msg_mgmt->execute();
	//don't need to store results, deletes messages older than 1 week
	
	//Display things...
	echo "<div id='msg_form'>";
	if ($messages->num_rows == 0)
	{
		echo "No messages found.";
	}
	else{
	echo "
	    <h6>Messages</h6><table>
		<th> User </th>
		<th> Message </th>
		
		<th> Posted </th>
		<th> </th>
		<th> </th>";
	while ($row = $messages->fetch_assoc()){
		$mssg = stripslashes($row['message']);
		$who = $row['user'];
		$id = $row['id'];
		$posted = $row['date'];
		
		echo "<tr><td>".$who."</td>".
			"<td>".
		 $mssg.
			"</td>".
			"<td>".
			$posted."</td>".
		    "<td>".
		"<form action='index.php?cmd=edit_msg' method='post'>\n".
         " <input type=hidden name=id value='$id'>\n".
         " <input id='submit' type=submit value='EDIT'>\n".
         "</form>".
			"</td>".
			"<td>".
		 "<form action='index.php?cmd=delete_msg' method='post'>\n".
         " <input type=hidden name=id value='$id'>\n".
         " <input id='submit' type=submit value='DELETE'>\n".
         "</form>".
			"</td>".
			"</tr>";
	}
	echo "</table>";
	}
	echo "</div>";
  
  }
  
  function cmd_delete_msg()
  {
	  header("location: index.php?cmd=show_admin");
	  $link = open_database('archive');
	  $id = escape(get_value("id"));
	  
	  $remove = $link->prepare("DELETE FROM msg_board WHERE id = '$id'");
	  $remove->execute();
	  $remove->close();
  }
  
  function cmd_post_msg()
  {
	verify_login();
	$link = open_database('archive');

    echo "<div id='msg_form'><form action='index.php?cmd=save_msg' method='post'>\n";
    echo "<h6>New Message</h6><table>\n";
    echo "<tr><td><input id='msg' type=text length=128 name=msg placeholder='Type your message here. Enter will POST. Limit 300 characters.'></td></tr>\n";

    echo "</table>\n".
     "<input id='submit' type=submit value=\"POST\">\n".
     "</form></div>";
	
  }
  
    function cmd_save_msg()
  {
    header("location: index.php?cmd=show_admin");
    $link = open_database('archive');

    $post = $link->prepare("INSERT INTO msg_board (user, message, date) 
      VALUES(?, ?, NOW())");
    $post->bind_param('ss', $user, $msg);

    $user = $_SESSION['fullname'];
 
    $raw_msg = escape(get_value("msg"));

    if ($raw_msg == "") die("No Message");

    $msg = htmlentities($raw_msg);

    $post->execute();
  }
  
    function cmd_edit_msg() 
  {
	verify_login();
	$link = open_database('archive');
	global $level;
    $plant = escape(get_value('plant'));

	if ($level >= 9) {
		$id = escape(get_value("id"));
		//PREPARED STATEMENT
		$sql = $link->prepare("SELECT * FROM msg_board WHERE id='$id'");

		$sql->execute();
		$result = $sql->get_result();
		$sql->close();
		
		$row = $result->fetch_assoc();
		
		$uid =      stripslashes($row["id"]);
		$msg =      stripslashes($row["message"]);
		$user =      stripslashes($row["user"]);
		$date =      stripslashes($row["date"]);

		if ($msg == "") die("No Message");
		
		
		echo "<form action='index.php?cmd=update_msg' method='post'>".
		  "<br><table>".
		  "<tr><td>Message: </td>".
		    "<td><input style='width:500px; height:30px;' type=text length=300 name=msg value=\"$msg\"></td></tr>".
		  "</table>".
		  "<input type=hidden name=id value='$id'>".
		  "<input type=hidden name=user value='$user'>".
		  "<input type=hidden name=date value='$date'>".
		  "<input id='submit' type=submit value='Save'>".
		  "</form>";
	}
	else {echo "You are not authorized to use this function.";}
  }
  
  function cmd_update_msg()
  {
	header("location: index.php?cmd=show_admin");
	verify_login();
	$link = open_database('archive');
    $plant = escape(get_value('plant'));
	$id = escape(get_value("id"));
	
	$update = $link->prepare("UPDATE msg_board SET user=?, message=?, date=NOW() WHERE id='$id'");
	$update->bind_param("ss", $user, $msg);
	
	$user = $_SESSION['fullname'];
	$msg = escape(get_value("msg"));
	
	$update->execute();
	$update->close();

  }
  
  
  function cmd_show_user()
  {
	verify_login();
	$link = open_database('docs');
	global $level;
    $plant = escape(get_value('plant'));
    
	//PREPARED STATEMENTS
	$users = $link->prepare("SELECT user_id, username, first_name, last_name, level FROM docs.users ORDER BY first_name");
	
	//EXECUTE AND STORE RESULTS
	$users->execute();
	$result_users = $users->get_result();
	$users->close();
	
	if ($result_users->num_rows == 0) die ("No users found.");
	
	echo "<div id='msg_form2'><h6>TAC Online Users</h6>";
	  if ($level >= 8) {
		echo "<div id='submit' style='float:right;font-size: 10pt;'>".
		  "<a href='index.php?cmd=add_user'>ADD USER</a></div>";
	  }
		echo "<table>
		<th>User</th>
		<th>First Name</th>
		<th> Last Name </th>
		<th> Level </th>
		<th>  </th>";
	while ($row = $result_users->fetch_assoc()){
		$username = $row['username'];
		$id = $row['user_id'];
		$fname = $row['first_name'];
		$lname = $row['last_name'];
		$ulevel = $row['level'];
		
		echo "<tr>".
		  "<td>". $username ."</td>".
		  "<td>". $fname ."</td>".
		  "<td>". $lname ."</td>".
		  "<td>". $ulevel ."</td>".
		  "<td>"; 
		if ($level >= 9) {
		 echo "<form action='index.php?cmd=edit_user' method='post'>\n".
         "<input type=hidden name = id value='$id'>\n".
         "<input id='submit' type=submit value='EDIT'>\n".
         "</form>";
		}
		echo "</td>".
		 "</tr>";
	}
	echo "</table>";
	echo "</div>";
  }
  
  function cmd_edit_user() 
  {
	verify_login();
	$link = open_database('docs');
	global $level;
    $plant = escape(get_value('plant'));
	$id = escape(get_value("id"));

	if ($level >= 9) {
		
		//PREPARED STATEMENT
		$sql = $link->prepare("SELECT * FROM users WHERE user_id='$id'");

		$sql->execute();
		$result = $sql->get_result();
		$sql->close();
		
		$row = $result->fetch_assoc();
		
		$id =      stripslashes($row["user_id"]);
		$username =      stripslashes($row["username"]);
		$fname =      stripslashes($row["first_name"]);
		$lname =      stripslashes($row["last_name"]);
		$ulevel =      stripslashes($row["level"]);
		
		echo "<form action='index.php?cmd=save_user' method='post'>".
		  "<br><table>".
		  "<h4>User: $username</h4>".
		  "<tr><td>First Name</td><td><input type=text name=fname value='$fname'></td></tr>".
		  "<tr><td>Last Name</td><td><input type=text name=lname value='$lname'></td></tr>".
		  "<tr><td>Level</td><td>0<input type=range name='ulevel' min='0' max='10' value='$ulevel'>10</td></tr>".
		  "</table>".
		  "<input type=hidden name=id value='$id'>".
		  "<input id='submit' type=submit value='Save'>".
		  "</form>".
		  "<form action='index.php?cmd=delete_user' method='post'>".
		  "<input type=hidden name=id value='$id'>".
		  "<input id='submit' type=submit value='Delete'>".
		  "</form>";
	}
	else {echo "You are not authorized to use this function.";}
  }
	function cmd_save_user()
	{
		header("location: index.php?cmd=show_admin");
		verify_login();
		$link = open_database('docs');
		$id = escape(get_value("id"));
		
		//PREPARED STATEMENT
		$update = $link->prepare("UPDATE users SET first_name = ?, last_name = ?, level = ?
  		  WHERE user_id = '$id'");
		$update->bind_param("ssi", $fname, $lname, $ulevel);
		
		$fname = escape(get_value("fname"));
		$lname = escape(get_value("lname"));
		$ulevel = escape(get_value("ulevel"));
		
		$update->execute();
		$update->close();
	}
	
	function cmd_insert_user() 
	{
		header("location: index.php?cmd=show_admin");
		verify_login();
		global $level;
		if ($level >= 8){
			$link = open_database('docs');
			
			//PREPARED STATEMENT
			$add = $link->prepare("INSERT INTO users (username, password, level, first_name, last_name) VALUES (?, md5(?), ?, ?, ?)");
			$add->bind_param("ssiss", $uname, $pwd, $ulevel, $fname, $lname);
			
			$uname = escape(get_value("uname"));
			$pwd = escape(get_value("uname"));
			$ulevel = escape(get_value("ulevel"));
			$fname = escape(get_value("fname"));
			$lname = escape(get_value("lname"));
			
			$add->execute();
			$add->close();			
		}
		else {echo "You are not authorized to use this function";}
	}
	
	function cmd_add_user()
	{
		verify_login();
		global $level;
		if ($level >= 8){
		
		echo "<form action='index.php?cmd=insert_user' method='post'>".
		  "<table>".
		  "<tr><td>User Name</td><td><input type=text name=uname></td></tr>".
		  "<tr><td>First Name</td><td><input type=text name=fname></td></tr>".
		  "<tr><td>Last Name</td><td><input type=text name=lname></td></tr>".
		  "<tr><td>Access Level</td><td><input type=text name=ulevel></td></tr>".
		  "</table>".
		  "<br>Default password is the user's User Name. Advise user that he/she will need to change their password.<br>".
		  "<input id='submit' type=submit value='Save'>".
		  "</form>";
		echo "<div id='submit'><a href='index.php?cmd=show_admin'>Cancel</a></div>";
		}
	}
	
	function cmd_delete_user()
	{
		header("location: index.php?cmd=show_admin");
    
		$link = open_database('docs');
    
		global $level;
    
		$id = escape(get_value("id"));
		
		if ($level >= 9){
		
		  $delete = $link->prepare("DELETE FROM docs.users WHERE user_id='$id'");
		  $delete->execute();
		  $delete->close();
		}
		else {echo "You are not authorized to use this function.";}
	}
 
  
?>