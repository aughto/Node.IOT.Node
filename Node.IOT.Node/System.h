/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Config.h
*/


#ifndef SYSTEM_H
#define SYSTEM_H

#ifdef MODULE_SYSTEM
#define MODULE "[System]    "
#endif

//#include "asyncHTTPrequest.h"

#include "AsyncTCP.h"

class System
{
 public:
  System(const char * name, const char * ip);

  bool init(void);
  void show(void);

  void update(unsigned long current);

  void set_next(System * n) { next = n; };
  System * get_next(void) { return next; };

 private:

  void create_client();

  void http_request(unsigned long current);
  void check_request();
  
  void onError(void * arg, AsyncClient * client, int error);
  void onConnect(void * arg, AsyncClient * client);
  void onDisconnect(void * arg, AsyncClient * c);
  void onTimeout(void* arg, AsyncClient * c, uint32_t time);
  
  void onData(void * arg, AsyncClient * c, void * data, size_t len);

  void check_connection();
  
  char * name;
  char * ip;

  unsigned long last_update;

//  asyncHTTPrequest request;

  AsyncClient * aClient;
  AsyncClient * cur_client;
  
  System * next; // Next in linked list

  unsigned long start_time;
bool connected ;
bool connecting ;

  bool pending;
  
  
};

#endif
