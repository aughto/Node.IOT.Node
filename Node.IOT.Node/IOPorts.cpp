/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: IOPorts.cpp
*/

#define MODULE_IOPORTS

#include <MQTT.h>

#include "Config.h"
#include "Utility.h"
#include "IOPorts.h"
#include "AWS.h"
#include "MQTT.h"
#include "IOT.h"


Input::Input(void)
{
  state_changed = false;
}


Input::Input(String _name, byte _pin, bool _inverted)
{
  last_update =0;
  state = 0;
  pin = _pin;
  inverted = _inverted;
  name = _name;
  pinMode(pin,INPUT);
}

void Input::update(unsigned long current)
{
  bool cur_state =  (digitalRead(pin) == HIGH) ^ inverted;

  if (state != cur_state) state_changed = true;

  if (!state_changed) return;

  state_changed = true;

  state = cur_state;                      // Save current

  // Rate Limit Publish
  if (current - last_update < IO_UPDATE_PERIOD)
  {
    return;
  }
  else
  {
    last_update = current;                  // Save Last udpate time
    publish();
    state_changed = false;                // Reset state changed 
  }

  
}


bool Input::check_getval(const String &item, String &value)
{
  if (item != name) return false;

  value = state ? "1" : "0";
  
  return true;
}

  
  
void Input::publish()
{
  String v = state ? "1" : "0";           // Create update string
  String topic = root_name + name;

print_log(MODULE "Publish " + topic + " " + v + "\n");

  mqtt.publish(topic, v, true, 2); 
      
  aws.publish_value(name.c_str(), v.c_str());

  iot.send_message("set", name.c_str(), v.c_str());
    
  /*Serial.print(MODUtopic);
  Serial.print("  ");
  Serial.println(v);*/
}



Output::Output (void) 
{
}

Output::Output (String _name, byte _pin)
{
  last_update =0;
  state = 0;
  next_state = 0;
  pin = _pin;
  name = _name;
  pinMode(pin,OUTPUT);
  digitalWrite(pin, 0);
}

void Output::update(unsigned long current)
{
  // Only update on stagte change
  if (state == next_state) return;

  // Rate limit
  if (current - last_update < IO_UPDATE_PERIOD) return;

  state = next_state;

  String topic = root_name + name;
  
  print_log(MODULE + topic + "  " + state + "\n");

  publish();
  
  last_update = current;
  digitalWrite(pin, state);
}

  
void Output::set(byte s)
{
  next_state = s;
}


bool Output::check_msg(const String &topic, const String &payload)
{
  if (topic != root_name + name) return false;
      
  if (payload.length() == 0) return false;
        
  set(payload[0] == '1' ? HIGH : LOW);

  return true;
}

bool Output::check_setval(const String &item, const String &value)
{
  if (item != name) return false;
  if (value.length() == 0) return false;

  set(value[0] == '1' ? HIGH : LOW);

  return true;
}


bool Output::set_value(const char * value)
{
  //print_log(MODULE "Output set value %s %s\n", name.c_str(), value);
  
  if (strlen(value) == 0) 
  {
    print_log(MODULE "set_value: No value\n");
    return true;
  }  

  set(value[0] == '1' ? HIGH : LOW);

  return false;
}

bool Output::set_value(unsigned char value)
{
  //print_log(MODULE "Output set value %d\n", value);
    
  set(value ? HIGH : LOW);

  return false;
}


bool Output::get_value()
{
  return state;
}

    
void Output::publish()
{
  String v = state ? "1" : "0";           // Create update string
  String topic = name;

  mqtt.publish(topic, v, true, 2); 

  aws.publish_value(name.c_str(), v.c_str());

  iot.send_message("set", name.c_str(), v.c_str());
      
  print_log(MODULE + topic + "  " + v + "\n");
  
}
