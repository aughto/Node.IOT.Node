/* 
    Vector
	2015 Jason Hunt
	
	File: UI.js	
		
	User Interface
*/

"use strict";

window.INVALID_OBJECT = -1;					// Sentinel for no object selection	

var ui = (function () 
{
	var local = {};
	
	local.start 			= function()  { ui_start(); };
	local.clear_selections 	= function()  { clear_selections(); };
	
	//local.get_selected 		= function()  { return object_selected; } ;
	local.action_click_open = function()  { action_click_open(); };
	local.set_view 			= function(v) { ui_set_view(v); };
	local.set_layer 		= function(l) { ui_set_layer(l); };
	
	local.get_min_size 		= function()  { return MIN_SIZE; };
	local.get_max_size 		= function()  { return MIN_SIZE; };
	local.get_min 			= function()  { return {x:MIN_X, y:MIN_Y}; };
	local.get_max 			= function()  { return {x:MAX_X, y:MAX_Y}; };
	
	
	local.add_clickcallback = function(type, func) { add_clickcallback(type, func); } ;
	
	local.add_keyevent		= function(t, f) { add_keyevent(t, f); };
	
	local.action_copy		= function(id) { action_copy(id); };
	
	

	
	// Private
	var MODULE = "[UI]        ";
	
	var MIN_SIZE = 0.1;						// Minimum object size in x or y
	var MAX_SIZE = 10000;						// Minimum object size in x or y
	
	var MIN_X = -100000;						// Minimum x position
	var MAX_X = 100000;						// Maximum x position
	var MIN_Y = -100000;						// Minimum y position
	var MAX_Y = 100000;						// Maximum y position
	var MIN_EDIT = 0.001;					// Min change before saving object
	
	
	var WHEEL_FACTOR = 100;
	
		// Constants
	var UIMODE = {NONE : 0, SELECT : 1, RESIZE : 2, MOVE : 3, DRAG : 4}	// UI Modes
	var ui_mode = UIMODE.NONE;				// Current UI Mode
	
	var mouse_l_down = 0;					// True if left mouse button down
	var mouse_r_down = 0;					// True if right mouse button down
	
	var mouse_x_start = 0;					// SCreen pos where mouse was pressed
	var mouse_y_start = 0;

	var in_edit = 0;
	
	var object_selected = INVALID_OBJECT;	// Current single selected object
	var object_moved = 0;					// True if object was moved
	var click_index = INVALID_OBJECT;		// Index of last clicked object
	//var last_selected = INVALID_OBJECT;      // Last selected object, used for attaching
	
	
	var select_x = 0;
	var select_y = 0;
	
	// Temp variables for selectiong box testing
	var select_x_start = 0;
	var select_y_start = 0;
	
		
	
	var selecting = 0;
	
	var selected_objects = Array();
	
	var key_events = Array();
	
	
	var KEY_ESCAPE = 27;
	
	var click_callbacks = [];
	
	
	
	function ui_start()
	{
		
		// Hook events for canvas
		hookEvent('hmimaincanvas', 'mousewheel', on_mousewheel);
		hookEvent('hmimaincanvas', 'mousedown',  on_mousedown);
		hookEvent('hmimaincanvas', 'mouseup',    on_mouseup);
		hookEvent('hmimaincanvas', 'mousemove',  on_mousemove);	
		
		//		hookEvent('canvas_container', 'keydown',    onKeyDown);	
		//canvascontainer.addEventListener( "keydown", on_keydown, true);					
		//hookEvent('canvascontainer', 'keydown',  on_keydown);	


		document.onkeydown = function(evt) { on_keydown(evt); };

		clear_selections();
	}

	
		
	function add_clickcallback(type, func)
	{
		click_callbacks.push({type:type, func:func});
	}
		
		
	function check_click_callback(index)
	{
		if (index < 0) return false;
		
		
		console.log("Check click : " + index);
		var o = graphics.get_object(index);
		
		for (var i = 0; i < click_callbacks.length; i++)
		{
			if (click_callbacks[i].type == o.type)
			{
				return click_callbacks[i].func(index, o);
			}
		}
		
		
		return false;
		
	}
		
		
		
		
		
	
	

	function add_keyevent(type, func)
	{
		key_events.push({type:type, func:func});
	}
		
	
	

	// Change in layer
	function ui_set_layer(layer) 
	{
		//current_layer = layer;
		graphics.set_layer(layer);
		
		graphics.render();
	}


	// Populate debug area
	function show_debug()
	{
		/*if (!main.get_debug()) return;
	

		var data = "";
		
		
		//var o = graphics.get_object(object_selected);
		

		//data += "UI Mode: " + ui_mode;		
		if (ui_mode == UIMODE.NONE)   data += " [None] ";   else
		if (ui_mode == UIMODE.SELECT) data += " [Select] "; else
		if (ui_mode == UIMODE.RESIZE) data += " [Resize] "; else
		if (ui_mode == UIMODE.MOVE)   data += " [Move] ";   else
		if (ui_mode == UIMODE.DRAG)   data += " [Drag] "; 

		data += " Object: " + JSON.stringify(selected_objects);		
		data += " Clicked: " + click_index;

		//if (object_selected != INVALID_OBJECT)
		//{
		//	data += " ID: " + o.id;
		//	data += " Type: " + o.type;
		//}

		data += " Draw Count: " + graphics.get_draw_count();

		//data += " x ofs: " + x_ofs;
		//data += " y ofs: " + y_ofs;

		data += " scale: " +graphics.get_zoom_scale().toFixed(2);

		//data += " tag: " + o.tag;

		////data += " Last: " + last_selected;
	
		set_html("debug", data);	*/
	}


	/*
		UI Actions
	*/
	
	function clear_selections()
	{
	
		//log("sel: " + object_selected);
		
		
		log("Clear");
		
		properties.set_editing(0);
		
		graphics.clear_selections();

		
		if (selected_objects.length == 0)
			graphics.action_object_unselect(-1);
	
	
		// Only save if we were selecting one object
		if (selected_objects.length == 1)
		{
			graphics.action_object_unselect(selected_objects[0]);
			
		}
		
			
			
		selected_objects.length = 0;
		
				
	
	selecting = 0;

		object_selected = INVALID_OBJECT;
		//last_selected = INVALID_OBJECT;
		
		ui_mode = UIMODE.NONE;	

		//show_context();
		//hide_edit();
		
		graphics.set_select(0, 0, 0, 0, 0);
		
		graphics.render();
	}
	
	
	
	
	function action_copy(id)
	{
		clear_selections();
		
		
		
		
		objects.ui_copy(id);
		
		
		
		
		
		
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function action_click_open()
	{
		//set_edit_text("");
		//log("Click open");
	
	
	
	
		
	
				// CLicked open and only one obeject selected
				if ( selected_objects.length == 1)
				{
					//index = INVALID_OBJECT;
				
					//graphics.action_object_unselect(object_selected);
					properties.save(selected_objects[0]);
				}
	
	
	
	
	
	
		clear_selections();
	
		object_selected = INVALID_OBJECT;
		//last_selected = INVALID_OBJECT;
	
		ui_mode = UIMODE.DRAG;
		//show_context();
				
				
		log("After click open: " + JSON.stringify(selected_objects));
				
				
	}
	


	
	function action_group_select(x1, y1, x2, y2)
	{
		
		log("action_group_select");
		
		selected_objects = graphics.find_objects(x1, y1, x2, y2);
		
	
			//graphics.group_select(mouse_x_start, mouse_y_start, x, y);
	
		// See if index is in list
		for (var i = 0; i < selected_objects.length; i++)
		{
			//if (selected_objects[i] == object_index)
			//index = i;
		
			var p = graphics.get_disp_properties(selected_objects[i]);
			
			p.selected = 1;
			
			
				//var p = graphics.get_disp_properties(index);
		
			//console.log("start select Index" + index + " " + p.x + " " + p.y);
		
			p.x_start = p.x;
			p.y_start = p.y;
			
		}
		
	
	log("Objects: " + JSON.stringify(selected_objects));
	
	
	
	}
	
	
	
	
	
	
	
	function action_select_start(index)
	{
		// Either select object or move
		
		console.log("start select on " + index);

		
		
		
		if (view_mode != "edit")
		{
			
			// DO not select rectangle.  Must move to generic properties
			
			var o = graphics.get_object(index);
			
			
			if (o.type == "rect")
			{
							console.log("Not selectable in run mode");
							
							graphics.clear_selections();
click_index = INVALID_OBJECT;

							return;
							
			}
			
			
		}
		
		
		
		
		
		
		
		
		if (index != INVALID_OBJECT)
		{
			var p = graphics.get_disp_properties(index);
		
			console.log("start select Index" + index + " " + p.x + " " + p.y);
		
			p.x_start = p.x;
			p.y_start = p.y;
		}
		
		//log("sel obj" + JSON.stringify(selected_objects));
		 
		
	/*	for (var i = 0; i < selected_objects.length; i++)
		{
			var p = graphics.get_disp_properties(selected_objects[i]);
		
			p.x_start = p.x;
			p.y_start = p.y;
		}*/
		
		
		// Save starting positions
		// only need to save selected object if group select is not available
		//for (var i = 0; i < disp_objects.length; i++)
		//{
		//			disp_objects[i].disp_properties.x_start = disp_objects[i].disp_properties.x;
			//disp_objects[i].disp_properties.y_start = disp_objects[i].disp_properties.y;
		//}
				
		//last_selected = object_selected;		
		object_selected = index;
	}

	function action_select_end(object_index)
	{
		//last_selected = object_selected;
		log("Select end Index: " + object_index);

		
		
		
		
		
		
		
		
		
		
		
		ui_mode = UIMODE.SELECT;
		
		//object_selected = click_index;
		
		var p = graphics.get_disp_properties(object_index);		
		
		var index = -1;
		
		
		// See if index is in list
		for (var i = 0; i < selected_objects.length; i++)
		{
			console.log("sel obj " + i + " " + selected_objects[i]);
		
			
			if (selected_objects[i] == object_index)
			index = i;
			
		}
		
		
	
		
		// not in list
		if (index == -1)
		{
			console.log("Not found, adding to list: " + object_index);
			p.selected = 1;
			selected_objects.push(object_index);
		}
		else
		{
			
			// remove from list
			selected_objects.splice(index, 1);
			
			p.selected = 0;
			
		}
			
			//log("obkectindex: " + object_index + " index: " + index);
		
		//log("Object list: " + JSON.stringify(selected_objects));
		
		
		
		
		
		
			// See if index is in list
		for (var i = 0; i < selected_objects.length; i++)
		{
			console.log("sel obj2 " + i + " " + selected_objects[i]);
			
		}
		
		
		
		
		console.log("len: " +selected_objects.length);
		
		if (selected_objects.length == 1)
		{
			graphics.action_object_select(selected_objects[0]);
		}
		else
		{
			graphics.action_object_unselect(-1);
		}
			
		
		
		
		
			show_debug();
		
		
		/*
		
		//clear_selections();
		

		


				
				
				
		//p.selected = 1 ; // !
		
		p.selected = !p.selected;
				
				log("Sel1 " + selected_objects.length);
		if (p.selected) selected_objects.length++; else selected_objects.length--;
			
			log("Sel2 " + selected_objects.length);
			
			
			
			
		if (selected_objects.length > 1) 
		{	
	
			graphics.action_object_unselect(-1);
	
			//hide_edit();
		//
			ui_mode = UIMODE.MSELECT;
		//	console.log(selected_objects.length);
		}

		//graphics.action_object_select(object_selected);

		
		//			
		if (selected_objects.length == 1)
		{
			//show_edit();	
			
			graphics.action_object_select(object_selected);
		}
	
			if (selected_objects.length == 0)
			{
				hide_edit();			
				ui_mode = UIMODE.NONE;	
		}
	
				

				
			//console.log("se");
		/*	if (selected_objects.length == 1)
			{
				show_context();
				//show_edit(object_selected);
			}
			else
				object_selected = INVALID_OBJECT;*/
				
		//show_context();*/
		
	
	}
	


	
	
	function action_mouse_wheel(x, y, delta)
	{
		graphics.zoom(x, y, delta);
	
		//if (in_edit) show_edit();
		
	}
	
	function action_move(delta_x, delta_y)
	{
	
		
			
		click_index = object_selected;
		
		
		
		
		// MOve single object, not selected
		
			ui_mode = UIMODE.MOVE;	
			
			
			
			
		if (click_index != INVALID_OBJECT && selected_objects.length == 0)	
		{
		
			var p = graphics.get_disp_properties(click_index);		
		
			if (p.locked) return;
		
			var tx = p.x_start - delta_x / graphics.get_zoom_scale();
			var ty = p.y_start - delta_y / graphics.get_zoom_scale();
		
		
			p.x = graphics.grid_round(tx);
			p.y = graphics.grid_round(ty);
			
			//log("found action move single mode:" + ui_mode);
			
			return;
			
		}
		
		
		
		
		
		
		
	
		
		
		//console.log("CLick index: " + click_index);
		//console.log("Object selected: " + object_selected);
		
		//if (selected_objects.length == 0) return;
		
		//if (click_index == INVALID_OBJECT )	return;
		
		
		
		// drag single object (selected flag is not set for single)
		
	
		
		//if (disp_objects[click_index].type == "job" ) return;
	
			
		var move_y = 1;
		var move_x = 1;
			
			/*if (disp_objects[click_index].type == "conveyor" || 
				disp_objects[click_index].type == "station" || 
			disp_objects[click_index].type == "job" ) move_y = 0;

		if (disp_objects[click_index].type == "conveyor") move_x = 0;*/	
		
	/*	
		var p = graphics.get_disp_properties(click_index);		
		
		var tx = p.x_start - delta_x / graphics.get_zoom_scale();
		var ty = p.y_start - delta_y / graphics.get_zoom_scale();
				
		if (move_x) p.x = graphics.grid_round(tx);
		if (move_y) p.y = graphics.grid_round(ty);
	*/	
		
		for (var i = 0; i < selected_objects.length; i++)
		{
			var p = graphics.get_disp_properties(selected_objects[i]);		
		
			if (p.locked) continue;
		
			var tx = p.x_start - delta_x / graphics.get_zoom_scale();
			var ty = p.y_start - delta_y / graphics.get_zoom_scale();
				
			//if (move_x) 
				p.x = graphics.grid_round(tx);
			//if (move_y) 
				p.y = graphics.grid_round(ty);
			
			
		}
		
		
		
		
		
		
		
		
		
		
		
		
		//if (move_y == 0) disp_objects[click_index].disp_properties.y = grid_round_var(ty, 5); 
		
		
		//console.log("TY: " + ty + " " + disp_objects[click_index].y);
		
			

			
		//var id = disp_objects[click_index].id;
						
		// Drag children
		/*for (var j = 0; j < disp_objects.length; j++)
		{
			if (disp_objects[j].parent == id)
			{
				var tx = disp_objects[j].x_start - delta_x / zoom_scale;
				var ty = disp_objects[j].y_start - delta_y / zoom_scale;
				
				if (move_x)disp_objects[j].x = grid_round(tx);
				if (move_y) disp_objects[j].y = grid_round(ty);	
			}
						
					
		}*/
						

									
								
		// Drag all selected disp_objects									
		/*for (var i = 0; i < disp_objects.length; i++)
		{
			if (disp_objects[i].selected && !disp_objects[i].locked)
			{
				var tx = disp_objects[i].x_start - delta_x / zoom_scale;
				var ty = disp_objects[i].y_start - delta_y / zoom_scale;
					
				disp_objects[i].x = grid_round(tx);
				disp_objects[i].y = grid_round(ty);	
		
			}
		}*/
				
	}

	// User done moving object
	function action_move_end()
	{
		//return;
		//if (selected_objects.length == 0 && ) return;
		
		if (object_selected != INVALID_OBJECT) 
		{
			
			graphics.action_object_moved(object_selected);
		}
		
		
		
		for (var i = 0; i < selected_objects.length; i++)
		{		
			graphics.action_object_moved(selected_objects[i]);
		}
		
			/*if (selected_objects.length == 0) return;
		
		for (var i = 0; i < selected_objects.length; i++)
		{
			graphics.action_object_moved(selected_objects[i]);
		}*/
		
		/*
			// Save children	
			var id = disp_objects[object_selected].id;
		
			for (var i = 0; i < disp_objects.length; i++)
			{
				if (disp_objects[i].parent == id)
					websocket_request_update(object_selected);
				
		}*/
				
		clear_selections();
	}
	
	
	
	
	
	
	
	
	function action_resize_start(index)
	{
		
		if (selected_objects.length != 1)
		{
			log("resize on more than one object");
			return;
		}
		
		
		var p = graphics.get_disp_properties(selected_objects[0]);
				
		
		p.w_start = p.w;
		p.h_start = p.h;		
						
		//drag_expand = 1;
		//alert("drag");
						
		ui_mode = UIMODE.RESIZE;
	}
	
	
	
	
	
	
	

	function action_resize(delta_x, delta_y)
	{
		//var do_resize = 1;
		
		if (selected_objects.length != 1) return;
		
		var p = graphics.get_disp_properties(selected_objects[0]);
		
		p.w = graphics.grid_round(p.w_start - delta_x / graphics.get_zoom_scale());
		p.h = graphics.grid_round(p.h_start - delta_y / graphics.get_zoom_scale());
				
		if (p.w < MIN_SIZE) p.w  = MIN_SIZE;
		if (p.h < MIN_SIZE) p.h  = MIN_SIZE;
	}

	// User done resizing
	function action_resize_end()
	{
		if (selected_objects.length != 1) return;
		
		graphics.action_object_resized(selected_objects[0]);
		
		/*var id = disp_objects[object_selected].id;
	
		// Save children	
		for (var i = 0; i < disp_objects.length; i++)
		{
			if (disp_objects[i].parent == id)
				websocket_request_update(object_selected);
				
		}*/
				
		clear_selections();
	}
	
	
	
	
	
	
	// Mouse wheel event
	function on_mousewheel(event)
	{
		//var rect = canvas.getBoundingClientRect();
		
		var screen_cords = graphics.get_screen_cords(event);
		
		var x = screen_cords.x;//event.pageX - canvas_rect.left;
		var y = screen_cords.y;//event.pageY - canvas_rect.top;
		
		event = event ? event : window.event;
	
		var raw = event.detail ? event.detail : event.wheelDelta;
		var delta = event.detail ? event.detail * -1 : event.wheelDelta / WHEEL_FACTOR;	
		
		action_mouse_wheel(x, y, delta);		// APply action
	
		return cancelEvent(event);
	}
	
	
	
	
	

	
	
	
	
	
	// Mouse down event
	function on_mousedown(event)
	{
		// Fix for some browsers
		event = event ? event : window.event;	
			
		var screen_cords = graphics.get_screen_cords(event);
		
		var x = screen_cords.x;//event.pageX - canvas_rect.left;
		var y = screen_cords.y;//event.pageY - canvas_rect.top;
			
			
		//var x = event.pageX - canvas_rect.left;
		//var y = event.pageY - canvas_rect.top;
		
					var index =  graphics.find_index(x, y);
		
		
		if (view_mode == "edit")
			
			{
		
		
		
		
		
		
		
		
		
		
		
		
		
			
		// Left mouse
		if (event.which == 1)
		{
			mouse_l_down = 1;		
			
			mouse_x_start = x;
			mouse_y_start = y;		
	
			
			//graphics.start_pan(); // tell graphics to same current offsets
	
			object_moved = 0;
			

		
			click_index = index;
		
			// Save edits if we were editing and clicked away
			if (object_selected != INVALID_OBJECT )
			{
				//console.log("save edit down sel:" + object_selected);
				//save_edit();
				
				/*if (index != object_selected)
				{
					//index = INVALID_OBJECT;
				
					//graphics.action_object_unselect(object_selected);
					properties.save(object_selected);
				}*/
			}
	
			if (index == INVALID_OBJECT)	// Click off into open area
			{
				//log("open click");
				action_click_open();
				
				
				selecting = 1;
				
				select_x_start = mouse_x_start;
				select_y_start = mouse_y_start;
				
				
				
			}
			else
			{
				// Object was already selected, drag expand
				if (index == object_selected)
				{
					action_resize_start(index)
				}
				else
				{
					log("calling start");
					//if (object_selected == INVALID_OBJECT)
						action_select_start(index);
					
				}
			}
		}
			}
			
		else
		{			// Run mode options
			
		
			
		// Left mouse
		if (event.which == 1)
		{
			mouse_l_down = 1;		
			
			mouse_x_start = x;
			mouse_y_start = y;		
	
			
			//graphics.start_pan(); // tell graphics to same current offsets
	
			object_moved = 0;
			
		//	var index =  graphics.find_index(x, y);
		
		click_index = index;
		
		if (index == INVALID_OBJECT)	// Click off into open area
			{
				//log("open click");
				action_click_open();
				
			}
			else{
		
			
			
			action_select_start(index);
			}
			
			
		
			
		} 

			
			
			
			
			
			
			
			
			
			
		}
			
			
			
			
			
				if (event.which == 3) 
		{
			mouse_x_start = x;
			mouse_y_start = y;				
			
			//log("Right Down");
			graphics.start_pan(); // tell graphics to same current offsets
			
			mouse_r_down = 1;
			cancelEvent(event);
		}		
			
	
		graphics.render();
		
		return cancelEvent(event);
	}
	
	// Mouse up event
	function on_mouseup(event)
	{
		// Fix for some browsers
		event = event ? event : window.event;	
		
	
		var screen_cords = graphics.get_screen_cords(event);
		
		var x = screen_cords.x;
		var y = screen_cords.y;		
		
		
				
		if (view_mode == "edit")
			
			{
		
		
		
		
		
		// Left mouse
		if (event.which == 1) 
		{
			log("Up selecting");
			
			mouse_l_down = 0;
			
			// Object was hit at mousedown, and we did not move
			if (click_index >= 0 && object_moved == 0)action_select_end(click_index); else 
			
			// Object was resized
			if (ui_mode == UIMODE.RESIZE) action_resize_end(); else
			
			// Was dragging 
			//if (ui_mode == UIMODE.DRAG)	action_move_end(); else
			if (object_moved == 1 && !selecting)	action_move_end(); else
			
				
			
			
			// Need to check and process selections
			//if (graphics.get_selecting()) 
						
	
			if(selecting && ui_mode != UIMODE.MOVE)
			{
				
				//if (object_moved == 1)
					
				log("sel ui+ " + ui_mode);
				
				if (ui_mode != UIMODE.MOVE)
				//if (selected_objects.length == 0 && object_selected == INVALID_OBJECT)
					action_group_select(mouse_x_start, mouse_y_start, x, y);
			//else
				
				
				
		
				
				
			}
			else
			{action_move_end();
				clear_selections();
			}

			
			
			graphics.set_select(0, 0, 0, 0, 0);
			
			//show_context(); //  check if needed
			
		} 
		
		
			}
			
			
			
			
			else
			{		// Run mode options
		
		
				
		
		// Left mouse
		if (event.which == 1) 
		{
			log("Run Mouse Up");
			
			mouse_l_down = 0;
			
			
			
			if (check_click_callback(click_index))
			{
				
				clear_selections();
				
			} else
			
			
			
			
			
			
			// Object was hit at mousedown, and we did not move
			if (click_index >= 0 && object_moved == 0) action_select_end(click_index);  else
			
			
			{
				
				
				clear_selections();
			}
			




			/*else 
			
			// Object was resized
			if (ui_mode == UIMODE.RESIZE) action_resize_end(); else
			
			// Was dragging 
			//if (ui_mode == UIMODE.DRAG)	action_move_end(); else
			if (object_moved == 1 && !selecting)	action_move_end(); else
			
				
			
			
			// Need to check and process selections
			//if (graphics.get_selecting()) 
						
	
			if(selecting && ui_mode != UIMODE.MOVE)
			{
				
				//if (object_moved == 1)
					
				log("sel ui+ " + ui_mode);
				
				if (ui_mode != UIMODE.MOVE)
				//if (selected_objects.length == 0 && object_selected == INVALID_OBJECT)
					action_group_select(mouse_x_start, mouse_y_start, x, y);
			//else
				
				
				
		
				
				
			}
			else
			{action_move_end();
				clear_selections();
			}
			*/

				//clear_selections();
			
			graphics.set_select(0, 0, 0, 0, 0);
			
			//show_context(); //  check if needed
			
		}
		
		
			}


		// RIght Mouse

		
			
			if (event.which == 3) 
		{
			//log("Right up");
			//graphics.set_select
			mouse_r_down = 0;
			
			// Find selections
			
			
			
			
			
		}
				
			
			
		
		graphics.render();
		
		return cancelEvent(event);
	}
	
	// Mouse move event
	function on_mousemove(event)
	{
		/*if (mouse_l_down == 0)
		{
			return cancelEvent(event);
		}*/
		
//log("sel: " + selected_objects.length);
		
		// Fix for some browsers
		event = event ? event : window.event;	
	
		var screen_cords = graphics.get_screen_cords(event);
		
		var x = screen_cords.x;
		var y = screen_cords.y;
		
		var delta_x = mouse_x_start - x;
		var delta_y = mouse_y_start - y;			
		
		if (view_mode == "edit")
			
		{
		
		
		
		// Left mouse
		if (mouse_l_down)
		{
				//log("Left move");
	
			if (delta_x != 0 || delta_y != 0)  // Was mouse moved
				object_moved = 1; 
			
			// Do not move locked object
			if (object_selected != INVALID_OBJECT)
			{
				var p = graphics.get_disp_properties(object_selected);
						
				// Need to cancel so click through works
				if (p.locked != 0)
					object_selected = INVALID_OBJECT;		
			}
					
					
					
					
					
			if (selected_objects.length > 0 || object_selected != INVALID_OBJECT)		
			//if (object_selected != INVALID_OBJECT)
			{
				if (ui_mode == UIMODE.RESIZE)
				{
					action_resize(delta_x, delta_y);
				}
				else
				{
					//log("call action move");
					action_move(delta_x, delta_y);
				}
				
			}
			else // No object selected, do group selection
			{
				//graphics.apply_pan(delta_x, delta_y);
				//log("draw_sel");
				
				if (delta_x != 0 || delta_y != 0)
				{
				
				
					graphics.set_select(mouse_x_start, mouse_y_start, x, y, 1);
				}
				
	
			
				
			}		
			graphics.render();
		} 
		
		
		}
		
		else		// Run mode options
		{
			
			
			
			
		}
		
		
		
		
		
		
		
		
		// Right mouse
		if (mouse_r_down) 
		{
			log("Right move");
			
			graphics.apply_pan(delta_x, delta_y);
			
			graphics.render();
		}
		
		
		//graphics.render();
	
		return cancelEvent(event);
	}
	
	
	
	
	
	function on_keydown(evt)
	{
	    evt = evt || window.event;
	
	//	log("Key: " + evt.keyCode);   // evt.ctrlKey 
		
		if (evt.keyCode == KEY_ESCAPE) clear_selections();
		
		
		// Apply keyboard hooks to selected objects
		for(var i = 0; i < selected_objects.length; i++)
		{
			for (var j = 0; j < key_events.length; j++)
			{
				var o = graphics.get_object(selected_objects[i]);
					
				if (o.type == key_events[j].type)
					key_events[j].func(selected_objects[i], evt.keyCode );
				
			}
		}
		
		
		if (selected_objects.length != 0 && properties.get_editing() == 0)
		{
			if (evt.keyCode == 81) properties.set_lock(selected_objects,0);  // 'q'
			if (evt.keyCode == 87) properties.set_lock(selected_objects,1);  // 'w'
		}

	}
		
	
	// Change in view
	function ui_set_view(view) 
	{
		log(MODULE + "Set view: " + view);
		
		objects.request_view(view);
		
		graphics.reset_zoom();
		
		//zoom_scale = DEFAULT_ZOOM;
		//current_layer = layer;
		//graphics.render();
	}

	return local;
}());
	




