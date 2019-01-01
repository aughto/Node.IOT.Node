/* 
    Vector
	2015 Jason Hunt
	
	File: 
	File: Graphics.js
*/

"use strict";


/* 
  Graphics 
*/



// Todo move more into object_types


var graphics = (function () 
{
	var local = {};

	// Public 
	local.start 				= function() { start(); };
	
	local.get_canvas_rect 		= function() { return canvas_rect; };
	
	local.update_display_bounds = function() { update_display_bounds(); };
	local.render 				= function() { render(); } ;
	
	local.adjust_scale			= function() { adjust_scale(); };
	
	
	local.find_index 			= function(x, y) { return find_index(x, y); };

	local.find_objects			= function(x1, y1, x2, y2) { return find_objects(x1, y1, x2, y2) };
	
	
	local.get_screen_cords 		= function(e) { return get_screen_cords(e); };
	
	local.get_selecting			= function() { return selecting; } ;
	
	//local.get_world_x 			= function(sx) { return get_world_x(sx); };
	//local.get_world_y 			= function(sy) { return get_world_y(sy); };
	//local.get_offset 			= function() { return {x:x_ofs, y:y_ofs}; };
	local.get_zoom_scale 		= function() { return zoom_scale; } ;
	
	local.get_draw_count 		= function() { return draw_count; };
	local.grid_round 			= function(v, g) {return grid_round(v, g);};
	
	local.zoom 					= function(x,y, d) { apply_zoom(x, y, d); };
	
	
	local.start_pan 			= function() { start_pan(); };
	local.apply_pan 			= function(dx, dy) { apply_pan(dx, dy); };
	local.set_layer 			= function(l) { set_layer(l); } ;
	
	
	local.object_add 			= function(disp_prop) { return object_add(disp_prop); };
	
	
	
	local.add_handler 			= function(action, func) { add_handler(action, func); } ;

	local.action_object_moved 	= function(p) { action_object_moved(p); };
	local.action_object_resized = function(p) { action_object_resized(p); };
	local.action_object_select 	= function(p) { action_object_select(p); };
	local.action_object_unselect= function(p) { action_object_unselect(p); };
	
	local.reset_zoom 			= function() { zoom_scale = DEFAULT_ZOOM; };

	local.get_object 			= function(i) { return disp_objects[i]; };
	
	local.get_id_object			= function(id) { return get_id_object(id); };
	local.get_num_objects		= function(i) { return disp_objects.length; };
	
	
	local.get_disp_properties   = function(i) { return disp_objects[i].disp_properties; };
	

	local.clear_selections		= function() { clear_selections(); } ;
	local.remove_objects		= function() { 	disp_objects.length = 0; };
	local.object_update	 		= function(d) { object_update(d); };
	local.object_delete			= function(id) { object_delete(id); };
	
	//local.new_object 		 	= function(t,o1, o2) { return new DispObject(t,o1, o2); };

	local.new_object 		 	= function(t,o1, o2) { return new new_object(t, o1, o2); };

	
	local.draw_select			= function (x1, y1, x2, y2) { draw_select(x1, y1, x2, y2); };
	
	
	
	local.draw_rectangle = function(x,y,w,h, text, color, border) { draw_rectangle(x,y,w,h, text, color, border); };
	local.draw_text = function (x, y, w, h,color,text) { draw_text(x, y, w, h,color,text); };
	
	
	

	local.draw_image = function (data, x, y, w, h) { draw_image(data, x, y, w, h); } ;
	
	
	
	
	
	
	local.draw_start			= function() { draw_start(); }
	local.draw_end				= function() { draw_end(); }
	
	
	local.set_select 			= function (x1, y1, x2, y2, s) { set_select(x1, y1, x2, y2, s); };
	local.group_select 			= function (x1, y1, x2, y2) { group_select(x1, y1, x2, y2); } ;
	
	
	// Private 
	var MODULE = "[Graphics]  ";
		
	var action_object_moved 	= function() { log("default moved"); };
	var action_object_resized	= function() { log("default resized"); };
	var action_object_select 	= function() { log("default select"); };
	var action_object_unselect 	= function() { log("default unselect"); };
	
	// Private
	var WHEEL_FACTOR = 40.0;					// Factor for mouse wheel correction
	
	var MIN_DRAW = 0.5;						// Do not draw below this size
	var MAX_DRAW = 2000;						// Do not draw above this size
	var MIN_TEXTDRAW = 1.0;					// Do not draw text below this size
	var MAX_TEXTDRAW = 4000.0;				// Do not draw text below this size

	var MIN_SCALE = 0.1;					// Minimum scale
	var MAX_SCALE = 70.0;					// Maximum scale
	var ZOOM_RATE = 0.05;					// Mouse wheel zoom rate
	var GRID_FACTOR = 0.5;					// Grid snap divisor ft / GF
	var DEFAULT_ZOOM = 1.5;					// Current zoom level


		
	
	var screen_min_x = 0;					// Min possible x pos in world cords
	var screen_max_x = 0;					// Max possible x pos in world cords
	var screen_min_y = 0;					// Min possible y pos in world cords
	var screen_max_y = 0;					// Max possible y pos in world cords
	
	var x_ofs = 0;							// Pan offset
	var y_ofs = 0;

	var orig_x_ofs = 0;						// offset storage for panning
	var orig_y_ofs = 0;

	
	var object_x_min = 10000000;
	var object_x_max =-10000000;
	
	var object_y_min = 10000000;
	var object_y_max =-10000000;
	
	
	
	
	
	var zoom_scale = DEFAULT_ZOOM;					// Current zoom level

	
	var draw_count = 0;						// Number of draw operations per render
	
	var canvas_rect = null;					// Canvas rectangle
	
	var current_layer = "All";				// Active display layers

	var canvas = null;						// HTML5 Canvas
	var context = null; 						// HTML5 Canvas context

		
	var disp_objects = [];						// Main array of objects. Need to switch to mysql as array index

	
	//var handlers = Array();
	
	// Graphics Helpers
	//function get_screen_x(wx) {	return wx * zoom_scale - x_ofs;}						// World X to Screen X
	//function get_screen_y(wy) {	return wy * zoom_scale - y_ofs;}						// World Y to Screen Y
	function get_world_x(sx)  {	return (sx + x_ofs) / zoom_scale; }						// Screen X to World X
	function get_world_y(sy)  { return (sy + y_ofs) / zoom_scale; }						// Screen Y to World Y 
	//function grid_round(v)    { return +(v*GRID_FACTOR).toFixed(1)/GRID_FACTOR; }     	// Apply snap to grid
	
	//function grid_round_var(v, gf)    { return +(v*gf).toFixed(1)/gf; }     	// Apply snap to grid

	function grid_round(v, grid)    { return +Math.round(v / GRID_FACTOR) * GRID_FACTOR; }     	// Apply snap to grid
	
	function grid_round_var(v, grid)    { return +Math.round(v / grid) * grid; }     	// Apply snap to grid
	
	


	
	
	function start()
	{
		console.log("Graphics start");
		
		
		// Setup Canvas
		canvas = document.getElementById("hmimaincanvas");	
		context = canvas.getContext("2d");	
					

		window.onresize=function(){resize()}; 
		window.oncontextmenu=function (e) {contextmenu(e)}; 
					
			
		resize();
			
	}
	
	function contextmenu(e)
	{
			e.preventDefault();
	}
		
	
	
	
	
	
	function resize()
	{log("resize");
		
		var header_height = 10;//document.getElementById("header").clientHeight;	
		//var debug_height = 0 ;//document.getElementById("debug").clientHeight;	
		//var edit_width = document.getElementById("edit_box").clientWidth;	
	
	
		//console.log("Header: " + header_height);
	
	
		// No debug height if disabled
		//if (main.get_debug() == 0)
		//			debug_height = 0;
			
		// Resize and position canvas area
		var obj = document.getElementById("canvas_box");	
	
		obj.style.top = header_height+1;
		obj.style.height = window.innerHeight - header_height - 3;
		obj.style.width = window.innerWidth - 3;
		
		
		context.canvas.width  = window.innerWidth;// - 140;
		context.canvas.height = window.innerHeight;// - tool_display.context.canvas.height - 100;		
		
		
		//context.canvas.width  = obj.clientWidth;
		//context.canvas.height = obj.clientHeight;
		
		
		console.log(`window.innerHeight: ${window.innerHeight} `);
		
		
		
		canvas_rect = canvas.getBoundingClientRect();
	


		obj = document.getElementById("edit_box");	
		//obj.style.top = "60px";//header_height;
		//obj.style.left = context.canvas.width - edit_width - 30;
		//obj.style.height = context.canvas.height - 20;
		//obj.style.right = context.canvas.width - 30;
		
		
		
		// Position debug area
		//obj = document.getElementById("debug");	
		//obj.style.top = context.canvas.height + menu_height;
		
		// Initial pan
		//x_ofs = -context.canvas.width  / 2;
		//y_ofs = -context.canvas.height  / 2;
		



		adjust_scale();	
		
		update_display_bounds();
		
		

		
		render();
	}
	
		

		
	var selecting = 0;
	var select_x1 = 0,  select_y1 = 0;
	var select_x2 = 0,  select_y2 = 0; 
		
		
	
	
	function group_select(x1, y1, x2, y2)
	{
	//	log("group");
	//return;
		if (x1 > x2) {var t = x2; x2 = x1; x1 = t;};
		if (y1 > y2) {var t = y2; y2 = y1; y1 = t;};
		
		
		var wx1 = get_world_x(x1), wy1 = get_world_y(y1);
		var wx2 = get_world_x(x2), wy2 = get_world_y(y2);		
		
		
		for (var i = 0; i < disp_objects.length; i++)
		{
			var cx = disp_objects[i].disp_properties.x + disp_objects[i].disp_properties.w/2;
			var cy = disp_objects[i].disp_properties.y + disp_objects[i].disp_properties.h/2;
			
			if (cx < wx1 || cx > wx2) continue;
			if (cy < wy1 || cy > wy2) continue;
			
			disp_objects[i].disp_properties.selected = 1;
			
			
			
		}
		

		
		
		
	}
	

	
		
		
	function set_select(x1, y1, x2, y2, s)
	{
		//log("set: " + s);

		if (x1 > x2) {var t = x2; x2 = x1; x1 = t;};
		if (y1 > y2) {var t = y2; y2 = y1; y1 = t;};
		
		selecting = s;
		
		select_x1 = get_world_x(x1); 
		select_y1 = get_world_y(y1);
		
		select_x2 = get_world_x(x2);
		select_y2 = get_world_y(y2);		
		
		
	}
		


		function set_layer(layer)
	{
		// Change in layer
		current_layer = layer;
		
		render();

	}
	

	function clear_selections()
	{
	
		for (var i = 0; i < disp_objects.length; i++)
				disp_objects[i].disp_properties.selected = 0;
	}
	
	
	
	function get_id_object(id)
	{
		for (var i = 0; i < disp_objects.length; i++)
		{
			if (disp_objects[i].id == id) return disp_objects[i];
		}
		
		return null;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
		
	// Find which object is at a screen location
	function find_index(x, y)
	{
		var min_index = INVALID_OBJECT;
		var min_layer = 0;
	
		x = get_world_x(x);	// Convert to work cords
		y = get_world_y(y);
	
		for (var i = 0; i < disp_objects.length; i++)
		{
			//if (disp_objects[i].type == "rect")
			{
				if (disp_objects[i].disp_properties.active==0) continue;

				var ox = disp_objects[i].disp_properties.x;
				var oy = disp_objects[i].disp_properties.y;
				var ow = disp_objects[i].disp_properties.w;
				var oh = disp_objects[i].disp_properties.h;
				var l = +disp_objects[i].disp_properties.layer;
				
				if (l < min_layer) continue;		// Higher layer has priority
				
				// See if point inside object
				if (x >= ox && x <= ox + ow && y >= oy && y <= oy + oh) 
				{
					//min_dist = d;
					min_index = i;
					min_layer = l;
				}	
			}
		}
		
		return min_index;
	}
	
	
	
			
	// Find which object is at a screen location
	function find_objects(x1, y1, x2, y2)
	{
		if (x1 > x2) {var t = x2; x2 = x1; x1 = t;};
		if (y1 > y2) {var t = y2; y2 = y1; y1 = t;};
		
		
		var wx1 = get_world_x(x1), wy1 = get_world_y(y1);
		var wx2 = get_world_x(x2), wy2 = get_world_y(y2);		
				
		var object_list = Array();
		
		
		for (var i = 0; i < disp_objects.length; i++)
		{
			var cx = disp_objects[i].disp_properties.x + disp_objects[i].disp_properties.w/2;
			var cy = disp_objects[i].disp_properties.y + disp_objects[i].disp_properties.h/2;
			
			if (cx < wx1 || cx > wx2) continue;
			if (cy < wy1 || cy > wy2) continue;
			
			//disp_objects[i].disp_properties.selected = 1;
			
			object_list.push(i);
			
			
			
		}
		
		return object_list;
		
		
		
		
		/*
		
//		var min_index = INVALID_OBJECT;
		//var min_layer = 0;
	
		//x = get_world_x(x);	// Convert to work cords
		//y = get_world_y(y);
	
		for (var i = 0; i < disp_objects.length; i++)
		{
			//if (disp_objects[i].type == "rect")
			{
				if (disp_objects[i].disp_properties.active==0) continue;

				var ox = disp_objects[i].disp_properties.x;
				var oy = disp_objects[i].disp_properties.y;
				var ow = disp_objects[i].disp_properties.w;
				var oh = disp_objects[i].disp_properties.h;
				var l = +disp_objects[i].disp_properties.layer;
				
				if (l < min_layer) continue;		// Higher layer has priority
				
				// See if point inside object
				if (x >= ox && x <= ox + ow && y >= oy && y <= oy + oh) 
				{
					//min_dist = d;
					min_index = i;
					min_layer = l;
				}	
			}
		}
		
		return min_index;*/
	}
	
	

	
		
	// Correct for canvas position offset
	function get_screen_cords(e)
	{	
		return {x : e.pageX - canvas_rect.left, 
                y : e.pageY - canvas_rect.top};
	}
			
	
	// Determine if world cord in on screen
	function on_screen(x, y, w, h)
	{
		if (x > screen_max_x) return 0;
		if (x + w < screen_min_x) return 0;
		
		if (y > screen_max_y) return 0;
		if (y + h < screen_min_y) return 0 ;
	
		return 1;
	}	

	// Recalc display limits
	function update_display_bounds()
	{
		screen_min_x = get_world_x(0);
		screen_max_x = get_world_x(context.canvas.width);
		
		screen_min_y = get_world_y(0);
		screen_max_y = get_world_y(context.canvas.height);
		
		
		
		//console.log("display bounds " + screen_min_x+ " " + screen_max_x + " " + screen_min_y + " " + screen_max_y);
		
		
	}
	

	
	
	
	
	function adjust_scale()
	{
		//console.log("Adjust scale");
		
	/*	for (var i = 0; i < disp_objects.length; i++)
		{
			i//f (disp_objects[i].id == id) return disp_objects[i];
			
			var p = disp_objects[i].disp_properties;
			
			if (p.x < object_x_min) object_x_min = p.x;
			if (p.x +p.w > object_x_max) object_x_max = p.x + p.w;
			
			if (p.y < object_y_min) object_y_min = p.y;
			if (p.y +p.h > object_y_max) object_y_max = p.y + p.h;
			
			
		}*/
		
		
		//console.log("X " + object_x_min + " " + object_x_max);
		//console.log("Y " + object_y_min + " " + object_y_max);
		
		
		var x_span = object_x_max - object_x_min + 5;
		var y_span = object_y_max - object_y_min + 5;
		
		
		var canvas_x_size = canvas_rect.right - canvas_rect.left;
		var canvas_y_size = canvas_rect.bottom - canvas_rect.top;
		
		
		var x_scale = canvas_x_size / x_span ;
		var y_scale = canvas_y_size / y_span;
		
		/*
		
		if (x_scale <= y_scale) 
		{
			zoom_scale = x_scale;
			
			var mid_y = (object_y_min + object_y_max) / 2.0;
	
			y_ofs = mid_y * zoom_scale - canvas_y_size / 2.0
			x_ofs = object_x_min * zoom_scale;

	
		}
		else 
		{
			zoom_scale = y_scale;
			
					
			var mid_x = (object_x_min + object_x_max) / 2.0;
					
					
			x_ofs =  mid_x * zoom_scale - canvas_x_size / 2.0;
			y_ofs = object_y_min * zoom_scale;
		 
	
	
		}*/
		
		
		
		
		update_display_bounds();
		
		
		//{	return (sx + x_ofs) / zoom_scale; }						// Screen X to World X
	//function get_world_y(sy)  { return (sy + y_ofs) / zoom_scale; }		
		
		
		
		
		
		
		
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	function draw_triangle(x1,y1,x2,y2,x3,y3, color)
	{
		context.beginPath();
		context.moveTo(get_screen_x(x1), get_screen_y(y1));
		context.lineTo(get_screen_x(x2), get_screen_y(y2));
		context.lineTo(get_screen_x(x3), get_screen_y(y3));
		context.closePath();	
		
		context.fillStyle = color;
		context.fill();	
		
		context.stroke();
	}
	*/
	
	
	
	/*function draw_select(x1, y1, x2, y2)
	{
			if (canvas == null) {alert("Unable to load canvas"); return; }
	
		// Clear
		context.clearRect(0, 0, canvas.width, canvas.height);
			context.save();
	
	
				// Apply pan and zoom
		context.translate(-x_ofs, -y_ofs);
		context.scale(zoom_scale, zoom_scale);
		
		log("draw: " + x1 + " " + y1 + " " + x2 + " " + y2);
		
		
		draw_outline(x1,y1,x2-x1,y2-y1, "#ff2222");
	
		context.restore();
		
		//render();
	
	}*/
	
	

	// Draw text at position
	function draw_text(x, y, w, h,color,text)
	{
		if (text == "") return;
		
		var size = h * zoom_scale;
		
		if (size < MIN_TEXTDRAW) return;
		if (size > MAX_TEXTDRAW) return;
		
		if (!on_screen(x,y,w,h)) return;
		
		context.lineWidth = 1;
		context.font = "bold " + size + "px Arial";
		context.fillStyle = color;
	
		var line = context.measureText('M').width / zoom_scale // Estimate height
	
		context.save();
		context.translate(x, y + line);
		context.scale(1 / zoom_scale, 1 / zoom_scale);
		context.fillText(text, 0, 0);
		context.restore();

		context.stroke();
	
		draw_count++;	
	}


	function draw_text_angle(x, y, angle, width, s,  color,text)
	{
		if (text == "") return;
		
		var size = s * zoom_scale;
		
		if (size < MIN_TEXTDRAW) return;
		if (size > MAX_TEXTDRAW) return;
		
		if (!on_screen(x,y,size*20,size*10)) return;
	
		context.lineWidth = 1;
		context.font = "bold " + size + "px Arial";
		context.fillStyle = color;

		var text_width = context.measureText(text).width / zoom_scale;
	
		x += width / 2  - text_width / 2;	
	
		var line = context.measureText('M').width / zoom_scale // Estimate height

		context.save();
		context.translate(x, y + line);
		context.scale(1 / zoom_scale, 1 / zoom_scale);
		context.fillText(text, 0, 0);
		context.restore();
	
		context.stroke();
	
		draw_count++;	
	}

	// Draw outline at position
	function draw_outline(x,y,w,h, color)
	{
		
		
		if (h * zoom_scale < MIN_DRAW) return;
		if (w * zoom_scale < MIN_DRAW) return;
		
		if (!on_screen(x,y,w,h)) return;
	
	
		//log("f" + " " + x + " " + y + " " + w + " " + h + " " + color);
		
		
		context.lineWidth = 2 / zoom_scale;	
		//if (context.lineWidth > 5) context.lineWidth = 5;
		
		context.strokeStyle = color;
		context.strokeRect(x, y, w, h);	
		draw_count++;
		
	}

	// Draw filled rectangle at position
	function draw_rectangle(x,y,w,h, text, color, border)
	{
		//w = 100;
		//h = 100;
		//color = "#606060";
		
		
		if (h * zoom_scale < MIN_DRAW) return;
		if (w * zoom_scale < MIN_DRAW) return;	
		
		// overlap to ensure no gaps
		var pad = 0.5 / zoom_scale;
	
		x -= pad;
		y -= pad;
		w += 2 * pad;
		h += 2 * pad;
		
		if (!on_screen(x,y,w,h)) return;
		
		//console.log("y:" + y);
		
		//context.lineWidth = 0;	
		context.fillStyle = color;
		context.fillRect(x, y, w, h);		
		
		if (border > 0)
		{
			
			if (border > 5 / zoom_scale )
				border = 5 / zoom_scale;
			
			context.lineWidth = border;// / zoom_scale;	
			context.strokeStyle = "#000000";
			context.strokeRect(x, y, w, h);			
		}
			
		draw_count++;	
	}
	
	// Draw circle at position
	function draw_circle(x1,y1, r, color)
	{
		context.beginPath();
		context.arc(x1, y1, r, 0, 2 * Math.PI, false);
		
		context.fillStyle = color;
		context.fill();	
	
		context.closePath();	
		context.stroke();
	}
	

	
	function draw_start()
	{
		context.save();
	
		// Apply pan and zoom
		context.translate(-x_ofs, -y_ofs);
		context.scale(zoom_scale, zoom_scale);
		
	}
	
	
	function draw_end()
	{
				context.restore();
		
	}
	
	

	/*// Draw generic object
	function draw_object_update(obj)
	{
		

	
		obj.draw();
		//log("draw " + obj.id);
	

	}*/


	
	
	
	// Draw generic object
	/*function draw_object()
	{
	
		var p = this.disp_properties;

		if (p.active == 0) return;
		
		if (this.type == "rect") 
		{
			
			
			
			draw_rectangle(p.x, p.y, p.w, p.h, p.text, p.color, p.border);	 
			draw_text(p.x, p.y, p.w, p.h, p.tcolor, p.text);
		} else		
		// Generic
		{
			draw_rectangle(p.x, p.y, p.w, p.h, p.text, p.color, p.border);	 
			draw_text(p.x, p.y, p.w, p.h, p.tcolor, p.text);			
		}
			
			
		// Draw bounding box if selected
		if (this.disp_properties.selected)
		{
			var select_pad = 0.1;
			var select_color = "#ff0000";
			draw_outline(p.x - select_pad, p.y - select_pad, p.w + 2 * select_pad, p.h +2 * select_pad, select_color);	 
		}
	}*/
	
	
	
	function draw_object_selection(p)
	{
				var select_pad = 0.1;
			var select_color = "#ff0000";
			draw_outline(p.x - select_pad, p.y - select_pad, p.w + 2 * select_pad, p.h +2 * select_pad, select_color);	
		
		
	}
	
	
	
	
	
	
	
	
	
	

	// Main render
	function render()
	{
		//log("render");
		draw_count = 0;
	
		if (canvas == null) {alert("Unable to load canvas"); return; }
	
		// Clear
		context.clearRect(0, 0, canvas.width, canvas.height);
	
		//draw_image();
	
		context.save();
	
		// Apply pan and zoom
		context.translate(-x_ofs, -y_ofs);
		context.scale(zoom_scale, zoom_scale);

		// draw layers lowest to highest (presorted)
		for (var i = 0; i < disp_objects.length; i++)
		{
			// Layer not selected
			if (disp_objects[i].disp_properties.layer != current_layer && current_layer != "All") continue;
			
			// Object is no longer active
			if (disp_objects[i].disp_properties.active == 0) continue;
			
			
			//if (disp_objects[i].id > 900)
			//	log("drawing " +i +" " +  disp_objects[i].id + " " + JSON.stringify(disp_objects[i]));
			
			//console.log("Draw: %o", disp_objects[i]);
			
			
			disp_objects[i].draw();
			
			
			if (disp_objects[i].disp_properties.selected)
				draw_object_selection( disp_objects[i].disp_properties);
			
			
			
		}
		
		
		
		
		if (selecting)
		{
			//log("s");
			
					draw_outline(select_x1, select_y1, select_x2 - select_x1, select_y2 - select_y1, "#ff2222");
	
			
			
		}
		
		
		
		
		
		
		
		context.restore();
	}

	function apply_zoom(x, y, delta)
	{
		var old_scale = zoom_scale;
	
		zoom_scale *= (1 + ZOOM_RATE * delta);
				
		if (zoom_scale > MAX_SCALE) zoom_scale = MAX_SCALE;
		if (zoom_scale < MIN_SCALE) zoom_scale = MIN_SCALE;
	
		
		// Zoom to current mouse pos
		var mx = (x + x_ofs) / old_scale;
		var my = (y + y_ofs) / old_scale;
		
		x_ofs = x_ofs + mx * (zoom_scale - old_scale);
		y_ofs = y_ofs + my * (zoom_scale - old_scale);

		update_display_bounds();
		render();
	}



	function start_pan()
	{
		orig_x_ofs  = x_ofs;
		orig_y_ofs  = y_ofs;
	}
	

	function apply_pan(delta_x, delta_y)
	{
		x_ofs = orig_x_ofs + delta_x;
		y_ofs = orig_y_ofs + delta_y;
				
		
		//if (x_ofs < -get_world_x(canvas.width)) x_ofs = -get_world_x(canvas.width);
				
		//var pan_x_min = -100;		if (x_ofs  < pan_x_min / zoom_scale) x_ofs = pan_x_min /zoom_scale ;
		//var pan_x_min = -1000;			if (x_ofs < pan_x_min) x_ofs = pan_x_min  ;
				
		update_display_bounds();	
	}
	
	
	// Load new object data
	function object_update(data)
	{
		for (var i = 0; i < disp_objects.length; i++)
		{
			if (disp_objects[i].id == data.object_data.id)
			{
				//disp_objects[i] = data.object_data;
				
				//return;
				// What else can change?
				
				// Copy over new properties
				disp_objects[i].custom_properties = data.object_data.custom_properties;
				disp_objects[i].disp_properties = data.object_data.disp_properties;
				
				//disp_objects[i].id = data.id;
			}
		}
	
		render();
	}
	
	
	// Delete from GUI.  Make inactive
	function object_delete(id)
	{
		log("Delete");
			
		var found = -1;
	
		for (var i = 0; i < disp_objects.length && found == -1; i++)
		{
			//console.log(MODULE + "l: " + disp_objects[i].id + " " + obj.id);
			if (disp_objects[i].id == id)
			{
				
				disp_objects[i].type = "xxx";
//				disp_objects[i].id = 1000;
				
				
				disp_objects[i].disp_properties.active = 0;
				//objects[i].active = 0;
			
				found = i;
				
			//	log(MODULE + "process delete: " + found + " " + JSON.stringify(disp_objects[i]));				
				
			}
		}
		
		
		log(MODULE + "process delete: " + found + " " + JSON.stringify(disp_objects[found]));						
		
		render();
	}
	
	
	

	function object_add(object_data)
	{
	
		//object_data.draw = draw_object;
		
		//object_types.link_functions(object_data);
		
		//object_data.draw_update = draw_object_update; // lost when reloaded from server
		//log("Object add: " + object_data.disp_properties.layer + " objects: " + disp_objects.length);
	
	
	
	
		// was stored as string, need to look at
		object_data.disp_properties.layer = +parseInt(object_data.disp_properties.layer);
	
		object_data.disp_properties.x = +parseFloat(object_data.disp_properties.x);
		object_data.disp_properties.y = +parseFloat(object_data.disp_properties.y);
		object_data.disp_properties.w = +parseFloat(object_data.disp_properties.w);
		object_data.disp_properties.h = +parseFloat(object_data.disp_properties.h);
		
	
	
			var p = object_data.disp_properties;
	
	
				if (p.x < object_x_min) object_x_min = p.x;
			if (p.x +p.w > object_x_max) object_x_max = p.x + p.w;
			
			if (p.y < object_y_min) object_y_min = p.y;
			if (p.y +p.h > object_y_max) object_y_max = p.y + p.h;
			
	
	
		// find next slot for layer
		// TODO  need to fix layer change in gui, rebuild layer list
		// Look for lower layer to add after
		for (var i = 0; i < disp_objects.length; i++)
		{
			
			if (object_data.disp_properties.layer <= disp_objects[i].disp_properties.layer)
			{
				disp_objects.splice(i, 0, object_data);
				return;
			}
		}
	

	
		disp_objects.push(object_data);	
	}
	
	
	// Add action handler
	function add_handler (action, func)
	{
		if (action == "object_moved")    action_object_moved    = func;
		if (action == "object_resized")  action_object_resized  = func;
		if (action == "object_select")   action_object_select   = func;
		if (action == "object_unselect") action_object_unselect = func;
		
		//handlers.push ( { target: target, action : action, func : handler_func} );
	}


	function new_object(type, option1, option2)
	{
		
		var x = grid_round((context.canvas.width  / 2.0  + x_ofs)/zoom_scale);
		var y = grid_round((context.canvas.height / 2.0  + y_ofs)/zoom_scale);
		
		var w = grid_round(50/zoom_scale);
		var h = grid_round(50/zoom_scale);
			
		
		return object_types.get_object(type, x, y, w, h);	
	}

	
	
	
		
	function draw_image(img, x, y, w, h) 
	{
    //"use strict";
    //var canvas = document.getElementById("maincanvas");
    //var ctx = canvas.getContext("2d");

    //var uInt8Array = new Uint8Array(imgData);
    /*var uInt8Array = imgData;
    var i = uInt8Array.length;
    var binaryString = [i];
    while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    var data = binaryString.join('');

    var base64 = window.btoa(data);
*/
	//var x_pos = x;
	//var y_pos = y;
 
 
	//x_pos = 25;
	//y_pos = 250;
	
	//var x_size = 120;
	//var y_size = 80;
	
	
    //var img = new Image();
	
    //img.src = "data:image/jpg;base64," + imgData ; //base64;

    //img.onload = function () 
	//{
        //console.log("Image Onload");
		
		
		
		//draw_start();
		
		//var y_pos  50;
		
		

	
		context.drawImage(img, x, y, w, h);
		
		//draw_end();
		
		
        //ctx.drawImage(img, coords[0], coords[1], canvas.width, canvas.height);
    //};
	
    //img.onerror = function (stuff) 
	//{
        //console.log("Img Onerror:", stuff);
    //};

}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	return local;
}());
	



	
/* 
	End of graphics 
*/


