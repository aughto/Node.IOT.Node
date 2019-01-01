/*    
	Vector
	2015 Jason Hunt
	Jason.Hunt
	
	File: 

	Special objects

*/

"use strict";


var object_types = (function () 
{
	var local = {};
	
	var min, max, min_size, max_size;
		
	//local.start = function() { start(); } ;
	//local.get_inital_properties = function(t, o) { get_inital_properties(t, o); };
	local.update_object = function(o, v) { update_object(o, v); };
		
		
	local.get_object = function (type, x, y, w, h) { return get_object(type, x, y, w, h); };
		
	var camera_index = 0;
		
		
	var object_defs = [];
			
		
	local.start = function()
	{
		// Private
		min_size = ui.get_min_size();
		max_size = ui.get_max_size();
			
		max = ui.get_max();
		min = ui.get_min();
		
		
		
		
		
		
		// Load objects
		object_defs.push(Rect());
		object_defs.push(Module());
		object_defs.push(Rack());
		object_defs.push(VarDisplay());
		object_defs.push(VarInput());
		object_defs.push(BitDisplay());
		object_defs.push(BitInput());
		object_defs.push(Camera());
		
		
		
		//console.log("type: ( " + JSON.stringify(object_defs[0]) + " ) " );
		//console.log("my object: %o",object_defs[0]);
		//console.log("my object: %o",Rect);
		
		
		
		//object_defs[0].load();
		
		for (var i = 0; i < object_defs.length; i++)
		{
			object_defs[i].load();
		}
		
	};

	
	// load object from database data
	//var tmp = object_types.load_object(id, view, type, disp, cust);
			
	local.load_object = function(id, view, type, disp, cust)
	{
		
		// need to store as assitiave arrray
		
		
		//for (var i = 0; i < object_defs.length; i++)
		{
			//if (object_defs[i].type == type)
			{
				// Creates a copy from reference
				//var tmp =  new object_defs[i](); //Object.create(Rect(), {});
				//var tmp =  new object_defs[i]; //Object.create(Rect(), {});
				
				// Need to pull from object_defs array, could not figure out how

				var tmp = get_object_base(type);
				
				
				tmp.id = id;
				tmp.view = view;
				tmp.disp_properties = disp;
				tmp.custom_properties = cust;
				
				
				tmp.init(); // override loads
				
				
				//console.log(JSON.stringify(tmp));
				
				//console.log("new object: %o", tmp);
				
				return tmp;
				
			
			}
		}
		
		
		console("Type not found for load_object");
		
		
		return null;
		
	};
	
	
	
	
	
	
	
	
	
	
	function get_object_base(type)
	{
				
		var tmp = {} ;
				
		// Need to pull from object_defs array, could not figure out how
				
		if (type == "rect") tmp = new Rect();
		if (type == "module") tmp = new Module();
		if (type == "rack")  tmp = new Rack();
		if (type == "vardisplay")  tmp = new VarDisplay();
		if (type == "varinput")  tmp = new VarInput();
		if (type == "bitdisplay")  tmp = new BitDisplay();
		if (type == "bitinput")  tmp = new BitInput();
		if (type == "camera")  tmp = new Camera();
		
				
				
		return tmp;		
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	function get_object(type, x, y, w, h)
	{
		var local;
		
		local = get_object_base(type);

		
		local.id = -1;
		local.type = type;
		
		local.disp_properties = {};
		local.custom_properties = {};
		
		local.disp_properties.type = "rect";


		local.disp_properties.parent = -1;
		local.disp_properties.machine = -1;

		local.disp_properties.type = type;
		local.disp_properties.active = +1;
		local.disp_properties.layer = +10;
		local.disp_properties.locked = +0;
		local.disp_properties.text = '';
		local.disp_properties.name = '';
		local.disp_properties.color = "#e0e0e0";	
		local.disp_properties.tcolor = "#666666";
		local.disp_properties.border = 1;
		local.disp_properties.parent_index = INVALID_OBJECT;
		local.disp_properties.machine = "";
		local.disp_properties.enabled = 1;
		local.disp_properties.tag = 0;
		
		local.disp_properties.param1 = "";
	
		local.disp_properties.x = x;
		local.disp_properties.y = y;
		
		local.disp_properties.w = w;
		local.disp_properties.h = h;
			
			
		local.custom_properties.note = "";
			
		local.loaded = false;
			
					
		// get object specific properties
		//	if (object_types.get_inital_properties(type, local)) return;
	
		local.get_inital(); // override default properties for some objects
					
		local.loaded = true;
		
		console.log("New object: %o", local);
		
		return local;
		
		
	}
	
			
	
	/*
	
	function get_inital_properties(type, obj)
	{
		var found = false;
		for (var i = 0; i < object_defs.length; i++)
		{
			if (object_defs[i].type == type)
			{
				object_defs[i].get_inital(obj);
				return true;
			}
		}
		
		return false;
	}
*/
	
	
	
	function update_object(o, value)
	{
		
		//console.log("Update object: " + value);
	
		
			for (var i = 0; i < object_defs.length; i++)
		{
			if (object_defs[i].type == o.type)
			{
				object_defs[i].update(o, value);
				return true;
			}
		}
		
		
	}
	
	
	
	function Common()
	{
		var local = {};
			
			
			
		return local;
		
			
	}
	
	
	function draw_generic(obj)
	{
		var p = obj.disp_properties;

		
		//p.color
		graphics.draw_rectangle(p.x, p.y, p.w, p.h, p.text, p.color, p.border);	 
		graphics.draw_text(p.x, p.y, p.w, p.h, p.tcolor, p.text);

			
	}
	
	
	
	
	
	function Rect()
	{
		var local = {};
		
		var type = "rect";
		local.type = "rect";
		
		
		
		local.test = "zzz";
		
		local.get_inital = function() 
		{
			this.disp_properties.display_name = "Rectangle";	
		}
		
		local.update = function(obj, value)
		{
			
			
		}
		
		local.draw = function()
		{
			draw_generic(this);

		}
		
		local.init = function()
		{
			
		}
		
		
		
		ui.add_keyevent(type, function(index, k) 
		{ 
			var id = graphics.get_object(index).id;
		
			if (k == 46) objects.request_delete_object(id); // 'delete'
		});			
		
		
		
		
		local.load = function()
		{
			console.log("Loaded rect");
		//properties.add_property({mode:"edit", mode:"all", type:type, fclass:   "custom", field:   "test", show: "all", display:       "Test", datatype:   "string", min:     0, max:0} ); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:   "name", show: "all", display:       "Name", datatype:   "string", min:     0, max:0}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:   "text", show: "all", display:       "Text", datatype:   "string", min: 	  0, max:0}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:      "x", show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:      "y", show: "all", display:          "Y", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:      "w", show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:      "h", show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:  "color", show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field: "tcolor", show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field: "border", show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field:  "layer", show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
		properties.add_property({mode:"edit", type:type, fclass:     "disp", field: "locked", show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
		properties.add_property({mode:"edit", type:type, fclass:         "", field:       "", show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
		properties.add_property({mode:"edit", type:type, fclass:   "custom", field:   "note", show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 
		}
		
		return local;
	}

	
	
	function VarDisplay()
	{
		var local = {};
		
		var type = "vardisplay";		
		local.type = "vardisplay";
		
		local.get_inital = function() 
		{
			this.disp_properties.display_name = "Variable Display";	
			this.disp_properties.color = "#ffffff";	
			this.disp_properties.tcolor = "#111111";
			this.custom_properties.digits = 2;
		}
		
		local.update = function(o, value)
		{
			var digits = 2;
					
			if (typeof o.custom_properties.digits != 'undefined')
				digits = o.custom_properties.digits;
					
					
					//log("digits " + digits + o.custom_properties.digits + " " + JSON.stringify(o.custom_properties));
					
					
			o.disp_properties.text = value.toFixed(digits);			
			
			
		}
		
		local.draw = function()
		{
			draw_generic(this);

		}		
		
		local.init = function()
		{
			this.disp_properties.text = "";  // Override database value
		}		
		
		local.load = function()
		{
			
		//properties.add_property({ mode:"all", type:type, fclass:   "custom", field:   "test", show: "all", display:       "Test", datatype:   "string", min: 0, max:100}); 
		properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "name", show: "all", display:       "Name", datatype:   "string", min: 0, max:100}); 
		//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "text", show: "all", display:       "Text", datatype:   "string", min: 0, max:100}); 
		properties.add_property({ mode:"all", type:type, fclass: "custom", field:    "tag", show: "all", display:       "Tag", datatype:   "taglist", min: 0, max:100}); 
		properties.add_property({ mode:"edit", type:type, fclass: "custom", field: "digits", show: "all", display:    "Digits", datatype:   "number", min: 0, max:10}); 		
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "x", show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "y", show: "all", display:          "Y", datatype:   "number", min: min.y, max:max.y}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "w", show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "h", show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "color", show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "tcolor", show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "border", show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "layer", show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "locked", show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
		properties.add_property({ mode:"run", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "logging", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass: "custom", field:   "note", show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 
		
		
		properties.add_editcallback(type, function(index, o)
		{
			//o.disp_properties.color = self.get_state_color(o.custom_properties.state);
			
			objects.rebuild_tag_lookup();
			
		});	

		}		
		
		
		return local;
		
		
	}
	
	
	function VarInput()
	{
		var local = {};		
		
		var type = "varinput";		
		local.type = "varinput";
		
		local.get_inital = function() 
		{
			this.disp_properties.display_name = "Variable Input";	
			this.disp_properties.color = "#ffffff";	
			this.disp_properties.tcolor = "#111111";
			this.custom_properties.digits = 2;			
			
			/*obj.disp_properties.display_name = "Variable Input";	
			obj.disp_properties.color = "#ffffff";	
			obj.disp_properties.tcolor = "#111111";
			obj.custom_properties.digits = 2;				*/
			
		}
		
		local.update = function(o, value)
		{
			var digits = 2;
					
			if (typeof o.custom_properties.digits != 'undefined')
				digits = o.custom_properties.digits;
					
					
			//log("digits " + digits + o.custom_properties.digits + " " + JSON.stringify(o.custom_properties));
			
			o.disp_properties.text = value.toFixed(digits);			
		}
		
		local.draw = function()
		{
			draw_generic(this);

		}	

		local.init = function()
		{
			this.disp_properties.text = ""; // Override database value
		}
		
		local.set_value = function(value)
		{
			console.log("Request set value to: " + value);
			
			objects.request_tag_write(this.custom_properties.tag, value);
			
		}		
		
		
		local.load = function()
		{
		
			//properties.add_property({ mode:"all", type:type, fclass:   "custom", field:   "test", show: "all", display:       "Test", datatype:   "string", min: 0, max:100}); 
			//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "name", show: "all", display:       "Name", datatype:   "string", min: 0, max:100}); 
			//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "text", show: "all", display:       "Text", datatype:   "string", min: 0, max:100}); 

			properties.add_property({ mode:"all", type:type, fclass: "custom", field:    "tag", show: "all", display:       "Tag", datatype:   "taglist", min: 0, max:100}); 		
			properties.add_property({ mode:"run", type:type, fclass:   "disp", field:   "text", show: "all", display:   "Value", datatype:   "value", min: 0, max:100}); 

			properties.add_property({ mode:"edit", type:type, fclass: "custom", field: "digits", show: "all", display:    "Digits", datatype:   "number", min: 0, max:10}); 		
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "x", show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "y", show: "all", display:          "Y", datatype:   "number", min: min.y, max:max.y}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "w", show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "h", show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "color", show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "tcolor", show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "border", show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "layer", show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "locked", show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
			properties.add_property({ mode:"all", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "logging", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass: "custom", field:   "note", show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 

			
			properties.add_editcallback(type, function(index, o)
			{
				//o.disp_properties.color = self.get_state_color(o.custom_properties.state);
				
				
				console.log("Tagid: " + o.custom_properties.tag + " new value: " + o.disp_properties.text);
				
				
				//objects.request_tag_write(o.custom_properties.tag, o.disp_properties.text);
				
				objects.rebuild_tag_lookup();
				
			});	

		}		
		
		return local;		
	}
	
	
	
	
	
	
	function BitDisplay()
	{
		var local = {};
		
		var type = "bitdisplay";		
		local.type = "bitdisplay";
		
		local.get_inital = function() 
		{
			this.disp_properties.display_name = "Bit Display";	
			this.disp_properties.color = "#ffffff";	
			this.disp_properties.tcolor = "#111111";			
		}
		
		local.update = function(o, value)
		{
			o.value = value & 1;
										
			if (o.value)
				o.disp_properties.color = "#22ee22";	
			else
				o.disp_properties.color = "#ee2222";		

			
			
		}
		
		local.draw = function()
		{
			draw_generic(this);

		}		
		
		local.init = function()
		{
			
		}		
		
		
		local.load = function()
		{
		
		
		//properties.add_property({ mode:"all", type:type, fclass:   "custom", field:   "test", show: "all", display:       "Test", datatype:   "string", min: 0, max:100}); 
		properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "name", show: "all", display:       "Name", datatype:   "string", min: 0, max:100}); 
		//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "text", show: "all", display:       "Text", datatype:   "string", min: 0, max:100}); 
		properties.add_property({ mode:"all", type:type, fclass: "custom", field:    "tag", show: "all", display:       "Tag", datatype:   "taglist", min: 0, max:100}); 
		//properties.add_property({ mode:"edit", type:type, fclass: "custom", field: "digits", show: "all", display:    "Digits", datatype:   "number", min: 0, max:10}); 		
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "x", show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "y", show: "all", display:          "Y", datatype:   "number", min: min.y, max:max.y}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "w", show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "h", show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "color", show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "tcolor", show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "border", show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "layer", show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "locked", show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "logging", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass: "custom", field:   "note", show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 
		
		
		properties.add_editcallback(type, function(index, o)
		{
			//o.disp_properties.color = self.get_state_color(o.custom_properties.state);
			
			objects.rebuild_tag_lookup();
			
		});		
		}
		
		return local;		
		
	}
	
	
	function BitInput()
	{
		var local = {};		
		
		var type = "bitinput";		
		local.type = "bitinput";
		
		local.get_inital = function() 
		{
			this.disp_properties.display_name = "Bit Input";
			this.disp_properties.color = "#ffffff";	
			this.disp_properties.tcolor = "#111111";			
		}
		
		
		local.update = function(o, value)
		{
			o.value = value & 1;
					
			if (o.value)
				o.disp_properties.color = "#22ee22";	
			else
				o.disp_properties.color = "#ee2222";				
			
		}
		
		local.draw = function()
		{
			draw_generic(this);

		}		
		
		local.init = function()
		{
			
		}		
		
		local.load = function()
		{
		//properties.add_property({ mode:"all", type:type, fclass:   "custom", field:   "test", show: "all", display:       "Test", datatype:   "string", min: 0, max:100}); 
		properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "name", show: "all", display:       "Name", datatype:   "string", min: 0, max:100}); 
		//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "text", show: "all", display:       "Text", datatype:   "string", min: 0, max:100}); 
		properties.add_property({ mode:"all", type:type, fclass: "custom", field:    "tag", show: "all", display:       "Tag", datatype:   "taglist", min: 0, max:100}); 		
		//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "text", show: "all", display:   "Value", datatype:   "value", min: 0, max:100}); 
		
		//properties.add_property({ mode:"all", type:type, fclass: "custom", field: "digits", show: "all", display:    "Digits", datatype:   "number", min: 0, max:10}); 		
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "x", show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "y", show: "all", display:          "Y", datatype:   "number", min: min.y, max:max.y}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "w", show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "h", show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "color", show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "tcolor", show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "border", show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "layer", show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "locked", show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "logging", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass: "custom", field:   "note", show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 
	

	
	
		ui.add_clickcallback(type, function(index, o)
		{
			//o.disp_properties.color = self.get_state_color(o.custom_properties.state);
			console.log("Tag: " + o.custom_properties.tag + " clicked");
			
			var value = o.value;
			
			console.log("State: " + value);
			
			// toggle
			if (value) 
				value = 0;
			else
				value = 1;
			
			objects.request_tag_write(o.custom_properties.tag, value);
			
			

			
			return true;

			
			/*console.log("Tagid: " + o.custom_properties.tag + " new value: " + o.disp_properties.text + " write disabled");
			
			
				var state = o.disp_properties.text;
				
				
			
			
			
			objects.request_tag_write(o.custom_properties.tag, state);
			
			o.disp_properties.text = "";
		
			
			objects.rebuild_tag_lookup();*/
			
		});		
		
		properties.add_editcallback(type, function(index, o)
		{
			//o.disp_properties.color = self.get_state_color(o.custom_properties.state);
			
			
			/*console.log("Tagid: " + o.custom_properties.tag + " new value: " + o.disp_properties.text + " write disabled");
			
			
				var state = o.disp_properties.text;
				
				
				
			
			
			
			objects.request_tag_write(o.custom_properties.tag, state);
			
			o.disp_properties.text = "";
		
			
			objects.rebuild_tag_lookup();*/
			
						objects.rebuild_tag_lookup();
			
			
		});		
		
		}
		
		return local;		
		
	}
	
	
	
		
	function Camera()
	{
		var local = {};		
		
		var type = "camera";		
		local.type = "camera";
		
		var camera_data = "";
		var img = new Image();
			
		var self;
			
		
		local.get_inital = function() 
		{
			this.disp_properties.display_name = "Camera";	
			this.disp_properties.color = "#ffffff";	
			this.disp_properties.tcolor = "#111111";
			this.custom_properties.digits = 2;			
			
			/*obj.disp_properties.display_name = "Variable Input";	
			obj.disp_properties.color = "#ffffff";	
			obj.disp_properties.tcolor = "#111111";
			obj.custom_properties.digits = 2;				*/
			
		}
		
		local.update = function(o, value)
		{
			//var digits = 2;
					
			//if (typeof o.custom_properties.digits != 'undefined')
			//	digits = o.custom_properties.digits;
					
					
			//log("digits " + digits + o.custom_properties.digits + " " + JSON.stringify(o.custom_properties));
			
			//o.disp_properties.text = value.toFixed(digits);			
		}
		
		local.draw = function()
		{
			//draw_generic(this);
			
			var p = this.disp_properties;


			graphics.draw_image(img, p.x, p.y, p.w, p.h );

			
			//ctx.drawImage(img, x, y, w, h);
			
			
		}	

		local.init = function()
		{
			this.disp_properties.text = ""; // Override database value
			
			
			//			var camera_index = 0;

			this.camera_id = camera_index;
			
			
			//console.log("Cam idnex: " + camera_index);
			
			objects.register_camera_object(camera_index, this);
			
			
			camera_index++;
			
			self = this;
			
			
		}
		
		local.set_value = function(value)
		{
			//console.log("Request set value to: " + value);
			
			//objects.request_tag_write(this.custom_properties.tag, value);
			
		}		
		

		img.onload = function () 
		{
			//console.log("Image Onload");
			
			var p = self.disp_properties;

			
			//console.log("Image Onload self %o", self.disp_properties);
			
			
			graphics.draw_start();
			

			graphics.draw_image(img, p.x, p.y, p.w, p.h );

		graphics.draw_end();
			
		}
		
		 img.onerror = function (stuff) 
		{
			console.log("Img Onerror:", stuff);
		};

		
		local.process_camera_data = function(data)
		{
			console.log("Process");
			
			//camera_data = data;
			
			
			img.src = "data:image/jpg;base64," + data; //base64;
			
			//img.on
				
				
				
			
			//this.draw();
			
			//var p = this.disp_properties;
			
//			graphics.draw_image(camera_data, p.x, p.y, p.w, p.h );
			
			
		}
		
		
		local.load = function()
		{
		
			//properties.add_property({ mode:"all", type:type, fclass:   "custom", field:   "test", show: "all", display:       "Test", datatype:   "string", min: 0, max:100}); 
			//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "name", show: "all", display:       "Name", datatype:   "string", min: 0, max:100}); 
			//properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "text", show: "all", display:       "Text", datatype:   "string", min: 0, max:100}); 

			//properties.add_property({ mode:"all", type:type, fclass: "custom", field:    "tag", show: "all", display:       "Tag", datatype:   "taglist", min: 0, max:100}); 		
			//properties.add_property({ mode:"run", type:type, fclass:   "disp", field:   "text", show: "all", display:   "Value", datatype:   "value", min: 0, max:100}); 

			//properties.add_property({ mode:"edit", type:type, fclass: "custom", field: "digits", show: "all", display:    "Digits", datatype:   "number", min: 0, max:10}); 		
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "x", show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "y", show: "all", display:          "Y", datatype:   "number", min: min.y, max:max.y}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "w", show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "h", show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
			//properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "color", show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
			//properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "tcolor", show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "border", show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "layer", show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
			properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "locked", show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
			//properties.add_property({ mode:"all", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "logging", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
			properties.add_property({ mode:"edit", type:type, fclass: "custom", field:   "note", show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 

			
			properties.add_editcallback(type, function(index, o)
			{
				//o.disp_properties.color = self.get_state_color(o.custom_properties.state);
				
				
				//console.log("Tagid: " + o.custom_properties.tag + " new value: " + o.disp_properties.text);
				
				
				//objects.request_tag_write(o.custom_properties.tag, o.disp_properties.text);
				
				//objects.rebuild_tag_lookup();
				
			});	

		}		
		
		return local;		
	}
	
	
	
	
	
	
	
	

	function Module()
	{
		var local = {};		

		var type = "module";

		local.type = "module";

		local.get_inital = function() 
		{
			this.disp_properties.display_name = "Module";
		}
		
		local.update = function(obj, value)
		{
			
			
		}
		
		local.draw = function()
		{
			draw_generic(this);

		}		
		
				local.init = function()
		{
			
		}
		

			
		local.set_state = function(index, state)
		{
			var o = graphics.get_object(index);
			
			properties.hide();
				
			o.custom_properties.state = state;
				
			o.disp_properties.color = self.get_state_color(o.custom_properties.state);
				
			objects.request_update(index);
				
			graphics.render();
		}
		
		local.get_state_color = function(state)
		{
			if (state == "Unused")  return "#222222"; else
			if (state == "Cleaned") return "#ff4400"; else
			if (state == "Planted") return "#4444ff"; else
			if (state == "Ready")   return "#44ff44"; else
			if (state == "Lost")    return "#ff1111";	
				
			return "#000000";
		}
				
		local.load = function()
		{
			
			
			
			
					
		var self = this;
		
		ui.add_keyevent(type, function(index, k) 
		{ 
		/*	var id = graphics.get_object(index).id;
		
			if (k == 46) objects.request_delete_object(id); // 'delete'
		
			if (k == 67) self.set_state(index, "Cleaned"); // 'c'
			if (k == 85) self.set_state(index, "Unused"); // 'u'
			if (k == 80) self.set_state(index, "Planted"); // 'u'
			if (k == 82) self.set_state(index, "Ready"); // 'u'
			if (k == 76) self.set_state(index, "Lost"); // 'u'*/
		});		
			
		properties.add_editcallback(type, function(index, o)
		{
			/*console.log("This: %o", self);
			
			
			o.disp_properties.color = self.get_state_color(o.custom_properties.state);*/
		});

			
			
			
			
			
			
			
		properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "name", show: "all", display:       "Name", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"all", type:type, fclass:   "custom", field:  "state", show: "all", display:       "State", datatype:   "state",  min: 0, max:0}); 			
		properties.add_property({ mode:"all", type:type, fclass:   "disp", field:   "text", show: "all", display:       "Text", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "x", show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "y", show: "all", display:          "Y", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "w", show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:      "h", show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "color", show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "tcolor", show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "border", show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field:  "layer", show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp", field: "locked", show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:       "", field:       "", show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass: "custom", field:   "note", show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 
		}
		
		return local;		
	}


	
	
	
	
	function Rack()
	{
		var local = {};
				
		var type = "rack";
		local.type = "rack";				
				

		local.get_inital = function() 
		{
			this.disp_properties.display_name =  "Rack";	
			//obj.disp_properties.name = "Rack ID" + option1;
			//obj.disp_properties.text = option2;
			
			this.disp_properties.color = "#eeeeee";	
			
			//log("Rack id: " + option);
		}

		local.update = function(obj, value)
		{
			
			
		}
		
		local.draw = function()
		{
			draw_generic(this);

		}		
		
		
		local.init = function()
		{
			
		}		
		
		
		
		local.load = function()
		{
			
var self = this;			
			
		ui.add_keyevent(type, function(index, k) 
		{ 
			var id = graphics.get_object(index).id;
		
			if (k == 46) objects.request_delete_object(id); // 'delete'
		
			if (k == 67) self.set_state(index, "Cleaned"); // 'c'
			if (k == 85) self.set_state(index, "Unused"); // 'u'
			if (k == 80) self.set_state(index, "Planted"); // 'u'
			if (k == 82) self.set_state(index, "Ready"); // 'u'
			if (k == 76) self.set_state(index, "Lost"); // 'u'
		});		
			
		properties.add_editcallback(type, function(index, o)
		{
			//o.disp_properties.color = self.get_state_color(o.custom_properties.state);
		});

			
		this.set_state = function(index, state)
		{
			/*var o = graphics.get_object(index);
			
			properties.hide();
				
			o.custom_properties.state = state;
				
			o.disp_properties.color = self.get_state_color(o.custom_properties.state);
				
			objects.request_update(index);
				
			graphics.render();*/
		}
		
		this.get_state_color = function(state)
		{
			if (state == "Unused")  return "#222222"; else
			if (state == "Cleaned") return "#ff4400"; else
			if (state == "Planted") return "#4444ff"; else
			if (state == "Ready")   return "#44ff44"; else
			if (state == "Lost")    return "#ff1111";	
				
			return "#000000";
		}
				
		properties.add_property({ mode:"all", type:type, fclass:   "disp",	field:   "name", 	show: "all", display:       "Name", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"all", type:type, fclass:   "custom",	field:  "rack_id",	show: "all", display:       "Rack", datatype:   "rack",  min: 0, max:0}); 			
		properties.add_property({ mode:"all", type:type, fclass:   "disp",	field:   "text", 	show: "all", display:       "Text", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field:      "x", 	show: "all", display:          "X", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field:      "y", 	show: "all", display:          "Y", datatype:   "number", min: min.x, max:max.x}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field:      "w", 	show: "all", display:          "W", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field:      "h", 	show: "all", display:          "H", datatype:   "number", min: min_size, max_size}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field:  "color", 	show: "all", display: "Back Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field: "tcolor", 	show: "all", display: "Text Color", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field: "border", 	show: "all", display:     "Border", datatype:   "string", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field:  "layer", 	show: "all", display:      "Layer", datatype:   "number", min: 0, max:10}); 
		properties.add_property({ mode:"edit", type:type, fclass:   "disp",	field: "locked", 	show: "all", display:       "Lock", datatype:     "lock", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass:       "",	field:       "", 	show: "all", display:           "", datatype: "nbuttons", min: 0, max:0}); 
		properties.add_property({ mode:"edit", type:type, fclass: "custom",	field:   "note", 	show: "all", display:       "Note", datatype:   "string", min: 0, max:0}); 
		}
		
		return local;		
	}

	
	
	
	
	
	
	
	
	return local;
}());
	







