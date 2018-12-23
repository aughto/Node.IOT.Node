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
  show_memory("Logic Debug\n");
 
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
  if (inst == INST_COLLECT)   print_log("COLLECT"); else
  if (inst == INST_XIO)     { print_log("XIO      %5d (%d)", op1, get_value(op1)); i++; } else
  if (inst == INST_XIC)     { print_log("XIC      %5d (%d)", op1, get_value(op1)); i++; }else
  if (inst == INST_OTE)     { print_log("OTE      %5d (%d)", op1, get_value(op1)); i++; }else
  if (inst == INST_OTL)     { print_log("OTL      %5d (%d)", op1, get_value(op1)); i++; }else
  if (inst == INST_OTU)     { print_log("OTU      %5d (%d)", op1, get_value(op1)); i++; }else
  if (inst == INST_TMR)     { print_log("TMR      %5d (%d)", op1, get_value(op1)); i++; }else
    print_log("Unknown inst %2x\n", inst);

  if (newline) print_log("\n");

  i++;
}











void Logic::show_disassembly( void )
{

  print_log(MODULE "Bytecode Listing\n");


  unsigned int i = 0;
  
  while (i < bytecode_size)
  {
    decode_next_inst(i, true);
  }

  
}



void Logic::show_memory(char * title )
{
  print_log(MODULE "%s\n", title);

  for (int i = 0; i < 64; i++)
    print_log("%i %2x\n", i, variables[i]);  

  print_log("\n");

}

// Make sure variable offset is in range
unsigned char Logic::check_offset(unsigned int i)
{
  if (i >= VARIABLE_MAX)
  {
    print_log("Invalid memory address: %d\n", i);
    return true;
  }

  return false;
}




unsigned char Logic::get_value(unsigned int i)
{
  if (check_offset(i)) return 0;
  
  return variables[i];

/*
  // Input
  if (i < 64) 
  {
    unsigned char v;

    if (io.get_value(i, v)) return 0;
    return v;
  }

   // output
   if (i < 128) 
  {
    unsigned char v;

    if (io.get_value(i, v)) return 0;
    return v;
  }

  
  i -= 128;

  if (i >= VARIABLE_MAX) return 0;
  
  return variables[i];*/
}
  
void Logic::set_value(unsigned int i, unsigned char v)
{

  if (check_offset(i)) return;

  
variables[i] = v;
/*
  
  // Input
  if (i < 64) 
  {
    return;
  }

  // output
  if (i < 128) 
  {
    io.set_value(i, v);
    return;
  }

  i -= 128;

  if (i >= VARIABLE_MAX) return;
  
  variables[i] = v;*/
}




void Logic::solve_logic(unsigned long dt)
{
  //print_log("Solve Logic\n");

  //show_memory("Before");


  if (bytecode == NULL && bytecode_size == 0)
  {
    print_log("Solve: Logic not ok\n");
    return;
  }
  
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
      
      if (cr_ptr >= CRSTACK_MAX) {print_log("PUSHCR Error- Too Parge\n"); return; }
      
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

         if (or_ptr >= ORSTACK_MAX) {print_log("PUSHOR Error- Too Parge"); return; }
    } else

    if (inst == INST_COLLECT)
    {
      or_ptr--;

      if (or_ptr < 0) {print_log("COLLECT Error - Too Small"); return; }
      
      //var v = or_stack[or_ptr];
      
      cr = cr | or_stack[or_ptr];
    } else    
    
    if (inst == INST_XIO)
    {
      unsigned char op1 = bytecode[++i];

      //cr = cr & !variables[op1];
      cr = cr & !get_value(op1);
      
    } else
    
    if (inst == INST_XIC)
    {
      unsigned char op1 = bytecode[++i];
            
      //cr = cr & variables[op1];
      cr = cr & get_value(op1);
      
      
    } else    
    
    if (inst == INST_OTE)
    {
      unsigned char op1 = bytecode[++i];
      
      //variables[op1] = cr;

      set_value(op1, cr);
    } else    
    
    if (inst == INST_OTL)
    {
      unsigned char op1 = bytecode[++i];      
      //if (cr) variables[op1] = 1;
      if (cr) set_value(op1, 1);
      
    } else    
    
    if (inst == INST_OTU)
    {
      unsigned char op1 = bytecode[++i];
      //if (cr) variables[op1] = 0;
      if (cr) set_value(op1, 1);
    } else  
    
    if (inst == INST_TMR)
    {
      unsigned char op1 = bytecode[++i];
      /*
//      console.log("timer cr: " + cr + " " + inst.op);
      variable_table[inst.op1].preset = 1000;

      if (variable_table[inst.op1].acc == undefined) 
        variable_table[inst.op1].acc = 0;
      
      if (cr)
      {
        variable_table[inst.op1].acc += dt;

        if (variable_table[inst.op1].acc > variable_table[inst.op1].preset)
          variable_table[inst.op1].acc = variable_table[inst.op1].preset;
      
        cr = variable_table[inst.op1].acc >= variable_table[inst.op1].preset;
      
      } else
        variable_table[inst.op1].acc = 0;
      
      variable_table[inst.op1].value  = cr;
      
      
      //console.log("acc: " + variable_table[inst.op1].acc + " C" + cr + " dt" + dt);*/
    } 
    else
    { 
      print_log(MODULE "CPU: Unknown Inst: %x" + inst);
    }
    
    //print_log("     CR %d\n", cr);


    i++;
    
  }
  
  
  //show_memory("After");

  updates++;
}
