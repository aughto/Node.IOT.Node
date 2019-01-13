/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Config.cpp

  The config file is stored as a list of single element JSON objects terminaded by new line chars
  This is done because there is not enough memory to load the entire project json object into memory
  
*/

#define MODULE_CONFIG

#include <Arduino.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>

#include "Utility.h"
#include "Config.h"
#include "Network.h"
#include "AWS.h"
#include "NMQTT.h"
#include "HTTP.h"
#include "Systems.h"



Config config;


Config::Config()
{
}


// Init
void Config::init()
{
  load_config(CONFIG_FILENAME);
  show();
}



// Get module name from key
bool get_module(const char *key, char *module, const unsigned int max)
{
  char *pch =  strchr(key, '_');
      
  if (!pch)
  {
    print_log(MODULE "Config key module not found (%s)\n", key);
    return true;
  }

  int pos = pch-key;
  
  if (pos > MODULE_NAME_MAX)
  {
    print_log(MODULE "Module name too long (%s)\n", key);
    return true;
  }
  
  memcpy(module, key, pos);
  module[pos] = 0;

  return false;
}

// Get key name from key
bool get_name(const char *key, char *name, const unsigned int max)
{
  char *pch =  strchr(key, '_');
      
  if (!pch)
  {
    print_log(MODULE "Config name not found (%s)\n", key);
    return true;
  }

  int len = strlen(key);
  int pos = pch-key+1;
  
  if (len - pos > CONFIG_NAME_MAX)
  {
    print_log(MODULE "Config key too long (%s)\n", key);
    return true;
  }
  
  memcpy(name, key+pos, len-pos);
  name[len-pos] = 0;

  return false;
}

// Parse config line and apply settings
bool Config::parse_line(char * line)
{
  print_log("Parsing line (%s)\n", line);

  DynamicJsonBuffer jsonBuffer(CONFIG_LINE_MAX);

  JsonObject &root = jsonBuffer.parseObject(line);

  if (!root.success())
  {
    Serial.println(F("Failed to parse config file"));
    return true;
  }


  const char* module = root["module"];

  if (module)
  {
    print_log("Module name: %s\n", module);

    // Route config entry to module that needs it
    // TODO Search a module list
    if (!strcmp(module, "systems")) systems.config(root);
  
  }  
      



  // Need to just extract key[0]
  for( const auto& kv : root  ) 
  {
      // portion of key before first "_" contains which module it applies to 
      // Extract module and key name
      char module[MODULE_NAME_MAX+1]; // Leave space for term
      char name[CONFIG_NAME_MAX+1];
      
      char *value = (char *)kv.value.as<char*>();

      if (get_module(kv.key, module, MODULE_NAME_MAX)) continue;
      if (get_name(kv.key, name, MODULE_NAME_MAX)) continue;

      //print_log(MODULE "Module: (%s) Name: (%s) Value: (%s)\n", module, name, value);

      // TODO Need to link in modules to get rid of this list
      if (!strcmp(module, "network")) network.set_config(name, value);
      if (!strcmp(module, "aws")) aws.set_config(name, value);
      if (!strcmp(module, "mqtt")) mqtt.set_config(name, value);
      if (!strcmp(module, "http")) http.set_config(name, value);
      //if (!strcmp(module, "system")) systems.set_config(name, value);
      
  }
 
}

// Read next line from file
bool get_next_line(File file, char * line, unsigned int LINE_MAX)
{
  unsigned int index = 0;
  
  while (file.available() && index < LINE_MAX - 1)
  {
    char ch = file.read();
   
    // Check for end of line
    if (ch == '\n')
    {
      line[index] = 0; // Null term
      return false;    // Done
    }

    line[index++] = ch;
  }
  
  return true;
}





// Load config file
bool Config::load_config(const char *filename)
{
  if (!filename)
  {
    print_log(MODULE "load_config: No filename\n");
    return true;
  }
  
  File file = SPIFFS.open(filename, FILE_READ);
    
  if(!file || file.isDirectory())
  {
      print_log(MODULE "Failed to open file config file (%s)\n", filename);
      return true;
  }

  print_log(MODULE "Loading Config %s\n", filename);

  //Serial.println("Read file:");
    
  /*while(file.available())
  {
    char ch = file.read();
    print_log("%c", ch);
  }*/

  char line[CONFIG_LINE_MAX];

  while(file.available())
  {
    if (!get_next_line(file, line, CONFIG_LINE_MAX))
      parse_line(line);
  }

 


  
  /*
  DynamicJsonBuffer jsonBuffer(1024);

  JsonObject &root = jsonBuffer.parseObject(file);

  if (!root.success())
  {
    Serial.println(F("Failed to parse config file"));
    
    //String s; // string not long enough, need to load to buffer
    //root.prettyPrintTo(s);
    //print_log("Json: %s\n", s.c_str());
    
    return true;
  }
*/


  // send config values to system objects 
  /*for( const auto& kv : root  ) 
  {
      // portion of key before first "_" contains which module it applies to 
      // Extract module and key name
      char module[MODULE_NAME_MAX+1]; // Leave space for term
      char name[CONFIG_NAME_MAX+1];
      char *value = (char *)kv.value.as<char*>();

      if (get_module(kv.key, module, MODULE_NAME_MAX)) continue;
      if (get_name(kv.key, name, MODULE_NAME_MAX)) continue;

//      print_log(MODULE "Module: (%s) Name: (%s) Value: (%s)\n", module, name, value);

      if (!strcmp(module, "network")) network.set_config(name, value);
      if (!strcmp(module, "aws")) aws.set_config(name, value);
      if (!strcmp(module, "mqtt")) mqtt.set_config(name, value);
      if (!strcmp(module, "http")) http.set_config(name, value);
      
      
      
  }*/

/*
    
  // Get config values
  for (int i = 0; parameters[i].name != NULL; i++)
  {
    char *name = parameters[i].name;

    print_log("Checking %s\n", name);

    if (!root.containsKey(name)) continue;

    print_log("Found %s\n", name);
    print_log("Value %s\n",  (const char *) root[name]);
    
    if (parameters[i].type == PARAM_STR)
    {
        strncpy((char*)parameters[i].value, (const char *) root[name], parameters[i].max);
    }

    if (parameters[i].type == PARAM_INT)
    {
      int *v = (int *)parameters[i].value;
      *v = atoi((const char *) root[name]);
    }
  }*/
  
  file.close();

  print_log(MODULE "Config Loaded\n");

  return false;
}























void Config::show()
{
  print_log(MODULE "Config Options\n");
  network.show_config();
  aws.show_config();
  mqtt.show_config();  
  http.show_config();  
  systems.show_config();  
  
}

void Config::update(unsigned long current)
{
  /*if (check_timeout(save_timeout, current))
  {
    print_log(MODULE "Config save failed");
    save_timeout = 0;
    config_file.close();
    //esp_restart(); // reboot to load new config
  }*/

}
