/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: IO.cpp
*/

 
#include <arduino.h>

#include "config.h"
#include "Utility.h"
#include "IO.h"
#include "IOPorts.h"
#include "NMQTT.h"
#include "network.h"

#define MODULE "[IO]        "

IO io;

IO::IO()
{


  
}


void IO::init()
{
  inputs[0] = Input("Input1", DINPUT_1, false);
  inputs[1] = Input("Input2", DINPUT_2, false);
  inputs[2] = Input("Input3", DINPUT_3, false);
  inputs[3] = Input("Input4", DINPUT_4, false);
  inputs[4] = Input("Input5", DINPUT_5, false);
  inputs[5] = Input("Input6", DINPUT_6, false);
  
  #ifdef DOUTPUT_1
  outputs[0] = Output("Output1", DOUTPUT_1);
  #endif
  
  #ifdef DOUTPUT_2
  outputs[1] = Output("Output2", DOUTPUT_2);
  #endif
  
  #ifdef DOUTPUT_3
  outputs[2] = Output("Output3", DOUTPUT_3);
  #endif
  
  #ifdef DOUTPUT_4
  outputs[3] = Output("Output4", DOUTPUT_4);
  #endif

  #ifdef DOUTPUT_5
  outputs[4] = Output("Output5", DOUTPUT_5);
  #endif

  #ifdef DOUTPUT_6
  outputs[5] = Output("Output6", DOUTPUT_6);
  #endif
  
  #ifdef DOUTPUT_7
  outputs[6] = Output("Output7", DOUTPUT_7);
  #endif

  #ifdef DOUTPUT_8
  outputs[7] = Output("Output8", DOUTPUT_8);
  #endif 
  
}


bool IO::check_message(String topic, String payload)
{
  for (int i = 0; i < NUM_OUTPUTS; i++)
    if (outputs[i].check_msg(topic, payload)) return true;

  return false;
}

bool IO::check_setval(const String item, const String value)
{
  for (int i = 0; i < NUM_OUTPUTS; i++)
    if (outputs[i].check_setval(item, value)) return true;

  return false;
}

bool IO::check_getval(const String item, String &value)
{
  for (int i = 0; i < NUM_INPUTS; i++)
    if (inputs[i].check_getval(item, value)) return true;

  return false;
}





bool IO::get_value(unsigned index, unsigned char &value)
{
  // Inputs
  if (index < 64)
  {
    if (index >= NUM_INPUTS) return true;
    value = inputs[index].get_value();

  } else
  // Outputs
  if (index >= 64)
  {
    index -= 64;
    if (index >= NUM_OUTPUTS) return true;
    value = outputs[index].get_value();

  } 

  return false;
}

  
bool IO::set_value(unsigned index, unsigned char value)
{
  index -= 64;

   //print_log("Set index %d  val %d\n", index, value);


  if (index >= NUM_OUTPUTS) return true;

  outputs[index].set_value(value);

  return false;
}









bool IO::set_value(const char * item, const char * value)
{
  if (strlen(item) == 0)
  {
    print_log(MODULE "set_value: No item\n");
    return true;
  }  
  
  for (int i = 0; i < NUM_OUTPUTS; i++)
  {
    if (!strcmp(outputs[i].get_name(), item))
    {
     if (outputs[i].set_value(value))
     return true;
    }
  }
  
  return false;
}

  
void IO::update(unsigned long current)
{
  for (int i = 0; i < NUM_INPUTS; i++)
    inputs[i].update(current);

  for (int i = 0; i < NUM_OUTPUTS; i++)
    outputs[i].update(current);
}

void IO::send_current()
{
  
  for (int i = 0; i < NUM_INPUTS; i++)
    inputs[i].publish();

  for (int i = 0; i < NUM_OUTPUTS; i++)
    outputs[i].publish();
}
