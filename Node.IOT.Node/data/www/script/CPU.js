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
var INST_TYPES = 	{INST_NONE		: 0x00, 
					INST_CLEAR		: 0x10, 
					INST_PUSHCR		: 0x11, 
					INST_POPCR		: 0x12,
					INST_PUSHOR		: 0x13, 
					INST_COLLECT	: 0x14, 
					INST_XIO		: 0x30, 
					INST_XIC		: 0x31,
					INST_OTE		: 0x40, 
					INST_OTL		: 0x41, 
					INST_OTU		: 0x42, 
					INST_TMR		: 0x80};

// Variable types
var VAR_TYPES = 	{VAR_NONE		: 0x00, 
					 VAR_DIN		: 0x10, 
					 VAR_DOUT		: 0x20, 
					 VAR_AIN		: 0x30, 
					 VAR_AOUT		: 0x40, 
					 VAR_BIT		: 0x50, 
					 VAR_TMR		: 0x60 };
					
					
// Variable sizes					
var VAR_SIZE = 	{ VAR_DIN		: 1, 
				 VAR_DOUT		: 1, 
				 VAR_AIN		: 2, 
				 VAR_AOUT		: 2, 
				 VAR_BIT		: 1, 
				 VAR_TMR		: 10 };
						


var logic_ok = false;		// true if logic is ok to process
var inst_list = [];			// Instruction list
var variable_data = null; //  Raw byte data for variable storage 


/* 
	CPU
*/


function cpu_init()
{


}

// Solve logic
function cpu_update(dt)
{
	solve_logic(dt);	
}


// Get byte from memory location
function cpu_get_byte(offset)
{

	if (offset < 0 || offset >= variable_data.length)
	{
		console.log("cpu_get_byte: Invalid location ("+offset+")\n");
		return 0;
	}

	return variable_data[offset];
}

// Set byte at memory location
function cpu_set_byte(offset, v)
{
	if (offset < 0 || offset >= variable_data.length)
	{
		console.log("cpu_set_byte: Invalid location ("+offset+")\n");
		return 0;
	}

	variable_data[offset] = v;
}



// Extract timer from memory array 
//  Would be a type cast in C
function cpu_get_timer(offset)
{
	var t = {};
	
	t.value = variable_data[offset];
	t.pre = (variable_data[offset+1] << 8) + variable_data[offset+2];
	t.acc = (variable_data[offset+3] << 8) + variable_data[offset+4];
	
	return t;
}


//  Would be a type case in C
function cpu_set_timer(offset, t)
{
	variable_data[offset+0] = t.value
	variable_data[offset+1] = t.pre >> 8;
	variable_data[offset+2] = t.pre & 0xff;
	variable_data[offset+3] = t.acc >> 8;
	variable_data[offset+4] = t.acc & 0xff;
}


// Toggle memory byte at location
function cpu_toggle_byte(offset)
{
//	variable_table[i].value = v;
	//var mem_idx = cpu_get_mem_index(idx);
	
	//if (mem_idx == -1) return;
	
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




/* End of memory */


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
	if (inst == INST_TYPES.INST_NONE) console.log("["+n+"] NONE "); else 
	if (inst == INST_TYPES.INST_CLEAR) console.log("["+n+"] CLEAR "); else 
	if (inst == INST_TYPES.INST_PUSHCR) console.log("["+n+"] PUSHCR "); else 
	if (inst == INST_TYPES.INST_POPCR) console.log("["+n+"] POPCR "); else 
	if (inst == INST_TYPES.INST_PUSHOR) console.log("["+n+"] PUSHOR "); else 
	if (inst == INST_TYPES.INST_COLLECT) console.log("["+n+"] COLLECT "); else 
	if (inst == INST_TYPES.INST_XIC) console.log("["+n+"] XIC " + op1); else 
	if (inst == INST_TYPES.INST_XIO) console.log("["+n+"] XIO " + op1);else
	if (inst == INST_TYPES.INST_OTE) console.log("["+n+"] OTE " + op1);else	
	if (inst == INST_TYPES.INST_OTL) console.log("["+n+"] OTL " + op1);else	
	if (inst == INST_TYPES.INST_OTU) console.log("["+n+"] OTU " + op1);else	
	if (inst == INST_TYPES.INST_TMR) console.log("["+n+"] TMR " + op1);else
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



// Check variable for valid offset
function check_var(idx)
{
	/*var i = variable_find(idx)
		
	if (variable_table[i] == undefined) 
	{
		console.log("Undf\n");return true;
	}
	*/
	return false;
}


// Core Solver
function solve_logic(dt)
{
	
	if (!logic_ok) 
	{
		console.log("Solve: Logic not ok");
		return;
	}

	//console.log("Solve:");
		
	//if (log) console.log("Memory Before:");
	//if (log) show_memory()
	
	
	var cr_stack = [];
	var cr_ptr = 0;
	
	var or_stack = [];
	var or_ptr = 0;
	
	var cr = 1;
	
	for (var i = 0; i < inst_list.length; i++)
	{
		var inst = inst_list[i];
		
		//if (log)  decode_inst(i, inst.inst, inst.op);
		
		
		if (inst.inst == INST_TYPES.INST_CLEAR)
		{
			cr = 1;
		} else		
		
		
		if (inst.inst == INST_TYPES.INST_PUSHCR)
		{
			cr_stack[cr_ptr] = cr;
			cr_ptr++;
			
			
		} else

		if (inst.inst == INST_TYPES.INST_POPCR)
		{
			cr_ptr--;
			if (cr_ptr < 0) { console.log("[" + i + "] POPCR ERROR"); return; }
			cr = cr_stack[cr_ptr];
			
		} else
		
		if (inst.inst == INST_TYPES.INST_PUSHOR)
		{
			or_stack[or_ptr] = cr;
			or_ptr++;
		} else

		if (inst.inst == INST_TYPES.INST_COLLECT)
		{
			or_ptr--;

			if (or_ptr < 0) {console.log("[" + i + "] COLLECT ERROR"); return; }
			
			var v = or_stack[or_ptr];
			
			cr = cr | or_stack[or_ptr];
		} else		
		
		if (inst.inst == INST_TYPES.INST_XIO)
		{
			if (check_var(inst.op1)) return;
			
			//cr = cr & !variable_table[inst.op1].value;
			
			cr = cr & !cpu_get_byte(inst.op1);
			
		} else
		
		if (inst.inst == INST_TYPES.INST_XIC)
		{
			if (check_var(inst.op1)) return;

			//cr = cr & variable_table[inst.op1].value;
			cr = cr & cpu_get_byte(inst.op1);
		} else		
		
		if (inst.inst == INST_TYPES.INST_OTE)
		{
			if (check_var(inst.op1)) return;

			//variable_table[inst.op1].value = cr;
			cpu_set_byte(inst.op1, cr);			
		} else		
		
		if (inst.inst == INST_TYPES.INST_OTL)
		{
			if (check_var(inst.op1)) return;


			//if (cr) variable_table[inst.op1].value = 1;
			
			if (cr)	cpu_set_byte(inst.op1, 1);			
		} else		
		
		if (inst.inst == INST_TYPES.INST_OTU)
		{
			if (check_var(inst.op1)) return;

			//if (cr) variable_table[inst.op1].value = 0;
			if (cr)	cpu_set_byte(inst.op1, 0);			
		} else	
		
		if (inst.inst == INST_TYPES.INST_TMR)
		{
			if (check_var(inst.op1)) return;
			
			var timer = cpu_get_timer(inst.op1);
			

			if (cr)
			{
				timer.acc += dt;

				if (timer.acc > timer.pre)
					timer.acc = timer.pre;
			
				cr = (timer.acc >= timer.pre) ? 1 : 0;
			
			} else
				timer.acc = 0;
			
			timer.value = cr;
			
			//console.log("cr: " + cr + " value: " + timer.value + " op1: " + inst.op1 + " Val: " + timer.value + " Pre: " + timer.pre + " Acc:" + timer.acc);
			
			cpu_set_timer(inst.op1, timer);
		}	
		else
		{	
			console.log("CPU: Unknown Inst:" + inst.inst);
		}
		
		//if (log) console.log("CR " + cr);
		
	}
	
	//if (log) console.log("Memory After:");
	//if (log) show_memory()
}




/* 
	End CPU
*/


