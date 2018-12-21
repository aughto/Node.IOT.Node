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


   
