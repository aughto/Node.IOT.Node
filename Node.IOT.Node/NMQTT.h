/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: NMQTT.cpp
*/


#ifndef NMQTT_H
#define NMQTT_H

#include <arduino.h>
#include <WiFi.h>
#include <MQTT.h>


// todo fix
#define root_name         "iomodules/"


class NMQTT
{
 public:

  NMQTT();

  void init();
  void update(unsigned long current);
  
  void publish(String topic, String payload);
  void publish(String topic, String payload, bool retained, int QOS);

  bool set_config(const char *name, const char *value);
  void show_config();

 private:

  //Config
  bool enabled;
  char client_id[CONFIG_CLIENT_MAX+1];
  char user[CONFIG_USER_MAX+1];
  char pass[CONFIG_PASS_MAX+1];
  char host[CONFIG_HOST_MAX+1];
  char pub_topic[CONFIG_TOPIC_MAX+1];
  char sub_topic[CONFIG_TOPIC_MAX+1];


  MQTTClient client;
};


extern NMQTT mqtt;
#endif
