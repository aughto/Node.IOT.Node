<?php
  /* 
    VectorFarm (C) 2017 Aughto Inc.
    
    File:     header.php
    Purpose:  
    
    Edit:     
      3-12-2017 JH Initial
   */
?>
<html>
  <head>
    <meta charset="utf-8">
    
	<link rel="stylesheet" type="text/css" href="CSS/style.css">
	<link rel="stylesheet" type="text/css" href="CSS/bootstrap.css">
	<!-- <link href="CSS/bootstrap.css" rel="stylesheet"> -->
	
    <title><?=$prog_name?></title>
    <script type="text/javascript" src="Script/graph.js"></script>
    <script type="text/javascript" src="Script/utility.js"></script>	
    <script type="text/javascript" src="Script/ajax.js"></script>
    <script type="text/javascript" src="Script/object_types.js"></script>  
    <script type="text/javascript" src="Script/graphics.js"></script>		
    <script type="text/javascript" src="Script/ui.js"></script>	
    <script type="text/javascript" src="Script/properties.js"></script>	
    <script type="text/javascript" src="Script/websocket.js"></script>	
    <script type="text/javascript" src="Script/objects.js"></script>
    <script type="text/javascript" src="Script/object_types.js"></script>  
    <script type="text/javascript" src="Script/main.js"></script>
  
    <script type="text/javascript" src="Script/libs/jquery.min.js"></script>
    <script type="text/javascript" src="Script/libs/bootstrap.min.js"></script>	

	</head>
  <body>
<div id="header">	
	<div id="banner"><a href="index.php?cmd=view_show"> <?=$prog_name?> </a></div>
    <?php require_once("menu.php"); ?>
</div> <!-- Header -->
<br>
<article>   

