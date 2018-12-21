/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com
*/

#include <arduino.h>

#include "Config.h"
#include "Utility.h"
#include "Watchdog.h"
#include "Network.h"
#include "NMQTT.h"
#include "Hardware.h"
#include "Logic.h"



#define MODULE "[Watchdog]  "

Watchdog watchdog;

Watchdog::Watchdog()
{

  
}

void Watchdog::init()
{
  last_keepalive = 0;
  last_rssi = 0;
  updates = 0;
}

 
 
void Watchdog::update(unsigned long current) 
{
  update_rssi(current);
  update_keepalive(current);
  update_second(current);
  
  updates++;
}



void Watchdog::update_rssi(unsigned long current)
{
  
  if (current - last_rssi > RSSI_PERIOD) 
  {
    long rssi = network.get_rssi();
    
   // print_log("RSSI: %d\n", rssi);

    char buffer[100];
    sprintf(buffer, "%d", rssi);
    //mqtt.publish("iomodules/rssi", buffer);
    
    last_rssi = millis();
  }
}

void Watchdog::update_keepalive(unsigned long current)
{
  
  if (current - last_keepalive > KEEPALIVE_PERIOD) 
  {
    //client.publish("iomodules/pulse", "board1");

    mqtt.publish("iomodules/pulse", "board1");

    last_keepalive= millis();

  }
}


void Watchdog::update_second(unsigned long current)
{
  if (current - last_second > SECOND_PERIOD) 
  {
    //client.publish("iomodules/pulse", "board1");

    //print_log("Update Rate: %d\n", updates);

    print_log("Logic Update Rate: %d\n", logic.get_updates());


    //hardware.show_stats();


    updates = 0;

    //mqtt.publish("iomodules/pulse", "board1");

    last_second = millis();

    network.second();
    
  }
}
