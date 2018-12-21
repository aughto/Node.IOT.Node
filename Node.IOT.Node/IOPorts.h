/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: IOPorts.h
*/

#ifndef IOPORTS_H
#define IOPORTS_H


#include <arduino.h>

#include "NMQTT.h"

#ifdef MODULE_IOPORTS
#define MODULE "[IOPorts]   "
#endif


class Input
{
 public:
  
  unsigned long last_update;
  bool state;
  byte pin;
  String name;
  bool inverted;
  Input ();

  Input (String _name, byte _pin, bool inverted);

  bool check_getval(const String &item, String &value);

  bool get_value() { return state; };

  void update(unsigned long current);
  void publish();

  bool state_changed;
};

class Output
{
 public:
  
  unsigned long last_update;
  byte state;
  byte next_state;
  byte pin;
  String name;

  Output ();
  Output (String _name, byte _pin);
  void update(unsigned long current);

  const char * get_name() { return (const char*) name.c_str(); };

  void set(byte s);

  bool check_msg(const String &topic, const String &payload);
  bool check_setval(const String &item, const String &value);
  
  bool set_value(const char * value);
  bool set_value(unsigned char value);
  bool get_value();

  void publish();
  
};


#endif
