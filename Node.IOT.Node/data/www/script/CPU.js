/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com

	The CPU is abstracted from the user interface and logic compiler
	it deals only with the instruction list, the raw memory, and the io interface	
*/

"use strict";

/* CPU */

// Instruction types
const INST_TYPES = 	{INST_NONE		: 0x00, 
					 INST_CLEAR		: 0x10, 
					 INST_PUSHCR	: 0x11, 
					 INST_POPCR		: 0x12,
					 INST_PUSHOR	: 0x13, 
					 INST_POPOR		: 0x14, 
					 INST_XIO		: 0x30, 
					 INST_XIC		: 0x31,
					 INST_OTE		: 0x40, 
					 INST_OTL		: 0x41, 
					 INST_OTU		: 0x42, 
					 INST_TMR		: 0x80};

// Variable types
const  VAR_TYPES = 	{VAR_NONE		: 0x00, 
					 VAR_DIN		: 0x10, 
					 VAR_DOUT		: 0x20, 
					 VAR_AIN		: 0x30, 
					 VAR_AOUT		: 0x40, 
					 VAR_BIT		: 0x50, 
					 VAR_TMR		: 0x60};
					
// Variable sizes					
const  VAR_SIZE = 	{VAR_DIN		: 1, 
					 VAR_DOUT		: 1, 
					 VAR_AIN		: 2, 
					 VAR_AOUT		: 2, 
					 VAR_BIT		: 1, 
					 VAR_TMR		: 6};
						




/* 
	CPU
*/

// Global Websockets service object
var cpu = (function () 
{
	// Private variables
	var local = {};		

	const MODULE = "CPU       ";
	
	const UPDATE_TIME = 100;	// Update period
	
	var inst_table = [];		// Instruction jump table
	
	var inst_list = [];			// Instruction list
	var variable_data = null; 	//  Raw byte data for variable storage 
	var logic_ok = false;		// true if logic is ok to process
	
	// Public Interface
	local.init = init;
	local.set_timer = set_timer;
	local.solve = solve_logic;
	
	
	local.resize_variable_data = resize_variable_data;
	local.variable_update = variable_update;
	local.get_byte = get_byte;
	local.get_ops = get_ops;
	local.toggle_byte = toggle_byte;
	
	local.set_logic_ok = set_logic_ok;
	
	// Interface for assembler
	local.add_inst = add_inst;
	local.clear_inst_list = clear_inst_list;
	local.get_inst_list = get_inst_list;
	
	
	/* 
		Public 
	*/

	
	// Core CPU init 
	function init()
	{
		console.log(`${MODULE} Init`);	
	
		// Setup instruction table
		inst_table[INST_TYPES.INST_CLEAR]  = inst_clear;
		inst_table[INST_TYPES.INST_PUSHCR] = inst_pushcr;
		inst_table[INST_TYPES.INST_POPCR]  = inst_popcr;
		inst_table[INST_TYPES.INST_PUSHOR] = inst_pushor;
		inst_table[INST_TYPES.INST_POPOR]  = inst_popor;
		inst_table[INST_TYPES.INST_XIC]    = inst_xic;
		inst_table[INST_TYPES.INST_XIO]    = inst_xio;
		inst_table[INST_TYPES.INST_OTE]    = inst_ote;
		inst_table[INST_TYPES.INST_OTL]    = inst_otl;
		inst_table[INST_TYPES.INST_OTU]    = inst_otu;
		inst_table[INST_TYPES.INST_TMR]    = inst_tmr;

		setInterval(update_timer, UPDATE_TIME);	// Setup timer
	}


	// Logic update timer
	function update_timer()
	{
		solve_logic(100);
	}

	
	function set_logic_ok(s)
	{
		logic_ok = s;
	}
	
	
	function clear_inst_list()
	{
		
		inst_list = [];
	}
	
	
	function get_inst_list()
	{
		
		return inst_list;
	}

	
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
	
	// Add instruction to instruction list
	function add_inst(inst, op1, op2)
	{
		var i = {inst:inst, op1:op1, op2:op2};
		inst_list.push(i);
	}
	
	
	// Get number of operands
	function get_ops(inst)
	{
		if (inst == INST_TYPES.INST_XIC) return 1;
		if (inst == INST_TYPES.INST_XIO) return 1;
		if (inst == INST_TYPES.INST_OTE) return 1;
		if (inst == INST_TYPES.INST_OTL) return 1; 
		if (inst == INST_TYPES.INST_OTU) return 1;
		if (inst == INST_TYPES.INST_TMR) return 1;
		
		return 0;
	}
	
	
	// Decode and display
	function decode_inst(n, inst, op1, op2)
	{
		if (inst == INST_TYPES.INST_NONE)    console.log("["+n+"] NONE ");      else 
		if (inst == INST_TYPES.INST_CLEAR)   console.log("["+n+"] CLEAR ");     else 
		if (inst == INST_TYPES.INST_PUSHCR)  console.log("["+n+"] PUSHCR ");    else 
		if (inst == INST_TYPES.INST_POPCR)   console.log("["+n+"] POPCR ");     else 
		if (inst == INST_TYPES.INST_PUSHOR)  console.log("["+n+"] PUSHOR ");    else 
		if (inst == INST_TYPES.INST_POPOR)   console.log("["+n+"] COLLECT ");   else 
		if (inst == INST_TYPES.INST_XIC)     console.log("["+n+"] XIC " + op1); else 
		if (inst == INST_TYPES.INST_XIO)     console.log("["+n+"] XIO " + op1); else
		if (inst == INST_TYPES.INST_OTE)     console.log("["+n+"] OTE " + op1); else	
		if (inst == INST_TYPES.INST_OTL)     console.log("["+n+"] OTL " + op1); else	
		if (inst == INST_TYPES.INST_OTU)     console.log("["+n+"] OTU " + op1); else	
		if (inst == INST_TYPES.INST_TMR)     console.log("["+n+"] TMR " + op1); else
		{
			console.log("Unknown inst: " + inst);
		}
	}
	
	// Show instruction list
	function show_inst_list()
	{
		console.log("Instruction list:");
		
		for (var i = 0; i < inst_list.length; i++)
		{
			var inst = inst_list[i].inst;
			var op1 = inst_list[i].op1;
			var op2 = inst_list[i].op2;
			
			decode_inst(i, inst, op1, op2);		
		}
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
				inst_table[state.inst.inst](state);
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


