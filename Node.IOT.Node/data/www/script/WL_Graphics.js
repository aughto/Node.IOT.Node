
/* 
    JS Vector Engine
	2015 Jason Hunt
	
	File: Graphics.js
*/

"use strict";


/* 
  Graphics 
*/

// Graphics Helpers
function get_screen_x(wx) {	return wx * zoom_scale - x_ofs;}						// World X to Screen X
function get_screen_y(wy) {	return wy * zoom_scale - y_ofs;}						// World Y to Screen Y
function get_world_x(sx)  {	return (sx + x_ofs) / zoom_scale; }						// Screen X to World X
function get_world_y(sy)  { return (sy + y_ofs) / zoom_scale; }						// Screen Y to World Y 
function grid_round(v)    { return +(v*GRID_FACTOR).toFixed(1)/GRID_FACTOR; }     	// Apply snap to grid
	
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
	screen_max_x = get_world_x(main_context.canvas.width);
	
	screen_min_y = get_world_y(0);
	screen_max_y = get_world_y(main_context.canvas.height);
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
function draw_tool_text(context, x, y, size, color,text)
{
	if (text == "") return;
	
	
	context.lineWidth = 1;
	context.font = "bold " + size + "px Arial";
	context.fillStyle = color;

	
	context.fillText(text, x, y);
	
	context.stroke();
	
	draw_count++;	
}


// Draw text at position
function draw_text(context, x, y, w, h,color,text)
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

// Draw outline at position
function draw_outline(x,y,w,h, color)
{
	if (h * zoom_scale < MIN_DRAW) return;
	if (w * zoom_scale < MIN_DRAW) return;
	
	if (!on_screen(x,y,w,h)) return;
	
	context.lineWidth = 1 / zoom_scale;	
	//if (context.lineWidth > 5) context.lineWidth = 5;
	
	context.strokeStyle = color;
	context.strokeRect(x, y, w, h);	
	draw_count++;
	
}



function draw_line(ctx, x1, y1, x2, y2)
{
	
	ctx.strokeStyle = "#000088";
	ctx.lineWidth = 1;// / zoom_scale;	
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.stroke();
	
	
	
}



function draw_symbol_line(ctx, x1, y1, x2, y2)
{
	
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 3;// / zoom_scale;	
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.stroke();
	
	
	
}


// Draw outline at position
function draw_arc(ctx, x,y,r, s, e)
{
	
	ctx.lineWidth = 1;// / zoom_scale;	
	//if (context.lineWidth > 5) context.lineWidth = 5;
	
	ctx.strokeStyle = "#000000";
	
	ctx.moveTo(x,y);
	ctx.beginPath();
	ctx.arc(x, y, r, s, e);
	
	ctx.stroke();
	//context.strokeRect(x, y, w, h);	
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
	
	
	//border /= zoom_scale;
	
	
	
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
	
	context.lineWidth = 0;
	
	
	context.fillStyle = color;
    context.fill();	
	
	
	context.closePath();	
	//context.stroke();
}

// Draw image at position
function draw_image()
{	
	// draw image
	//if (current_layer == "All" || current_layer == '1')
	{
		context.save();
		var image_scale =5;
		context.scale(image_scale * zoom_scale ,  image_scale* zoom_scale);
		var bx = 100;
		var by = 50;
				
		context.translate( -x_ofs/zoom_scale/image_scale, - y_ofs/zoom_scale / image_scale);
		context.drawImage(imageObj,bx,by);
		context.restore();
	}
	
}