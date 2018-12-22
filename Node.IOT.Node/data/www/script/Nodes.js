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





	

	
	