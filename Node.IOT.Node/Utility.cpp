#include <Arduino.h>

#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "esp_task_wdt.h"

#include "Config.h"
#include "Utility.h"


//#define USE_MUTEX


#ifdef USE_MUTEX
portMUX_TYPE mmux = portMUX_INITIALIZER_UNLOCKED;
#endif


void print_log(const char *format, ...)
{
#ifdef SERIAL_LOG

  #ifdef USE_MUTEX
  taskENTER_CRITICAL(&mmux);
  #endif

  char buf[PRINT_LOG_BUFFER];
  va_list ap;
  va_start(ap, format);
  vsnprintf(buf, sizeof(buf), format, ap);
  for(char *p = &buf[0]; *p; p++) 
  {
    // Expand
    if(*p == '\n')
      Serial.write('\r');
    Serial.write(*p);
  }
  va_end(ap);
  
  #ifdef USE_MUTEX
  taskEXIT_CRITICAL(&mmux);
  #endif

  #endif
}


void print_log(const String &s)
{
  print_log(s.c_str());
}


// Timeout
// 0 is use to check for disabled

void set_timeout(unsigned long &to, unsigned long t) 
{
  // Just in case timeout was set at rollover
  if (to == 0) to = 1;
  
  to = t;
}

bool check_timeout(unsigned long to, unsigned long current) 
{
  if (to == 0) return false;
  
  // Check for roll over
  return  (long)(current - to) > 0 ;

//  return current > timeout_ticks;
}



/* File IO */


// Read next 1 digit hex number from file
bool read_hex4(File &file, unsigned char &v)
{
    if (!file.available()) return true;
  
    unsigned char c = file.read();

    if (c >= 'a') v = c - 'a' + 10;  else    // Small A is largest 
    if (c >= 'A') v = c - 'A' + 10;  else  // Large A is next
      v = c - '0';    // Digits are lowest

    return false;
}



// Read next 2 digit hex number from file
bool read_hex8(File &file, unsigned char &v)
{
  unsigned char b1, b2;

  if (read_hex4(file, b1)) return true;
  if (read_hex4(file, b2)) return true;

  v = (b1 << 4) + b2;
    
  return false;
}


// Read next 4 digit hex number from file
bool read_hex16(File &file, unsigned int &v)
{
    unsigned char b1, b2;

    if (read_hex8(file, b1)) return true;
    if (read_hex8(file, b2)) return true;

    v = (b1 << 8) + b2;

    return false;
}


// Read next 8 digit hex number from file
bool read_hex32(File &file, unsigned long &v)
{
    unsigned int b1, b2;

    if (read_hex16(file, b1)) return true;
    if (read_hex16(file, b2)) return true;

    v = (b1 << 16) + b2;

    return false;
}







   
