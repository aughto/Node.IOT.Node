/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Filesystem.h
*/

#ifndef FILESYSTEM_H
#define FILESYSTEM_H

#ifdef MODULE_FIELSYSTEM

#define MODULE "[FS]        "

#define FORMAT_SPIFFS_IF_FAILED true

#define FILE_NOTFOUND 1
#define FILE_ISDIR    2

#endif

#include <FS.h>

class Filesystem
{
 public:

  Filesystem();
  
  void init();

  void listDir( String dirname, uint8_t levels);
  void readFile( String path);

  int get_file(String  path, File &file);
  bool exists(String  path);
  
  //void update(unsigned long current);

 private:

};

extern Filesystem  filesystem;

#endif
