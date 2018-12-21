/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Config.h
*/


#ifndef Config_H
#define Config_H

#ifdef MODULE_CONFIG
#define MODULE "[Config]    "
#endif

#include <SPIFFS.h>

#include "BoardConfig.h"

class Config
{
 public:

  Config();

  void init();
  void show();
  bool save();

  void update(unsigned long current);
    
  void save_start(const char *filename);
  void save_chunk(const char *filename, uint8_t *data, size_t len);
  void save_end(const char *filename);
  
 private:

  bool load(const char * filename);

  bool file_loaded; // need to move into config file
  File config_file;
  
  unsigned long save_timeout;
};


extern Config config;
#endif
