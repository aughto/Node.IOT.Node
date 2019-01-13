/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Config.cpp

  The config file is stored as a list of single element JSON objects terminaded by new line chars
  This is done because there is not enough memory to load the entire project json object into memory
  
*/

#define MODULE_SYSTEMS

#include <Arduino.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>



#include "asyncHTTPrequest.h"

#include "AsyncTCP.h"

#include "Utility.h"
#include "Config.h"
#include "System.h"
#include "Systems.h"
#include "Network.h"
#include "AWS.h"
#include "NMQTT.h"
#include "HTTP.h"


Systems systems;


Systems::Systems()
{
  system_list = NULL;

}



// Init
void Systems::init()
{
  //load_config(CONFIG_FILENAME);
  show();
}

void Systems::show_config()
{
  print_log(MODULE "System List\n");

  printf(MODULE "Name        IP");

  System *s = system_list;

  while(s)
  {
    s->show();
    s = s->get_next();
  }
}



// deal with config json object
bool Systems::config(JsonObject &root)
{
  print_log(MODULE "Loading config entry\n");
  
  const char* cmd= root["cmd"];  

  // See if a command was passed
  if (cmd)
  {
    // Add a system
    if (!strcmp(cmd, "add"))
    {
      add_system(root["name"], root["ip"]);
    }
    
  }else
  {
    // Parse remaining
  
 
  }


  return false;
}


bool Systems::add_system(const char * name, const char * ip)
{
    if (!name)
    {
      print_log(MODULE "Add: No Name\n");
      return true;
    }

    if (!ip)
    {
      print_log(MODULE "Add: No IP\n");
      return true;
    }

    print_log("New system (%s) at (%s)\n", name, ip);

    /*if (cur_system >= num_systems)
    {
      print_log("Too many systems. Max: %d\n", num_systems);

      return true;
    }*/

    System* s = new System(name, ip);
    
    // Insert into linked list at front
    s->set_next(system_list);
    system_list = s;
}



/*bool Systems::set_config(const char *name, const char *value)
{
  print_log("Systems set config %s %s\n", name, value);
  
  if (!strcmp(name, "count")) 
  {
    num_systems = atoi(value); 

    get_system_memory();
  
  }

  print_log("Num systems %d\n", num_systems);

}
*/







/*bool Systems::get_system_memory()
{
  // Free system memory, TODO, need to free items in list also
  if (system_list != NULL) free(system_list);
  
  system_list = (System*) malloc(sizeof(System) * num_systems);

  if (system_list == NULL)
  {
    print_log(MODULE "Unable to get system memory\n");
    return true;
  }

  return false;
}*/




void Systems::show()
{
  print_log(MODULE "Systems\n");
}

void Systems::update(unsigned long current)
{
  System *s = system_list;

  while(s)
  {
    s->update(current);
    s = s->get_next();
  }

  
  /*if (check_timeout(save_timeout, current))
  {
    print_log(MODULE "Config save failed");
    save_timeout = 0;
    config_file.close();
    //esp_restart(); // reboot to load new config
  }*/

}






 
