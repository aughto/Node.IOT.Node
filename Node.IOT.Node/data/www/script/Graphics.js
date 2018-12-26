/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";



// Display wrapper  
		  
function DisplayType(name)
{
	this.canvas_name = name;
	this.MIN_SIZE = 0.1;						// Minimum object size in x or y
	this.MIN_X = -100000;						// Minimum x position
	this.MAX_X = 100000;						// Maximum x position
	this.MIN_Y = -100000;						// Minimum y position
	this.MAX_Y = 100000;						// Maximum y position
	this.MIN_EDIT = 0.001;					// Min change before saving object
	this.MIN_DRAW = 0.5;						// Do not draw below this size
	this.MAX_DRAW = 2000;						// Do not draw above this size
	this.MIN_TEXTDRAW = 1.0;					// Do not draw text below this size
	this.MAX_TEXTDRAW = 4000.0;				// Do not draw text below this size
	this.MIN_SCALE = 0.05;					// Minimum scale
	this.MAX_SCALE = 5.0;					// Maximum scale

	this.canvas = null;						// HTML5 Canvas
	this.context = null; 						// HTML5 Canvas context
	this.canvas_rect = null;					// Canvas rectangle

	this.min_x = 0;					// Min possible x pos in world cords
	this.max_x = 0;					// Max possible x pos in world cords
	this.min_y = 0;					// Min possible y pos in world cords
	this.max_y = 0;

	this.orig_x_ofs = 0;							// Pan offset
	this.orig_y_ofs = 0;

	this.x_ofs = 0;							// Pan offset
	this.y_ofs = 0;


	this.zoom_scale = 0.5;					// Current zoom level
	
	this.assign_canvas = function()
	{
		this.canvas = get_element(this.canvas_name);
		
		// Make sure we loaded a canvas
		if (this.canvas == null) return;
		
		this.context = this.canvas.getContext("2d");	
	}
	
	this.clear = function()
	{
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); 	// Clear
	}
	
	
	this.update_bounds = function()
	{
		// Recalc display limits

		this.min_x = this.get_world_x(0);
		this.max_x = this.get_world_x(this.canvas.width);

		this.min_y = this.get_world_y(0);
		this.max_y = this.get_world_y(this.canvas.height);
	}
	
	this.get_world_x = function (sx) { return (sx + this.x_ofs) / this.zoom_scale; }						// Screen X to World X
	this.get_world_y = function (sy) { return (sy + this.y_ofs) / this.zoom_scale; }						// Screen Y to World Y 
	
	
	
	
	this.apply_zoom = function(x, y, z, rate)
	{
		var old_scale = this.zoom_scale;
		
		this.zoom_scale *= (1 + rate * z);
			
		if (this.zoom_scale > this.MAX_SCALE) this.zoom_scale = this.MAX_SCALE;
		if (this.zoom_scale < this.MIN_SCALE) this.zoom_scale = this.MIN_SCALE;
		
		var mx = (x + this.x_ofs) / old_scale;
		var my = (y + this.y_ofs) / old_scale;
			
		this.x_ofs = this.x_ofs + mx * (this.zoom_scale - old_scale);
		this.y_ofs = this.y_ofs + my * (this.zoom_scale - old_scale);

		this.update_bounds();
	}
	
	
	this.apply_pan = function(dx, dy)
	{
		this.x_ofs = this.orig_x_ofs + delta_x;
		this.y_ofs = this.orig_y_ofs + delta_y;
				
		//if (main_display.x_ofs < -get_world_x(canvas.width)) main_display.x_ofs = -get_world_x(canvas.width);
				
		//var pan_x_min = -100;		if (main_display.x_ofs  < pan_x_min / main_display.zoom_scale) main_display.x_ofs = pan_x_min /main_display.zoom_scale ;
		//var pan_x_min = -1000;			if (main_display.x_ofs < pan_x_min) main_display.x_ofs = pan_x_min  ;
		
		this.update_bounds();
	}
	
	// Save and transform context
	this.transform = function()
	{
		this.context.save();
		
		// Apply pan and zoom
		this.context.translate(-this.x_ofs, -this.y_ofs);
		this.context.scale(this.zoom_scale, this.zoom_scale);
	}
	
	// Restore context
	this.restore = function()
	{
		this.context.restore();
	}
	
	//function get_screen_x(wx) {	return wx * main_display.zoom_scale - x_ofs;}						// World X to Screen X
	//function get_screen_y(wy) {	return wy * main_display.zoom_scale - y_ofs;}						// World Y to Screen Y
	//function grid_round(v)    { return +(v*GRID_FACTOR).toFixed(1)/GRID_FACTOR; }     	// Apply snap to grid

	
	// Determine if world cord in on screen
	this.on_screen = function (x, y, w, h)
	{
		if (x > this.max_x) return 0;
		if (x + w < this.min_x) return 0;

		if (y > this.max_y) return 0;
		if (y + h < this.min_y) return 0 ;

		return 1;
	}	
		

	/* 
	  Graphics Primitives
	*/


	// Draw text at position
	this.draw_text = function (x, y, size, color,text)
	{
		/*if (text == "") return;
		
		var size = h * this.zoom_scale;
		
		if (size < this.MIN_TEXTDRAW) return;
		if (size > this.MAX_TEXTDRAW) return;
		
		if (!this.on_screen(x,y,w,h)) return;
		
		this.context.lineWidth = 1;
		
		//size = size/main_display.zoom_scale;
		
		this.context.font = "bold " + h + "px Arial";
		this.context.fillStyle = color;

		//var line = context.measureText('M').width / main_display.zoom_scale // Estimate height

		///context.save();
		//context.translate(x, y + line);
		//context.scale(1 / main_display.zoom_scale, 1 / main_display.zoom_scale);
		this.context.fillText(text, x, y);
		//context.restore();

		this.context.stroke();*/
		
		this.context.lineWidth = 1;
		this.context.font = "bold " + size + "px Arial";
		this.context.fillStyle = color;
		
		this.context.fillText(text, x, y);
		
		this.context.stroke();
		
		//draw_count++;	
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


	// Draw text at position
	this.draw_tool_text = function(x, y, size, color,text)
	{
		if (text == "") return;
		
		this.context.lineWidth = 1;
		this.context.font = "bold " + size + "px Arial";
		this.context.fillStyle = color;
		
		this.context.fillText(text, x, y);
		
		this.context.stroke();
		
		//draw_count++;	
	}




	// Draw outline at position
	function draw_outline(display, x,y,w,h, color)
	{
		if (h * display.zoom_scale < display.MIN_DRAW) return;
		if (w * display.zoom_scale < display.MIN_DRAW) return;
		
		if (!on_screen(context,x,y,w,h)) return;
		
		display.context.lineWidth = 1 / display.zoom_scale;	
		//if (context.lineWidth > 5) context.lineWidth = 5;
		
		display.context.strokeStyle = color;
		display.context.strokeRect(x, y, w, h);	
		//draw_count++;
		
	}







	this.draw_line = function (x1, y1, x2, y2, w)
	{
		this.context.strokeStyle = "#000000";
		this.context.lineWidth = w;// / main_display.zoom_scale;	
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.stroke();
	}


	// Draw outline at position
	this.draw_arc = function(x,y,r, s, e) 
	{
		this.context.lineWidth = 1;// / main_display.zoom_scale;	
		//if (context.lineWidth > 5) context.lineWidth = 5;
		
		this.context.strokeStyle = "#000000";
		
		this.context.moveTo(x,y);
		this.context.beginPath();
		this.context.arc(x, y, r, s, e);
		
		this.context.stroke();
		//context.strokeRect(x, y, w, h);	
		//draw_count++;
		
	}





	// Draw filled rectangle at position
	/*function draw_rectangle(display, x,y,w,h, text, color, border)
	{
		//w = 100;
		//h = 100;
		//color = "#606060";
		
		
		if (h * display.zoom_scale < display.MIN_DRAW) return;
		if (w * display.zoom_scale < display.MIN_DRAW) return;	
		
		// overlap to ensure no gaps
		var pad = 0.5 / main_display.zoom_scale;

		x -= pad;
		y -= pad;
		w += 2 * pad;
		h += 2 * pad;
		
		if (!on_screen(display,x,y,w,h)) return;
		
		//console.log("y:" + y);
		
		//context.lineWidth = 0;	
		display.context.fillStyle = color;
		display.context.fillRect(x, y, w, h);		
		
		
		//border /= main_display.zoom_scale;
		
		
		
		if (border > 0)
		{
			
			if (border > 5 / display.zoom_scale )
				border = 5 / display.zoom_scale;
			
			display.context.lineWidth = border;// / main_display.zoom_scale;	
			display.context.strokeStyle = "#000000";
			display.context.strokeRect(x, y, w, h);			
		}
			
	//	draw_count++;	
	}*/

	// Draw circle at position
	/*function draw_circle(x1,y1, r, color)
	{
		context.beginPath();
		context.arc(x1, y1, r, 0, 2 * Math.PI, false);
		
		context.lineWidth = 0;
		
		context.fillStyle = color;
		context.fill();	
		
		context.closePath();	
		//context.stroke();
	}*/

	// Draw image at position
	/*function draw_image()
	{	
		// draw image
		//if (current_layer == "All" || current_layer == '1')
		{
			context.save();
			var image_scale =5;
			context.scale(image_scale * main_display.zoom_scale ,  image_scale* main_display.zoom_scale);
			var bx = 100;
			var by = 50;
					
			context.translate( -x_ofs/main_display.zoom_scale/image_scale, - y_ofs/main_display.zoom_scale / image_scale);
			context.drawImage(imageObj,bx,by);
			context.restore();
		}
	}*/
		
			
		
		
		
		
		
		
};
	  







