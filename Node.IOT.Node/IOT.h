/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: IO.h
*/

#ifndef IOT_H
#define IOT_H

#ifdef MODULE_IOT
#define MODULE "[IOT]       "
#endif


class IOT
{
 public:

  IOT();
  
  void init();
  void update(unsigned long current);

  void send_message(const char *cmd, const char *item, const char *value);

  bool handle_message(const char *cmd, const char *item, const char *value); // Generic
  bool handle_message(uint8_t* data); // From websockets

  bool ping_message();
  void send_variables();

  void send_current();

  private:
  bool getvars_flag;
};

extern IOT iot;

#endif
