/*
	Ladder Logic Engine
	2018 nulluser@gmail.com
*/

"use strict";

var enagle_log = true;
//var log = false;

/* Assembly */
var INVALID_NODE = -1;
var stack = [];
var stack_ptr = 0;
var nodes = [];
var root_node = {};;


function init_logic()
{
	

		
		
}








/* 
	Nodes 
*/

// Add a new node and re-link 
function create_node(x, y, type, op1)
{
		
	var n;
		
	// decode node type
	if (type == SYM.B)  	  n = new NodeB();  else	
	if (type == SYM.E)		  n = new NodeE();  else		
	
	if (type == SYM.CAPLEFT)  n = new NodeCL();  else	
	if (type == SYM.CAPRIGHT) n = new NodeCR();  else
	if (type == SYM.BRRIGHT)  n = new NodeBR();  else
	if (type == SYM.BRLEFT)   n = new NodeBL();  else
	if (type == SYM.BRDOWN)   n = new NodeBD();  else
	if (type == SYM.HORZ)     n = new NodeHW();  else
	if (type == SYM.VERT)     n = new NodeVW();  else
	if (type == SYM.XIC)      n = new NodeXIC(); else
	if (type == SYM.XIO)      n = new NodeXIO(); else
	if (type == SYM.OTE)      n = new NodeOTE(); else
	if (type == SYM.OTL)      n = new NodeOTL(); else
	if (type == SYM.OTU)      n = new NodeOTU(); else
	if (type == SYM.TMR)      n = new NodeTMR(); else
	
	{
		n = new Node(type);
	}
	
	if (enagle_log) console.log("Add node type: " + n.type_text + " pos (" + x + "," +y + ")");
	
	
	
	n.x = x;
	n.y = y;
	
	n.sx = symbol_x;
	n.sy = symbol_y;
	
	n.consumed = 0;
	
	n.op1 = op1;

	return n;
	
	

}

function add_node(x, y, type, op1)
{
	
	var n = create_node(x, y, type, op1);
	nodes.push(n);
	link_node(n);
	
	return nodes.length - 1;		
}


function set_node(x, y, s)
{
	var ni = find_node(x, y);
	
	if (ni == -1)
	{
		add_node(x, y, s, 0);
		return;
	}
	
	var n = create_node(x, y, s, 0);
	
	nodes[ni] = n;
	
	//assemble();
	
	
//	cells[x+y*x_cells] = s;
}

/*function remove_node(ni)
{
	for (var i = 0; i < nodes.length; i++)
	{
		var n = nodes[i];
		
		if (n.next == ni) { n.next_x = -1; n.next_y = -1; n.next= -1; }
		if (n.branch == ni) { n.branch_x = -1; n.branch_y = -1; n.branch= -1;}
		if (n.up == ni) {n.up_x = -1; n.up_y = -1; n.up= -1;}
		if (n.down == ni) {n.down_x = -1; n.down_y = -1; n.down= -1;}
		if (n.left == ni) {n.left_x = -1; n.left_y = -1; n.left= -1;}
		if (n.right == ni) {n.right_x = -1; n.right_y = -1; n.right= -1;}
	}
	
	
	
}
*/



function link_node(n)
{
	//console.log("Link node: " + n);
	
	n.up_x = n.x;		n.up_y = n.y-1;
	n.down_x = n.x;		n.down_y = n.y+1;
	n.left_x = n.x-1;	n.left_y = n.y;
	n.right_x = n.x+1;	n.right_y = n.y;
	
	n.branch_x = -1;
	n.branch_y = -1;
/*

	if (n.type == SYM.BRDOWN)
	{
		n.next_x = n.x+1;
		n.next_y = n.y;
		
		n.branch_x = n.x;
		n.branch_y = n.y+1;
		
	} else
	
	
	if (n.type == SYM.BRRIGHT)
	{
		n.next_x = n.x+1;
		n.next_y = n.y;
		
		n.branch_x = n.x;
		n.branch_y = n.y+1;
		
	} else
	
	if (n.type == SYM.BRLEFT)
	{
		n.next_x = n.x;
		n.next_y = n.y-1;
	} else
		
	if (n.type == SYM.CAPLEFT)
	{
		n.next_x = n.x;
		n.next_y = n.y-1;
		
		
	} else
	if (n.type == SYM.CAPRIGHT)
	{
		n.next_x = n.x+1;
		n.next_y = n.y;
		
		
	} else
		
	{		
		n.next_x = n.x+1;
		n.next_y = n.y;
	}
	*/
	
	
}


function resolve_links()
{
	for (var i = 0; i < nodes.length; i++)
	{
		var n = nodes[i];
		
		n.up = find_node(n.up_x, n.up_y);
		n.down = find_node(n.down_x, n.down_y);
		n.left = find_node(n.left_x, n.left_y);
		n.right = find_node(n.right_x, n.right_y);
		
		n.next = find_node(nodes[i].next_x, nodes[i].next_y);
		n.branch = find_node(nodes[i].branch_x, nodes[i].branch_y);
		n.prev = find_node(nodes[i].prev_x, nodes[i].prev_y);
	}
}

function clear_nodes()
{
	root_node = {};;
	nodes = [];
}
	

function show_nodes()
{
	for(var i = 0; i < nodes.length; i++)
	{
		var n = nodes[i];
		
		var s = "";
		s += "N " + i + " " + n.type_text + " (" + n.x + "," + n.y + ") ";
		
		s += "Next: " + nodes[i].next + " " ;
		
		if (nodes[i].branch != -1)
			s += "Branch: " + nodes[i].branch + " " ;

		if (nodes[i].branch != -1)
			s += "Type: " + nodes[i].branch_type + " " ;
		
		if (nodes[i].prev != -1)
			s += "Prev: " + nodes[i].prev + " " ;
		
		console.log(s);
	}
}



function find_node(x, y)
{
	for (var i = 0; i < nodes.length; i++)
		if (nodes[i].x == x && nodes[i].y == y) return i;
			
	return -1;
}



/* 
	End of nodes 
*/




/* 
	Main Assembly 
*/

function logic_assemble()
{
	console.log("Assemble");

	logic_ok = false;
	
	for (var i = 0 ; i < nodes.length; i++)
		nodes[i].consumed = 0;
	
	
	stack_ptr = 0;
	
	// Find start symbols to resolve all chains
	for (var i = 0; i < nodes.length; i++)
	{
		var n = nodes[i];
		if (n.type == SYM.B) resolve_nodes(n.x, n.y);
	}
	
	resolve_links();
	
	console.log("Nodes: ");
	
	if (enagle_log) show_nodes();

	if (assemble_nodes())
	{
		console.log("Unable to assemble");
		return true;
	}
	
	logic_ok = true;
	
	
	
	
	
	
	cpu_update(100);
	
	//solve_logic();
}



/* 
	Flow direction resolution 
*/
var order=0;

function resolve_nodes(x, y)
{
	if (resolve_chain(root_node, x, y)) 
	{
		console.log("Unable to assemble row (" + x + "," + y + ")");
		//return;
	}
			
	// Evaluate branch stack.
	while(stack_ptr)
	{
		stack_ptr--;
				
		if (enagle_log) console.log(stack_ptr + " Popping node " + stack[stack_ptr].pn + " " +
								" pos (" + stack[stack_ptr].x + "," + stack[stack_ptr].y + ")" );

		if (resolve_chain(stack[stack_ptr].pn, stack[stack_ptr].x, stack[stack_ptr].y))
		{
			console.log(" Unable to assemble row at " + stack[stack_ptr].x + " " + stack[stack_ptr].y);
			//return true;
				
		}
	}
}
		
	

function add_stack(pn, x, y)
{
	stack[stack_ptr] = {};
	stack[stack_ptr].x = x;
	stack[stack_ptr].y = y;
	stack[stack_ptr].pn = pn; // Previous node

	//if (enagle_log) console.log(" Pushing Prev n" + pn + " (" + px + "," + py + ")" + " pos (" + x + "," + y + ")" );

	stack_ptr++;
}


function resolve_chain(prev_ni, x, y)
{
	if (enagle_log) console.log(" Assemble Row ("+x+","+y+")");
	
	var max = 100;
	
	var x_dir = 1;
	var y_dir = 0;
		
	var ni = find_node(x, y);	 // current node index
	var n = nodes[ni];           // current node 

	//console.log("Prev ni: " + prev_ni);
	
	while(max-- && ni != -1)
	{
		//if (enagle_log) console.log("[" + ni + "] Pos  (" + x + "," + y + ") = " + n.type_text +  "Dir: (" + x_dir +"," + y_dir + ")" + " C: " + n.consumed);
		
		// skip consumed cells
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
		ni = find_node(x, y);		
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


function assemble_nodes()
{
	inst_list = []; // Clear instruction list
 
	var result = "";
	
	//console.log("Assemble Tree");
	
	for (var i = 0; i < nodes.length; i++)
	{
		var n = nodes[i];
		
		if (n.type == SYM.B)
		{
		
			add_inst(INST_TYPES.INST_CLEAR, 0, 0); // REset CR
			//if (assemble_tree(0, root_node)) return true;
			
			if (assemble_tree(0, i)) return true;
			
		}
		
	}
	
	//if (enagle_log) console.log("Result: " + result);
	if (enagle_log) show_inst_list();
	
	return false;

}



/* Decode symbol to instruction and add to instruction list */
/*function add_operation(o, op1, op2)
{
	
	
	
	if (o == SYM.NO) add_inst(INST_TYPES.INST_XIO, op1);
	if (o == SYM.NC) add_inst(INST_TYPES.INST_XIC, op1);
	if (o == SYM.OTE) add_inst(INST_TYPES.INST_OTE, op1);
	if (o == SYM.OTL) add_inst(INST_TYPES.INST_OTL, op1);
	if (o == SYM.OTU) add_inst(INST_TYPES.INST_OTU, op1);
	if (o == SYM.TMR) add_inst(INST_TYPES.INST_TMR, op1);
	
	
}
*/

/* Assemble parsed node tree to instruction list */
function assemble_tree(level, node)
{
	if (enagle_log) console.log("Assemble level: " +level + " Node: " + node);
	
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
			add_inst(n.type_inst, n.op1, n.op2);
			
//			add_operation(n.type, n.op1, n.op2);

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
				add_inst(INST_TYPES.INST_COLLECT, 0, 0);
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
			if (assemble_tree(level+1, n.next)) return true;
			
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





// Assemble, compute memory and save logic to device
function logic_download()
{
	console.log("Saving logic:");

	
	logic_assemble();
		
	var bytecode = generate_bytecode();

	store_bytecode(bytecode);
	
}



// Generate program bytecode
function generate_bytecode()
{
	console.log("Generating Bytecode");
	
	var out = "";
	
	for (var i = 0; i < inst_list.length; i++)
	{
		var inst = inst_list[i];		// current instruction
		var nops = get_ops(inst.inst);	// Number of ops
		
		// Add instruction
		out += get_hex8(inst.inst);
		
		// Add operands
		if (nops > 0) out += get_hex8(inst.op1);
		if (nops > 1) out += get_hex8(inst.op2);
	}
	
	var size = out.length / 2;
	
	console.log("Bytecode size: " + size);
	
	// Prepend with total number of bytes.
	return get_hex32(size) + out;;
}





// Save bytecode to device
function store_bytecode(bytecode)
{
	console.log("Saving bytecode ");
	console.log("Bytecode: " + bytecode);

	var XHR = get_request();

    XHR.addEventListener("load", function(event) 
	{
      console.log(event.target.responseText);
    });

    XHR.addEventListener("error", function(event) 
	{
      alert('Unable to save logic to device');
    });

	XHR.open("POST", "/save_bytecode"); 
		
    XHR.send(bytecode);
}




/* Test data */
function test_logic()
{
	clear_bits();
	
	clear_nodes();
	
	//root_node = add_node(-1, 0, SYM.ROOT);
	//console.log("Root: " + root_node);	
	
	add_node(0, 0, SYM.B);
	add_node(1, 0, SYM.XIC, 128);
	add_node(2, 0, SYM.XIC, 129);
	add_node(3, 0, SYM.BRDOWN);
	add_node(4, 0, SYM.XIC, 130);
	add_node(5, 0, SYM.BRDOWN);
	add_node(6, 0, SYM.BRDOWN);	
	add_node(7, 0, SYM.HORZ);	
	add_node(8, 0, SYM.HORZ);	
	add_node(9, 0, SYM.HORZ);	
	add_node(10, 0, SYM.XIO, 131);	
	add_node(11, 0, SYM.HORZ);	
	add_node(12, 0, SYM.HORZ);	
	add_node(13, 0, SYM.HORZ);	
	add_node(14, 0, SYM.HORZ);	
	add_node(15, 0, SYM.HORZ);		
	add_node(16, 0, SYM.OTE, 132);	
	add_node(17, 0, SYM.E);	
	
	add_node(3, 1, SYM.BRRIGHT);
	add_node(4, 1, SYM.XIC, 133);	
	add_node(5, 1, SYM.BRLEFT);

	add_node(3, 2, SYM.BRRIGHT);
	add_node(4, 2, SYM.XIC, 134);	
	add_node(5, 2, SYM.CAPLEFT);

	add_node(3, 3, SYM.CAPRIGHT);
	add_node(4, 3, SYM.XIC, 135);	
	add_node(5, 3, SYM.XIO, 136);
	add_node(6, 3, SYM.CAPLEFT);
	add_node(6, 2, SYM.VERT);
	add_node(6, 1, SYM.VERT);



	add_node(0, 5, SYM.B);
	add_node(1, 5, SYM.XIC, 0);
	add_node(2, 5, SYM.XIC, 1);
	add_node(3, 5, SYM.OTE, 64);
	add_node(4, 5, SYM.E, 3);

	
	add_node(10, 5, SYM.B);
	add_node(11, 5, SYM.BRDOWN);
	add_node(12, 5, SYM.XIC, 2);
	add_node(13, 5, SYM.BRDOWN);
	add_node(14, 5, SYM.OTE, 65);
	add_node(15, 5, SYM.E);

	
	add_node(11, 6, SYM.CAPRIGHT);
	add_node(12, 6, SYM.XIC, 3);
	add_node(13, 6, SYM.CAPLEFT);	
	
	
	
	

	add_node(0, 8, SYM.B);
	add_node(1, 8, SYM.HORZ);
	add_node(2, 8, SYM.BRDOWN);
	add_node(3, 8, SYM.XIC, 140);
	add_node(4, 8, SYM.TMR, 141);
	add_node(5, 8, SYM.OTU, 140);
	add_node(6, 8, SYM.BRDOWN);
	add_node(7, 8, SYM.HORZ);	
	add_node(8, 8, SYM.E);	
	
	
	add_node(2, 9, SYM.CAPRIGHT);
	add_node(3, 9, SYM.XIO, 140);
	add_node(4, 9, SYM.TMR, 142);
	add_node(5, 9, SYM.OTL, 140);
	add_node(6, 9, SYM.CAPLEFT);


	
	


	
	
	/*
	add_node(0, 6, SYM.HORZ);
	add_node(1, 6, SYM.NO);
	add_node(2, 6, SYM.HORZ);
	add_node(3, 6, SYM.HORZ);
	add_node(4, 6, SYM.HORZ);
	add_node(5, 6, SYM.HORZ);
	add_node(6, 6, SYM.HORZ);	
	add_node(7, 6, SYM.HORZ);	
	add_node(8, 6, SYM.HORZ);	
	add_node(9, 6, SYM.HORZ);	
	add_node(10,6, SYM.HORZ);	
	add_node(11, 6, SYM.HORZ);	
	add_node(12, 6, SYM.HORZ);	
	add_node(13, 6, SYM.HORZ);	
	add_node(14, 6, SYM.HORZ);	
	add_node(15, 6, SYM.HORZ);		
	add_node(16, 6, SYM.OTE);	
	*/
	
	resolve_links();

	
	setup_variable_table();
	

	logic_assemble();
	
}






