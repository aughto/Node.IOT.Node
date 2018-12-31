/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Logic.cpp
*/

 
#include <arduino.h>

#include "Config.h"
#include "Utility.h"
#include "Logic.h"
#include "IO.h"

#define MODULE "[CPU]       "

/* CPU */


void Logic::show_debug(void)
{
  //show_memory("Logic Debug\n");
 
}

void Logic::decode_next_inst(unsigned int &i, bool newline)
{
  unsigned char inst = bytecode[i];
  unsigned char op1 = bytecode[i+1];
  unsigned char op2 = bytecode[i+2];

  print_log("%4X ", i);

  if (inst == INST_NONE)      print_log("NONE"); else
  if (inst == INST_CLEAR)     print_log("CLEAR");  else 
  if (inst == INST_PUSHCR)    print_log("PUSHCR"); else
  if (inst == INST_POPCR)     print_log("POPCR"); else 
  if (inst == INST_PUSHOR)    print_log("PUSHOR");  else
  if (inst == INST_POPOR)     print_log("POPOR"); else
  if (inst == INST_XIO)     { print_log("XIO      %5d (%d)", op1, get_byte(op1)); i++; } else
  if (inst == INST_XIC)     { print_log("XIC      %5d (%d)", op1, get_byte(op1)); i++; }else
  if (inst == INST_OTE)     { print_log("OTE      %5d (%d)", op1, get_byte(op1)); i++; }else
  if (inst == INST_OTL)     { print_log("OTL      %5d (%d)", op1, get_byte(op1)); i++; }else
  if (inst == INST_OTU)     { print_log("OTU      %5d (%d)", op1, get_byte(op1)); i++; }else
  if (inst == INST_TMR)     { print_log("TMR      %5d (%d)", op1, get_byte(op1)); i++; }else
    print_log("Unknown inst %2x\n", inst);

  if (newline) print_log("\n");

  i++;
}


// Show bytecode disassembly
void Logic::show_disassembly(void)
{
  print_log(MODULE "Bytecode Listing\n");

  if (bytecode == NULL)
  {
    print_log("No Bytecode loaded\n");
    return;
  }

  unsigned int i = 0;
  
  while (i < bytecode_size)
  {
    decode_next_inst(i, true);
  }
}



void Logic::show_variables()
{
  print_log(MODULE "Variables\n");

  for (int i = 0; i < variables_size; i++)
    print_log("%i %2x\n", i, variables[i]);  

  print_log("\n");
}


// Make sure variable offset is in range
unsigned char Logic::check_offset(unsigned int i)
{
  if (variables == NULL) return true;
  
  if (i >= variables_size)
  {
    print_log("Invalid memory address: %d\n", i);
    return true;
  }

  return false;
}

unsigned int Logic::get_variables_size()
{
   return variables_size;
}


// Get byte from memory
unsigned char Logic::get_byte(unsigned int i)
{
  if (check_offset(i)) return 0;
  
  return variables[i];
}

// Get byte from memory
uint16_t Logic::get_word(unsigned int i)
{
  if (check_offset(i)) return 0;
  if (check_offset(i+1)) return 0;
  
  return (variables[i]<<8) + variables[i+1];
}


// Set byte in memory
void Logic::set_byte(unsigned int i, unsigned char v)
{
  if (check_offset(i)) return;
  
  variables[i] = v;
}

// Set byte in memory
void Logic::set_word(unsigned int i, uint16_t v)
{
  if (check_offset(i)) return;
  if (check_offset(i+1)) return;
    
  variables[i] = v >> 8;
  variables[i+1] = v & 0xff;
  
}

// Core solver
void Logic::solve_logic(unsigned long dt)
{
  //print_log("Solve Logic\n");

  //show_memory("Before");

  // Make sure logic is valid
  if (bytecode == NULL || variables == NULL || bytecode_size == 0 || variables_size == 0)
  {
    print_log("Solve: Logic not ok\n");
    return;
  }

  // Reset stack pointers
  cr_ptr = 0;
  or_ptr = 0;

  unsigned int cr = 1;

  unsigned int i = 0;

  while (i < bytecode_size) 
  {
    unsigned char inst = bytecode[i];

    unsigned int tmp = i;
    
    //decode_next_inst(tmp, false);
    
    if (inst == INST_CLEAR)
    {
      cr = 1;
    } else    
    
    if (inst == INST_PUSHCR)
    {
      cr_stack[cr_ptr] = cr;
      cr_ptr++;
      
      if (cr_ptr >= CRSTACK_MAX) {print_log("PUSHCR Error- Too Large\n"); return; }
      
    } else

    if (inst == INST_POPCR)
    {
      cr_ptr--;
      if (cr_ptr < 0) { print_log("POPCR ERROR - Too Small"); return; }
      cr = cr_stack[cr_ptr];
      
    } else
    
    if (inst == INST_PUSHOR)
    {
      or_stack[or_ptr] = cr;
      or_ptr++;

         if (or_ptr >= ORSTACK_MAX) {print_log("PUSHOR Error- Too Large"); return; }
    } else

    if (inst == INST_POPOR)
    {
      or_ptr--;

      if (or_ptr < 0) {print_log("POPOR Error - Too Small"); return; }
      
      //var v = or_stack[or_ptr];
      
      cr = cr | or_stack[or_ptr];
    } else    
    
    if (inst == INST_XIO)
    {
      unsigned char op1 = bytecode[++i];

      //cr = cr & !variables[op1];
      cr = cr & !get_byte(op1);
      
    } else
    
    if (inst == INST_XIC)
    {
      unsigned char op1 = bytecode[++i];
            
      //cr = cr & variables[op1];
      cr = cr & get_byte(op1);
      
      
    } else    
    
    if (inst == INST_OTE)
    {
      unsigned char op1 = bytecode[++i];
      
      //variables[op1] = cr;

      set_byte(op1, cr);
    } else    
    
    if (inst == INST_OTL)
    {
      unsigned char op1 = bytecode[++i];      
      //if (cr) variables[op1] = 1;
      if (cr) set_byte(op1, 1);
      
    } else    
    
    if (inst == INST_OTU)
    {
      unsigned char op1 = bytecode[++i];
      //if (cr) variables[op1] = 0;
      if (cr) set_byte(op1, 0);
    } else  
    
    if (inst == INST_TMR)
    {
      unsigned char op1 = bytecode[++i];
      
      unsigned char value = get_byte(op1);
      unsigned char base = get_byte(op1+1);
      uint16_t pre = get_word(op1+2);
      uint16_t acc = get_word(op1+4);

          byte crt = cr;
      if (cr)
      {
        acc += dt;
        
        if (acc > pre) acc = pre;
                
        cr = acc >= pre;
      
      } else
        acc = 0;

      set_byte(op1, cr);    // Set value
      set_word(op1+4, acc);   // Set acc
      
      print_log("Crt: %d  Cr %d  V: %d B: %d Pre: %d  Acc: %d\n", crt, cr, value, base, pre, acc);

    } 
    else
    { 
      print_log(MODULE "CPU: Unknown Inst: %x\n" + inst);
    }
    
    //print_log("     CR %d\n", cr);


    i++; // consume opcode only
    
  }
  
  
  //show_memory("After");

  updates++;
}
