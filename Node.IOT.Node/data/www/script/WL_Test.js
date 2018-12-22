/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";

	
// Load test data for logic and memory
function logic_test()
{
	logic_test_variables()
	
	logic_test_ladder();
	
	resolve_links(); // Move to logic_assemble ?
	
	logic_assemble();
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

		// Load some timer data
	var i = find_variable_index("Tmr_1")
	cpu_set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:3000} );

	var i = find_variable_index("Tmr_2")
	cpu_set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:3000} );

	var i = find_variable_index("Tmr_3")
	cpu_set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:3000} );

	var i = find_variable_index("Tmr_4")
	cpu_set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:3000} );

	var i = find_variable_index("Tmr_5")
	cpu_set_timer(variable_list.variables[i].offset, {value:0, acc:0, pre:3000} );
	
}


/* Test data */
function logic_test_ladder()
{
	clear_bits();
	clear_nodes();
	
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





}
