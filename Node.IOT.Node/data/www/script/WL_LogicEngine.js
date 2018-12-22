/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


var BRANCH_NONE = 0;
var BRANCH_OPEN = 1;
var BRANCH_CLOSE = 2;




var enagle_log = true;
//var log = false;

/* Assembly */
var INVALID_NODE = -1;
var stack = [];
var stack_ptr = 0;
var nodes = [];
var root_node = {};;


var variable_list = {};  // Variable name list


function logic_init()
{
	console.log("Logic init");
	cpu_init();
		
	logic_test();
		
		
		
	
	setInterval(function() {logic_update_timer()}, 100);	// Setup timer
	
		
}


function logic_update_timer()
{
	
	cpu_update(100);
	
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
	
	//if (enagle_log) console.log("Add node type: " + n.type_text + " pos (" + x + "," +y + ")");
	
	
	
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
	
	
	//n.op1_index = find_variable_index(n.op1);
	
	
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
		
		//s += "Next: " + nodes[i].next + " " ;
		
		//if (nodes[i].branch != -1)
//			s += "Branch: " + nodes[i].branch + " " ;

		//if (nodes[i].branch != -1)
//			s += "Type: " + nodes[i].branch_type + " " ;
		
		//if (nodes[i].prev != -1)
//			s += "Prev: " + nodes[i].prev + " " ;
		
			
			s += "Op1: " + nodes[i].op1 + " " ;
			//s += "Op1_index: " + nodes[i].op1_index + " " ;
		
		console.log(s);
	}
	
	console.log(nodes);
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
	
	assign_variable_list();
	

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
				
		//if (enagle_log) console.log(stack_ptr + " Popping node " + stack[stack_ptr].pn + " " +
		//						" pos (" + stack[stack_ptr].x + "," + stack[stack_ptr].y + ")" );

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
	//if (enagle_log) console.log(" Assemble Row ("+x+","+y+")");
	
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
			var offset1 = find_variable_offset(n.op1);
			var offset2 = find_variable_offset(n.op2);
			
			

			add_inst(n.type_inst, offset1, offset1);
			
			
			
			
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
	
	
	store_variablelist();
	
	
	
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
















/* memory */



function logic_add_variable(name, type)
{
	var v = {};
	
	v.name = name;
	v.type = type;
		
	
	// Find splice point
	
	var splice = 0;
	
	for (var i = 0; i < variable_list.variables.length && splice==0; i++)
	{

		if (variable_compare_type(v, variable_list.variables[i]) < 0)
		{
			splice = i;
		}
	}
		
	console.log("Splice: " + splice);
		
		
	variable_list.variables.splice(splice, 0, v);
		
		
	// adjust all indexes after splice
	
	for (var i = 0; i < nodes.length; i++)
	{
		
		if (nodes[i].op1 > splice)
			nodes[i].op1 += 1;
		
	}
		
	assign_variable_list();
}







	
function logic_remove_variable(index)
{
	
	for (var i = 0; i < nodes.length; i++)
	{
		if (nodes[i].op1 == index)
		{
			
			nodes[i].op1 = -1;
			
		}else
		// reassign variable indexes to account for missing variable
		if (nodes[i].op1 > index)
			nodes[i].op1--;
		
	}
		
		
//	n.op1_index = find_variable_index(n.op1);
	
	
	
}
	
	
function cpu_remove_variable(index)
{
	
	variable_list.variables.splice(index, 1);
	
	assign_variable_list();
	
	
}
	
	

// Find offset for variable by index
function find_variable_offset(index)
{
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		if (variable_list.variables[i].index == index)
			return variable_list.variables[i].offset;
		
	}
		
	return -1;
}
		
		
// Find index for variable by name
function find_variable_index(n)
{
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		if (variable_list.variables[i].name == n)
			return i;
		
	}
		
	return -1;
}		
		
		
		

// Find index of variable by offset
// used for node linking		
/*function find_variable_index(offset)
{
	
	// Compute memory offsets
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		
		if (variable_list.variables[i].offset == offset) return i;
	}
	
	return -1;
}
*/









function assign_variable_list()
{
// Variables are sorted by type and then by name to assign index


	console.log("Assign variable table");

	variable_list.variables.sort(variable_compare_type);
	
	
	
	
	variable_list.num_din = 0;
	variable_list.num_dout = 0;
	variable_list.num_ain = 0;
	variable_list.num_aout = 0;
	variable_list.num_bit = 0;
	variable_list.num_tmr = 0;
	
	var offset = 0;
	// Compute memory offsets
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		variable_list.variables[i].index = i; // Save index for when list is sorted for viewing
		variable_list.variables[i].offset = offset;
		
		if (variable_list.variables[i].type == VAR_TYPES.VAR_DIN)  {variable_list.num_din++; offset += VAR_SIZE.VAR_DIN; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_DOUT) {variable_list.num_dout++; offset += VAR_SIZE.VAR_DOUT; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_AIN)  {variable_list.num_ain++; offset += VAR_SIZE.VAR_AIN; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_AOUT) {variable_list.num_aout++; offset += VAR_SIZE.VAR_AOUT; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_BIT)  {variable_list.num_bit++; offset += VAR_SIZE.VAR_BIT; } 
		if (variable_list.variables[i].type == VAR_TYPES.VAR_TMR)  {variable_list.num_tmr++; offset += VAR_SIZE.VAR_TMR; } 
	}
	
	variable_list.mem_size = offset;
	
	variable_data = new Uint8Array(variable_list.mem_size);
	
	
	for (var i = 0; i < variable_data.length; i++)
		variable_data[i] = 0;
	
	console.log("Memory: " + variable_data.length);
	console.log(variable_list);
	console.log(variable_data);
	
	
	console.log(nodes);
	
}



// Name compare for variables
function variable_compare_type(a,b) 
{
	// Sory by type first
	
	if (a.type < b.type) return -1;
	if (a.type > b.type) return 1;
	
	// Then sort by name	
		
	
  if (a.name.toUpperCase()  < b.name.toUpperCase() )    return -1;
  if (a.name.toUpperCase()  > b.name.toUpperCase() )    return 1;
  return 0;
}

// Name compare for variables
function variable_compare_name(a,b) 
{
	
	//  sort by name	
		
	
  if (a.name.toUpperCase()  < b.name.toUpperCase() )    return -1;
  if (a.name.toUpperCase()  > b.name.toUpperCase() )    return 1;
  return 0;
}



// Save bytecode to device
function store_variablelist()
{
	console.log("Saving variablelist ");

	
	var tmp_list = {};
	tmp_list.vars = [];
	
	// Build temp variable list

	
	for (var i = 0; i < variable_list.variables.length; i++)
	{
		tmp_list.vars[i] = {name:variable_list.variables[i].name, type:variable_list.variables[i].type};
	}
	
	tmp_list.config = {};
	tmp_list.config.num_din = variable_list.num_din;
	tmp_list.config.num_dout = variable_list.num_dout;
	tmp_list.config.num_ain = variable_list.num_ain;
	tmp_list.config.num_aout = variable_list.num_aout;
	tmp_list.config.num_bit = variable_list.num_bit;
	tmp_list.config.num_tmr = variable_list.num_tmr;
	
	var variable_list_str = JSON.stringify(tmp_list);
	
	
	console.log("Variable list string: " + variable_list_str);
	
	
	
	
	
	
	

	var XHR = get_request();

    XHR.addEventListener("load", function(event) 
	{
      console.log(event.target.responseText);
    });

    XHR.addEventListener("error", function(event) 
	{
      alert('Unable to save logic to device');
    });

	XHR.open("POST", "/save_variablelist"); 
		
    XHR.send(variable_list_str);
}


	
	/* End of memory */
	
	
	

	
	