/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Utility.h
*/

#ifndef UTILITY_H
#define UTILITY_H

class String;

void print_log(const char *format, ...);
void print_log(const String &s);

void set_timeout(unsigned long &to, unsigned long t); 
bool check_timeout(unsigned long to, unsigned long current);


#endif
