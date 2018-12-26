/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


/* 
  Graphics Primitives
*/

// Graphics Helpers
//function get_screen_x(wx) {	return wx * main_display.zoom_scale - x_ofs;}						// World X to Screen X
//function get_screen_y(wy) {	return wy * main_display.zoom_scale - y_ofs;}						// World Y to Screen Y
function get_world_x(display, sx)  {	return (sx + display.x_ofs) / display.zoom_scale; }						// Screen X to World X
function get_world_y(display, sy)  { return (sy + display.y_ofs) / display.zoom_scale; }						// Screen Y to World Y 
//function grid_round(v)    { return +(v*GRID_FACTOR).toFixed(1)/GRID_FACTOR; }     	// Apply snap to grid
	
// Determine if world cord in on screen
function on_screen(display, x, y, w, h)
{
	if (x > display.max_x) return 0;
	if (x + w < display.min_x) return 0;
	
	if (y > display.max_y) return 0;
	if (y + h < display.min_y) return 0 ;

	return 1;
}	

// Recalc display limits
function update_display_bounds(display)
{
	display.min_x = get_world_x(display, 0);
	display.max_x = get_world_x(display, display.canvas.width);
	
	display.min_y = get_world_y(display, 0);
	display.max_y = get_world_y(display, display.canvas.height);
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
function draw_tool_text(display, x, y, size, color,text)
{
	if (text == "") return;
	
	
	display.context.lineWidth = 1;
	display.context.font = "bold " + size + "px Arial";
	display.context.fillStyle = color;

	
	display.context.fillText(text, x, y);
	
	display.context.stroke();
	
	//draw_count++;	
}


// Draw text at position
function draw_text(display, x, y, w, h,color,text)
{
	if (text == "") return;
	
	var size = h * display.zoom_scale;
	
	if (size < display.MIN_TEXTDRAW) return;
	if (size > display.MAX_TEXTDRAW) return;
	
	if (!on_screen(display,x,y,w,h)) return;
	
	display.context.lineWidth = 1;
	
	//size = size/main_display.zoom_scale;
	
	display.context.font = "bold " + h + "px Arial";
	display.context.fillStyle = color;

	//var line = context.measureText('M').width / main_display.zoom_scale // Estimate height

	///context.save();
	//context.translate(x, y + line);
	//context.scale(1 / main_display.zoom_scale, 1 / main_display.zoom_scale);
	display.context.fillText(text, x, y);
	//context.restore();

	display.context.stroke();
	
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



function draw_line(display, x1, y1, x2, y2)
{
	
	display.context.strokeStyle = "#000088";
	display.context.lineWidth = 1;// / main_display.zoom_scale;	
	display.context.beginPath();
	display.context.moveTo(x1,y1);
	display.context.lineTo(x2,y2);
	display.context.stroke();
	
	
	
}



function draw_symbol_line(display, x1, y1, x2, y2)
{
	
	display.context.strokeStyle = "#000000";
	display.context.lineWidth = 3;// / main_display.zoom_scale;	
	display.context.beginPath();
	display.context.moveTo(x1,y1);
	display.context.lineTo(x2,y2);
	display.context.stroke();
	
	
	
}


// Draw outline at position
function draw_arc(display, x,y,r, s, e)
{
	
	display.context.lineWidth = 1;// / main_display.zoom_scale;	
	//if (context.lineWidth > 5) context.lineWidth = 5;
	
	display.context.strokeStyle = "#000000";
	
	display.context.moveTo(x,y);
	display.context.beginPath();
	display.context.arc(x, y, r, s, e);
	
	display.context.stroke();
	//context.strokeRect(x, y, w, h);	
	//draw_count++;
	
}





// Draw filled rectangle at position
function draw_rectangle(display, x,y,w,h, text, color, border)
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
}

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

