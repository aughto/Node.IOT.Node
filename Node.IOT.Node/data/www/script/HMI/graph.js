/* Graph 


*/


"use strict";

var graph = (function () 	
{
	var local = {};

	// Public

	local.show_datalog = function(id) { show_datalog(id); };


	function show_datalog(id)
	{
		
		ui.clear_selections();
		
	//	alert(id);
		window.open("PHP/data_display.php?cmd=show_graph&tag_id=" + id, "Graph", "height=800,width=1000");
		
	}
	

	return local;
}());
	








var graphs = [];

function add_graph(title, canvas, x_axis_title, y_axis_title,  x_vals, y_vals)
{
    //console.log("Adding graph: " + title + " with canvas: " + canvas);

    var graph = Object();

    graph.title = title;
    graph.x_axis_title = x_axis_title;
    graph.y_axis_title = y_axis_title;

    graph.canvas = canvas;

    graph.x_vals = x_vals;
    graph.y_vals = y_vals;


    graphs.push(graph);

    draw_graphs();
}



window.onresize = function(event) 
{
    draw_graphs();
}


function draw_graph(graph)
{
//  console.log("Drawing graph: " + graph.title + " Canvas: " + graph.canvas + "\n");

  if (graph == null) return;

  var c = document.getElementById(graph.canvas);
  
  if (c == null) return;
  
  if (graph.x_vals.length < 2) return;
  if (graph.y_vals.length < 2) return;  
  
  var ctx = c.getContext("2d");

  var rect = c.getBoundingClientRect();

  // Not quite right, needs to be done without constants
  ctx.canvas.width  = window.innerWidth - rect.left*2;
  ctx.canvas.height = window.innerHeight - rect.top - 50;
 
  var width = c.width;
  var height = c.height;
  
  var y_pad_top = 5;
  var y_pad_bottom = 5;
  
  var graph_top = 20;
  var graph_left = 40;
  var graph_width = c.width - graph_left - 20;
  var graph_height = c.height - graph_top - 20;

  var x_min = 10000, x_max = -10000;
  var y_min = 10000, y_max = -10000;

  // test data
  if (0)
  {
    graph.x_vals = [];
    graph.y_vals = [];

    var count = 10;

    for (var i = 0; i < count; i++)
    {
      graph.x_vals[i] = i+1;
      graph.y_vals[i] = (i % 2) * 4;
      //y_vals[i] =  0;//(i % 2) * 4;
    }  
  }
  
  
  // Find min and max
  for (var i = 0; i < graph.x_vals.length; i++)
  {
    if (graph.x_vals[i] < x_min) x_min = graph.x_vals[i];
    if (graph.x_vals[i] > x_max) x_max = graph.x_vals[i];
    if (graph.y_vals[i] < y_min) y_min = graph.y_vals[i];
    if (graph.y_vals[i] > y_max) y_max = graph.y_vals[i];
  }
  
  // Compute Range
  var x_range = x_max - x_min;
  var y_range = y_max - y_min;
  
//  if (y_range < 100) y_range = (y_max + 100) - y_min;
  
   // Need to hve an x_range
  if (x_range == 0) return;
  
  // No y_range
  if (y_range == 0) 
  {
      y_range = 1; 
   
      y_max = 1;
      y_min = 0;
  }
  
  
  // Compute scales and offsets  
  var x_scale = graph_width/x_range;
  var x_offset = graph_left - x_min * x_scale;
  
  var y_scale = -(graph_height-y_pad_top - y_pad_bottom)/y_range;
  var y_offset = graph_top + graph_height - y_pad_bottom  - y_min * y_scale;
  
  // Draw area border
  ctx.beginPath();
  ctx.rect(graph_left,graph_top,graph_width,graph_height);
  ctx.strokeStyle="#000000";
  ctx.stroke();
  
  // Graph the data
  ctx.beginPath();
  
  for (var i = 0; i < graph.x_vals.length - 1; i++)
  {
    var x1 = x_scale * graph.x_vals[i]   + x_offset;
    var y1 = y_scale * graph.y_vals[i]   + y_offset;
    var x2 = x_scale * graph.x_vals[i+1] + x_offset;
    var y2 = y_scale * graph.y_vals[i+1] + y_offset;

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.strokeStyle = "#1b7ce4"; 
  ctx.lineWidth = 3;

  ctx.stroke();
  
  // Draw Labels
  
  // Need general draw text function
  
  ctx.beginPath();
  ctx.font = "20px Trebuchet MS ";
  ctx.strokeStyle="#1b7ce4";  
  var text_width = ctx.measureText(graph.title).width; 
  var text_height = 15;  // Text height is estimate
  ctx.fillText(graph.title,graph_left + graph_width/2 - text_width/2, 16);
  ctx.stroke();  
  
  ctx.beginPath();
  ctx.font = "15px Trebuchet MS";
  ctx.strokeStyle="#1b7ce4";  
  var text_width = ctx.measureText(graph.x_axis_title).width; 
  var text_height = 15; 
  ctx.fillText(graph.x_axis_title,graph_left + graph_width/2 - text_width/2, graph_top + graph_height + text_height);
  ctx.stroke();
 
  
  ctx.beginPath();
  ctx.font = "15px Trebuchet MS";  
  ctx.strokeStyle="#1b7ce4";
  var text_height = 15;   
  ctx.rotate(-90 * Math.PI/180);
  ctx.fillText(graph.y_axis_title, -(graph_top + graph_height/2 + text_height/2), 15);
  ctx.rotate(90 * Math.PI/180); // reset ctx
  ctx.stroke();  
  
   
  var t1 = y_max.toFixed(1);//.toString();
  ctx.beginPath();
  ctx.font = "15px Trebuchet MS";  
  ctx.strokeStyle="#1b7ce4";
  var text_height = 15;   
  ctx.fillText(t1, 0, graph_top + text_height);
  ctx.stroke();   
  
   var t1 = y_min.toFixed(1);//.toString();
  
  ctx.beginPath();
  ctx.font = "15px Trebuchet MS";  
  ctx.strokeStyle="#1b7ce4";
  var text_height = 15;   
  ctx.fillText(t1, 2, graph_top + graph_height );
  ctx.stroke();   
  
  var t1 = x_min.toFixed(1);//.toString();
  ctx.beginPath();
  ctx.font = "15px Trebuchet MS";  
  ctx.strokeStyle="#1b7ce4";
  var text_height = 15;   
  ctx.fillText(t1, graph_left, graph_top + graph_height + text_height);
  ctx.stroke();   

  var t1 = x_max.toFixed(1);//.toString();
  ctx.beginPath();
  ctx.font = "15px Trebuchet MS";  
  ctx.strokeStyle="#1b7ce4";
  var text_height = 15;   
  var text_width = ctx.measureText(t1).width; 
  ctx.fillText(t1, graph_left + graph_width - text_width, graph_top + graph_height + text_height);
  ctx.stroke();   
}
 
 
 
function draw_graphs()
{
    for (var i = 0; i < graphs.length; i++)
        draw_graph(graphs[i]);
}

 
 


 
 