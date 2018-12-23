/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";


/* 
	Nodes 
*/

// Add a new node and re-link 
function create_node(x, y, type, op1, op2)
{
	var n;
		
	// decode node type
	if (type == SYM.B)  	  n = new NodeB();  else		// Begin
	if (type == SYM.E)		  n = new NodeE();  else		// End
	
	if (type == SYM.CAPLEFT)  n = new NodeCL();  else		// Left corner
	if (type == SYM.CAPRIGHT) n = new NodeCR();  else		// Right corner
	if (type == SYM.BRRIGHT)  n = new NodeBR();  else		// Branch right
	if (type == SYM.BRLEFT)   n = new NodeBL();  else		// Branch left
	if (type == SYM.BRDOWN)   n = new NodeBD();  else		// Branch down
	if (type == SYM.HORZ)     n = new NodeHW();  else		// Horizontal
	if (type == SYM.VERT)     n = new NodeVW();  else		// Vert
	if (type == SYM.XIC)      n = new NodeXIC(); else		// Examine if closed
	if (type == SYM.XIO)      n = new NodeXIO(); else		// Examine if opened
	if (type == SYM.OTE)      n = new NodeOTE(); else		// Output energize
	if (type == SYM.OTL)      n = new NodeOTL(); else		// Output latch
	if (type == SYM.OTU)      n = new NodeOTU(); else		// Output unlatch
	if (type == SYM.TMR)      n = new NodeTMR(); else		// Timer
	{
		n = new Node(type);		// Unknown
	}
	
	//if (enagle_log) console.log("Add node type: " + n.type_text + " pos (" + x + "," +y + ")");
	
	n.x = x;
	n.y = y;
	
	n.sx = symbol_x;
	n.sy = symbol_y;
	
	n.branch_x = -1;
	n.branch_y = -1;
	
	n.consumed = 0;
	
	n.op1 = op1;
	n.op2 = op2;
	

	return n;
}

function add_node(x, y, type, op1, op2)
{
	if (op1 == undefined) op1 = -1;
	if (op2 == undefined) op2 = -1;
	
	var n = create_node(x, y, type, op1, op2);
	nodes.push(n);
	
	return nodes.length - 1;		
}


// Set node symbol at location
function set_node(x, y, s)
{
	// Get node index for location
	var ni = find_node(x, y);
	
	// Delete whatever is there, if anything
	if (ni != -1) nodes.splice(ni, 1);

	// Just return if we are deleting a node
	if (s == SYM.NONE) return;
	
	// Create new node at location
	add_node(x, y, s, 0);
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





	

	
	