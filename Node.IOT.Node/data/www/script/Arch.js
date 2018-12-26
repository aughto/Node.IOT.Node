/*
	Node.IOT
	2018 Aughto Inc
	Jason Hunt - nulluser@gmail.com

	CPU architecture Constants
	Used by the assembled and CPU
	
	File: Arch.js
*/

"use strict";

// Instruction types
const INST_TYPES = 	{INST_NONE		: {op:0x00, size:0},  
					 INST_CLEAR		: {op:0x10, size:0},  
					 INST_PUSHCR	: {op:0x11, size:0},  
					 INST_POPCR		: {op:0x12, size:0},  
					 INST_PUSHOR	: {op:0x13, size:0},   
					 INST_POPOR		: {op:0x14, size:0},   
					 INST_XIO		: {op:0x30, size:1},   
					 INST_XIC		: {op:0x31, size:1},  
					 INST_OTE		: {op:0x40, size:1},   
					 INST_OTL		: {op:0x41, size:1},   
					 INST_OTU		: {op:0x42, size:1},   
					 INST_TMR		: {op:0x80, size:1}};

					 
// Variable types
const  VAR_TYPES = 	{VAR_NONE		: 0x00, 
					 VAR_DIN		: 0x10, 
					 VAR_DOUT		: 0x20, 
					 VAR_AIN		: 0x30, 
					 VAR_AOUT		: 0x40, 
					 VAR_BIT		: 0x50, 
					 VAR_TMR		: 0x60};
					
// Variable sizes					
const  VAR_SIZE = 	{VAR_DIN		: 1, 
					 VAR_DOUT		: 1, 
					 VAR_AIN		: 2, 
					 VAR_AOUT		: 2, 
					 VAR_BIT		: 1, 
					 VAR_TMR		: 6};
						




