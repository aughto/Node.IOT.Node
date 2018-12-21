/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Filesystem.cpp
*/

#define MODULE_FIELSYSTEM

#include <Arduino.h>

#include <FS.h>
#include <SPIFFS.h>

#include "Config.h"
#include "Filesystem.h"
#include "Utility.h"


Filesystem filesystem;


Filesystem::Filesystem()
{

}

 
void Filesystem::init()
{
  print_log(MODULE "Mounting Filesystem\n");

  if(!SPIFFS.begin(FORMAT_SPIFFS_IF_FAILED))
  {
    print_log(MODULE "SPIFFS Mount Failed - Formatting\n");
    //return;
  }

  //print_log(MODULE "Files:\n");
  //listDir("/", 0);
}


void Filesystem::readFile(const String path)
{
    print_log(MODULE "Reading file: %s\n", path.c_str());
  
    File file = SPIFFS.open(path);
    
    if(!file || file.isDirectory())
    {
        print_log(MODULE " Failed to open file for reading");
        return;
    }

    print_log(MODULE " Read from file:");
    while(file.available())
    {
        Serial.write(file.read());
    }
}



void Filesystem::listDir(const String dirname, uint8_t levels)
{
    print_log(MODULE "Listing directory: %s\r\n", dirname.c_str());

    File root = SPIFFS.open(dirname);
    
    if(!root)
    {
        print_log(MODULE "- failed to open directory\n");
        return;
    }
    
    if(!root.isDirectory())
    {
        print_log(MODULE " - not a directory\n");
        return;
    }

    File file = root.openNextFile();
    
    while(file)
    {
        if(file.isDirectory())
        {
            print_log(MODULE "  DIR: %s\n", file.name());

            if(levels) listDir(file.name(), levels - 1);
        } 
        else 
        {
            print_log(MODULE "  File: %s Size: %d\n", file.name(), file.size());
        }
        file = root.openNextFile();
    }
}

int Filesystem::get_file(const String path, File &file)
{
  file = SPIFFS.open(path, "r");
    
  if (!file)
  {
    print_log(MODULE "- unable to open file(%s)\n", path.c_str());
    return FILE_NOTFOUND;
  }

  if (file.isDirectory())
  {
    print_log(MODULE "MODULE - file is a directory(%s)\n", path.c_str());
    return FILE_ISDIR;
  }

  return 0;
}

bool Filesystem::exists(const String path)
{
  bool yes = false;
  File file = SPIFFS.open(path, "r");
  if(!file.isDirectory()){
    yes = true;
  }
  file.close();
  return yes;
}


  
