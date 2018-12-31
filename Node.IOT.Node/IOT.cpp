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
  getvars_flag = false;

  
}


void IOT::init()
{

  
}


  
void IOT::update(unsigned long current)
{
    
    // Only send data during update between cpu scans
    if (getvars_flag)
    {
      send_variables();
      getvars_flag = false;
    }

  
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

char get_hex(unsigned char v)
{
  if (v > 9) 
    return v - 10 + 'A';
  else
    return v + '0';
}


void IOT::send_variables()
{
  //print_log(MODULE "send_message (param): %s %s %s \n", cmd, item, value);

  /*if (strlen(cmd) + strlen(item) + strlen(value) + 20 > TMP_MAX)
  {
    print_log(MODULE "send_message too long\n");
    return;
  }*/

  // will need to reserve some memory on logic load to store the list

  unsigned int size = logic.get_variables_size();

  char tmp[size * 2 + 1 + 50];    // Return string also needs header
  char var_char[size * 2 + 1];    // HEX varaible string
 
  unsigned int index = 0;
  
  for (int i = 0; i < size; i++)
  {
    unsigned char v = logic.get_byte(i);

    var_char[index++] = get_hex(v>>4);
    var_char[index++] = get_hex(v&0x0f);
  }    

  var_char[index] = 0; // Null terminate 
  
  sprintf(tmp, "{\"cmd\":\"getvars\",\"data\":\"%s\"}", var_char);

  //print_log("msg: %s\n", tmp);

  http.send_message(tmp);
}


bool IOT::ping_message()
{
  char tmp[256];

  sprintf(tmp, "{\"cmd\":\"ping\"}");

  //print_log("msg: %s\n", tmp);

  http.send_message(tmp);
}



bool IOT::handle_message(const char *cmd, const char *item, const char *value)
{
  //print_log(MODULE "handle_message (param): %s %s %s \n", cmd, item, value);


  if (!strcmp(cmd, "ping"))
  {
    ping_message();
  } else
  if (!strcmp(cmd, "getvars"))
  {
    getvars_flag = true;
    //send_variables();
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
  

    if (io.set_byte(item, value))
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

    logic.set_byte(var_offset, var_value);


    if (io.set_byte(item, value))
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
    if (root.containsKey("cmd"))   cmd = (char *)root["cmd"].asString();
    if (root.containsKey("item"))  item = (char *)root["item"].asString();
    if (root.containsKey("value")) value = (char *)root["value"].asString();        
  } 
  else
    return true;

  if (handle_message(cmd, item, value))
  {
    print_log("Problem with WS message %s %s %s\n", cmd, item, value);
    

    
    /*// Send back to clients
      hardware.toggle_led();
      http.send_message((char *)data);
      return false;*/
  }
  
  return true;
}


void IOT::send_current()
{
  //io.send_current();
}




  
