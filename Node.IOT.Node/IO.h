/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: IO.h
*/

#ifndef IO_H
#define IO_H

#include <arduino.h>
#include "IOPorts.h"

class IO
{
 public:

  IO();
  

  void init();

  bool check_message(String topic, String payload);
  bool check_setval(const String item, const String value);
  bool check_getval(const String item, String &value);

  bool set_value(const char * item, const char * value);

  bool get_value(unsigned index, unsigned char &value);
  bool set_value(unsigned index, unsigned char value);
  
  
  void update(unsigned long current);

  void send_current();


  Input inputs[NUM_INPUTS];
  Output outputs[NUM_OUTPUTS];


};

extern IO io;


#endif
