/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Network.h
*/


#ifndef NETWORK_H
#define NETWORK_H

#include <WIFI.h>

#include "config.h"

// Private
#ifdef MODULE_NETWORK

#define MODULE "[Network]   "

#endif



typedef enum {
    NET_NONE = 0,    
    NET_ETH,        
    NET_WIFI         
} network_type_t;


typedef enum 
{
  MODE_NONE,
  MODE_DISCOVER,
  MODE_WAITIP,
  MODE_CONNECTED,
  MODE_DISCONNECTED
} network_mode_t;



class FIFO;


class Network
{
 public:

  Network();
 
  void init();
  void update(unsigned long current);
  bool get_connected();
  long get_rssi();
  void second();

  // config interface
  bool set_config(const char *name, const char *value);
  char * get_config(const char *name);
  void show_config();

 private:

  void process_events();
  static void event(WiFiEvent_t event);

  void connect_ethernet();
  void connect_wifi();
  void connect(void);

  void network_connected();

  bool check_timeout(unsigned long current);
  void reset_timeout(unsigned long current);

  bool set_mac_address(uint8_t mac[6]);
  //bool set_mac_address(uint8_t m1, uint8_t m2, uint8_t m3, uint8_t m4, uint8_t m5, uint8_t m6);

  FIFO *event_fifo;//(NET_EVENT_BUFF_SIZE);

  network_type_t network_type; // Current network type
  network_mode_t network_mode; // Current network_mode

  bool connected;


  unsigned timeout_ticks;  // future tick value for network timeout

  // config

  bool dhcp_enabled;

  IPAddress ip, mask, gw, dns;
  /*char net_ip[NETWORK_IP_MAX+1];
  char net_mask[NETWORK_IP_MAX+1];
  char net_gw[NETWORK_IP_MAX+1];
  char net_dns[NETWORK_IP_MAX+1];*/

  char node_name[CONFIG_CLIENT_MAX+1];
  bool eth_enabled;
    
  bool wifi_enabled;
  bool wifi_dhcp_enabled;
  char wifi_ssid[NETWORK_SSID_MAX+1];
  char wifi_pass[NETWORK_PASS_MAX+1];

  
};

extern Network network;
extern WiFiClient net;

#endif
