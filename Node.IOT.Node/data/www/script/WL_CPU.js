/*
	Ladder Logic Engine
	2018 nulluser@gmail.com
*/

"use strict";


/* CPU */

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


var inst_list = [];
var variable_table = [];

var BRANCH_NONE = 0;
var BRANCH_OPEN = 1;
var BRANCH_CLOSE = 2;

var logic_ok = false;


/* 
	CPU
*/

function cpu_update(dt)
{
	solve_logic(dt);	
}


function variable_find(idx)
{
	// find index
	for (var i = 0; i < variable_table.length; i++)
	{
		if (variable_table[i].index == idx)
			return i;
	}
	return -1;
}




function variable_update(idx, v)
{
	for (var i = 0; i < variable_table.length; i++)
	{
		if (variable_table[i].index == idx)
		{
			variable_table[i].value = v;
		}
	}
	
}





function setup_variable_table()
{
	variable_table = [];
	
	
	
	variable_table.push( { index:0, name:"Input 1", value:0} );
	variable_table.push( { index:1, name:"Input 2", value:0} );
	variable_table.push( { index:2, name:"Input 3", value:0} );
	variable_table.push( { index:3, name:"Input 4", value:0} );
	
	variable_table.push( { index:64, name:"Output 1", value:0} );
	variable_table.push( { index:65, name:"Output 2", value:0} );
	variable_table.push( { index:66, name:"Output 3", value:0} );
	variable_table.push( { index:67, name:"Output 4", value:0} );
	
	
	for (var i = 0; i < 32; i++)
	{
		var n = "Bit_"+i;
		variable_table.push({ index:i+128, name:n, value:0});
		
	}		
	
	console.log(variable_table);
	
	
/*	
	
	
	for (var i = 0; i < 36; i++)
	{
		var n = "Test"+i;
		variable_table[i] = { name:n, value:0} ;
		
	}	*/
	
}



function clear_bits()
{
	//for (var i = 0; i < 100; i++)
//		variable_table[i].value = 0;
}


function add_inst(inst, op1, op2)
{
	var i = {inst:inst, op1:op1, op2:op2};
	inst_list.push(i);
}



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



function show_memory()
{
	console.log("Memory:");
	
	var s = "";
	
	for (var i = 0; i < 15; i++)
	{
		//console.log("["+ i + "]" + variable_table[i].value);		
		s +=  variable_table[i].value + " " ;		
		
	}	
	
	console.log(s);
}




function check_var(idx)
{
	var i = variable_find(idx)
		
	if (variable_table[i] == undefined) 
	{
		console.log("Undf\n");return true;
	}
	
	return false;
}


function cpu_get_value(idx)
{
	var i = variable_find(idx)

	if (i == -1) return r;
	
	return variable_table[i].value;
}

function cpu_set_value(idx, v)
{
	var i = variable_find(idx)

	if (i == -1) return;
	
	variable_table[i].value = v;
}





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
			
			cr = cr & !cpu_get_value(inst.op1);
			
		} else
		
		if (inst.inst == INST_TYPES.INST_XIC)
		{
			if (check_var(inst.op1)) return;

			//cr = cr & variable_table[inst.op1].value;
			cr = cr & cpu_get_value(inst.op1);
		} else		
		
		if (inst.inst == INST_TYPES.INST_OTE)
		{
			if (check_var(inst.op1)) return;

			//variable_table[inst.op1].value = cr;
			cpu_set_value(inst.op1, cr);			
		} else		
		
		if (inst.inst == INST_TYPES.INST_OTL)
		{
			if (check_var(inst.op1)) return;


			//if (cr) variable_table[inst.op1].value = 1;
			
			if (cr)	cpu_set_value(inst.op1, 1);			
		} else		
		
		if (inst.inst == INST_TYPES.INST_OTU)
		{
			if (check_var(inst.op1)) return;

			//if (cr) variable_table[inst.op1].value = 0;
			if (cr)	cpu_set_value(inst.op1, 0);			
		} else	
		
		if (inst.inst == INST_TYPES.INST_TMR)
		{
			if (check_var(inst.op1)) return;
			
			
			var idx = variable_find(inst.op1);
			if (idx == -1) 
			{
				console.log("Cant find timer var\n");
				return;
			}
			
//			console.log("timer cr: " + cr + " " + inst.op);
			variable_table[idx].preset = 1000;

			if (variable_table[idx].acc == undefined) 
				variable_table[idx].acc = 0;
			
			if (cr)
			{
				variable_table[idx].acc += dt;

				if (variable_table[idx].acc > variable_table[idx].preset)
					variable_table[idx].acc = variable_table[idx].preset;
			
				cr = variable_table[idx].acc >= variable_table[idx].preset;
			
			} else
				variable_table[idx].acc = 0;
			
			variable_table[idx].value  = cr;
			
			
			//console.log("acc: " + variable_table[inst.op1].acc + " C" + cr + " dt" + dt);
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


