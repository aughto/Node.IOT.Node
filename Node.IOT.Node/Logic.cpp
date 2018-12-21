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

#define MODULE "[LogicEng]  "

Logic logic;

Logic::Logic()
{
   bytecode = NULL;
   bytecode_size = 0;
   updates = 0;
}


void Logic::init()
{
   print_log("Logic init\n"); 

  // Allocate stacks

  variables = (unsigned char *)malloc(VARIABLE_MAX + 1);
  cr_stack  = (unsigned char *)malloc(CRSTACK_MAX + 1);
  or_stack  = (unsigned char *)malloc(ORSTACK_MAX + 1);

  if (variables == NULL)
  {
    print_log("Unable to get variable memory\n");
    return;
  }
    
  if (cr_stack == NULL)
  {
    print_log("Unable to get crstack memory\n");
    return;
  }

  
  if (or_stack == NULL)
  {
    print_log("Unable to get orstack memory\n");
    return;
  }

  for (int i = 0; i < 32; i++)
   variables[i] = 0;  

  // Allocate Max bytecode. This is done to prevent heap fragmentation during reloading

  load();
}


void Logic::load()
{
  print_log("Logic Load\n");

  load_bytecode(BYTECODE_FILENAME);


  show_disassembly();

  
}

void Logic::save()
{
  print_log("Logic Save\n");
}

  
void Logic::update(unsigned long current)
{
  static long int c = 0;

  /*if (c++ > 100000)
  {
    //print_log("Logic Update\n");

    c = 0;
  }

  unsigned long dt = 1;

    
  // Get inputs

  unsigned char v;
  
  if (!io.get_value(0, v))
  {
    variables[25] = v;
  }
  
  if (!io.get_value(1, v))
  {
    variables[26] = v;
  }  


if (!io.get_value(2, v))
  {
    variables[15] = v;
  }
  
  if (!io.get_value(3, v))
  {
    variables[16] = v;
  }  


  
  
  //variables[15] = 1;
  //variables[16] = 1;
*/
  unsigned long dt = 1;
  solve_logic(dt);

  /*// Map outputs
  io.set_value(0, variables[27]);
  io.set_value(1, variables[17]);*/
  

}


// Hex char nibble to byte 
/*unsigned char get_nibble(unsigned char c)
{
  if (c >= 'a') return c - 'a' + 10;    // Small A is largest 
  if (c >= 'A') return c - 'A' + 10;    // Large A is next
  
  return c - '0';                       // Digits are lowest
}
*/

/*unsigned char get_byte(unsigned char c1, unsigned char c2)
{

print_log("(%c%c)", c1, c2);

  
  return (get_nibble(c1) << 4) + get_nibble(c2);
}*/


// Read next 1 digit hex number from file
bool read_hex4(File &file, unsigned char &v)
{
    if (!file.available()) return true;
  
    unsigned char c = file.read();

    if (c >= 'a') v = c - 'a' + 10;  else    // Small A is largest 
    if (c >= 'A') v = c - 'A' + 10;  else  // Large A is next
      v = c - '0';    // Digits are lowest

    return false;
}



// Read next 2 digit hex number from file
bool read_hex8(File &file, unsigned char &v)
{
  unsigned char b1, b2;

  if (read_hex4(file, b1)) return true;
  if (read_hex4(file, b2)) return true;

  v = (b1 << 4) + b2;
    
  return false;
}


// Read next 4 digit hex number from file
bool read_hex16(File &file, unsigned int &v)
{
    unsigned char b1, b2;

    if (read_hex8(file, b1)) return true;
    if (read_hex8(file, b2)) return true;

    v = (b1 << 8) + b2;

    return false;
}


// Read next 8 digit hex number from file
bool read_hex32(File &file, unsigned long &v)
{
    unsigned int b1, b2;

    if (read_hex16(file, b1)) return true;
    if (read_hex16(file, b2)) return true;

    v = (b1 << 16) + b2;

    return false;
}




bool Logic::load_bytecode(const char *filename)
{
  if (bytecode != NULL) free(bytecode);

  bytecode = NULL;
  bytecode_size = 0;
  
  if (!filename)
  {
    print_log(MODULE "Logic Bytecode load: No filename\n");
    return true;
  }
  
  print_log(MODULE "Loading Config %s\n", filename);

  File file = SPIFFS.open(filename, FILE_READ);
    
  if(!file || file.isDirectory())
  {
      print_log(MODULE " Failed to open bytecode file");
      return true;
  }



// Read size

  if (read_hex32(file, bytecode_size))
  {
    print_log("Unable to read config file\n");
    file.close();
    return true;
  }

  print_log("Bytecode size: %d\n", bytecode_size);

  // Check for invalid size

  if (bytecode_size > MAX_BYTECODE)
  {
    print_log("Bytecode too large: %d Limit: %d\n", bytecode_size, MAX_BYTECODE);
    return true;
  }


  // Allocate Memory
    
  bytecode = (unsigned char*) malloc(bytecode_size + 10 );  // Padd space so that we can always index past current instruction 

  if (bytecode == NULL)
  {
    print_log("Unable to load bytecode - Memory\n");
    return true;
  }


  // Read file
  unsigned int index = 0;

  while(file.available())
  {
    unsigned char b;

    if (read_hex8(file, b))
    {
      print_log("Unable to read config file\n");
      file.close();
      return true;
    }

    //print_log(" %x ", b);

    bytecode[index++] = b;
        
      //Serial.write(file.read());
    }
  
  file.close();

  print_log(MODULE "Bytecode Loaded\n");

  return false;
}

















void Logic::savebytecode_start(const char *filename)
{
  file_loaded = false;
  
  bytecode_file = SPIFFS.open(filename, FILE_WRITE);
  
  if(!bytecode_file)
  {
    Serial.println(MODULE "Failed to open file for writing");
    return;
  }

  set_timeout(save_timeout, millis() + CONFIG_TIMEOUT);

  file_loaded = true;
  
  print_log(MODULE "Save started for %s\n", filename);
}


void Logic::savebytecode_chunk(const char *filename, uint8_t *data, size_t len)
{
  if (!file_loaded) return;
 
  if (!bytecode_file.write(data, len))
  {
      print_log("Config write failed\n");
    
  }

  save_timeout = 0;
 
}

void Logic::savebytecode_end(const char *filename)
{
  if (!file_loaded) return;

  bytecode_file.close();
  
  print_log(MODULE "Save ended for %s\n", filename);


  print_log("Bytecode Saved\n");


  file_loaded = false;

  load_bytecode(BYTECODE_FILENAME);
}

/* CPU */


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

  for (int i = 0; i < 32; i++)
    print_log("%2x ", variables[i]);  

  print_log("\n");

}

unsigned char Logic::get_value(unsigned int i)
{

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
  
  return variables[i];
}
  
void Logic::set_value(unsigned int i, unsigned char v)
{
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
  
  variables[i] = v;
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
