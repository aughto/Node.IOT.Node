/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

	
// Load test data for logic and memory
function logic_test()
{
	console.log("Logic Test");	
	
	logic_test_variables()
	
	logic_test_ladder();
	
	
	//logic_assemble();
}


// Load test variables
function logic_test_variables()
{
	variable_list = {};
	
	variable_list.variables = [];
	
	// Needs to come from IO config
	variable_list.variables.push({name:"Input_1", type:VAR_TYPES.VAR_DIN});
	variable_list.variables.push({name:"Input_2", type:VAR_TYPES.VAR_DIN});
	variable_list.variables.push({name:"Input_3", type:VAR_TYPES.VAR_DIN});
	variable_list.variables.push({name:"Input_4", type:VAR_TYPES.VAR_DIN});

	variable_list.variables.push({name:"Output_1", type:VAR_TYPES.VAR_DOUT});
	variable_list.variables.push({name:"Output_2", type:VAR_TYPES.VAR_DOUT});
	variable_list.variables.push({name:"Output_3", type:VAR_TYPES.VAR_DOUT});
	variable_list.variables.push({name:"Output_4", type:VAR_TYPES.VAR_DOUT});
	
	// Setup demo variables
	
	variable_list.variables.push({name:"Bit_01", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_02", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_03", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_04", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_05", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_06", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_07", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_08", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_09", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_10", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_11", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_12", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_13", type:VAR_TYPES.VAR_BIT});
	variable_list.variables.push({name:"Bit_14", type:VAR_TYPES.VAR_BIT});
	
	variable_list.variables.push({name:"Tmr_1", type:VAR_TYPES.VAR_TMR});
	variable_list.variables.push({name:"Tmr_2", type:VAR_TYPES.VAR_TMR});
	variable_list.variables.push({name:"Tmr_3", type:VAR_TYPES.VAR_TMR});
	variable_list.variables.push({name:"Tmr_4", type:VAR_TYPES.VAR_TMR});
	variable_list.variables.push({name:"Tmr_5", type:VAR_TYPES.VAR_TMR});

	// Create variables
	//for (var i = 0; i < variable_list.variables.length; i++)
	//variables[i] = 0;


	assign_variable_list();


	
}

function load_test_variables()
{
	console.log("Load test variable data");
	
	// Load some timer data
	var i = find_variable_index("Tmr_1")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_2")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_3")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_4")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );

	var i = find_variable_index("Tmr_5")
	cpu.set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:500} );
		
}



/* Test data */
function logic_test_ladder()
{
//	clear_bits();
	clear_nodes();
	/*
	var x=0;
	var y=0;
	add_node(x++, y, SYM.B);
	add_node(x++, y, SYM.XIC, find_variable_index("Bit_01"));
	add_node(x++, y, SYM.XIC, find_variable_index("Bit_02"));
	add_node(x++, y, SYM.BRDOWN);
	add_node(x++, y, SYM.XIC, find_variable_index("Bit_03"));
	add_node(x++, y, SYM.BRDOWN);
	add_node(x++, y, SYM.BRDOWN);	
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.XIO, find_variable_index("Bit_04"));	
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.HORZ);		
	add_node(x++, y, SYM.OTE, find_variable_index("Bit_05"));	
	add_node(x++, y, SYM.E);	
	
	x=3; y=1;
	add_node(x++, y, SYM.BRRIGHT);
	add_node(x++, y, SYM.XIC, find_variable_index("Bit_06"));	
	add_node(x++, y, SYM.BRLEFT);

	x=3; y=2;
	add_node(x++, y, SYM.BRRIGHT);
	add_node(x++, y, SYM.XIC, find_variable_index("Bit_07"));	
	add_node(x++, y, SYM.CAPLEFT);

	x=3; y=3;
	add_node(x++, y, SYM.CAPRIGHT);
	add_node(x++, y, SYM.XIC, find_variable_index("Bit_08"));	
	add_node(x++, y, SYM.XIO, find_variable_index("Bit_09"));
	add_node(x,   y,   SYM.CAPLEFT);
	add_node(x,   y-1, SYM.VERT);
	add_node(x,   y-2, SYM.VERT);


	x=0; y=5;
	add_node(x++, y, SYM.B);
	add_node(x++, y, SYM.XIC, find_variable_index("Input_1"));
	add_node(x++, y, SYM.XIC, find_variable_index("Input_2"));
	add_node(x++, y, SYM.OTE, find_variable_index("Output_1"));
	add_node(x++, y, SYM.E, 3);

	x=10; y=5;
	add_node(x++, y, SYM.B);
	add_node(x++, y, SYM.BRDOWN);
	add_node(x++, y, SYM.XIC, find_variable_index("Input_3"));
	add_node(x++, y, SYM.BRDOWN);
	add_node(x++, y, SYM.OTE, find_variable_index("Output_2"));
	add_node(x++, y, SYM.E);

	x=11; y=6;
	add_node(x++, y, SYM.CAPRIGHT);
	add_node(x++, y, SYM.XIC, find_variable_index("Input_4"));
	add_node(x++, y, SYM.CAPLEFT);	
	
	x=0; y=8;
	add_node(x++, y, SYM.B);
	add_node(x++, y, SYM.HORZ);
	add_node(x++, y, SYM.BRDOWN);
	add_node(x++, y, SYM.XIC, find_variable_index("Bit_10"));
	add_node(x++, y, SYM.TMR, find_variable_index("Tmr_1"));
	add_node(x++, y, SYM.OTU, find_variable_index("Bit_10"));
	add_node(x++, y, SYM.BRDOWN);
	add_node(x++, y, SYM.HORZ);	
	add_node(x++, y, SYM.E);	
	
	x=2; y=9;
	add_node(x++, y, SYM.CAPRIGHT);
	add_node(x++, y, SYM.XIO, find_variable_index("Bit_10"));
	add_node(x++, y, SYM.TMR, find_variable_index("Tmr_2"));
	add_node(x++, y, SYM.OTL, find_variable_index("Bit_10"));
	add_node(x++, y, SYM.CAPLEFT);
	
	*/
	
	// test data captured from console
	var node_list = {"nodes":[{"t":5,"x":0,"y":0},{"t":14,"x":1,"y":0,"o1":8},{"t":14,"x":2,"y":0,"o1":9},{"t":11,"x":3,"y":0},{"t":14,"x":4,"y":0,"o1":10},{"t":11,"x":5,"y":0},{"t":11,"x":6,"y":0},{"t":12,"x":7,"y":0},{"t":12,"x":8,"y":0},{"t":12,"x":9,"y":0},{"t":15,"x":10,"y":0,"o1":11},{"t":12,"x":11,"y":0},{"t":12,"x":12,"y":0},{"t":12,"x":13,"y":0},{"t":12,"x":14,"y":0},{"t":12,"x":15,"y":0},{"t":16,"x":16,"y":0,"o1":12},{"t":6,"x":17,"y":0},{"t":10,"x":3,"y":1},{"t":14,"x":4,"y":1,"o1":13},{"t":9,"x":5,"y":1},{"t":10,"x":3,"y":2},{"t":14,"x":4,"y":2,"o1":14},{"t":7,"x":5,"y":2},{"t":8,"x":3,"y":3},{"t":14,"x":4,"y":3,"o1":15},{"t":15,"x":5,"y":3,"o1":16},{"t":7,"x":6,"y":3},{"t":13,"x":6,"y":2},{"t":13,"x":6,"y":1},{"t":5,"x":0,"y":5},{"t":14,"x":1,"y":5,"o1":0},{"t":14,"x":2,"y":5,"o1":1},{"t":16,"x":3,"y":5,"o1":4},{"t":6,"x":4,"y":5,"o1":3},{"t":5,"x":10,"y":5},{"t":11,"x":11,"y":5},{"t":14,"x":12,"y":5,"o1":2},{"t":11,"x":13,"y":5},{"t":16,"x":14,"y":5,"o1":5},{"t":6,"x":15,"y":5},{"t":8,"x":11,"y":6},{"t":14,"x":12,"y":6,"o1":3},{"t":7,"x":13,"y":6},{"t":5,"x":0,"y":8},{"t":12,"x":1,"y":8},{"t":11,"x":2,"y":8},{"t":14,"x":3,"y":8,"o1":17},{"t":19,"x":4,"y":8,"o1":22},{"t":18,"x":5,"y":8,"o1":17},{"t":11,"x":6,"y":8},{"t":12,"x":7,"y":8},{"t":6,"x":8,"y":8},{"t":8,"x":2,"y":9},{"t":15,"x":3,"y":9,"o1":17},{"t":19,"x":4,"y":9,"o1":23},{"t":17,"x":5,"y":9,"o1":17},{"t":7,"x":6,"y":9},{"t":5,"x":10,"y":2,"o1":0},{"t":12,"x":11,"y":2,"o1":0},{"t":11,"x":12,"y":2,"o1":0},{"t":11,"x":14,"y":2,"o1":0},{"t":14,"x":13,"y":2,"o1":18},{"t":14,"x":13,"y":3,"o1":20},{"t":7,"x":14,"y":3,"o1":0},{"t":8,"x":12,"y":3,"o1":0},{"t":15,"x":15,"y":2,"o1":19},{"t":16,"x":16,"y":2,"o1":20},{"t":6,"x":17,"y":2,"o1":0}]};
	load_nodelist(node_list);
	
	
}

