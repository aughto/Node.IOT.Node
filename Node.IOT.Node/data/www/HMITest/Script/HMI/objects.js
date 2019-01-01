/* 
    Vector
	2015 Jason Hunt
	Jason.Hunt@fcagroup.com
	
	File: 
	
	
*/


var objects = (function () 
{
	var local = {};
		
	// Public
	local.start            	= function()  { start(); } ;
	local.ui_add           	= function(t, o1, o2) { ui_add(t, o1, o2); };
	local.ui_delete        	= function(t) { ui_delete(t); };
	local.ui_copy          	= function(t) { ui_copy(t); };
	local.request_update   	= function(i) { request_update(i);};
	local.request_view     	= function(v) { request_view(v); };
	local.get_tags		   	= function()  { return tags; };
	
	local.request_tag_write = function(i, v) { request_tag_write(i, v); };
	
	
	
	local.request_delete_object = function(o) { request_delete_object(o); };
	
	local.rebuild_tag_lookup = function() { create_tag_lookup(); }
	

	
	
	// Private
	var MODULE = "[Objects]   ";
	
	var DEFAULT_VIEW = 1;
	var current_view = 1;
	
	var tags = [];
	var tag_lookup = Array();

	function start()
	{
		

		
		// Bind into websockets events
		websocket.add_handler("obj", "list",   process_object_list);	
		websocket.add_handler("obj", "update", process_update_object);	
		websocket.add_handler("obj", "add",    process_add_object);		
		websocket.add_handler("obj", "delete", process_delete_object);	
	
		websocket.add_handler("tags", "values", parse_tag_data);	
		websocket.add_handler("tags", "list", parse_tag_list);	
		
	websocket.add_handler("cam", "data",   process_cam_data);	
	
	
	
		websocket.add_handler("", "connected", process_connected);	
	
		// bind into ui events
		graphics.add_handler("object_moved", request_update);
		graphics.add_handler("object_resized", request_update);

		graphics.add_handler("object_select", properties.show);
		graphics.add_handler("object_unselect", properties.hide);
		
		
		
		
		
		
				
		
	}

	
	
	
	
	
	
	
	
	
	
		// Make object add request to network
	function request_tag_write(tag_id, value)
	{
		var command = Object();
  	
		command.target = "tag";
		command.action = "write";
		command.tag_id = tag_id;
		command.value = value;
		
		log(MODULE + "Request tag list:" + JSON.stringify(command));
		
		websocket.command(command);	
	

	}
	
	
	
	
	

/* Parse new image from server */
function parse_tag_data(data)
{
	var strdata = JSON.stringify(data);
	
	//log("New tag data: " + strdata);
	
	tag_data = data.data;

	//	display_image();
	
	var strdata = JSON.stringify(tag_data);
	
	//log("New tag data: " + strdata);
	//log("Length: " +  tag_data.length);
	// Make lookup
	
	

	//log("NUm: " + num_objects);
	
	
graphics.draw_start();
		
		//log("Tag lookup: " + JSON.stringify(tag_lookup));
		//tag_lookup
		
		
		for (var j = 0; j < tag_data.length; j++)
		{
			//console.log("ID: " + tag_data[j].id + " value: " + tag_data[j].value );
		
			var t = -1;
		
			if (typeof tag_lookup[tag_data[j].id] == 'undefined') continue;
		
			for (var i = 0; i < tag_lookup[tag_data[j].id].length; i++)
			{
			
				index = tag_lookup[tag_data[j].id][i];
		
				var o = graphics.get_object(index);
				
				
				if (typeof o == 'undefined') continue;
		
		
		//log("Type: " + o.type);
		
		
				//console.log("Index: " + index);
		
				//if (o.type != "process" && o.type != "event") continue;
			
				//console.log("Match");
				/*if (o.type == "process")
				{
					var digits = 2;
					
					if (typeof o.custom_properties.digits != 'undefined')
						digits = o.custom_properties.digits;
					
					
					//log("digits " + digits + o.custom_properties.digits + " " + JSON.stringify(o.custom_properties));
					
					
					o.disp_properties.text= tag_data[j].value.toFixed(digits);
				}*/
				
				
				
				object_types.update_object(o, tag_data[j].value);
				
				
				
				
				
				
				
				
				if (o.type == "vardisplay")
				{
		
					
				}				
				
				
				if (o.type == "varinput")
				{

				}				
					
				
		
			if (o.type == "bitdisplay")
				{
	
								
				}
		
				
				
			if (o.type == "bitinput")
				{
		


								
				}				
				
				if (o.type == "event")
				{
					//log("event match (" + tag_data[j].value + ") + index : "  + index);
					
					
					//o.color = "#000000";
					
					
					if (tag_data[j].value & 1)
						
						o.disp_properties.color = "#22ee22";	
					else
						o.disp_properties.color = "#ee2222";		


								
				}
				
				//console.log("Obj: %o", o);
				if (o.disp_properties.active != 0)
					o.draw();	
			}
			
		}
	
	graphics.draw_end();
	
	//graphics.render();
	
}
	
	
	
	
	
	
/* Parse new image from server */
function parse_tag_list(data)
{
	var strdata = JSON.stringify(data);
	
	//log("New tag data: " + strdata);
	
	tag_list = data.data;

	//	display_image();
	
	var strdata = JSON.stringify(tag_list);
	
	//log("New tag data: " + strdata);
	//log("Length: " +  tag_data.length);
	// Make lookup
	
		/*tags.push({id:76, name:"test 1", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:77, name:"test 2", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:78, name:"test 3", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:79, name:"test 4", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:80, name:"test 5", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:81, name:"test 6", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:82, name:"test 7", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:83, name:"test 8", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:84, name:"test 9", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:85, name:"test 10", device_name: "", type:"test", high:10, low:0.1});
	tags.push({id:86, name:"test val 1", device_name: "", type:"test", high:10, low:0.1});*/
	

	//log("NUm: " + num_objects);
	
	tags.length = 0;
	
	
		for (var j = 0; j < tag_list.length; j++)
		{
			
			var id = tag_list[j].id;
			var name = tag_list[j].name;
			var type = tag_list[j].type;
			var warn_min = tag_list[j].warn_min;
			var warn_max = tag_list[j].warn_max;
			
			
			//log(id + " " + name);
			
			
			tags.push({id:id, name:name, type:type, warn_min:warn_min, warn_max:warn_max});
			
			
		}

		
		//log("Tag lookup: " + JSON.stringify(tag_lookup));
		//tag_lookup
		/*
		
		for (var j = 0; j < tag_data.length; j++)
		{
			//console.log("ID: " + tag_data[j].id + " value: " + tag_data[j].value );
		
			var t = -1;
		
			if (typeof tag_lookup[tag_data[j].id] == 'undefined') continue;
		
			for (var i = 0; i < tag_lookup[tag_data[j].id].length; i++)
			{
			
				index = tag_lookup[tag_data[j].id][i];
		
				var o = graphics.get_object(index);
				if (o == 'undefined') continue;
		
		//log("Type: " + o.type);
		
		
				//console.log("Index: " + index);
		
				if (o.type != "process" && o.type != "event") continue;
			
				//console.log("Match");
				if (o.type == "process")
				{
					o.disp_properties.text= tag_data[j].value;
				}
				
				
				if (o.type == "event")
				{
					//log("event match (" + tag_data[j].value + ") + index : "  + index);
					
					
					//o.color = "#000000";
					
					
					if (tag_data[j].value & 1)
						
						o.disp_properties.color = "#22ee22";	
					else
						o.disp_properties.color = "#ee2222";						
				}
			}
			
		}
	*/
	
	 create_tag_lookup()
	
	
	//graphics.render();
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	
	
	
// Parse list data from object server
function create_tag_lookup()
{
	//var str = JSON.stringify(list);
	//console.log(str);
	// alert(str);
	//var prev = objects.length;
	//alert("prev: " + prev);
	
	//var count = list.count;
			
	console.log("Rebuilding tag lookup");


	
			tag_lookup.length = 0;
			
			
			
			
		var num_objects = graphics.get_num_objects();
			
	
	for (var i = 0; i < num_objects; i++)
	{
		var o = graphics.get_object(i);
		
		var tag_id = o.custom_properties.tag;
		
		if (tag_id == undefined) continue;
		
		if (tag_id == "") continue;
		if (tag_id == null) continue;
		

		//log("Tag id: " + tag_id);
		
		if (typeof tag_lookup[tag_id] == 'undefined')
			tag_lookup[tag_id] = Array();
		
			
		tag_lookup[tag_id].push(i);
		
		//log("Tag lookup: " + JSON.stringify(tag_lookup));
		
	}
			
			
			
			
			
			
			
			
			
		/*	
			
	for (var i = 0; i < count; i++)
	{	
		var tmp = new Object;
	
		tmp.id        = i;
		tmp.name      = list.data.object_name[i].name;
		tmp.device_name      = list.data.object_name[i].device_name;
		tmp.type      = list.data.object_name[i].type;
	
		tags.push(tmp);
	}*/

	var str = JSON.stringify(tags);
	
		//console.log("Loaded tags: " + str);
	
	graphics.render();
}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	// Make object add request to network
	function request_view(view)
	{
		var command = Object();
  	
		command.target = "tag";
		command.action = "list";
		command.view = view;
		
		log(MODULE + "Request tag list:" + JSON.stringify(command));
		
		websocket.command(command);	
	
	
		command.target = "obj";
		command.action = "list";
		command.view = view;
		
		log(MODULE + "Request view:" + JSON.stringify(command));
		
		websocket.command(command);
	}


	// Parse list data from object server
	function process_object_list(data)
	{
		// Clear current objects
		graphics.remove_objects();
		
		//disp_objects.length = 0;
		
		var list = data.data;
//		var prev = disp_objects.length;
		var count = list.length;
				
		current_view = data.view;
			
		for (var i = 0; i < count; i++)
		{	
			add_object_data(list[i]);
			
		}
	
	
	
	
		graphics.adjust_scale();
	
		
	
	
		create_tag_lookup();

		graphics.render();
		
		
		main.set_loaded();
		
		
		
	}
	
	
	function add_object_data(data)
	{
	
	
			//console.log("Add object data: %o " , data);
	
			var disp_properties = {};
			var custom_properties = {};
			
			// TODO these need to be pre-parsed by server, not returned as strings
			
			
			try
			{
				disp_properties = JSON.parse(data.disp_properties); // Temp for conversion
			}
			catch(e)
			{
				log(MODULE + "process_object_list: Unable to parse disp_properties (" + e.message + ") " + data.disp_properties);		
			}
			
			try
			{
				custom_properties = JSON.parse(data.custom_properties); // Temp for conversion
			}
			catch(e)
			{
				log(MODULE + "process_object_list: Unable to parse custom_properties (" + e.message + ") " + data.custom_properties);
			}
			
			
			var tmp = object_types.load_object(data.id, data.view, data.type,
												disp_properties, 
												custom_properties);
			
			
			
			
			/*var tmp = new Object();
			
			tmp.id = list[i].id;
			tmp.view = list[i].view;
			tmp.type = list[i].type;
			
			//log(MODULE + "add list id: " + tmp.id);
			//log(MODULE + "add type id: " + tmp.type);
			
			tmp.disp_properties = disp_properties;
			tmp.custom_properties = custom_properties;*/
			
			graphics.object_add(tmp);

	
	
	}
	
	
	
	
	
	
	
	
	
	
	
	// Make object update request to network
	function request_update(index)
	{
		//log(MODULE + "request update on index: " + index);
	
		var obj = graphics.get_object(index);
	
		var command = Object();
  	
		command.target = "obj";
		command.action = "update";
		
		command.object_data = Object();
		
		command.object_data.id = obj.id;
		command.object_data.type = obj.type;
		//log(MODULE + "cust: " + JSON.stringify(obj.custom_properties));
		
		command.object_data.disp_properties   = JSON.parse(JSON.stringify(obj.disp_properties));		
		command.object_data.custom_properties = JSON.parse(JSON.stringify(obj.custom_properties));		
		
		
		// Strip out internal state
		command.object_data.disp_properties.selected = 0;
		
		//log(MODULE + "Move command: " + JSON.stringify(command));
		
		websocket.command(command);
	}

	// Deal with object update from network
	function process_update_object(data)
	{
		//log(MODULE + "process_update_object");
		//log(MODULE + "Move command: " + JSON.stringify(data));
	
	
		graphics.object_update(data);
		
		graphics.render();
		
	
	
	}

	// Request inital view when connected
	function process_connected()
	{
		//log(MODULE + "Process connected");
		request_view(DEFAULT_VIEW);
	
		poll_cameras();
	
		
		
	}	



	// Make object add request to network
	function request_add_object(obj)
	{
		var command = Object();
		
		command.target = "obj";
		command.action = "add";
		command.view = current_view;
		
		try
		{
			command.object_data = JSON.parse(JSON.stringify(obj));
		}
		catch (e)
		{
			log(MODULE + "Unable to parse add object_data: " + JSON.stringify(obj));
			return;
		}

			
		// Strip out internal state
		//log(MODULE + "command str: " +  JSON.stringify(command));
		
		websocket.command(command);
	}


	// Deal with object add from network
	function process_add_object(data)
	{
		log(MODULE + "process_add_object " + JSON.stringify(data));
	
			
			var tmp = object_types.load_object(data.object_data.id, data.object_data.view, data.object_data.type,
												data.object_data.disp_properties, 
												data.object_data.custom_properties);
			
			
			
			
			/*var tmp = new Object();
			
			tmp.id = list[i].id;
			tmp.view = list[i].view;
			tmp.type = list[i].type;
			
			//log(MODULE + "add list id: " + tmp.id);
			//log(MODULE + "add type id: " + tmp.type);
			
			tmp.disp_properties = disp_properties;
			tmp.custom_properties = custom_properties;*/
			
			graphics.object_add(tmp);


			
			
	//	add_object_data(data.object_data);
	
	
//		graphics.object_add(data.object_data);   // Add to display objects
		 
		create_tag_lookup();
	
		graphics.render();
	}


	// Make object delete request to network
	function request_delete_object(id)
	{
	//	log(MODULE + "Request delete" + index);
		
		if (id < 0) return;
		
		log("Request Delete: " + id);
		
		var obj = graphics.get_id_object(id); 
		
		if (obj == null) { log("request_delete_object could not find object"); };
		
		var id = obj.id;
		
		
		log("object: "  + JSON.stringify(obj));
		
		var command = Object();
		
		command.target = "obj";
		command.action = "delete";
		command.id = id;
	
	log("Request Delete: " + command.id);
		
	
		websocket.command(command);
	}

	// Deal with object delete from network
	function process_delete_object(data)
	{
		log(MODULE + "process delete: " + JSON.stringify(data));
		
		graphics.object_delete(data.id);
		
		create_tag_lookup();
		
		graphics.render();
		

	}

 
	/* User interacting with objects */




	// User requests new object
	function ui_add(type, option1, option2)
	{
		//log("obj " +  option1);

			var obj = graphics.new_object(type, option1, option2);
		
		//var obj = new graphics.Object();
		
		
		if (obj.type == "") return;
		
	
	console.log("Add object");
	console.log(obj);
		
		request_add_object(obj);	

		
			var tmp = object_types.load_object(obj.id, obj.view, obj.type,
												obj.disp_properties, 
												obj.custom_properties);
			
			
			
			
			/*var tmp = new Object();
			
			tmp.id = list[i].id;
			tmp.view = list[i].view;
			tmp.type = list[i].type;
			
			//log(MODULE + "add list id: " + tmp.id);
			//log(MODULE + "add type id: " + tmp.type);
			
			tmp.disp_properties = disp_properties;
			tmp.custom_properties = custom_properties;*/
			
			graphics.object_add(tmp);


		 
		create_tag_lookup();
	
		graphics.render();
		
		
		

	}
	
	
	
	// Make a copy of an item or group
	function ui_copy(id)
	{
		if (id < 0) return;
			
		//log("index: " + index);
	

		

	
		// clone object
		var tmp_object = new Object;	
	
		var obj = graphics.get_id_object(id);
	
		if (typeof obj == 'undefined') 
		{
			
			log("Copy: can't find object: " + id);
			
		}
		
		
		log("Object: " + JSON.stringify(obj));
	
	
	
		tmp_object = JSON.parse(JSON.stringify(obj));
	
		tmp_object.id = -1;
		tmp_object.disp_properties.x += tmp_object.disp_properties.w + 10;
		tmp_object.disp_properties.selected = 0;
		
		request_add_object(tmp_object);	
	
	}
	
	// Remove Item
	function ui_delete(id)
	{
		
		
		
		// Find id
		
		
		log("UI Delete: " + id);
		
		
		
		
		
		
		//log(MODULE + "remove item");
		
		//alert("sel: " + object_selected + " l: " + disp_objects[object_selected].locked);
		
		if (id < 0) return;
		
		
		//var obj = graphics.get_object(index); 
		
		log("ui_delete on " + id);
		
		
		var obj= graphics.get_id_object(id);
		
		
		if (obj == null)
		{
			log("UI Delete:  unable to find object");
			return;
			
		}
		
		
		
		if (obj.locked == 1) 
		{
			log(MODULE + "Cannot remove locked object. Unlock first");
			return;		// Cannot remove locked
	
		}
		
//		obj.disp_properties.active = 0;	// Disable display of object.  Need to check with select also
		
		
		request_delete_object(id);
	
		//var id = obj.id;
	
		//ui.action_click_open();
		ui.clear_selections();
	
		//graphics.render();
	
		return false;	
	}

	
	
	
	
	
	
	
	function poll_cameras()
	{
		
		
		for (var i = 0; i < camera_objects.length; i++)
		{
			
			camera_request_image(camera_objects[i].object.camera_id);
		}
		
		
		setTimeout(function() {poll_cameras();}, 1000);	// Setup timer
		
		
		
	}
	
	
	
	
	
	// Camera
	
	
	// Make object add request to network
	function camera_request_image(camera_id)
	{
		console.log("Request image " + camera_id);
		
		var command = Object();
		
		command.target = "cam";
		command.action = "get";
		command.camera_id = camera_id;
		
		//command.view = current_view;
		
			
		// Strip out internal state
		//log(MODULE + "command str: " +  JSON.stringify(command));
		
		websocket.command(command);
	}


	var camera_objects = [];
	
	
	
	local.register_camera_object = function (camera_index, obj)
	{
		
		var o = {camera_index:camera_index, object:obj};
		
		camera_objects.push(o);
		
		camera_request_image(obj.camera_id);
		
		
	}
	
	
	
	function process_cam_data(data)
	{
	


		//camera_request_image(); // request next
		
		//// Clear current objects
		//graphics.remove_objects();
		
		
		console.log("Camera objects %o", camera_objects);
		
		var camera_index = data.camera_id;
		
		
		console.log("camera id: " + camera_index);
		
		
		for (var i = 0; i < camera_objects.length; i++)
		{
			
			if (camera_objects[i].camera_index == camera_index)
			{
				camera_objects[i].object.process_camera_data(data.data);
				
				
				
					console.log("Camera objects ["+i+"] %o", camera_objects[i]);	
					
				//setTimeout(function() {camera_request_image(camera_objects[i].object.camera_id);}, 1000);	// Setup timer

				
			}
			
		}
		
		
		//disp_objects.length = 0;
		
		//var list = data.data;
//		var prev = disp_objects.length;
		//var count = list.length;
				
	
	//console.log("Cam Data: %o", data);
	
	//var raw_data = atob(data.data);
	
	

	
	
	
	}
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	return local;
}());
	










