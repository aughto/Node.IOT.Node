<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     menu.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */


  
	if (!isset($view_mode)) $view_mode = "";
	//echo "View mode: $view_mode";
	
	$level = get_level();
	
	//echo "Level: $level";
  
?>

<nav id="main_nav">
  <ul>
    <li>
	  <?php if ($view_mode == "edit" && $level >= 5) { ?>
      <a class="navbar-brand" href="index.php?cmd=view_show&view_mode=edit">Edit</a>
			
      <ul>
        <li>
          <a href="index.php?cmd=view_show">Views</a>
          <ul>
            <li><a href ='#' onclick=ui.set_view('1');>Overview</a></li>
            <li><a href ='#' onclick=ui.set_view('2');>View 1</a></li>
            <li><a href ='#' onclick=ui.set_view('3');>View 2</a></li>
            <li><a href ='#' onclick=ui.set_view('4');>View 3</a></li>
            <li><a href ='#' onclick=ui.set_view('5');>View 4</a></li>
          </ul>
        </li>
				  
				<li>
					<a  href="index.php?cmd=view_show">Layers</a>
					<ul>
					  <li><a href ='#' onclick=ui.set_layer('All');>All Layers</a></li>
					  <li><a href ='#' onclick=ui.set_layer('1');>Layer 1</a></li>
					  <li><a href ='#' onclick=ui.set_layer('2');>Layer 2</a></li>
					  <li><a href ='#' onclick=ui.set_layer('3');>Layer 3</a></li>
					  <li><a href ='#' onclick=ui.set_layer('4');>Layer 4</a></li>
					  <li><a href ='#' onclick=ui.set_layer('5');>Layer 5</a></li>
					  <li><a href ='#' onclick=ui.set_layer('6');>Layer 6</a></li>
					  <li><a href ='#' onclick=ui.set_layer('7');>Layer 7</a></li>
					  <li><a href ='#' onclick=ui.set_layer('8');>Layer 8</a></li>
					  <li><a href ='#' onclick=ui.set_layer('9');>Layer 9</a></li>
					  <li><a href ='#' onclick=ui.set_layer('10');>Layer 10</a></li>
					</ul>  
				</li>
				<li><a href="index.php?cmd=view_show">Add</a>
					<ul>
					  <li><a href ='#' onclick=objects.ui_add('rect'); >Rectangle</a></li>
					  
					  <li><a href ='#' onclick=objects.ui_add('vardisplay'); >Var Display</a></li> 
					  <li><a href ='#' onclick=objects.ui_add('varinput'); >Var Input</a></li> 
					  <li><a href ='#' onclick=objects.ui_add('bitdisplay'); >Bit Display</a></li> 
					  <li><a href ='#' onclick=objects.ui_add('bitinput'); >Bit Input</a></li> 					  
					  <li><a href ='#' onclick=objects.ui_add('camera'); >Camera</a></li> 					  
					  
					  <li><a href ='#' onclick=objects.ui_add('rack'); >Rack</a>
					  <?php echo make_rack_menu(); ?>
					  
					  </li>

					  <li><a href ='#' onclick=objects.ui_add('module'); >Module</a></li>

					  

					</ul>  
				</li>            
				
							<li><a href="index.php?cmd=view_show&view_mode=run">Run Mode</a> </li>
				
		</ul>
				
			
		<?php } else { ?>
			<a class="navbar-brand" href="index.php?cmd=view_show&view_mode=run">View</a>
		<?php if ($level >= 5) { ?>
		<ul>
			
				<li>
					<a href="index.php?cmd=view_show">Views</a>
					
					<ul>
					  <li><a href ='#' onclick=ui.set_view('1');>Overview</a></li>
					  <li><a href ='#' onclick=ui.set_view('2');>View 1</a></li>
					  <li><a href ='#' onclick=ui.set_view('3');>View 2</a></li>
					  <li><a href ='#' onclick=ui.set_view('4');>View 3</a></li>
					  <li><a href ='#' onclick=ui.set_view('5');>View 4</a></li>
					</ul>
										
				</li>
				  
				<li><a href="index.php?cmd=view_show&view_mode=edit">Edit Mode</a> </li>
				
		
			
				
				
			</ul>
				<?php } ?>
							<?php } //	end of view mode check ?>

		</li>
		<li>
			<a class="navbar-brand" href=index.php?cmd=show_system> Farm </a>
			<?php if ($level >= 5) { ?>
			<ul>
				<li><a href=index.php?cmd=show_system>System</a></li>
			</ul>
			<?php } ?>
			
		</li>
		<li>
		<a class="navbar-brand" href=index.php?cmd=config_showhome>Config</a>
		<?php if ($level >= 5) { ?>
		<ul>
		  <li><a href=index.php?cmd=config_showcrops>Crops</a></li>
		  <li> <a href=index.php?cmd=config_showtest>Test</a></li>
				<li><a href=index.php?cmd=config_showsystems>Systems</a></li>
				<li><a href=index.php?cmd=config_showactionlog>Action Log</a></li>		  
				<li><a href=index.php?cmd=config_restartserver>Restart</a></li>	
			</ul>
			<?php } ?>
	  </li>
	  
	  <li>
		<a class="navbar-brand" href='index.php?cmd=user_showwelcome'>User</a>
		<ul>
		  <!--<li><a href=index.php?cmd=user_showlogin>Login</a></li>-->
				<li><a href=index.php?cmd=user_logout>Logout</a></li>
				<!-- <li><a href=index.php?cmd=user_showprofile>Profile</a></li> -->
			</ul>
	  </li>
	</ul>
</nav>
