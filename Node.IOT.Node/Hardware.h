/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Hardware.h
*/


#ifndef HARDWARE_H
#define HARDWARE_H

#include "BoardConfig.h"

class Hardware
{
 public:

  Hardware();

  void init();
  void show_stats();

  void set_scantime(unsigned long s);
  void ratelimit(unsigned long s);
  void update(unsigned long current);
  
  void set_mode(int p, int v);
  void set_pin(int p, bool v);

  void set_led(bool v);
  void toggle_led();
  void toggle(int port);
  
  void restart();


  void DisablePHY();
  void EnablePHY();
  
  void ResetPHY();
  
  bool get_bootmode() { return boot_mode; };

  unsigned long second_timeout;

  unsigned long restart_timeout;

  void get_time(uint16_t &_year, uint8_t &_month, uint8_t &_day, uint8_t &_hour, uint8_t &_min, uint8_t &_sec );
  void set_time(uint16_t _year, uint8_t _month, uint8_t _day, uint8_t _hour, uint8_t _min, uint8_t _sec );
  void show_time();
  
 private:

  void init_rtc();
  void update_time();
 
  bool boot_mode;
  unsigned long scantime;
 
  uint16_t cur_year;
  uint8_t cur_month;
  uint8_t cur_day;

  uint8_t cur_hour;
  uint8_t cur_min;
  uint8_t cur_sec;
  
};

extern Hardware hardware;
#endif
