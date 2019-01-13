/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Config.h
*/


#ifndef SYSTEMS_H
#define SYSTEMS_H

#ifdef MODULE_SYSTEMS
#define MODULE "[Systems]   "
#endif


#include <ArduinoJson.h>
#include "System.h"

class Systems
{
 public:

  Systems();

  void init();
  void show();
  bool save();

  void show_config();

  void update(unsigned long current);


  bool add_system(const char * name, const char * ip);

  bool config(JsonObject &root);
      
 private:

  System * system_list; // Link list of systems
};

extern Systems systems;
#endif
