/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: config.h
*/


#ifndef BCONFIG_H
#define BCONFIG_H

#define PROGRAM_NAME      "[IOTNode]   "
#define PROGRAM_VERSION   "0.1"
#define PROGRAM_COPYRIGHT "2019 Aughto Inc."


#define BOARD_Node_IOT_POWER
//#define BOARD_OLIMEX_ESP32_GATEWAY
//#define BOARD_NullNode


// [Internal To board]

#ifdef BOARD_Node_IOT_POWER

#define BUILD_STR "BOARD_Node_IOT_POWER"

#define UPDATE_PERIOD     0

//#define LED_1           2

// #define BOOT_PIN 14




// Ethernet 
#define ETH_CLK_MODE      ETH_CLOCK_GPIO17_OUT
#define ETH_POWER_PIN     -1
#define ETH_TYPE          ETH_PHY_LAN8720
#define ETH_ADDR          1
#define ETH_MDC_PIN       23
#define ETH_MDIO_PIN      18

// Inputs

#define BOOT_SW           4  
#define ETH_RESET         0

#define NUM_INPUTS        6
#define DINPUT_1          36
#define DINPUT_2          15
#define DINPUT_3          34
#define DINPUT_4          39
#define DINPUT_5          32
#define DINPUT_6          35


// Outputs
#define NUM_OUTPUTS       4
#define DOUTPUT_1         14
#define DOUTPUT_2         33
#define DOUTPUT_3         13
#define DOUTPUT_4         12
//#define DOUTPUT_5         16
//#define DOUTPUT_6         5
//#define DOUTPUT_7         2
//#define DOUTPUT_8         4

#define ENABLE_RTC
#define RTC_SDA           5
#define RTC_SCL           16


#endif

#ifdef BOARD_NullNode

#define BUILD_STR "BOARD_NullNode"


#define UPDATE_PERIOD     0
// Ethernet 
#define ETH_CLK_MODE      ETH_CLOCK_GPIO17_OUT
#define ETH_POWER_PIN     -1
#define ETH_TYPE          ETH_PHY_LAN8720
#define ETH_ADDR          1
#define ETH_MDC_PIN       23
#define ETH_MDIO_PIN      18

// Inputs
#define NUM_INPUTS        6
#define DINPUT_1          4
#define DINPUT_2          34
#define DINPUT_3          39
#define DINPUT_4          36
#define DINPUT_5          32
#define DINPUT_6          35


// Outputs
#define NUM_OUTPUTS       8
#define DOUTPUT_1         33
#define DOUTPUT_2         14
#define DOUTPUT_3         16
#define DOUTPUT_4         5
#define DOUTPUT_5         12
#define DOUTPUT_6         13
#define DOUTPUT_7         2
#define DOUTPUT_8         15
#endif

#ifdef BOARD_OLIMEX_ESP32_GATEWAY

#define BUILD_STR "BOARD_OLIMEX_ESP32_GATEWAY"

#define UPDATE_PERIOD     0

#define ETH_CLK_MODE      ETH_CLOCK_GPIO0_IN
#define ETH_POWER_PIN     -1
#define ETH_TYPE          ETH_PHY_LAN8720
#define ETH_ADDR          0
#define ETH_MDC_PIN       23
#define ETH_MDIO_PIN      18

// Inputs
#define NUM_INPUTS        6
#define DINPUT_1          4
#define DINPUT_2          34
#define DINPUT_3          39
#define DINPUT_4          36
#define DINPUT_5          32
#define DINPUT_6          35

// Outputs
#define NUM_OUTPUTS       8
#define DOUTPUT_1         33
#define DOUTPUT_2         14
#define DOUTPUT_3         16
#define DOUTPUT_4         5
#define DOUTPUT_5         12
#define DOUTPUT_6         13
#define DOUTPUT_7         2
#define DOUTPUT_8         15
#endif



// Config
#define MAINCONFIG_FILENAME "/mainconfig.txt"
#define IOCONFIG_FILENAME "/ioconfig.txt"
#define BYTECODE_FILENAME "/bytecode.txt"
#define LOGIC_FILENAME "/logic.txt"


#define CONFIG_NULL "Unset"

#define MODULE_NAME_MAX   48
#define CONFIG_NAME_MAX   32
#define CONFIG_TIMEOUT    10000

#define NETWORK_IP_MAX    16
#define NETWORK_SSID_MAX  64
#define NETWORK_PASS_MAX  128

#define CONFIG_CLIENT_MAX 64
#define CONFIG_HOST_MAX   128
#define CONFIG_TOPIC_MAX  128
#define CONFIG_USER_MAX   64
#define CONFIG_PASS_MAX   64

#define START_DELAY       3000


// Serial
#define SERIAL_LOG
#define PRINT_LOG_BUFFER  256
//#define SERIAL_BAUD       57600
#define SERIAL_BAUD       115200


// Network

#define IDENTIFY_TIMEOUT   10000   // Time to discover if ethernet is plugged in.

#define NET_EVENT_BUFF_SIZE 16
#define WAIT_DELAY        500
#define NETWORK_TIMEOUT   30000


#define NETWORK_SET_MAC
//#define NETWORK_MAC [0x30, 0xAE, 0xA4, 0x12, 0xBD, 0x82]


// Monitoring
#define REBOOT_TIMEOUT    1000
#define SECOND_PERIOD     1000
#define KEEPALIVE_PERIOD  100000
#define RSSI_PERIOD       100000    
//#define UPDATE_PERIOD     10      // Rate limit



// IO
#define IO_UPDATE_PERIOD  1000




#endif
