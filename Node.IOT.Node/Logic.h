/* 
  Node.IOT
 
  (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Logic.h
*/

#ifndef LOGIC_H
#define LOGIC_H

#define MAX_BYTECODE  32768
#define VARIABLE_MAX  1024
#define CRSTACK_MAX   256
#define ORSTACK_MAX   256


// CPU Instructions

#define INST_NONE     0x00
#define INST_CLEAR    0x10 
#define INST_PUSHCR   0x11 
#define INST_POPCR    0x12
#define INST_PUSHOR   0x13 
#define INST_COLLECT  0x14 
#define INST_XIO      0x30
#define INST_XIC      0x31
#define INST_OTE      0x40 
#define INST_OTL      0x41 
#define INST_OTU      0x42 
#define INST_TMR      0x80


class Logic
{
 public:

  Logic();
  
  void init();
  void save();
  void load();
  

  void update(unsigned long current);


  bool load_bytecode(const char *filename);

  void savebytecode_start(const char *filename);
  void savebytecode_chunk(const char *filename, uint8_t *data, size_t len);
  void savebytecode_end(const char *filename);
  
  void show_disassembly();
  void decode_next_inst(unsigned int &i, bool newline);
  void show_memory(char * title );

  void solve_logic(unsigned long dt);

  unsigned char get_value(unsigned int i);
  void set_value(unsigned int i, unsigned char v);

  unsigned int get_updates() { unsigned int v = updates; updates = 0; return v; };
  

 private:

  bool file_loaded; // need to move into config file
  File bytecode_file;

  unsigned long save_timeout;

  unsigned char *bytecode;
  unsigned long bytecode_size;
  
  unsigned char *variables;
  unsigned char *cr_stack;
  unsigned char *or_stack;

  unsigned int cr_ptr;
  unsigned int or_ptr;

  unsigned int updates;
};


extern Logic logic;

#endif
