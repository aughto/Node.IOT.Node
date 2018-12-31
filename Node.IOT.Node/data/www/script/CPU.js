/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com

	The CPU is abstracted from the user interface and logic compiler
	it deals only with the instruction list, the raw memory, and the io interface	
*/

"use strict";

/* 
	CPU 
*/

// CPU
var cpu = (function () 
{
	const MODULE = "CPU       ";
	var local = main.register_module("cpu");		

	// Public Interface
	
	// Standard
	local.init = init;
	local.update = update;
	
	
	local.solve = solve_logic;
	local.load_inst_list = load_inst_list;

	local.set_update_callback = set_update_callback;
	
	
	/* Variable operations */
	local.resize_variable_data = resize_variable_data;
	local.variable_update = variable_update;
	local.get_byte = get_byte;
	local.set_byte = set_byte;
	
	local.set_timer = set_timer;
	local.toggle_byte = toggle_byte;
	
	/* State */
	local.set_logic_ok = set_logic_ok;	
	
	// Private variables
	
	var inst_table = [];		// Instruction jump table
	var inst_list = [];			// Instruction list
	var variable_data = null; 	//  Raw byte data for variable storage 
	var logic_ok = false;		// true if logic is ok to process
	var update_callback = null;
	
	/* 
		Public 
	*/
	
	// Core CPU init 
	function init()
	{
		console.log(`${MODULE} Init`);	
	
		// Setup instruction table
		inst_table = [];
		
		inst_table[INST_TYPES.INST_CLEAR.op]  = inst_clear;
		inst_table[INST_TYPES.INST_PUSHCR.op] = inst_pushcr;
		inst_table[INST_TYPES.INST_POPCR.op]  = inst_popcr;
		inst_table[INST_TYPES.INST_PUSHOR.op] = inst_pushor;
		inst_table[INST_TYPES.INST_POPOR.op]  = inst_popor;
		inst_table[INST_TYPES.INST_XIC.op]    = inst_xic;
		inst_table[INST_TYPES.INST_XIO.op]    = inst_xio;
		inst_table[INST_TYPES.INST_OTE.op]    = inst_ote;
		inst_table[INST_TYPES.INST_OTL.op]    = inst_otl;
		inst_table[INST_TYPES.INST_OTU.op]    = inst_otu;
		inst_table[INST_TYPES.INST_TMR.op]    = inst_tmr;
	}

	// Logic update timer
	function update()
	{
		// Do not update cpu in online mode
		if (project.get_online()) return;
		
		solve_logic(100);
		
		if (update_callback != null) update_callback();
	}
	
	
	// Remote hook for update callback
	function set_update_callback(callback)
	{
		update_callback = callback;
	}
	
	
	function set_logic_ok(s)
	{
		logic_ok = s;
	}
	
	// Deep copy instruction list from external source
	function load_inst_list(list)
	{
		//console.log("CPU load inst list");
		
		inst_list = [];

		for (var i = 0; i < list.length; i++)
			add_inst(list[i].inst, list[i].op1, list[i].op2);
		
		//console.log(inst_list);
	}
	
	
	// Add instruction to instruction list
	function add_inst(inst, op1, op2)
	{
		inst_list.push({inst:inst, op1:op1, op2:op2});
	}
	

	// Create and init variable data
	function resize_variable_data(size)
	{
		variable_data = new Uint8Array(size);
	
		for (var i = 0; i < variable_data.length; i++)
			variable_data[i] = 0;
	
		//console.log("Memory: " + variable_data.length);
		//console.log(variable_list);
		//console.log(variable_data);
	}
	
	function variable_update(idx, v)
	{
		console.log("Variable update " + idx + " " + v);
	
		if (idx < 0 || idx >= variable_data.length)
		{
			console.log("variable_update: Invalid memory reference: " + idx);
			return;
		}
	
		variable_data[idx] = parseInt(v);
	}	
		
	
	// Get byte from memory location
	function get_byte(offset)
	{
		if (offset < 0 || offset >= variable_data.length)
		{
			console.log("get_byte: Invalid location ("+offset+")\n");
			return 0;
		}
	
		return variable_data[offset];
	}
	
	// Get word from memory location
	function get_word(offset)
	{
		if (offset < 0 || offset + 1 >= variable_data.length)
		{
			console.log("get_byte: Invalid location ("+offset+")\n");
			return 0;
		}
	
		return (variable_data[offset] << 8) + variable_data[offset+1];
	}
	
	
	
	// Set byte at memory location
	function set_byte(offset, v)
	{
		if (offset < 0 || offset >= variable_data.length)
		{
			console.log("set_byte: Invalid location ("+offset+")\n");
			return 0;
		}
	
		variable_data[offset] = v;
	}
	
	
	// Set word at memory location
	function set_word(offset, v)
	{
		if (offset < 0 || offset + 1 >= variable_data.length)
		{
			console.log("set_byte: Invalid location ("+offset+")\n");
			return 0;
		}
	
		variable_data[offset] = v >> 8;
		variable_data[offset+1] = v & 0xff;
	}
	
	// Extract timer from memory array 
	//  Would be a type cast in C
	function get_timer(offset)
	{
		return {value : get_byte(offset+0),
				base  : get_byte(offset+1),
				pre   : get_word(offset+2),
				acc   : get_word(offset+4)};
	}
	
	//  Would be a type case in C
	function set_timer(offset, t)
	{
		set_byte(offset+0, t.value);
		set_byte(offset+1, t.base);
		set_word(offset+2, t.pre);
		set_word(offset+4, t.acc);
	}
	
	// Toggle memory byte at location
	function toggle_byte(offset)
	{
		variable_data[offset] = !variable_data[offset];	
	}
	
	// Display raw memory
	function show_memory()
	{
		console.log("Memory:");
		
		var s = "";
		
		for (var i = 0; i < variable_data.length; i++)
		{
			//console.log("["+ i + "]" + variable_table[i].value);		
			s +=  variables_data[i] + " " ;				
		}	
		
		console.log(s);
	}
	
	function clear_variables()
	{
		//for (var i = 0; i < variable_data.length; i++)
	//		variable_data[i] = 0;
	}
	

	
	
	/* 
		Instructions
	*/

	// Reset CR
	function inst_clear(state)
	{
		state.cr = 1;
	}
		
	// Push cr to stack
	function inst_pushcr(state)	
	{
		state.cr_stack[state.cr_ptr] = state.cr;
		state.cr_ptr++;
	}

	// Pop from cr stack
	function inst_popcr(state)	
	{
		state.cr_ptr--;
		if (state.cr_ptr < 0) { console.log("[] POPCR ERROR"); return; }
		state.cr = state.cr_stack[state.cr_ptr];
	}
	
	// Push to or stack		
	function inst_pushor(state)	
	{	
		state.or_stack[state.or_ptr] = state.cr;
		state.or_ptr++;
	}
	
	function inst_popor(state)	
	{
		state.or_ptr--;
		if (state.or_ptr < 0) {console.log("[] COLLECT ERROR"); return; }
		state.cr = state.cr | state.or_stack[state.or_ptr];
	}
			
	// Examine if closed
	function inst_xic(state)	
	{	
		state.cr = state.cr & get_byte(state.inst.op1);
	}
				
	// Examine if open
	function inst_xio(state)	
	{	
		state.cr = state.cr & !get_byte(state.inst.op1);
	}
	
	// Output energize			
	function inst_ote(state)		
	{
		set_byte(state.inst.op1, state.cr);			
	}
	
	// Output latch
	function inst_otl(state)				
	{
		if (state.cr) set_byte(state.inst.op1, 1);			
	}
				
	// Output unlatch			
	function inst_otu(state)	
	{		
		if (state.cr) set_byte(state.inst.op1, 0);			
	}
	
	// Timer
	function inst_tmr(state)				
	{
		var timer = get_timer(state.inst.op1);
				
		if (state.cr)
		{
			timer.acc += state.dt;
	
			if (timer.acc > timer.pre)
				timer.acc = timer.pre;
				
			state.cr = (timer.acc >= timer.pre) ? 1 : 0;
	
		} else
			timer.acc = 0;
			
		timer.value = state.cr;
			
		//console.log("cr: " + cr + " value: " + timer.value + " op1: " + inst.op1 + " Val: " + timer.value + " Pre: " + timer.pre + " Acc:" + timer.acc);
		
		set_timer(state.inst.op1, timer);
	}

	// Core Solver
	function solve_logic(dt)
	{
		
		// Make sure varibles are defined
		if (variable_data == null)
			logic_ok = false;
		
		
		if (!logic_ok) 
		{
			console.log("Solve: Logic not ok");
			return;
		}
		
		var state = { cr_stack : [],
					cr_ptr : 0,
					or_stack : [],
					or_ptr : 0,
					cr : 1,
					dt : dt};
		
		for (var i = 0; i < inst_list.length; i++)
		{
			state.inst = inst_list[i];
			
			//console.log("Inst: " + inst.inst);
			
			try
			{
				inst_table[state.inst.inst.op](state);
			}
			catch(ex)
			{
				console.log("Invalid instruction " + state.inst.inst.toString(16));
				console.log(inst_table);
				return;
			}
		
			//if (log) console.log("CR " + cr);
		}
	
		//if (log) console.log("Memory After:");
		//if (log) show_memory()
	}

	
	return local;
}());



/* 
	End CPU
*/


