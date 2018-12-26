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
   reload_flag = false;
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


  load();
}


void Logic::load()
{
  print_log("Logic Load\n");

  load_bytecode(BYTECODE_FILENAME);

  show_disassembly();

  reload_flag = false;
  
}

void Logic::save()
{
  print_log("Logic Save\n");
}

  
void Logic::update(unsigned long current)
{
  if (reload_flag)
  {
    load();
  }

  
  static long int c = 0;

  /*if (c++ > 100000)
  {
    //print_log("Logic Update\n");

    c = 0;
  }*/

  unsigned long dt = 1;

  map_inputs();

  solve_logic(dt);

  map_outputs();

}


// map inputs
void Logic::map_inputs(void)
{
  unsigned char v;

  for (int i = 0; i < NUM_INPUTS; i++)
  {
    if (!io.get_input(i, v)) { variables[i] = v; }
  }
}


void Logic::map_outputs(void)
{

  // Map outputs
  unsigned int output_offset = 4;
  
  for (int i = 0; i < NUM_OUTPUTS; i++)
  {
    io.set_output(i, variables[i + output_offset]);
  }
  
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


// Request reload on next update
void Logic::request_reload(void)
{
  reload_flag = true;
}
