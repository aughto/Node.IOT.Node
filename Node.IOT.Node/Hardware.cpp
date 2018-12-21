/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Hardware.cpp
*/
#include  <Arduino.h>
#include <Wire.h>  
#include "esp_system.h"
#include "esp_spi_flash.h"
#include "RTClib.h"       

#include "BoardConfig.h"
#include "Hardware.h"
#include "Utility.h"
#include "io.h"


#define MODULE "[Hardware]  "

Hardware hardware;

RTC_DS3231 rtc;


Hardware::Hardware()
{
  restart_timeout = 0;
  boot_mode = 0;
  scantime = 0;
}


void Hardware::init()
{
    Serial.begin(SERIAL_BAUD);

    print_log("\n\n\n\n"PROGRAM_NAME "Version " PROGRAM_VERSION "\n");
    print_log(PROGRAM_NAME "Copyright " PROGRAM_COPYRIGHT "\n");
    
    esp_chip_info_t chip_info;
    esp_chip_info(&chip_info);
    
    print_log(PROGRAM_NAME "ESP32 %d CPU cores\n",chip_info.cores);

    print_log(PROGRAM_NAME "WiFi%s%s\n",
            (chip_info.features & CHIP_FEATURE_BT) ? "/BT" : "",
            (chip_info.features & CHIP_FEATURE_BLE) ? "/BLE" : "");

    print_log(PROGRAM_NAME "Silicon revision %d \n", chip_info.revision);

    print_log(PROGRAM_NAME "Flash: %dMB %s\n", spi_flash_get_chip_size() / (1024 * 1024),
            (chip_info.features & CHIP_FEATURE_EMB_FLASH) ? "embedded" : "external");

   // Need to set IO port directions


  // check boot mode
  pinMode(BOOT_SW, INPUT);
  boot_mode = digitalRead(BOOT_SW);
  


  /*#ifdef ETH_RESET
  digitalWrite(ETH_RESET, 0);
  pinMode(ETH_RESET, OUTPUT);
  #endif*/



  #ifdef LED_1
  digitalWrite(LED_1, 1);
  pinMode(LED_1, OUTPUT);
  #endif

  // Configure Inputs
  #ifdef DINPUT_1
  set_mode(DINPUT_1, INPUT_PULLUP);
  #endif

  #ifdef DINPUT_2
  set_mode(DINPUT_2, INPUT_PULLUP);
  #endif

  #ifdef DINPUT_3
  set_mode(DINPUT_3, INPUT_PULLUP);
  #endif

  #ifdef DINPUT_4
  set_mode(DINPUT_4, INPUT_PULLUP);
  #endif

  #ifdef DINPUT_5
  set_mode(DINPUT_5, INPUT_PULLUP);
  #endif

  #ifdef DINPUT_6
  set_mode(DINPUT_6, INPUT_PULLUP);
  #endif

  #ifdef DINPUT_7
  set_mode(DINPUT_7, INPUT_PULLUP);
  #endif

  #ifdef DINPUT_8
  set_mode(DINPUT_8, INPUT_PULLUP);
  #endif


  // Configure Outputs
  #ifdef DOUTPUT_1
  set_mode(DOUTPUT_1, OUTPUT);
  #endif

  #ifdef DOUTPUT_2
  set_mode(DOUTPUT_2, OUTPUT);
  #endif
  
  #ifdef DOUTPUT_3
  set_mode(DOUTPUT_3, OUTPUT);
  #endif
  
  #ifdef DOUTPUT_4
  set_mode(DOUTPUT_4, OUTPUT);
  #endif
  
  #ifdef DOUTPUT_5
  set_mode(DOUTPUT_5, OUTPUT);
  #endif
  
  #ifdef DOUTPUT_6
  set_mode(DOUTPUT_6, OUTPUT);
  #endif
  
  #ifdef DOUTPUT_7
  set_mode(DOUTPUT_7, OUTPUT);
  #endif
  
  #ifdef DOUTPUT_8
  set_mode(DOUTPUT_8, OUTPUT);
  #endif
  

  #ifdef ENABLE_RTC
  init_rtc();
  #endif

  
  print_log(MODULE "Start Delay...");
  
  delay(START_DELAY);

  set_timeout(second_timeout, millis() + 1000);
}


void Hardware::set_mode(int p, int v)
{
   pinMode(p, v);
}

void Hardware::set_pin(int p, bool v)
{
  digitalWrite(p, v);
}

void Hardware::set_led(bool v)
{
  #ifdef LED_1
  digitalWrite(LED_1, v);
  #endif
}


void Hardware::toggle_led()
{
  #ifdef LED_1
  toggle(LED_1);
  #endif
  
/*  toggle(DOUTPUT_1);
  toggle(DOUTPUT_2);
  toggle(DOUTPUT_3);
  toggle(DOUTPUT_4);
  toggle(DOUTPUT_5);
  toggle(DOUTPUT_6);
  toggle(DOUTPUT_7);
  toggle(DOUTPUT_8);*/
}


void Hardware::toggle(int port)
{
  
  if(digitalRead(port))
    digitalWrite(port, 0);
  else
    digitalWrite(port, 1);
  

}


void Hardware::ResetPHY(void)
{
    pinMode(ETH_RESET, OUTPUT);
   
    digitalWrite(ETH_RESET, 1);
    delay(1000);
    
    digitalWrite(ETH_RESET, 0);
    delay(50);
    
    digitalWrite(ETH_RESET, 1);
    delay(1000);
}


void Hardware::DisablePHY(void)
{
    /*pinMode(ETH_RESET, OUTPUT);
   
    digitalWrite(ETH_RESET, 0);*/
}




void Hardware::show_stats()
{
  print_log(PROGRAM_NAME "System Stats\n");

  print_log(PROGRAM_NAME "  Free Heap: %d\n", ESP.getFreeHeap());
  print_log(PROGRAM_NAME "  Stack Size: %d\n", uxTaskGetStackHighWaterMark(NULL) * 4);

  print_log(PROGRAM_NAME "  Scan Time: %d\n", scantime);
  
}

void Hardware::set_scantime(unsigned long s)
{
  scantime = s;
}



void Hardware::update(unsigned long current)
{

static int m = 0;
    
  if (check_timeout(second_timeout, current))
  {
    set_timeout(second_timeout, current + 1000);
    toggle_led();

    update_time();

    //show_time();

    //digitalWrite(ETH_RESET, m & 1);


    //io.set_value("Output1", (m & 1) ? "0" : "1");
    //io.set_value("Output2", (m & 2) ? "0" : "1");
    

    m++;

    




  }

  
  if (check_timeout(restart_timeout, current))
  {
    print_log(MODULE "Restarting\n");
    esp_restart(); // reboot to load new config
  }

  hardware.set_scantime((long)(millis() - current));

  // Perform rate limit here
  while ( (long)( millis() - (current + UPDATE_PERIOD)) < 0) delay(1);
}


void Hardware::restart()
{
  restart_timeout = millis() + REBOOT_TIMEOUT;
}




#ifdef ENABLE_RTC
void Hardware::init_rtc()
{
  //return;
  
  print_log(MODULE "RTC Init\n");

  // Init I2C
  Wire.begin(RTC_SDA, RTC_SCL);

  if (rtc.begin()) 
  {
    print_log(MODULE "RTC Init OK\n");
  }else
  {
    print_log(MODULE "Unable to init RTC\n");
  }

  if (rtc.lostPower()) 
  {
    Serial.println(MODULE "RTC lost power, Setting Time");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // rtc.adjust(DateTime(2014, 1, 21, 3, 0, 0));
  }
  
  update_time();
  
}
#endif



void Hardware::update_time()
{
  //return;
  
  //print_log(MODULE "RTC Update Time\n");

  DateTime now = rtc.now();

  cur_year = now.year();
  cur_month = now.month();
  cur_day = now.day();

  cur_hour = now.hour();
  cur_min = now.minute();
  cur_sec = now.second();

}

void Hardware::set_time(uint16_t _year, uint8_t _month, uint8_t _day, uint8_t _hour, uint8_t _min, uint8_t _sec )
{
  //return;
  
  print_log(MODULE "RTC Set Time \n");
    
  rtc.adjust(DateTime(_year, _month, _day, _hour, _min, _sec));
}

void Hardware::get_time(uint16_t &_year, uint8_t &_month, uint8_t &_day, uint8_t &_hour, uint8_t &_min, uint8_t &_sec )
{
  //return;
  
  _year = cur_year;
  _month = cur_month;
  _day = cur_day;
  
  _hour = cur_hour;
  _min = cur_min;
  _sec = cur_sec;


  
/*    
    Serial.print(now.year(), DEC);
    Serial.print('/');
    Serial.print(now.month(), DEC);
    Serial.print('/');
    Serial.print(now.day(), DEC);
    Serial.print(" (");
    //Serial.print(daysOfTheWeek[now.dayOfTheWeek()]);
    Serial.print(") ");
    Serial.print(now.hour(), DEC);
    Serial.print(':');
    Serial.print(now.minute(), DEC);
    Serial.print(':');
    Serial.print(now.second(), DEC);
    Serial.println();
    
    Serial.print(" since midnight 1/1/1970 = ");
    Serial.print(now.unixtime());
    Serial.print("s = ");
    Serial.print(now.unixtime() / 86400L);
    Serial.println("d");
    
    // calculate a date which is 7 days and 30 seconds into the future
    DateTime future (now + TimeSpan(7,12,30,6));
    
    Serial.print(" now + 7d + 30s: ");
    Serial.print(future.year(), DEC);
    Serial.print('/');
    Serial.print(future.month(), DEC);
    Serial.print('/');
    Serial.print(future.day(), DEC);
    Serial.print(' ');
    Serial.print(future.hour(), DEC);
    Serial.print(':');
    Serial.print(future.minute(), DEC);
    Serial.print(':');
    Serial.print(future.second(), DEC);
    Serial.println();
   
  Serial.println();*/
}



void Hardware::show_time()
{
  //return;
  
  print_log(MODULE " Time: %d/%d/%d  %d:%d:%d\n", cur_month, cur_day, cur_year, cur_hour, cur_min, cur_sec);
}
