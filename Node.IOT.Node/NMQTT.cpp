/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: NMQTT.cpp
*/


#include  <Arduino.h>
#include  <MQTT.h>
#include  <WiFi.h>

#include "Config.h"
#include "Utility.h"
#include "Network.h"
#include "MQTTNode.h"
#include "NMQTT.h"
#include "IOPorts.h"
#include "IO.h"

#define MODULE "[NMQTT]     "



NMQTT mqtt;


NMQTT::NMQTT()
{

  enabled = false;
  strcpy(client_id, CONFIG_NULL);
  strcpy(user, CONFIG_NULL);
  strcpy(pass, CONFIG_NULL);
  strcpy(host, CONFIG_NULL);
  strcpy(pub_topic, CONFIG_NULL);
  strcpy(sub_topic, CONFIG_NULL);
}




void messageReceived(String &topic, String &payload) 
{
  //Serial.println("incoming: " + topic + " - " + payload);

  io.check_message(topic, payload);
}

void  NMQTT::init()
{
  if (!enabled) return;
  
  //Serial.print("Connecting to MQTT...");
  
  //while (!

  
  //{
//    Serial.print(".");
    //delay(1000);
  //}

  //Serial.println("\nconnected");

}


bool last_client_connected = false;
bool last_net_connected = false;


void NMQTT::update(unsigned long current)
{
  if (!enabled) return;

 // Need to replace with on event
  if (last_net_connected != network.get_connected())
  {
    last_net_connected = network.get_connected();
    
    // New connection
    if (network.get_connected())
    {
      print_log(MODULE "Network Connected\n");

      client.begin(host, net);
      client.onMessage(messageReceived);
     
      client.connect(client_id, user, pass);
      
    }
  }


  // Need to replace with on event
  if (last_client_connected != client.connected())
  {
    last_client_connected = client.connected();

    // New connection
    if (client.connected())
    {
      print_log(MODULE "Connected\n");

      client.subscribe("iomodules/#");
      io.send_current();
      
    }

  }


  if (client.connected())
  {
    client.loop();
  }


}


bool NMQTT::set_config(const char *name, const char *value)
{
  if (!strcmp(name, "enabled")) enabled = strcmp(value, "on") == 0;
  if (!strcmp(name, "client_id")) strncpy(client_id, value, CONFIG_CLIENT_MAX);
  if (!strcmp(name, "user")) strncpy(user, value, CONFIG_USER_MAX);
  if (!strcmp(name, "pass")) strncpy(pass, value, CONFIG_PASS_MAX);
  if (!strcmp(name, "host")) strncpy(host, value, CONFIG_HOST_MAX);
  if (!strcmp(name, "broker")) strncpy(host, value, CONFIG_HOST_MAX);
  if (!strcmp(name, "pub_topic")) strncpy(pub_topic, value, CONFIG_HOST_MAX);
  if (!strcmp(name, "sub_topic")) strncpy(sub_topic, value, CONFIG_HOST_MAX);
}

void NMQTT::show_config()
{
  print_log(MODULE " Enabled: %d\n", enabled);
  print_log(MODULE " Client ID: %s\n", client_id);
  print_log(MODULE " Username: %s\n", user);
  print_log(MODULE " Password: %s\n", pass);
  print_log(MODULE " Host: %s\n", host);
  print_log(MODULE " Pub Topic: %s\n", pub_topic);
  print_log(MODULE " Sub Topic: %s\n", sub_topic);
    
}















void NMQTT::publish(String topic, String payload)
{
  if (!network.get_connected()) return;

  if (!client.connected()) return;


  client.publish(root_name + topic, payload);
}


void NMQTT::publish(String topic, String payload, bool retained, int QOS)
{
   if (!client.connected()) return;
    
  client.publish(topic, payload,retained, QOS);
}
