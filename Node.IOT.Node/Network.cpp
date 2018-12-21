/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Network.cpp

  TODO
  need to support PHY on olimex board.  
  will need board selection
  auto detect eth

  
*/

/* 
 *  Process Event: 13
[Network]     Unknown network event: 13
Process Event: 13
[Network]     Unknown network event: 13
Process Event: 0
Process Event: 14
[Network]     Unknown network event: 14
Process Event: 4

 *  30:AE:A4:12:BD:84
*/


#define MODULE_NETWORK

#include <arduino.h>
#include <WiFi.h>
#include <ETH.h>
#include <ESPmDNS.h>

#include "Config.h"
#include "Utility.h"
#include "FIFO.h"
#include "Network.h"
#include "Hardware.h"


WiFiClient net;

Network network;





/* 
  External 
*/






Network::Network()
{
  network_type = NET_NONE;

  network_mode = MODE_NONE;

  connected = false;

  // Config Options
  strcpy(node_name, CONFIG_NULL);
  dhcp_enabled = false;
  eth_enabled = false;
  wifi_enabled = false;
  strcpy(wifi_ssid, CONFIG_NULL);
  strcpy(wifi_pass, CONFIG_NULL);
  

  timeout_ticks = millis() + NETWORK_TIMEOUT;
  
  event_fifo = new FIFO(NET_EVENT_BUFF_SIZE);

  WiFi.onEvent(event);

  
}


void Network::init()
{
  print_log(MODULE "Init\n");  

  if (wifi_enabled && eth_enabled)
  {
    print_log(MODULE "Cannot have both wifi and ethernet enabled. Defaulting to Ethernet\n");
    wifi_enabled = false;
  }

    
  if (wifi_enabled) print_log(MODULE "Wifi Enabled\n");
  if (eth_enabled)  print_log(MODULE "Ethernet Enabled\n");




//bool Network::set_mac_address(uint8_t m1, uint8_t m2, uint8_t m3, uint8_t m4, uint8_t m5, uint8_t m6)

#ifdef NETWORK_SET_MAC
  uint8_t tmp[6] = {0x30, 0xAE, 0xA4, 0x12, 0xBD, 0x82};
  set_mac_address(tmp);
#endif
  
  
  connect();

  /*if (MDNS.begin(NODE_MAME)) 
  {
    print_log(MODULE "MDNS responder started\n");
  }*/

}



bool Network::set_config(const char *name, const char *value)
{
  if (!strcmp(name, "node_name"))         strncpy(node_name, value, CONFIG_CLIENT_MAX);

  if (!strcmp(name, "dhcp_enabled"))      dhcp_enabled = strcmp(value, "on") == 0;
  if (!strcmp(name, "ip"))                ip.fromString(value);
  if (!strcmp(name, "mask"))              mask.fromString(value);
  if (!strcmp(name, "gw"))                gw.fromString(value);
  if (!strcmp(name, "dns"))               dns.fromString(value);
  if (!strcmp(name, "eth_enabled"))       eth_enabled = strcmp(value, "on") == 0;
  if (!strcmp(name, "wifi_enabled"))      wifi_enabled = strcmp(value, "on") == 0;
  if (!strcmp(name, "wifi_dhcp_enabled")) wifi_dhcp_enabled = strcmp(value, "on") == 0;
  if (!strcmp(name, "wifi_ssid"))         strncpy(wifi_ssid, value, NETWORK_SSID_MAX);
  if (!strcmp(name, "wifi_pass"))         strncpy(wifi_pass, value, NETWORK_PASS_MAX);

  
  return false;
}

/*char * Network::get_config(const char *name)
{
  print_log(MODULE "Getting config %s\n", name);


  return NULL;
}
*/



void Network::show_config()
{
  print_log(MODULE " Node Name:  %s\n", node_name);
  print_log(MODULE " DHCP: %d\n", dhcp_enabled);
  print_log(MODULE " IP:   %s\n", ip.toString().c_str());
  print_log(MODULE " MASK: %s\n", mask.toString().c_str());
  print_log(MODULE " GW:   %s\n", gw.toString().c_str());
  print_log(MODULE " DNS:  %s\n", dns.toString().c_str());
  print_log(MODULE " Eth Enabled: %d\n", eth_enabled);
  print_log(MODULE " Wifi Enabled: %d\n", wifi_enabled);
  print_log(MODULE " Wifi SSID: %s\n", wifi_ssid);
  print_log(MODULE " Wifi Pass: %s\n", wifi_pass);

  
}














void Network::reset_timeout(unsigned long current) 
{
  timeout_ticks = current + NETWORK_TIMEOUT;
}

bool Network::check_timeout(unsigned long current) 
{

  // Check for roll over
  return  (long)( millis() - timeout_ticks) > 0 ;

//  return current > timeout_ticks;
}




void Network::update(unsigned long current) 
{

  process_events();

  if (connected)
    reset_timeout(current);
      
  if (check_timeout(current))
  { 
    print_log(MODULE "Network Timeout\n");
    
    // reset timeout
    reset_timeout(current);
    
    connect();
  }
 
  // Check for reconnect
  if (connected == false)
  {

    
    /*if (millis() - last_link_attempt > NETWORK_TIMEOUT) 
    {
      print_log("Trying reconnect\n");
            
      Serial.print("WIFI status = ");
      WiFi.status()

      int m = WiFi.getMode();
      if (m == WIFI_AP) print_log("WIFI_AP\n");
      if (m == WIFI_STA) print_log("WIFI_STA\n");
      if (m == WIFI_AP_STA) print_log("WIFI_AP_STA\n");
      if (m == WIFI_OFF) print_log("WIFI_OFF\n");

      

      
      connect();
    }*/
  }
 
}


void Network::second()
{

/*  if (network_type == NET_WIFI)
  {
    print_log(MODULE "RSSI %d\n", get_rssi());
    print_log(MODULE "Mode: %d\n", WiFi.getMode());
    print_log(MODULE "Status: %d\n", WiFi.status());
  }*/
        
}














/* 
  Internal 
*/





void Network::connect(void)
{

  // override network settings if boot sw on
  if (hardware.get_bootmode())
  {
    print_log(MODULE "Using default boot config\n");

    eth_enabled = true;
    wifi_enabled = false;
    dhcp_enabled = false;
    ip.fromString("10.0.0.200");
    mask.fromString("255.255.255.0");
    gw.fromString("10.0.0.1");
    dns.fromString("10.0.0.1");
  }

  if (eth_enabled == false && wifi_enabled == false)
  {
      print_log(MODULE "Connect: No Network Connection Configured\n");
      return;
  }
  
  /*if (network_mode == MODE_NONE)
  {
    print_log(MODULE "Discovering Network Connection %d\n", network_type);

    network_mode = MODE_DISCOVER;
  }


  /if (network_mode == MODE_DISCOVER)
  {
    // First call or after wifi attempt
    if ((network_type == NET_NONE || network_type == NET_WIFI) && eth_enabled)
      network_type = NET_ETH;
    else
      network_type = NET_WIFI;
  }*/

  // Select network type
  if(eth_enabled) network_type = NET_ETH;
  if(wifi_enabled) network_type = NET_WIFI;
  
    print_log(MODULE "Connecting Network %d\n", network_type);

  if (network_type == NET_ETH) connect_ethernet(); else
  if (network_type == NET_WIFI) connect_wifi(); else
  {
    print_log(MODULE "Connect: No network type selected\n");  
  }
}




void Network::connect_ethernet()
{
  // Try Ethernet 

  if (eth_enabled == false)
  {
      //print_log("Ethernet Not Enabled\n");
      return;
  }

    print_log(MODULE "Connecting to Ethernet network\n");


  // Turn off Wifi
  WiFi.disconnect(true, true);

  
  ETH.begin(ETH_ADDR, ETH_POWER_PIN, ETH_MDC_PIN, ETH_MDIO_PIN, ETH_TYPE, ETH_CLK_MODE);

  hardware.ResetPHY();


  if (!dhcp_enabled)ETH.config(ip, gw, mask, dns);
  
}

  
// Try wifi
void Network::connect_wifi()
{
  if (wifi_enabled == false)
  {
      //print_log("Wifi Not Enabled");
      return;
  }

  print_log(MODULE "Connecting to WiFi network\n");
  
  // Turn off Wifi
  //ETH.disconnect(true, true);
  //WiFi.disconnect(true, true);
  //delay(1000);
  
  WiFi.mode(WIFI_STA);
  delay(1000);

   hardware.DisablePHY();

  
  WiFi.begin(wifi_ssid, wifi_pass);

  if (!dhcp_enabled) WiFi.config(ip, gw, mask, dns);


  WiFi.setAutoReconnect(true);
  WiFi.setAutoConnect(true);
   
  delay(1000);
}


void Network::network_connected()
{
  print_log(MODULE "Connected\n");
  
  if (network_type == NET_WIFI)
  {
    print_log(MODULE "Wifi IP Assigned\n");

    print_log(MODULE " Wifi MAC:     " + WiFi.macAddress() + "\n");
    print_log(MODULE " Wifi IP:      " + WiFi.localIP().toString() + "\n");
    print_log(MODULE " Wifi SN:      " + WiFi.subnetMask().toString() + "\n");
    print_log(MODULE " Wifi GW:      " + WiFi.gatewayIP().toString() + "\n");
    print_log(MODULE " Wifi DNS:     " + WiFi.dnsIP(0).toString() + "\n");
    print_log(MODULE " Wifi DNS:     " + WiFi.dnsIP(1).toString() + "\n");
      
  }

  if (network_type == NET_ETH)
  {
    print_log(MODULE "ETH IP Assigned\n");
      
    if (ETH.fullDuplex()) 
      print_log(MODULE " Link : Full Duplex\n");
    else
      print_log(MODULE " Link : Half Duplex\n");
            
    print_log(MODULE " Speed: %dMbps\n", ETH.linkSpeed());
      
    print_log(MODULE " Ethernet MAC: " + ETH.macAddress() + "\n");
    print_log(MODULE " Ethernet IP:  " + ETH.localIP().toString() + "\n");
    print_log(MODULE " Ethernet SN:  " + ETH.subnetMask().toString() + "\n");
    print_log(MODULE " Ethernet GW:  " + ETH.gatewayIP().toString() + "\n");
    print_log(MODULE " Ethernet DNS: " + ETH.dnsIP(0).toString() + "\n");
    print_log(MODULE " Ethernet DNS: " + ETH.dnsIP(1).toString() + "\n");
  }

     
  connected = true;
}






/* 
 * Event Engine 
 */

// Callback, load event to buffer 
void Network::event(WiFiEvent_t event) 
{
  //print_log("Event: %d\n", event);

  if (network.event_fifo->push(event) == false)
  {
    print_log(MODULE "Event buffer full. Very Bad\n");
  }
}

/*
      SYSTEM_EVENT_WIFI_READY = 0,         ESP32 WiFi ready 
    SYSTEM_EVENT_SCAN_DONE,                ESP32 finish scanning AP 
    SYSTEM_EVENT_STA_START,                ESP32 station start 
    SYSTEM_EVENT_STA_STOP,                 ESP32 station stop 
    SYSTEM_EVENT_STA_CONNECTED,            ESP32 station connected to AP 
    SYSTEM_EVENT_STA_DISCONNECTED,         ESP32 station disconnected from AP 
    SYSTEM_EVENT_STA_AUTHMODE_CHANGE,      the auth mode of AP connected by ESP32 station changed 
    SYSTEM_EVENT_STA_GOT_IP,               ESP32 station got IP from connected AP 
    SYSTEM_EVENT_STA_LOST_IP,              ESP32 station lost IP and the IP is reset to 0 
    SYSTEM_EVENT_STA_WPS_ER_SUCCESS,       ESP32 station wps succeeds in enrollee mode 
    SYSTEM_EVENT_STA_WPS_ER_FAILED,        ESP32 station wps fails in enrollee mode 
    SYSTEM_EVENT_STA_WPS_ER_TIMEOUT,       ESP32 station wps timeout in enrollee mode 
    SYSTEM_EVENT_STA_WPS_ER_PIN,           ESP32 station wps pin code in enrollee mode 
    SYSTEM_EVENT_AP_START,                 ESP32 soft-AP start 
    SYSTEM_EVENT_AP_STOP,                  ESP32 soft-AP stop 
    SYSTEM_EVENT_AP_STACONNECTED,          a station connected to ESP32 soft-AP 
    SYSTEM_EVENT_AP_STADISCONNECTED,       a station disconnected from ESP32 soft-AP 
    SYSTEM_EVENT_AP_STAIPASSIGNED,         ESP32 soft-AP assign an IP to a connected station 
    SYSTEM_EVENT_AP_PROBEREQRECVED,        Receive probe request packet in soft-AP interface 
    SYSTEM_EVENT_GOT_IP6,                  ESP32 station or ap or ethernet interface v6IP addr is preferred 
    SYSTEM_EVENT_ETH_START,                ESP32 ethernet start 
    SYSTEM_EVENT_ETH_STOP,                 ESP32 ethernet stop 
    SYSTEM_EVENT_ETH_CONNECTED,            ESP32 ethernet phy link up 
    SYSTEM_EVENT_ETH_DISCONNECTED,         ESP32 ethernet phy link down 
    SYSTEM_EVENT_ETH_GOT_IP,               ESP32 ethernet got IP from connected AP 
 */



void Network::process_events()
{
  
while (!event_fifo->empty())
{
  int event = event_fifo->pop();
  
  //print_log(MODULE "Process Event: %d\n", event);
  
  switch (event) 
  {
    // Ignore Wifi Ready
    case SYSTEM_EVENT_WIFI_READY:
      break;

    // Ethrenet Events
    case SYSTEM_EVENT_ETH_START:
      //print_log(MODULE "\nETH Started\n");
      ETH.setHostname("esp32-ethernet");
      break;

    case SYSTEM_EVENT_ETH_STOP:
      print_log(MODULE "ETH Stopped\n");
      connected = false;
      //eth_connected = false;
      break;
      
    case SYSTEM_EVENT_ETH_CONNECTED:
      print_log(MODULE "ETH Connected\n");
      //hardware.set_led(1);
      break;
      
    case SYSTEM_EVENT_ETH_DISCONNECTED:
      print_log(MODULE "ETH Disconnected\n");
      connected = false;
      //hardware.set_led(0);
      //eth_connected = false;
      break;

     
    case SYSTEM_EVENT_ETH_GOT_IP:
      network_type = NET_ETH;
      network.network_connected();
      break;
     

    // Wifi Events

    case SYSTEM_EVENT_STA_START:
      //print_log(MODULE "Wifi Started\n");
      WiFi.setHostname("esp32-ethernet");
      break;

      case SYSTEM_EVENT_STA_STOP:
      print_log(MODULE "Wifi Stopped\n");
      connected = false;
      break;
      
    case SYSTEM_EVENT_STA_CONNECTED:
      print_log(MODULE "Wifi Connected\n");
      break;

    case SYSTEM_EVENT_STA_DISCONNECTED:
      print_log(MODULE "Wifi Disconnected\n");
      connected = false;
    break;

    case SYSTEM_EVENT_STA_GOT_IP:
      print_log(MODULE "Wifi Got IP\n");
      network_type = NET_WIFI;
      network.network_connected();
      break;

    case SYSTEM_EVENT_STA_LOST_IP:
      network_type = NET_NONE;
      connected = false;
      break;
      
    default:
      print_log(MODULE "Unknown network event: %d\n", event);
      break;
  }
}

  
}


/* 
 * End of Event Engine 
 */



/* 
 * Helper
 */


//bool Network::set_mac_address(uint8_t m1, uint8_t m2, uint8_t m3, uint8_t m4, uint8_t m5, uint8_t m6)
bool Network::set_mac_address(uint8_t mac[6])
{ 
//  uint8_t new_mac[8] = {m1,m2, m3, m4, m5, m6};
  
  esp_base_mac_addr_set(mac);
}

bool Network::get_connected() 
{ 
  return connected; 
}

long Network::get_rssi() 
{ 
  return WiFi.RSSI(); 
};


























 /*
  * Serial.begin(115200);
WiFi.disconnect(true);
delay(3000);

//DO NOT TOUCH
    //  This is here to force the ESP32 to reset the WiFi and initialise correctly.
 //   Serial.print("WIFI status = ");
  //  Serial.println(WiFi.getMode());
  // WiFi.disconnect(true);
   // delay(3000);
   // WiFi.mode(WIFI_STA);
   // delay(1000);
    //Serial.print("WIFI status = ");
    //Serial.println(WiFi.getMode());
    // End silly stuff !!!
  *  //   Serial.print("WIFI status = ");
  //  Serial.println(WiFi.getMode());

  
  */
 
