/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


// Assembler
var assembler = (function () 
{
	const MODULE = "Project   ";
	var local = main.register_module("assembler");				

	local.init = init;
	
	// Public interface
	local.assemble = assemble;
	local.generate_bytecode = generate_bytecode;
	local.show_inst_list = show_inst_list;

	
	// Private variables
	var inst_list = [];			// Local instruction list for assembly only
	var stack = [];				// Assembly stack
	var stack_ptr = 0;			// Assembyy stack pointer
	var order = 0;
	

	/* 
		Main Assembly 
	*/
	
	
	function init()
	{
		
		
	}
	


	// Assemble nodes.  Takes node list and returns an instruction list
	// TODO Returns a blank instruction list if it fails
	function assemble(nodes, variable_list)
	{
		console.log("Assemble");
		
		if (nodes.length == 0)
		{
			console.log("No nodes supplied");
			return [];
		}
		
		//assign_variable_list();
		
		// Clear consumed flags
		for (var i = 0 ; i < nodes.length; i++)
			nodes[i].consumed = 0;
		
		inst_list = [];
		stack = [];
		stack_ptr = 0;
		order=0;
		
		// Find start symbols to resolve all chains
		for (var i = 0; i < nodes.length; i++)
		{
			var n = nodes[i];
			if (n.type == SYM.B) resolve_nodes(nodes, n.x, n.y);
		}
		
		resolve_links(nodes);
		
		console.log("Nodes: ");
		
		//if (enagle_log) show_nodes();

		if (assemble_nodes(nodes, variable_list))
		{
			console.log("Unable to assemble");
			return [];
		}
		
		//solve_logic();
		
		return inst_list;
	}

	//Find node in assembly node list
	function find_node(nodes, x, y)
	{
		for (var i = 0; i < nodes.length; i++)
			if (nodes[i].x == x && nodes[i].y == y) return i;
				
		return -1;
	}



	// Node pointers.
	function resolve_links(nodes)
	{
		for (var i = 0; i < nodes.length; i++)
		{
			var n = nodes[i];
			
			//n.up = find_node(n.up_x, n.up_y);
			//n.down = find_node(n.down_x, n.down_y);
			//n.left = find_node(n.left_x, n.left_y);
			//n.right = find_node(n.right_x, n.right_y);
			
			n.next = find_node(nodes, nodes[i].next_x, nodes[i].next_y);
			n.branch = find_node(nodes, nodes[i].branch_x, nodes[i].branch_y);
			n.prev = find_node(nodes, nodes[i].prev_x, nodes[i].prev_y);
		}
	}


	/* 
		Flow direction resolution 
	*/
	

	function resolve_nodes(nodes, x, y)
	{
		if (resolve_chain(nodes, x, y)) 
		{
			console.log("Unable to assemble row (" + x + "," + y + ")");
			//return;
		}
				
		// Evaluate branch stack.
		while(stack_ptr)
		{
			stack_ptr--;
					
			//if (enagle_log) console.log(stack_ptr + " Popping node " + stack[stack_ptr].pn + " " +
			//						" pos (" + stack[stack_ptr].x + "," + stack[stack_ptr].y + ")" );

			if (resolve_chain(nodes, stack[stack_ptr].x, stack[stack_ptr].y))
			{
				console.log(" Unable to assemble row at " + stack[stack_ptr].x + " " + stack[stack_ptr].y);
				//return true;
					
			}
		}
	}
			
		
	// add to branch stack
	function add_stack(pn, x, y)
	{
		stack[stack_ptr] = {x:x, y:y, pn:pn};

		//if (enagle_log) console.log(" Pushing Prev n" + pn + " (" + px + "," + py + ")" + " pos (" + x + "," + y + ")" );

		stack_ptr++;
	}

	// Follow flow direction and set node links
	function resolve_chain(nodes, x, y)
	{
		//if (enagle_log) console.log(" Assemble Row ("+x+","+y+")");
		
		var max = 100;
		
		var x_dir = 1; // Default moving to right
		var y_dir = 0;
			
		var ni = find_node(nodes, x, y);	 // current node index
		var n = nodes[ni];           // current node 

		
		
		while(max-- && ni != -1)
		{
			//if (enagle_log) console.log("[" + ni + "] Pos  (" + x + "," + y + ") = " + n.type_text +  "Dir: (" + x_dir +"," + y_dir + ")" + " C: " + n.consumed);
			
			// skip consumed cells. Consumed cell ends chain
			if (n.consumed == 1)
			{
				return false;
			}
			
			n.order=order++;
			n.consumed = 1;
		
			// make sure we have cell
			if (n.type == SYM.NONE)
			{
				return true;
			} else
			if (n.type == SYM.B) // Ignore begin symbol
			{
			} else 
			if (n.type == SYM.E) // End symbol terminates line
			{
				return false;
			} else
			if (n.type == SYM.ROOT)
			{
			} else
			if (n.type == SYM.HORZ)
			{
			} else		
			if (n.type == SYM.VERT)
			{
			} else				
			if (n.is_operation())
			{
			} else
			if (n.type == SYM.BRDOWN)
			{
				n.set_next(x+1, y);

				// Keep following wire if moving up and hit branch
				if (y_dir == -1)
				{				
					n.branch_type = BRANCH_CLOSE;
					
					x_dir = 1;
					y_dir = 0;
					
					n.set_prev(x, y+1);
				} else
				{
					n.branch_type = BRANCH_OPEN;
					
					n.set_branch(x, y+1);

					//console.log("Push " + ni);
					add_stack(ni, x+1, y);
					
					y_dir = 1;
					x_dir = 0;
				}

			} else
			if (n.type == SYM.CAPRIGHT)
			{
				x_dir = 1;
				y_dir = 0;
			} else
			if (n.type == SYM.CAPLEFT)
			{
				x_dir = 0;
				y_dir = -1;
			} else			
			if (n.type == SYM.BRRIGHT)
			{
				n.branch_type = BRANCH_OPEN;
				
				n.set_next(x+1, y);
				n.set_branch(x, y+1);
						
				//console.log("Push " + ni);

				add_stack(ni, x+1, y);		
				
				y_dir = 1;
				x_dir = 0;
			} else			
			if (n.type == SYM.BRLEFT)
			{
				n.branch_type = BRANCH_CLOSE;

				// Done if not moving up
				if (y_dir != -1)
				{				
					return false;
				}		
				else
				{
					n.set_next(x, y-1);			
					n.set_prev(x, y+1);
				}
			} else			
			{
				console.log(" Unknown symbol " + n.type);
				return true;
			}
					
			// Advance		
			x += x_dir;
			y += y_dir;

			// Next is overridden for branches 
			if (!n.is_branch())
				n.set_next(x, y);
			
			// Get next node		
			ni = find_node(nodes, x, y);		
			n = nodes[ni];
		}
		
		if (max == 0)
		{
			console.log(" Row limit reached " + x + " " + y);
			return true;
		}
		
		//console.log("["+l+"] Row str: " + row_str);
		return false;
		
	}


	/* 
		End of Flow direction resolution 
	*/



	/* 
		Node tree assembly 
	*/

	// Add instruction to instruction list
	function add_inst(inst, op1, op2)
	{
		var i = {inst:inst, op1:op1, op2:op2};
		inst_list.push(i);
	}


	
	// Find offset for variable by index
	function find_variable_offset(variable_list, index)
	{
		for (var i = 0; i < variable_list.variables.length; i++)
		{
			if (variable_list.variables[i].index == index)
				return variable_list.variables[i].offset;
		
		}
		
		return -1;
	}
	

	function assemble_nodes(nodes, variable_list)
	{
		inst_list = [];
		
		
	//	inst_list = []; // Clear instruction list
	 
		var result = "";
		
		//console.log("Assemble Tree");
		
		for (var i = 0; i < nodes.length; i++)
		{
			var n = nodes[i];
			
			if (n.type == SYM.B)
			{
			
				add_inst(INST_TYPES.INST_CLEAR, 0, 0); // Reset CR
				//if (assemble_tree(0, root_node)) return true;
				
				if (assemble_tree(nodes, variable_list, 0, i)) return true;
				
			}
			
		}
		
		//if (enagle_log) console.log("Result: " + result);
		//if (enagle_log) show_inst_list();
		
		return false;

	}


	/* Assemble parsed node tree to instruction list */
	function assemble_tree(nodes, variable_list, level, node)
	{
		//if (enagle_log) console.log("Assemble level: " +level + " Node: " + node);
		
		if (level > 32)
		{
			console.log("Assemble Tree - Too Deep");
			return true;
		}
			
		if (node == -1) return false;
		
		var n = nodes[node];
			
		//if (n.type == SYN_E) return false;
		
		var l = 1000;
		
		var np = node; // node index
		var pn = -1; // previous node index
		
		var next = -1;
		
		while (np != -1 && n.type != SYM.E && l--)
		{
			var n = nodes[np];
			
			next = n.next;
			
			//console.log("N: [" + np + "] pn: " + pn + " prev: " + n.prev + "\n");
			
			// Map operation to instructon
			if (n.is_operation()) 
			{
				var offset1 = find_variable_offset(variable_list, n.op1);
				var offset2 = find_variable_offset(variable_list, n.op2);

				add_inst(n.type_inst, offset1, offset1);

				//console.log("N: [" + np + "] " + n.type_text + "(" + n.op1 + ") " + n.x + " " + n.y + "\n");
			}	
			
			//console.log("Br: " + n.branch);	
			//console.log("Type: "+  n.type + " branch: " + is_branch(n.type));
				
			if (n.is_branch() && n.branch_type == BRANCH_CLOSE)
			{
				// Collect if we are rejoining a branch
				if ((pn !=-1) && (pn == n.prev)) 
				{
					//console.log("N: [" + np + "] COLLECT "+ n.x + " " + n.y + " \n");
					add_inst(INST_TYPES.INST_POPOR, 0, 0);
				}
				else // Otherwise done with segment
				{
					//console.log("N: [" + np + "] PUSHOR " + n.x + " " + n.y + " \n");
					add_inst(INST_TYPES.INST_PUSHOR, 0, 0);
					return false;
				}
				
			}
				
			if (n.is_branch() && n.branch_type == BRANCH_OPEN)
			{
				//console.log("N: [" + np + "] PUSHCR " + n.x + " " + n.y + " \n");
				add_inst(INST_TYPES.INST_PUSHCR, 0, 0);
				
				//s += assemble_tree(level+1, n.branch);
				if (assemble_tree(nodes, variable_list, level+1, n.next)) return true;
				
				next = n.branch;

				//console.log("N: [" + np + "] POPCR " + n.x + " " + n.y + " \n");
				
				add_inst(INST_TYPES.INST_POPCR, 0, 0);
			}
			
			pn = np;
			np = next;
		}
		
		
		if (l == 0)
		{
			console.log("Assembly Limit Reached");
			return true;
		}
		
		return false;
	}


	// Generate program bytecode from an instruction list
	function generate_bytecode(inst_list)
	{
		console.log("Generating Bytecode");
	
		var out = "";
	
		//var inst_list = cpu.get_inst_list();
	
		for (var i = 0; i < inst_list.length; i++)
		{
			var inst = inst_list[i];		// current instruction
			//var nops = cpu.get_ops(inst.inst);	// Number of ops

			var op = inst.inst.op;		// opcode
			var nops = inst.inst.size;	// Number of oprands
			
			// Add instruction
			out += get_hex8(op);
			
			// Add operands
			if (nops > 0) out += get_hex8(inst.op1);
			if (nops > 1) out += get_hex8(inst.op2);
		}
		
		var size = out.length / 2;
		
		console.log("Bytecode size: " + size);
		
		// Prepend with total number of bytes.
		return get_hex32(size) + out;;
	}
	
	// Disassembly

	
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
	function show_inst_list(inst_list)
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
	
	
	
	
	
	
	
	
	

	return local;
}());


	
	