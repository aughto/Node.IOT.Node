/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: IOT.cpp

  Handles all IOT messages
*/

#define MODULE_IOT
 
#include <arduino.h>
#include <ArduinoJson.h>

#include "Config.h"
#include "Hardware.h"
#include "Utility.h"
#include "IOT.h"
#include "IO.h"
#include "IOPorts.h"
#include "NMQTT.h"
#include "Logic.h"
#include "Network.h"
#include "HTTP.h"


IOT iot;

IOT::IOT()
{


  
}


void IOT::init()
{

  
}


  
void IOT::update(unsigned long current)
{
  
}

void IOT::send_message(const char *cmd, const char *item, const char *value)
{
  //print_log(MODULE "send_message (param): %s %s %s \n", cmd, item, value);

  #define TMP_MAX 256
  char tmp[TMP_MAX];
  
  if (strlen(cmd) + strlen(item) + strlen(value) + 20 > TMP_MAX)
  {
    print_log(MODULE "send_message too long\n");
    return;
  }

  sprintf(tmp, "{\"cmd\":\"%s\",\"item\":\"%s\",\"value\":\"%s\"}", cmd, item, value);

  http.send_message(tmp);



  
 
}



void IOT::send_variables()
{
  //print_log(MODULE "send_message (param): %s %s %s \n", cmd, item, value);

  #define TMP_MAX 256
  char tmp[TMP_MAX];
  
  /*if (strlen(cmd) + strlen(item) + strlen(value) + 20 > TMP_MAX)
  {
    print_log(MODULE "send_message too long\n");
    return;
  }*/


  char var_data[256];

  strcpy(var_data, "000102030405060708");
 

  sprintf(tmp, "{\"cmd\":\"getvars\",\"data\":\"%s\"}", var_data);

  http.send_message(tmp);
  
 
}




bool IOT::handle_message(const char *cmd, const char *item, const char *value)
{
  //print_log(MODULE "handle_message (param): %s %s %s \n", cmd, item, value);

  if (!strcmp(cmd, "getvars"))
  {
    send_variables();
    
  } else

  if (!strcmp(cmd, "set"))
  {
    if (item == NULL)
    {
      print_log(MODULE "Item not present");
      return true;
    }

    if (value == NULL)
    {
      print_log(MODULE "Value not present");
      return true;
    }

    //print_log("Command: %s\n", cmd);
    //print_log("Item: %s\n", item);
    //print_log("Value: %s\n", value);
  

    if (io.set_value(item, value))
      return true;
    
    //io.handle_message(cmd, item, value);
  } else 


   if (!strcmp(cmd, "setvar"))
  {
    if (item == NULL)
    {
      print_log(MODULE "Item not present");
      return true;
    }

    if (value == NULL)
    {
      print_log(MODULE "Value not present");
      return true;
    }

    //print_log("Command: %s\n", cmd);
    //print_log("Item: %s\n", item);
    //print_log("Value: %s\n", value);

    unsigned int var_offset = atoi(item);
    unsigned int var_value = atoi(value);

    logic.set_value(var_offset, var_value);


    if (io.set_value(item, value))
      return true;
    
    //io.handle_message(cmd, item, value);
  }


  return false;
  
}


bool IOT::handle_message(uint8_t* data)
{
  //print_log(MODULE "handle_message (raw): %s\n", data);
  
  DynamicJsonBuffer jsonBuffer;

  char *cmd = NULL;
  char *item = NULL;
  char *value = NULL;
  
  JsonObject& root = jsonBuffer.parseObject((const char*)data);
  if (root.success()) 
  {
    if (root.containsKey("cmd"))  cmd = (char *)root["cmd"].asString();
    if (root.containsKey("item")) item = (char *)root["item"].asString();
    if (root.containsKey("value"))  value = (char *)root["value"].asString();        
  } 
  else
    return true;

  if (!handle_message(cmd, item, value))
  {
    // Send back to clients
      hardware.toggle_led();
      http.send_message((char *)data);
      return false;
  }
  
  return true;
}


void IOT::send_current()
{
  io.send_current();
}




  
