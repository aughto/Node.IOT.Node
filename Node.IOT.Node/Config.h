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
      
 private:

  bool load(const char * filename);
};


extern Config config;
#endif
