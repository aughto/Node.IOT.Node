/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Node.IOT.Node.ino
*/

#define MODULE_MQTTNODE

#include <Arduino.h>

#include "MQTTNode.h"
#include "Hardware.h"
#include "Utility.h"
#include "Config.h"
#include "IO.h"
#include "Network.h"
#include "NMQTT.h"
#include "AWS.h"
#include "HTTP.h"
#include "Watchdog.h"
#include "Filesystem.h"
#include "Logic.h"
#include "IOT.h"


/*typedef struct 
{
  void (*init)(void);
  void (*update)(unsigned long t);
}module_type;

#define MAX_MODULES 16

module_type modules[MAX_MODULES];
*/


void setup() 
{
  // Constructors should be all heap allocation to prevent fragmentation
 
 
  hardware.init();
  filesystem.init();
  config.init();
  io.init();
  network.init();
  mqtt.init();
  aws.init();
  http.init();
  iot.init();
  watchdog.init();
  logic.init();

  print_log(MODULE "Startup Complete.\n\n");
  hardware.show_stats();
}

void loop() 
{
  unsigned long current = millis();
  
  config.update(current);
  watchdog.update(current);
  network.update(current);
  mqtt.update(current);
  aws.update(current);
  http.update(current);
  io.update(current);

  // Node need to split input and output updates
  logic.update(current);
  
  iot.update(current);
  iot.update(current);
  hardware.update(current);
}
