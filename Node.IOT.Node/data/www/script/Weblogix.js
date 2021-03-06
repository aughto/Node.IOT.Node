/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

// UI Symbol types 
const SYM =  {NONE : 0,
			MODE : 1,
			SELECT : 2,
			TOGGLE : 3,
			CLEAR : 4,
			B : 5,
			E : 6,
			CAPLEFT : 7,
			CAPRIGHT : 8,
			BRLEFT : 9,
			BRRIGHT : 10,
			BRDOWN : 11,
			HORZ : 12,
			VERT : 13,
			XIC : 14,
			XIO : 15,
			OTE : 16,
			OTL : 17,
			OTU : 18,
			TMR : 19,
			BOX : 20
		};

			  

	
// Weblogix container
var weblogix = (function () 
{
	const MODULE = "Weblogix  ";	  
	var local = main.register_module("weblogix");		

	// Public Interface 

	// Standard
	local.init = init;
	local.load = load;
	local.unload = unload;
	local.update = update;
	
	local.prop_ok_click = prop_ok_click;
	local.prop_cancel_click = prop_cancel_click;
	
	
	// Private variables

	// UI Modes
	const MODE_TYPES = {MODE_NONE		: 0x01, 
				  MODE_MEMORY	: 0x02, 
				  MODE_EDIT		: 0x03,
				  MODE_TOGGLE   : 0x04,
				  MODE_SELECT	: 0x05};

	const UIMODE = {NONE : 0, SELECT : 1, MSELECT : 2, RESIZE : 3, MOVE : 4, DRAG : 5}	// UI Modes
	const OBJMODE = {NONE : 0, ADD : 1}	// UI Modes
		  
	
	const INVALID_OBJECT = -1;				// Sentinel for no object selection
	
	//const UPDATE_TIME = 100;
	
	var ZOOM_RATE = 0.05;					// Mouse wheel zoom rate
	var GRID_FACTOR = 2.0;					// Grid snap divisor ft / GF
	var WHEEL_FACTOR = 40.0;				// Factor for mouse wheel correction
			  
	var mouse_l_down = 0;					// True if left mouse button down
	var mouse_r_down = 0;					// True if right mouse button down
		
	var mouse_x_start = 0;					// SCreen pos where mouse was pressed
	var mouse_y_start = 0;

	var object_selected = INVALID_OBJECT;	// Current single selected object
	var object_dragged = 0;					// True if object was moved


	var ui_mode = UIMODE.NONE;				// Current UI Mode
	var num_selected = 0;					// Number of selected objects
	var click_index = INVALID_OBJECT;		// Index of last clicked object
	var last_selected = INVALID_OBJECT;      // Last selected object, used for attaching
		
		
	var object_mode = OBJMODE.NONE;
		
	var current_tool = SYM.NONE;	
		
	var draw_count = 0;						// Number of draw operations per render

			  
	var main_display = new DisplayType("maincanvas");
	var tool_display = new DisplayType("toolcanvas");
				  
				  
	//Symbol Size
	var tool_symbol_x = 30;
	var tool_symbol_y = 30;

	var symbol_x = 50;
	var symbol_y = 50;

	var current_icons = [];

	var icon_pad = 10;

	var update_grid = true;

	var sel_icon = 1; // toggle mode

	var sel_color = "#5050ff";

	
	var enable_debug = 1;
		
		
	var in_edit = 0;
		
	var first_load = true;
		
		// Debugging	
	var count  = 0;							// Test number 
		
	var mode = MODE_TYPES.MODE_TOGGLE;
	
	var min_node_x = 0;
	var min_node_y = 0;
	
	

	function init()
	{
		console.log(`${MODULE} Init`);

		//ajax.add_target("weblogix", load);		
		

		load_icons();
	}


	// Called when clicking on 
	function load()
	{
		console.log("Load weblogix");
		
		show_module(local.name);	

		setup_display();								// Canvas
	

		render();									// Render
	}

	// Called when to hide
	function unload()
	{
		console.log(`${MODULE} Unload`);	

		hide_module(local.name);
	}		
	
	function update()
	{
		render();
	}



	/* 
		System
	*/

	function find_upperleft(n)
	{
		if (n.x < min_node_x) min_node_x = n.x;
		if (n.y < min_node_y) min_node_y = n.y;
	}

	// Resize canvas to fit screen
	function resize_canvas()
	{

		if (tool_display.canvas == null) return;
		if (main_display.canvas == null) return;		
		
		console.log(`${MODULE} canvas ok`);
		
		// Setup tool display
		//tool_display.context = tool_display.canvas.getContext("2d");	
		tool_display.context.canvas.width  = window.innerWidth  - 140;
		tool_display.context.canvas.height = 40;//indow.innerHeight;
		tool_display.canvas_rect = tool_display.canvas.getBoundingClientRect();

		
		
		// Setup main display
		//main_display.context = main_display.canvas.getContext("2d");	
		main_display.context.canvas.width  = window.innerWidth - 140;
		main_display.context.canvas.height = window.innerHeight - tool_display.context.canvas.height - 100;
		main_display.canvas_rect = main_display.canvas.getBoundingClientRect();

		//console.log("Top : " + main_display.canvas.getBoundingClientRect().top);
		
		// Only adjust offets for centering when first loaded
		if (first_load)
		{
			min_node_x = 1000;
			min_node_y = 1000;
			
			project.iterate_nodes(find_upperleft);
			console.log("Min node x " + min_node_x + " y " + min_node_y);
				
			// Allign offsets so upper left node is in upper left position 
			main_display.x_ofs = min_node_x * symbol_x * main_display.zoom_scale;
			main_display.y_ofs = min_node_y * symbol_y * main_display.zoom_scale;
			
			//main_display.x_ofs = -main_display.context.canvas.width / 2.0;
			//main_display.y_ofs = -main_display.context.canvas.height / 2.0;
		
			//main_display.x_ofs += (32/2) * symbol_x * main_display.zoom_scale;
			//main_display.y_ofs += (10/2) * symbol_y * main_display.zoom_scale;
		}
		
		
		main_display.update_bounds();
		tool_display.update_bounds();
		
		first_load = false;
		
		
	}





	// Setup displays. Called once when clicking on page
	function setup_display()
	{
		tool_display.assign_canvas();
		main_display.assign_canvas();		
		
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
	  
					  
		

	/* 
		Graphics 
	*/

	function draw_symbol(ctx, ofs_x, ofs_y, sym)
	{	
		if (sym == SYM.MODE)	draw_mode(ctx, ofs_x, ofs_y); else
		if (sym == SYM.SELECT)	draw_select(ctx, ofs_x, ofs_y); else
		if (sym == SYM.TOGGLE)	draw_toggle(ctx, ofs_x, ofs_y); else 
		if (sym == SYM.CLEAR)	draw_clear(ctx, ofs_x, ofs_y); 
	}


	function get_color(f)
	{
		return "#" + get_hex(256*f) + get_hex(256*f)+ get_hex(256*f);
	}


	// Draw Grid. Grid is draw in screen space 
	function draw_grid()
	{
		//if (!update_grid) return;
		
		
		var r = main_display.canvas.getBoundingClientRect();
		
		var width = r.right - r.left;
		var height = r.bottom - r.top;

		// Symbol size in screen space
		var x_size = symbol_x * main_display.zoom_scale;
		var y_size = symbol_y * main_display.zoom_scale;		
		
		// Compute grid offset
		var xo = main_display.x_ofs - Math.round(main_display.x_ofs / (x_size)) * x_size;
		var yo = main_display.y_ofs - Math.round(main_display.y_ofs / (y_size)) * y_size;

		var fade = 0.2 / main_display.zoom_scale;
		
		main_display.context.strokeStyle = get_color(fade);
		main_display.context.lineWidth = 0.5;

		// Nmuber of cells to draw
		
		var y_count = height / x_size;
		var x_count = width / y_size;
		
		for (var i = 0; i < y_count; i++)
		{
			var x1 = 0;
			var y1 = y_size * (i) - yo;

			var x2 = width;
			var y2 = y_size * (i) - yo;
		
			main_display.context.beginPath();
			main_display.context.moveTo(x1,y1);
			main_display.context.lineTo(x2,y2);
			main_display.context.stroke();
		}
		
		for (var i = 0; i < x_count; i++)
		{
			var x1 = x_size * i - xo;
			var y1 = 0;

			var x2 = x_size * i - xo;
			var y2 = height;
			
			main_display.context.beginPath();
			main_display.context.moveTo(x1,y1);
			main_display.context.lineTo(x2,y2);
			main_display.context.stroke();
		}
		
		update_grid = 0;
	}



	function draw_node(n, i)
	{
		
		n.draw(main_display, n.x*symbol_x, n.y*symbol_y, symbol_x, symbol_y);

		//main_display.draw_text(n.x*symbol_x+3, n.y*symbol_y+3 +symbol_y*0.8,10,"#000000", i);
		//draw_text(main_display.context, n.x*symbol_x+symbol_x*0.6+3, n.y*symbol_y+3 +symbol_y*0.6,10, 10,"#000000", n.order);
		
		if (!n.is_operation()) return;
		
		if (n.op1 == -1) return;

		var v = project.get_variable_by_index(n.op1);

		if (v == undefined)
		{
			console.log("UNdefined var " + n.op1);
			return;
			
		}
		
		//console.log(v);
		
		var value = 0;
		
		// Get value from memory_list in online mode
		if (project.get_online())
		{
			value = v.value;
		}
		// Otherwise use cpu value
		else
		{
			value = cpu.get_value(v.offset, v.type);
			
		}
			
		// Extract value from composite types
		if (v.type == VAR_TYPES.VAR_TMR)
			value = value.value;
			
		var color = (value == 0) ?  "#ff0000" : "#0000ff" ;
		var name = v.name;
				
		main_display.draw_text( n.x*symbol_x+symbol_x * 0.2, 
								n.y*symbol_y+symbol_y *0.20, 	
								symbol_y/5,color, name);		
	}


	// Main render
	function render()
	{
		// Do not render if not current module
		if (!main.is_current(local)) return;

		draw_count = 0;
		
		if (main_display.canvas == null) return; // {("Unable to load canvas"); return; }
		
		main_display.clear();

		draw_icons();
		draw_grid();
		
		main_display.transform();

		// Iterate drawing operation over the node list
		project.iterate_nodes(draw_node);

		main_display.restore();
	}

	/* 
		End of graphics 
	*/


	/* 
		Icons 
	*/

	function set_tool(t)
	{
		mode = MODE_TYPES.MODE_EDIT;
		current_tool = t;
		
		console.log("Set tool: " + t);
	}


	function add_icon(draw, click)
	{
		var i = {draw:draw, click:click};
		current_icons.push(i);
	}

	function add_node_icon(n)
	{
		add_icon(n.draw, function() { set_tool(n.type); }  );	
	}

	function load_icons()
	{
		current_icons = [];
			
		//add_icon(draw_mode, mode_click);
		add_icon(draw_select, select_click);
		add_icon(draw_toggle, toggle_click);
		add_icon(draw_clear, clear_click);
		
		add_node_icon(NodeB());
		add_node_icon(NodeE());
		add_node_icon(NodeCL());
		add_node_icon(NodeCR());
		add_node_icon(NodeBL());
		add_node_icon(NodeBR());
		add_node_icon(NodeBD());
		add_node_icon(NodeHW());
		add_node_icon(NodeVW());
		add_node_icon(NodeXIC());
		add_node_icon(NodeXIO());
		add_node_icon(NodeOTE());
		add_node_icon(NodeOTL());
		add_node_icon(NodeOTU());
		add_node_icon(NodeTMR());
	}


	function draw_icon_selection(display, x, y, sx, sy)
	{
		var ctx = display.context;
		
		var pad = 0.05 * (sx+sy)/2;
		pad = 0;
		
		ctx.strokeStyle = sel_color;;
		ctx.lineWidth = 1;

		
		ctx.beginPath();
		ctx.moveTo(x + pad,y + pad);
		ctx.lineTo(x+sx - pad,y + pad);
		
		ctx.lineTo(x+sx - pad,y + sy+ pad);
		
		ctx.lineTo(x + pad,y + sy+ pad);
		
		ctx.lineTo(x + pad, y + pad);
		
		
		
		
		ctx.stroke();

	}


	function draw_icons()
	{
		if (tool_display.canvas == null) return;
			
		tool_display.clear();
		//tool_display.context.clearRect(0, 0, tool_canvas.width, tool_canvas.height);
		
		for (var i = 0; i < current_icons.length; i++)
		{
			var x = i*(tool_symbol_x+icon_pad);;
			var y = 0;

			current_icons[i].draw(tool_display, x + icon_pad/2, y+icon_pad/2, tool_symbol_x, tool_symbol_y);
			
			if (i == sel_icon)
				draw_icon_selection(tool_display, x , y, tool_symbol_x + icon_pad, tool_symbol_y+ icon_pad);
			
				
			
		}
	}

	function icon_click(x, y)
	{
		
		for (var i = 0; i < current_icons.length; i++)
		{
			var icon = current_icons[i];
			
			if (x >= i * (tool_symbol_x+icon_pad) && x < (i+1) * (tool_symbol_x + icon_pad))
			{
				sel_icon = i;
				icon.click();
			}
		}
		
		
	}

	function draw_select(display, ofs_x, ofs_y, sx, sy)
	{
		
		display.draw_text(ofs_x+3, ofs_y+sy/2*1.2, 0.3* sx,"#000000", "Select");
	}

	function draw_toggle(display, ofs_x, ofs_y, sx, sy )
	{
		var ctx = display.context;
		
		display.draw_text(ofs_x+3, ofs_y+sy/2*1.2, 0.3* sx,"#000000", "Toggle");
	}

	function draw_clear(display, ofs_x, ofs_y, sx, sy)
	{
		var ctx = display.context;
		
		
		var pad = (symbol_x + symbol_y) / 2 * 0.2;
			
		display.draw_line(ofs_x + pad, ofs_y + pad, ofs_x+ sx - pad, ofs_y + sy - pad,1);	
		display.draw_line(ofs_x + pad, ofs_y + sy - pad, ofs_x+ sx - pad, ofs_y + pad,1);	
	}

	function save_click()
	{
		sel_icon = -1; // No highlight
		console.log("Buid\n");
		
		save_logic();
	}

	function select_click()
	{
		console.log("Select Mode " + mode);
		//show_logic();
		mode = MODE_TYPES.MODE_SELECT;
	}

	function toggle_click()
	{
		console.log("ix toggle Mode " + mode);
			
		mode = MODE_TYPES.MODE_TOGGLE; 
		//show_logic();
	}

	function clear_click()
	{
		mode = MODE_TYPES.MODE_EDIT;
		current_tool = SYM.NONE;
		//	show_logic();
	}
		
		
	/* 
		End of icons
	*/


	// Find which object is at a screen location
	/*function find_index(x, y)
	{
		var min_index = INVALID_OBJECT;
		var min_layer = 0;
		
		x = get_world_x(x);	// Convert to work cords
		y = get_world_y(y);
		
		
		var xi = x / x_cells;
		var yi = x / y_cells;
		
		if (x < 0 || x > x_cells-1) return SYM.NONE;
		if (y < 0 || y > y_cells-1) return SYM.NONE;
		
		return get_cell(x, y);
		
	}*/


	/* 
		End of Vector Engine 
	*/



	/*
		User Interface 

		// TODO Need to clean up mouse code

	*/




	/*
		UI Actions
	*/

	function clear_selections()
	{
		/*for (var i = 0; i < objects.length; i++)
			objects[i].selected = 0;*/

		num_selected = 0;
		
		ui_mode = UIMODE.NONE;	
		
		render();
	}

	function action_click_open()
	{
		//set_edit_text("");

		object_selected = INVALID_OBJECT;
		last_selected = INVALID_OBJECT;

		ui_mode = UIMODE.DRAG;
		
				
		clear_selections()
	}


	function action_start_resize(index)
	{
		/*objects[index].w_start = objects[index].w;
		objects[index].h_start = objects[index].h;*/
						
		//drag_expand = 1;
		//alert("drag");
						
		ui_mode = UIMODE.RESIZE;
	}


	function action_start_select(index)
	{
		// Either select object or move
		
		// Save starting positions
		/*for (var i = 0; i < objects.length; i++)
		{
			objects[i].x_start = objects[i].x;
			objects[i].y_start = objects[i].y;
		}*/
				
		last_selected = object_selected;		
		object_selected = index;
	}




	function action_select_end()
	{
		//last_selected = object_selected;

		object_selected = click_index;

		ui_mode = UIMODE.SELECT;
					
		if (click_index != SYM.NONE)
		{
			/*if (get_selected(click_index))
				set_selected(click_index, 0);
			else
				set_selected(click_index, 1);*/



		}
					
					
					
		//objects[click_index].selected = !objects[click_index].selected;
					
		/*if (get_selected(click_index)) num_selected++; else num_selected--;
				
		if (num_selected > 1) 
		{	
			hide_edit();

			ui_mode = UIMODE.MSELECT;
			console.log(num_selected);
		}*/
				
				
		//if (num_selected == 1)
	//		show_edit();	
		
		if (num_selected == 0)
		{
	//		hide_edit();			
			ui_mode = UIMODE.NONE;	
		}
		
							

				
		
	}



	// Used for both drag and resize
	function action_resize_end()
	{
		if (object_selected == INVALID_OBJECT) return;
		
		// Save object
		
		
		/*var id = objects[object_selected].id;*/

				
				
		object_selected = INVALID_OBJECT;
		//drag_expand = 0;
		
	}


	function action_drag_end()
	{
		
		//ui_mode = UIMODE.NONE;
		
	}



	function action_mouse_wheel(x, y, delta)
	{
		main_display.apply_zoom(x, y, delta, ZOOM_RATE);
		
		render();
	}


	function action_move(delta_x, delta_y)
	{
		/*// drag single object (selected flag is not set for single)
		if (click_index != INVALID_OBJECT && num_selected == 0)
		{
			var tx = objects[click_index].x_start - delta_x / main_display.zoom_scale;
			var ty = objects[click_index].y_start - delta_y / main_display.zoom_scale;
					
			objects[click_index].x = grid_round(tx);
			objects[click_index].y = grid_round(ty);
		}
					*/
		ui_mode = UIMODE.MOVE;
				
	}


	function action_resize(delta_x, delta_y)
	{
		/*objects[object_selected].w = grid_round(objects[object_selected].w_start - delta_x / main_display.zoom_scale);
		objects[object_selected].h = grid_round(objects[object_selected].h_start - delta_y / main_display.zoom_scale);
				
		if (objects[object_selected].w < MIN_SIZE) objects[object_selected].w  = MIN_SIZE;
		if (objects[object_selected].h < MIN_SIZE) objects[object_selected].h  = MIN_SIZE;*/
	}


	function action_pan(delta_x, delta_y)
	{
		main_display.apply_pan(delta_x, delta_y);

	}


	/* End of UI Actions */



	// Keypress hook
	function onKeyDown(event)
	{
		event = event || window.event;	
		
		//console.log(event);
		console.log(event.keyCode);

		
		//if (event.keyCode == 32) do_mutate();
		//if (event.keyCode == 82) do_random();
		//if (event.keyCode == 84) do_trial();
		
		
		
		//return cancelEvent(event);
	}

	// Mouse wheel event
	function onMouseWheel(event)
	{
		//var rect = canvas.getBoundingClientRect();

		event = event ? event : window.event;
		
		var x = event.pageX - main_display.canvas_rect.left;
		var y = event.pageY - main_display.canvas_rect.top;
	   
		var raw = event.detail ? event.detail : event.wheelDelta;
		var delta = event.detail ? event.detail * -1 : event.wheelDelta / WHEEL_FACTOR;	
		
		action_mouse_wheel(x, y, delta);		// APply action

		return cancelEvent(event);
	}

	// Mouse down event
	function onMouseDown(event)
	{
		// Fix for some browsers
		event = event ? event : window.event;	
			
		var x = event.pageX - main_display.canvas_rect.left;
		var y = event.pageY - main_display.canvas_rect.top;
			
				
		x = main_display.get_world_x(x);	// Convert to world cords
		y = main_display.get_world_y(y);
		
		
		var ix = Math.floor(x / symbol_x);
		var iy = Math.floor(y / symbol_y);
		
		//console.log("x: " + ix + " y: " + iy);
		
		// Ignore virtual edges
		//if (ix >= 1 && ix <= x_cells &&  iy >= 0 && iy < y_cells - 1)
		{
			
			if (mode == MODE_TYPES.MODE_EDIT)
			{
				if (current_tool == SYM.CLEAR)
					project.set_node(ix, iy, SYM.NONE);
				else
				{
					project.set_node(ix, iy, current_tool);
				}
				
					//assemble();

				
			} else
			if (mode == MODE_TYPES.MODE_TOGGLE)
			{
				project.toggle_node(ix, iy); 
			} else

			if (mode == MODE_TYPES.MODE_SELECT)
			{
				select_cell(ix, iy);
				
				
			} 

			
			
		}
		
		
		//console.log("Tool: " + current_tool);
		
		//return get_cell(x, y);
		
		
		
		/*var index =  find_index(x, y);
		
		console.log(index);
		if (index != SYM.NONE)
		{
			if(get_selected(index))
				set_selected(index, 0);
			else
				set_selected(index, 1);
			
		}*/
		
			
			
			
			
			
			//console.log(event.which);
		/*	
		// Left mouse
		if (event.which == 1)
		{
			mouse_l_down = 1;		
			
			mouse_x_start = x;
			mouse_y_start = y;		

			orig_main_display.x_ofs = main_display.x_ofs;
			orig_main_display.y_ofs = main_display.y_ofs;

			object_dragged = 0;
			
			var index =  find_index(x, y);
		
		
		
			click_index = index;
		
			// Save edits if we were editing and clicked away
			if (object_selected != INVALID_OBJECT && num_selected == 1)
			{
				//save_edit();
			}
		
			if (index == INVALID_OBJECT)	// Click off into open area
			{
				action_click_open();
			}
			else
			{
				// Object was already selected, drag expand
				if (index == object_selected && num_selected == 1)
				{
					action_start_resize(index)
				}
				else
				{
					action_start_select(index);
				}
			}
		} else
		// Right mouse
		if (event.which == 2) 
		{
			

			
		}

		if (event.which == 3) 
		{

		
			
			
		}
	*/
		render();
		
		return cancelEvent(event);
	}

	// Mouse up event
	function onMouseUp(event)
	{
		// Fix for some browsers
		event = event ? event : window.event;	
		
		var x = event.pageX - main_display.canvas_rect.left;
		var y = event.pageY - main_display.canvas_rect.top;	
		
		// Left mouse
		if (event.which == 1) 
		{
			mouse_l_down = 0;
			
			// Object was hit at mousedown, and we did not move
			if (click_index >= 0 && object_dragged == 0)action_select_end(); else 
			
			// Object was resized
			if (object_dragged == 1 || ui_mode == UIMODE.RESIZE) action_resize_end(); else
			
			// Was dragging 
			if (ui_mode == UIMODE.DRAG)	
				action_resize_end();
			
			
			if (ui_mode == UIMODE.MOVE)	
			{
				//apply_delaunay();
				render();
			}
			
			if (object_mode == OBJMODE.ADD && object_dragged == 0)
			{
				//add_item("circle");
				
				/*x = get_world_x(x);	// Convert to work cords
				y = get_world_y(y);
				var r = 10;
				add_circle(x,y, r, "#808080");*/
				
			}
			
		} else 
		// RIght Mouse
		if (event.which == 3) 
		{
			mouse_r_down = 0;
			
			
		}
		
		render();
		
		return cancelEvent(event);
	}

	// Mouse move event
	function onMouseMove(event)
	{
		// Fix for some browsers
		event = event ? event : window.event;	
		
		var x = event.pageX - main_display.canvas_rect.left;
		var y = event.pageY - main_display.canvas_rect.top;

		// Left mouse
		if (mouse_l_down)
		{
			//console.log("Left down " + object_selected);
			var delta_x = mouse_x_start - x;
			var delta_y = mouse_y_start - y;		

			if (delta_x != 0 || delta_y != 0)  // Was mouse moved
				object_dragged = 1; 
			
			// Do not move locked object
			/*if (object_selected != INVALID_OBJECT)
			{
				// Need to cancel so click through works
				if (objects[object_selected].locked != 0)
					object_selected = INVALID_OBJECT;		
			}*/
					
			if (object_selected != INVALID_OBJECT)
			{
				//console.log("Movable");
				if (ui_mode == UIMODE.RESIZE)
				{
					//action_resize(delta_x, delta_y);
				}
				else
				{
						//console.log("Move");
					action_move(delta_x, delta_y);
					//apply_delaunay();
						render();
				}
				
			}
			else // No object selected, apply panning
			{
				action_pan(delta_x, delta_y);
					render();
			}		
		} else 
		// Right mouse
		if (event.which == 3) 
		{
			
			
		}
		
		


		return cancelEvent(event);
	}





	// Mouse down event
	function onToolMouseDown(event)
	{
		// Fix for some browsers
		event = event ? event : window.event;	
			
		var x = event.pageX - main_display.canvas_rect.left;
		var y = event.pageY - main_display.canvas_rect.top;
		
		icon_click(x, y);
		
		render();

		return cancelEvent(event);
	}



		
		
	/* Cell properties */
		
	function hide_properties()
	{
		var c1  = document.getElementById("properties_container");	
		
		c1.style.display = "none";
		render();
	}

		
	function prop_ok_click(ix, iy)
	{
		/*var ni = project.find_node(ix, iy);
		if (ni < 0) 
		{
			console.log("Node not found " + ix + " " + iy);
			return;
		}
			
		var n = nodes[ni];*/
		
		var n = project.get_node(ix, iy);
		
		if (n == null) return;
		
		
		if (n.is_operation())
		//if (is_operation(n.type))
		{
			var c1  = document.getElementById("variable_select");	
			
			var variable_index = c1.value;

			//console.log("Variable select: " + variable_offset);
		
			if (variable_index != "")
			{
				var old = n.op1;
				n.op1 = parseInt(variable_index);
				
				// Need to go offline if change was made
				if (old != n.op1)
					project.set_offline();
				
				//n.op1_index =  find_variable_index(n.op1); // relink index
				//assemble();
			}
		}
		
		hide_properties();
	}


	function prop_cancel_click(ix, iy)
	{
		hide_properties();
	}	
			
	function select_cell(ix, iy)
	{
		console.log("Select cell");
		
		var s = "";
		
		s += "<b>Cell Properties</b><br>";

		s += "<table border=1>";
		
		/*var c = get_cell(ix, iy);
		
		if (c < 0) 
		{
			console.log("Cell not found " + ix + " " + iy);
			return;
		}*/
		
		/*var ni = project.find_node(ix, iy);

		if (ni < 0) 
		{
			console.log("Node not found " + ix + " " + iy);
			return;
		}
		
		var n = nodes[ni];*/
		
		var n = project.get_node(ix, iy);
		
		if (n == null) return;
		
		
		
		s += "<tr><td>Type</td><td>"+ n.type_text + "</td></tr>";
		
		s += "<tr><td>Variable</td>";

		s += "<td><select id=variable_select>";
		// Create variable list
		/*for (var i = 0; i < variable_table.length; i++)
		{
			var name = variable_table[i].name;
			var index = variable_table[i].index;
			
			
			var sel = n.op1 == index;
			
			s += "<option value="+index+" "+ (sel ? "selected":"") + "> " + name + "</option> \n";
		}*/
		
		
		var variable_list = project.get_sorted_variable_list();
		
			// Create variable list
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			var name = variable_list.variables[i].name;
			var index = variable_list.variables[i].index;
			
			
			var sel = n.op1 == index;
			
			s += "<option value="+index+" "+ (sel ? "selected":"") + "> " + name + "</option> \n";
		}
		
		
		
		
		
		s += "</select></td>";
		
		s += "</tr>";

		s += "</table>";

		s += `<input type=button value='Ok' onclick=weblogix.prop_ok_click(${ix},${iy})>`;
		s += `<input type=button value='Cancel' onclick=weblogix.prop_cancel_click(${ix},${iy})>`;

		
		var c1  = document.getElementById("properties_container");	
		
		c1.style.display = "block";
		
		c1.innerHTML = s;
	}
		
	/* End cell properties */


	return local;
}());

	
	
	



	
	

