/*
	Vector
	2015 Jason Hunt
	Jason.Hunt
	
	File: 
	
*/

"use strict";

	
var properties = (function () 	
{
	var local = {};

	// Public
	local.start = function () { start(); } ;
	
	local.show = function(o) { show(o); };
	local.hide = function(o) { hide(o); };
	local.save = function(o) { save(o); };
	
	local.set_lock = function(i, l) { set_lock(i, l); };

	local.get_editing = function() { return editing_text; } ;
	local.set_editing = function(e) {  editing_text = e; } ;

	local.add_property = function(p) { add_property(p); };

	local.add_editcallback = function(type, func) { add_editcallback(type, func); } ;
	
	local.text_focus = function(e) { editing_text = e; };


	
	var editing_text = 0;
	
	var property_table = [];
	
	var edit_callbacks = [];
	
	var in_edit = 0;
	
	
	
	var edit_index = -1;
	var edit_tag = -1;
	var edit_object = null;


	
	var entry_width = 150;
	
	
	function start()
	{

		

	
	}
		
		
	function add_property(p)
	{
		property_table.push(p);

	}
	
	
	function add_editcallback(type, func)
	{
		edit_callbacks.push({type:type, func:func});
	}
		



	// Display edit area
	function show(index)
	{	
		log("show properties for " + index);
		var o = graphics.get_object(index);
		var text = build_property_table(index);
		
		if (text == "")
		{
			console.log("No properties for object " + index + " " + o.type + " " + o.id);
			ui.clear_selections();
			
			return;
		}
		
		
		set_html("edit_box", text);

		var obj = document.getElementById("edit_box");	
		obj.style.visibility = "visible";
		
		in_edit = 1;
		edit_index = index;	
		edit_tag = o.custom_properties.tag;
		
		
		edit_object = o;
		
		
		
		
	}

	function hide()
	{
		in_edit = 0;
		
		var edit_area = document.getElementById("edit_box");	
		edit_area.style.visibility = "hidden";		
	}

	

	// Load edit changes
	function save(index)
	{
		
		if (view_mode != "edit") return;
		
		
		if (in_edit == 0)
		{
			log("save_edit called with in_edit == 0");
			return;  // Edit pave was not shown.
		}
		
		if (index == INVALID_OBJECT) return;
		
		var o = graphics.get_object(index);
		
		
		//if (o.disp_properties.locked != 0)		 return; //  Do not allow editing when locked // SHould grey the items out
		
		for (var i = 0; i < property_table.length; i++)
		{
			var p = property_table[i];
			
			// Items for this type only
			if (p.type != o.type) continue;
			if (p.field == "") continue;
			if (p.datatype == "lock") continue;
			
			if (p.mode != view_mode && p.mode != "all") continue;
		
			
			
			// Get value from edit field
			var value = get_element_value("editfield"+i, "");
			
			//log("datatype: " + p.datatype);
			
			// validate			
			
			if (p.datatype == "number") 
			{
				if (value < p.min) { console.log(p.display + " Too low. Value: " + value + " Min: " + p.min ); return }
				if (value > p.max) { console.log(p.display + " Too high. Value: " + value + " Max: " + p.max ); return }
				
				value = +parseFloat(value);
			}

			//log("field: " + p.field + " value: " + value);
			
			// Set value
			if (p.fclass == "disp")   o.disp_properties[p.field] = value;
			if (p.fclass == "custom")  o.custom_properties[p.field] = value;

		}
		
		// Check edit callbacks
		for (var i = 0; i < edit_callbacks.length; i++)
		{
			if (edit_callbacks[i].type == o.type)
			{
				edit_callbacks[i].func(index, o);
			}
		}
		
		// Need to resort disp_objects when changing layers
		
		objects.request_update(index);
		
		graphics.render();
	}

	
	
	function table_entry(s)
	{
	
		
		if (s == "") s = "&nbsp; ";
		
		
		
		return "<td width=" + entry_width + ">" + s + "</td>";
	}
	
	function string_field(id, value)
	{
		
		if (view_mode == "edit")
		
			return table_entry( "<input type=text id=" + id + " size=10 value=\"" + value + "\" onfocus='properties.text_focus(1);' onblur='properties.text_focus(0);'>");
		else
			return table_entry( value);
		
		
	}
	
	function button_field(label, onclick)
	{
		return table_entry( "<input type=submit value='" + label + "' style='width:80px' onclick='"+onclick+"'>") ;
		
	}
	
	
	

	local.ui_value_edit = function()
	{
		
		//console.log("Index: " + edit_index);
		
		var value = get_element_value("value_edit", "");
		
		console.log("Edit object: %o", edit_object);
		
		edit_object.set_value(value);
		
		
		//console.log("Tag: " + edit_tag + " Value: " + value);
		
		ui.clear_selections();
		
	}
	
	
	
	
	
	
	
	
	
	// generate html for each object type
	function build_property_text(index, property)
	{
		
	
		
		var text = "";
				
		var style = "";
			
			if (property.show == 0)
				style = "style='display:none'";
			
			text += "<tr " + style + " >";
			
			if (property.type == "string")
			{			
				text += table_entry( property.display );
				text +=	string_field(property.id, unescapedisplay(property.value));
			}
		
			if (property.type == "number")
			{
				text += table_entry( property.display );
				text +=	string_field(property.id, property.value) ;
			}	
		
			if (property.type == "lock")
			{
				text += table_entry("Locking");
		
				if (property.value)
				{
					text += button_field("Unlock", "properties.set_lock([" + index + "],0);" );
					//text += table_entry( "<input type=submit value='Unlock'  style='width:80px' onclick=properties.set_lock(" + index +",0);>") ;
				}
				else
				{
					text += button_field("Lock", "properties.set_lock([" + index + "],1);" );
					//text += table_entry( "<input type=submit value='Lock'  style='width:80px' onclick=properties.set_lock(" + index + ",1);>") ;		
				}
			}	
		
			// Generic edit buttons
			if (property.type == "nbuttons")
			{
				
				var id = graphics.get_object(index).id;
				
				//text += button_field("Copy",   "onclick=objects.ui_copy(" + id + "); " );
				text += button_field("Copy",   "onclick=ui.action_copy(" + id + "); " );
				
				text += button_field("Delete", "onclick=objects.ui_delete(" + id + "); " );
				
				
				
				//text += table_entry( "<input type=submit value='Copy'  style='width:80px' onclick=objects.ui_copy(" + index + ");> " );
				//text += table_entry( "<input type=submit value='Delete'  style='width:80px' onclick=objects.ui_delete(" + index + ");> ") ;
			}
				
			if (property.type == "checkbox")
			{
				text += table_entry( property.display );
				text += table_entry( "<input type=checkbox  id=" + property.id +" "+ ((property.value) ? "checked" : "") + ">") ;
			}
		
			if (property.type == "enable")			
			{
				text += table_entry(  property.display );
		
				var type_list = Array("Enabled", "Disabled");
				var index_list = Array("1", "0");
				
				text += "<td><select id=" + property.id +" height=32 style='width:80'>";	
		
				for (var j = 0; j < type_list.length; j++)
					if (index_list[j] == property.value)
						text += "<option value='"+index_list[j] + "' selected>" + type_list[j] + "</option>";
					else
						text += "<option value='"+index_list[j] + "'>" + type_list[j] + "</option>";
		
				text += "</select></td>";
			}
			
			if (property.type == "taglist")	
			{
				var tags = objects.get_tags();
			
				text += table_entry(  property.display );
			
				var tag_name = "";
			
			
				var select_text = "";
			
				select_text+= "<select id=" + property.id +" height=32 style='width: " +entry_width+ "'>";	
			
				var tag_id = property.value;
		
				for (var j = 0; j < tags.length; j++)
				{
					if (tags[j].id == tag_id)
					{
						tag_name = tags[j].name;
					select_text += "<option value='"+tags[j].id + "' selected>" + tags[j].name + "</option>";
					}
				else
					select_text += "<option value='"+tags[j].id + "'>" + tags[j].name + "</option>";
				}
		
				select_text += "</select>";
				
				
				
				if (view_mode == "edit")
				{
					text += table_entry( select_text);
				}
				else
				{
					
					text += table_entry(  tag_name );
				}
				
				
				
			}

			
			
			if (property.type == "state")			
			{
				text += table_entry(  property.display );
		
				var list = Array("Unused", "Cleaned", "Planted", "Ready", "Lost");
				
				text += "<td><select id=" + property.id +" height=32 style=''>";	
		
				for (var j = 0; j < list.length; j++)
					if (list[j] == property.value)
						text += "<option value='"+list[j] + "' selected>" + list[j] + "</option>";
					else
						text += "<option value='"+list[j] + "'>" + list[j] + "</option>";
		
				text += "</select></td>";
				
				
				
				
			}			
			
			
			
			if (property.type == "value")
			{			
		
				//var value = "Test";

				var vedit = "";
				
				var id = 0;
				var value = property.value;
				var onclick = "properties.ui_value_edit();";
				
				
				
				vedit += "<input type=text id='value_edit' size=10 value=\"" + value + "\" onfocus='properties.text_focus(1);' onblur='properties.text_focus(0);'>";
				vedit += "<input type=submit value='Set' style='width:80px' onclick='"+onclick+"'>";

				
				text += table_entry( property.display );
				text += table_entry( vedit);
				
				//text +=	string_field(property.id, unescapedisplay(property.value));
				//text +=	button_field("Set", 'request_set_value();' );
				
				
				
					/*if (view_mode == "edit")
		
			return table_entry( "<input type=text id=" + id + " size=10 value=\"" + value + "\" onfocus='properties.text_focus(1);' onblur='properties.text_focus(0);'>");
		else
			return table_entry( value);
		
		
	}
	
	function button_field(label, onclick)
	{
		return table_entry( "<input type=submit value='" + label + "' style='width:80px' onclick='"+onclick+"'>") ;
			
				
				
				
				*/
				
				
				
				
				
				
				
			}
					
			
			
			
			
			
			
			
			
			if (property.type == "rack")			
			{
				
				/*log("Racka property");
				text += table_entry(  property.display );
		
				//var list = Array("Unused", "Cleaned", "Planted", "Ready", "Lost");
				
				//var list = make_rack_list();
				
				
				text += "<td><select id=" + property.id +" height=32 style='width:80'>";	
		
				for (var j = 0; j < list.length; j++)
					if (list[j] == property.value)
						text += "<option value='"+list[j] + "' selected>" + list[j] + "</option>";
					else
						text += "<option value='"+list[j] + "'>" + list[j] + "</option>";
		
				text += "</select></td>";*/
				
				
				
				
			}					
			
			
			// Generic edit buttons
			if (property.type == "logging")
			{
				var id = graphics.get_object(index).custom_properties.tag;
				text += "<td>Logging</td>";
				
				text += button_field("Data Log",  "onclick=graph.show_datalog(" + id + "); " );
				
				//text += table_entry( "<input type=submit value='Copy'  style='width:80px' onclick=objects.ui_copy(" + index + ");> " );
				//text += table_entry( "<input type=submit value='Delete'  style='width:80px' onclick=objects.ui_delete(" + index + ");> ") ;
			}			
			

			text += "</tr>";
		
		return text;
	}




	function build_property_table(index)
	{
		var text = "";
		
		var properties = [];
		
		var o = graphics.get_object(index);
		
		text += "<table class=property_table border=1>";
				
		
		//if (view_mode == "edit")
		text += "<tr><td><b>Type</b></td><td style=\"width:200\"><b>" + o.disp_properties.display_name + "</b></td></tr>";	

		var found = 0;
		
		for (var i = 0; i < property_table.length; i++)
		{
			var p = property_table[i];
			
			// Items for this type only
			if (p.type != o.type) continue;

			if (p.mode != view_mode && p.mode != "all") continue;
			
			
			// Get value from object
			var value = "";
			if (p.fclass == "disp")   value = o.disp_properties[p.field];
			if (p.fclass == "custom") value = o.custom_properties[p.field];
			
			if (typeof value == 'undefined') value = "";
				
			//add_property(properties, p.display, "editfield"+i,  p.datatype,   1, value);	
			
			var prop = new Object;
		
			prop.display = p.display;
			prop.id = "editfield" + i;
			prop.type =  p.datatype;
			prop.show = 1;
			prop.value = value;
		
			//properties.push(p);

			text += build_property_text(index, prop);
			
			found++;
		}
		
		text += "</table>";
		
		if (found == 0) return "";
		
		return text;
	}


	// Set lock state of current object
	function set_lock(object_list, lock)
	{	
		for (var i = 0; i < object_list.length; i++)
		{
			//	if (index == INVALID_OBJECT) return;
			var index = object_list[i];
		
			log("Index: " + index);
		
			var p = graphics.get_disp_properties(index);
		
			//alert(lock);
			p.locked = lock;

			objects.request_update(index);
		}
		
		//show_context();
		//show_edit(object_selected);
		
		//objects.request_update(index);
		
		ui.clear_selections();
		
	}

	return local;
}());
	


/* End of Property Editor */




