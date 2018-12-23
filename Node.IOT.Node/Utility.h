/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Utility.h
*/

#ifndef UTILITY_H
#define UTILITY_H

#include <SPIFFS.h>

class String;

void print_log(const char *format, ...);
void print_log(const String &s);

void set_timeout(unsigned long &to, unsigned long t); 
bool check_timeout(unsigned long to, unsigned long current);


bool read_hex4(File &file, unsigned char &v);
bool read_hex8(File &file, unsigned char &v);
bool read_hex16(File &file, unsigned int &v);
bool read_hex32(File &file, unsigned long &v);



#endif
