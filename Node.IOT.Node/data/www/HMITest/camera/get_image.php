<?php

header("content-type: image/jpg");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$date = microtime(true);

$cam_address = "10.0.0.115:88";
$cam_url = "http://" . $cam_address . "/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr=justin&pwd=HouseDog417&d=" . $date;

//echo $cam_url;


//http://growlab.ddns.net/camera/get_image.php


$filename = "/tmp/image.jpg";

system("rm $filename" );

system("wget '" . $cam_url . "' -O $filename" );

//system("wget " . $cam_url . " -O $filename" );


readfile('/tmp/image.jpg');




?>