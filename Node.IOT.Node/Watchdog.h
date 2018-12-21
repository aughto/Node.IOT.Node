
#ifndef WATCHDOG_H
#define WATCHDOG_H

class Watchdog
{
 public:

  Watchdog();

  void init();
  
  void update(unsigned long current);

 private:

  void update_rssi(unsigned long current);
  void update_keepalive(unsigned long current);
  void update_second(unsigned long current);

  unsigned long last_keepalive;
  unsigned long last_rssi;
  unsigned long last_second;
  
  unsigned long updates;

};

extern Watchdog watchdog;

#endif
