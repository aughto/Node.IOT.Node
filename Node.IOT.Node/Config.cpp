/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: NMQTT.cpp
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


Config config;


Config::Config()
{


  //config_file = (File)NULL;
  file_loaded = false;

  
}



void Config::init()
{
  load(MAINCONFIG_FILENAME);
  load(IOCONFIG_FILENAME);
  
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


bool Config::load(const char *filename)
{
  if (!filename)
  {
    print_log(MODULE "Config load: No filename\n");
    return true;
  }
  
  print_log(MODULE "Loading Config %s\n", filename);

  File file = SPIFFS.open(filename, FILE_READ);
    
  if(!file || file.isDirectory())
  {
      print_log(MODULE " Failed to open file config file");
      return true;
  }

  DynamicJsonBuffer jsonBuffer(1024);

  JsonObject &root = jsonBuffer.parseObject(file);

  if (!root.success())
  {
    Serial.println(F("Failed to parse config file"));
    
    /*String s; // string not long enough, need to load to buffer
    root.prettyPrintTo(s);
    print_log("Json: %s\n", s.c_str());*/
    
    return true;
  }



  /* send config values to system objects */
  for( const auto& kv : root  ) 
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
      
      
      
  }

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


void Config::save_start(const char *filename)
{
  file_loaded = false;
  
  config_file = SPIFFS.open(filename, FILE_WRITE);
  
  if(!config_file)
  {
    Serial.println(MODULE "Failed to open file for writing");
    return;
  }

  set_timeout(save_timeout, millis() + CONFIG_TIMEOUT);

  file_loaded = true;
  
  print_log(MODULE "Save started for %s\n", filename);
}


void Config::save_chunk(const char *filename, uint8_t *data, size_t len)
{
  if (!file_loaded) return;
 
  if (!config_file.write(data, len))
  {
      print_log("Config write failed\n");
    
  }

  save_timeout = 0;
 
}

void Config::save_end(const char *filename)
{
  if (!file_loaded) return;

  config_file.close();
  
  print_log(MODULE "Save ended for %s\n", filename);

  print_log(MODULE "Rebooting in %d seconds\n", REBOOT_TIMEOUT/1000);

  file_loaded = false;
}



void Config::show()
{
  print_log(MODULE "Config Options\n");
  network.show_config();
  aws.show_config();
  mqtt.show_config();  
  http.show_config();  
}


void Config::update(unsigned long current)
{
  if (check_timeout(save_timeout, current))
  {
    print_log(MODULE "Config save failed");
    save_timeout = 0;
    config_file.close();
    //esp_restart(); // reboot to load new config
  }

}
