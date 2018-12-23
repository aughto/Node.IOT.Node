/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

function weblogix_init()
{
	console.log("Weblogix Init");	

	load_logic();
	
	
	init_global();								// Globals
	setInterval(function() {logic_ui_update_timer()}, 100);	// Setup timer
}


// Called when clicking on 
function load_weblogix()
{
	console.log("Load weblogix");
	
	setup_canvas();								// Canvas
	
	ui_init();

	render();									// Render
}



// Setup globals
function init_global()
{
	window.enable_debug = 1;
	
	// Constants
	window.UIMODE = {NONE : 0, SELECT : 1, MSELECT : 2, RESIZE : 3, MOVE : 4, DRAG : 5}	// UI Modes
	window.OBJMODE = {NONE : 0, ADD : 1}	// UI Modes

	window.INVALID_OBJECT = -1;					// Sentinel for no object selection
	
	
	window.MIN_SIZE = 0.1;						// Minimum object size in x or y
	window.MIN_X = -100000;						// Minimum x position
	window.MAX_X = 100000;						// Maximum x position
	window.MIN_Y = -100000;						// Minimum y position
	window.MAX_Y = 100000;						// Maximum y position
	window.MIN_EDIT = 0.001;					// Min change before saving object

	window.MIN_DRAW = 0.5;						// Do not draw below this size
	window.MAX_DRAW = 2000;						// Do not draw above this size
	window.MIN_TEXTDRAW = 1.0;					// Do not draw text below this size
	window.MAX_TEXTDRAW = 4000.0;				// Do not draw text below this size
	
	window.MIN_SCALE = 0.05;					// Minimum scale
	window.MAX_SCALE = 5.0;					// Maximum scale
	window.ZOOM_RATE = 0.05;					// Mouse wheel zoom rate
	window.GRID_FACTOR = 2.0;					// Grid snap divisor ft / GF

	window.WHEEL_FACTOR = 40.0;					// Factor for mouse wheel correction
	
	// Variables
	
	window.objects = [];						// Main array of objects. Need to switch to mysql as array index
	window.main_canvas = null;						// HTML5 Canvas
	window.main_context = null; 						// HTML5 Canvas context
	window.main_canvas_rect = null;					// Canvas rectangle

	window.tool_canvas = null;						// HTML5 Canvas
	window.tool_context = null; 						// HTML5 Canvas context
	window.tool_canvas_rect = null;					// Canvas rectangle

	window.x_ofs = 0;							// Pan offset
	window.y_ofs = 0;

	window.orig_x_ofs = 0;						// offset storage for panning
	window.orig_y_ofs = 0;

	window.zoom_scale = 0.5;					// Current zoom level
	window.mouse_l_down = 0;					// True if left mouse button down
	window.mouse_r_down = 0;					// True if right mouse button down
	
	window.mouse_x_start = 0;					// SCreen pos where mouse was pressed
	window.mouse_y_start = 0;

	window.object_selected = INVALID_OBJECT;	// Current single selected object
	window.object_dragged = 0;					// True if object was moved


	window.ui_mode = UIMODE.NONE;				// Current UI Mode
	window.num_selected = 0;					// Number of selected objects
	window.click_index = INVALID_OBJECT;		// Index of last clicked object
	window.last_selected = INVALID_OBJECT;      // Last selected object, used for attaching
	
	
	window.object_mode = OBJMODE.NONE;
	
	window.current_tool = SYM.NONE;	
	
	window.draw_count = 0;						// Number of draw operations per render

	window.screen_min_x = 0;					// Min possible x pos in world cords
	window.screen_max_x = 0;					// Max possible x pos in world cords
	window.screen_min_y = 0;					// Min possible y pos in world cords
	window.screen_max_y = 0;					// Max possible y pos in world cords
	
	
	window.in_edit = 0;
	
	// Debugging	
	window.count  = 0;							// Test number 
	
	window.mode = MODE_TYPES.MODE_TOGGLE;
	

}


function logic_ui_update_timer()
{

	render();
}



/* 
	System
*/





function resize_canvas()
{
	tool_canvas = document.getElementById("toolcanvas");	
	tool_context = tool_canvas.getContext("2d");	
	tool_context.canvas.width  = window.innerWidth;
	tool_context.canvas.height = 40;//indow.innerHeight;

	tool_canvas_rect = tool_canvas.getBoundingClientRect();
		
	
	
	main_canvas = document.getElementById("maincanvas");	
	main_context = main_canvas.getContext("2d");	
	main_context.canvas.width  = window.innerWidth;
	main_context.canvas.height = window.innerHeight - tool_context.canvas.height - 10;

	


	main_canvas_rect = main_canvas.getBoundingClientRect();

	//console.log("Top : " + main_canvas.getBoundingClientRect().top);
	
	x_ofs = -main_context.canvas.width / 2.0;
	y_ofs = -main_context.canvas.height / 2.0;
	
	x_ofs += (32/2) * symbol_x * zoom_scale;
	y_ofs += (10/2) * symbol_y * zoom_scale;
	
	update_display_bounds();
	
	
}





// Setup HTML5 Canvas
function setup_canvas()
{
	resize_canvas();

	// Hook events for canvas
	hookEvent('maincanvas', 'mousewheel', onMouseWheel);
	hookEvent('maincanvas', 'mousedown',  onMouseDown);
	hookEvent('maincanvas', 'mouseup',    onMouseUp);
	hookEvent('maincanvas', 'mousemove',  onMouseMove);	
	
	hookEvent('toolcanvas', 'mousedown',  onToolMouseDown);
	
	//hookEvent('document.body', 'keydown',    onKeyDown);	
	
	document.onkeydown = function(evt) {	return(onKeyDown(evt)); };
	
	window.onresize = function(event) { resize_canvas(); render();}
}


/* 
	End of System
*/
