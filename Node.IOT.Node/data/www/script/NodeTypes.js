/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com
*/

"use strict";



/* 
	Nodes 
*/


const BRANCH_NONE = 0;
const BRANCH_OPEN = 1;
const BRANCH_CLOSE = 2;
	
	
// Create a new node from UI symbol
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
	
	
	
	
	
	
	
	
	
// Generic
function Node(type)
{
	var n = {};
	
	n.draw = function(ctx, x, y, sx, sy) {};	
	n.type = type;
				
	n.op1 = -1;
	n.op2 = -1;
	
	n.branch_type = BRANCH_NONE;
	
	n.next = -1;	n.next_x = -1;	n.next_y = -1;
	n.branch = -1;	n.branch_x = -1;	n.branch_y = -1;
	// used for branch to indicate which direction the main line is
	n.prev = -1;	n.prev_x = -1; 	n.prev_y = -1;
			
			
	n.type_text = "BLANK";
	n.type_inst = INST_TYPES.INST_NONE;
			
	n.is_operation = function()
	{
		if (n.type == SYM.XIC) return true;
		if (n.type == SYM.XIO) return true;
		if (n.type == SYM.OTE) return true;
		if (n.type == SYM.OTL) return true;
		if (n.type == SYM.OTU) return true;
		if (n.type == SYM.BOX) return true;		
		if (n.type == SYM.TMR) return true;		
		
	
		return false;
	}

	n.is_branch = function()
	{
		if (n.type == SYM.BRLEFT) return true;
		if (n.type == SYM.BRRIGHT) return true;
		if (n.type == SYM.BRDOWN) return true;
		
		return false;
	}
		
	n.set_next = function (next_x, next_y)
	{
		n.next_x = next_x;
		n.next_y = next_y;
	}

	n.set_branch = function (branch_x, branch_y)
	{
		n.branch_x = branch_x;
		n.branch_y = branch_y;
	}

	n.set_prev = function (prev_x, prev_y)
	{
		n.prev_x = prev_x;
		n.prev_y = prev_y;
	}
			
	return n;
}


// Begin
function NodeB()
{
	var n = new Node(SYM.B);
	
	n.type_text = "BEGIN ";
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		//console.log("X: " + x + " Y: " + y + " sx: " + sx + " sy: " + sy);

		var pad = (sx + sy) / 2 * 0.2;
		
		draw_symbol_line(ctx, x+0 + sx/2, y+0 + pad, x+ sx/2, y+sy-pad);	
		draw_symbol_line(ctx, x + sx/2, y+sy/2, x+sx, y+sy/2);	
	}
	
	return n;
}

// End 
function NodeE()
{
	var n = new Node(SYM.E);
	
	n.type_text = "END   ";
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;

		draw_symbol_line(ctx, x+0 + sx/2, y+0 + pad, x+sx/2, y+sy-pad);	
		draw_symbol_line(ctx, x, y+sy/2, x+sx/2, y+sy/2);	
	}
	
	return n;
}

// Corner Right
function NodeCR()
{
	var n = new Node(SYM.CAPRIGHT);
	
	n.type_text = "CR    ";	
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		//console.log("X: " + x + " Y: " + y + " sx: " + sx + " sy: " + sy);
		draw_symbol_line(ctx, x+0 + sx/2, y+0, x+ sx/2, y+0 + sy/2);	
		draw_symbol_line(ctx, x+ sx/2-1, y+0 + sy/2, x+sx, y+sy/2);	
	}
	
	return n;
}

// Corner Left
function NodeCL()
{
	var n = new Node(SYM.CAPLEFT);
	
	n.type_text = "CL    ";		
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		draw_symbol_line(ctx, x+0 + sx/2, y+0, x+ sx/2, y+0 + sy/2);	
		draw_symbol_line(ctx,  x, y+0 + sy/2, x+sx/2, y+sy/2);	
	}
	
	return n;
}

// Branch right
function NodeBR()
{
	var n = new Node(SYM.BRRIGHT);
	
	n.type_text = "BR    ";		

	n.draw = function(ctx, x, y, sx, sy)
	{
		//console.log("X: " + x + " Y: " + y + " sx: " + sx + " sy: " + sy);
		
		draw_symbol_line(ctx, x+sx/2, y, x+sx/2, y+sy);	
		draw_symbol_line(ctx, x +sx/2, y+ sy/2, x+sx, y+sy/2);	
	}
	
	return n;
}

// Branch left
function NodeBL()
{
	var n = new Node(SYM.BRLEFT);
	
	n.type_text = "BL    ";		
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		draw_symbol_line(ctx, x+sx/2, y, x+sx/2, y+sy);	
		draw_symbol_line(ctx, x, y+sy/2, x+sx/2, y+sy/2);	
	}
	
	return n;
}


// Branch down
function NodeBD()
{
	var n = new Node(SYM.BRDOWN);
	
	n.type_text = "BD    ";		
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;
		
		draw_symbol_line(ctx, x, y + sy/2, x+sx, y+sy/2);	
		draw_symbol_line(ctx, x+sx/2 , y+sy/2, x+sx/2, y+sy);	
	
	}
	
	return n;
}


// Horz wire
function NodeHW()
{
	var n = new Node(SYM.HORZ);
	
	n.type_text = "HORZ  ";		
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		draw_symbol_line(ctx, x, y+sy/2, x+sx, y+sy/2);	
	}
	
	return n;
}


// Vert wire
function NodeVW()
{
	var n = new Node(SYM.VERT);
	
	n.type_text = "VERT  ";		
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		draw_symbol_line(ctx, x+sx/2, y, x+sx/2, y+ sy);	
	}
	
	return n;
}

// Examine if closed
function NodeXIC()
{
	var n = new Node(SYM.XIC);

	
	n.type_text = "XIC   ";		
	n.type_inst = INST_TYPES.INST_XIC;	
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;
		
		var c1 = sx * 0.40;
		var c2 = sx * 0.60;
		
		draw_symbol_line(ctx, x, y+sy/2, x+c1, y+sy/2);	
		draw_symbol_line(ctx, x+c1, y+sy/2-pad, x+c1, y+sy/2+pad);		
		draw_symbol_line(ctx, x+c2 , y+sy/2-pad, x+c2, y+sy/2+pad);		
		draw_symbol_line(ctx, x + c2, y+sy/2, x+sx, y+sy/2);	
	}
	
	return n;
}

// Examine if open
function NodeXIO()
{
	var n = new Node(SYM.XIO);

	n.type_text = "XIO   ";		
	n.type_inst = INST_TYPES.INST_XIO;
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;
		var pad2 = (sx + sy) / 2 * 0.15;
	
		var c1 = sx * 0.40;
		var c2 = sx * 0.60;
		
		var c3 = sx * 0.45;
		var c4 = sx * 0.55;
	
		draw_symbol_line(ctx, x, y+sy/2, x+c1, y+sy/2);	
		draw_symbol_line(ctx, x+c1, y+sy/2-pad, x+c1, y+sy/2+pad);		
		draw_symbol_line(ctx, x+c2 , y+sy/2-pad, x+c2, y+sy/2+pad);		
		draw_symbol_line(ctx, x + c2, y+sy/2, x+sx, y+sy/2);	

		draw_symbol_line(ctx, x + c3, y+sy/2-pad2, x+c4, y+sy/2+pad2);		
	}
	
	return n;
}




// Output Energize
function NodeOTE()
{
	var n = new Node(SYM.OTE);
	
	n.type_text = "OTE   ";		
	n.type_inst = INST_TYPES.INST_OTE;	
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;

		var c = sx * 0.20;
		var x1 = sx/2;
		var y1 = sy/2;
		var s = sx * 0.2 ;
		
		draw_symbol_line(ctx, x, y+y1, x+x1-c, y+y1);	
	
		draw_arc(ctx, x+x1,y+ y1,s, 0.7*Math.PI, 1.3 *Math.PI);
		draw_arc(ctx, x+x1,y+ y1,s, 1.7*Math.PI, 0.3 *Math.PI);
	
		draw_symbol_line(ctx, x + x1 +c, y+y1, x+sx, y + y1);	
	}
	
	return n;
}


// Output latch
function NodeOTL()
{
	var n = new Node(SYM.OTL);
	
	n.type_text = "OTL   ";		
	n.type_inst = INST_TYPES.INST_OTL;	
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;

		var c = sx * 0.20;
		var x1 = sx/2;
		var y1 = sy/2;
		var s = sx * 0.2 ;
		
		draw_symbol_line(ctx, x, y+y1, x+x1-c, y+y1);	
	
		draw_arc(ctx, x+x1,y+ y1,s, 0.7*Math.PI, 1.3 *Math.PI);
		draw_arc(ctx, x+x1,y+ y1,s, 1.7*Math.PI, 0.3 *Math.PI);
	
		draw_symbol_line(ctx, x + x1 +c, y+y1, x+sx, y + y1);	
		
		draw_tool_text(ctx, x+x1 - c*0.3, y+y1+ c*0.4,c, "#000000", "L");
	}
	
	return n;
}

// Output Unlatch
function NodeOTU()
{
	var n = new Node(SYM.OTU);
	
	n.type_text = "OTU   ";		
	n.type_inst = INST_TYPES.INST_OTU;	
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;

		var c = sx * 0.20;
		var x1 = sx/2;
		var y1 = sy/2;
		var s = sx * 0.2 ;
		
		draw_symbol_line(ctx, x, y+y1, x+x1-c, y+y1);	
	
		draw_arc(ctx, x+x1,y+ y1,s, 0.7*Math.PI, 1.3 *Math.PI);
		draw_arc(ctx, x+x1,y+ y1,s, 1.7*Math.PI, 0.3 *Math.PI);
	
		draw_symbol_line(ctx, x + x1 +c, y+y1, x+sx, y + y1);	
		
		draw_tool_text(ctx, x+x1- c*0.3, y+y1 + c*0.4,c,"#000000", "U");
	}
	
	return n;
}

// Generic Box
function NodeBOX()
{
	var n = new Node(SYM.BOX);
	
	n.type_text = "BOX   ";		
	n.type_inst = INST_TYPES.INST_BOX;	
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;
		
		var c = sx * 0.20;
		var x1 = sx/2;
		var y1 = sy/2;
	
		draw_symbol_line(ctx, x, y+y1, x+x1-c, y+y1);	
	
		draw_symbol_line(ctx, x+x1-c, y+y1-c, x+x1-c, y+y1+c);		
		draw_symbol_line(ctx, x+x1+c, y+y1-c, x+x1+c, y+y1+c);		
		
		draw_symbol_line(ctx, x+x1-c, y+y1-c, x+x1+c, y+y1-c);		
		draw_symbol_line(ctx, x+x1-c, y+y1+c, x+x1+c, y+y1+c);		
		
		draw_symbol_line(ctx, x + x1 +c, y+y1, x+sx, y + y1);	
		
		
	}
	
	return n;
}



// Timer
function NodeTMR()
{
	var n = new Node(SYM.TMR);
	
	n.type_text = "TMR   ";		
	n.type_inst = INST_TYPES.INST_TMR;	
	
	n.draw = function(ctx, x, y, sx, sy)
	{
		var pad = (sx + sy) / 2 * 0.2;
		
		var c = sx * 0.20;
		var x1 = sx/2;
		var y1 = sy/2;
	
		draw_symbol_line(ctx, x, y+y1, x+x1-c, y+y1);	
	
		draw_symbol_line(ctx, x+x1-c, y+y1-c, x+x1-c, y+y1+c);		
		draw_symbol_line(ctx, x+x1+c, y+y1-c, x+x1+c, y+y1+c);		
		
		draw_symbol_line(ctx, x+x1-c, y+y1-c, x+x1+c, y+y1-c);		
		draw_symbol_line(ctx, x+x1-c, y+y1+c, x+x1+c, y+y1+c);		
		
		draw_symbol_line(ctx, x + x1 +c, y+y1, x+sx, y + y1);	
		
		draw_tool_text(ctx, x+x1- c*0.3, y+y1 + c*0.4,c,"#000000", "T");
	}
	
	return n;
}




