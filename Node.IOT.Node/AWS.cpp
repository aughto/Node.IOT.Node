/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: Network.cpp

  TODO
  
*/


#define MODULE_AWS

#include <arduino.h>
#include <SPIFFS.h>
#include <WiFi.h>
#include <ETH.h>
#include <FS.h>
#include <AWS_IOT.h>


#include "Config.h"
#include "Utility.h"
#include "Network.h"
//#include "FIFO.h"
#include "AWS.h"

//Ticker NetworkCheck;

AWS aws;


// Declare an instance of the AWS IOT library
AWS_IOT aws_client;


//char HOST_ADDRESS[]="a2p05fa5qtxrjk-ats.iot.us-east-2.amazonaws.com";

//char CLIENT_ID[]= "Node1";
//char SUB_TOPIC[]= "$aws/things/Node1/update";
//char PUB_TOPIC[]= "$aws/things/Node1/shadow/update";

//char TOPIC_NAME[]= "$aws/things/TestThing/shadow/update";


/* 
  External 
*/


AWS::AWS()
{
  aws_mode = AWS_MODE_NONE;;
  
  certs_ok = false;

  set_timeout(pulse_timeout, millis() + 1000);

  //timeout_ticks = millis() + IDENTIFY_TIMEOUT;
  
  msgReceived = 0;


  enabled = false;
  strcpy(host, CONFIG_NULL);
  strcpy(client_id, CONFIG_NULL);
  strcpy(pub_topic, CONFIG_NULL);
  strcpy(sub_topic, CONFIG_NULL);
  

}


void AWS::init()
{
  if (!enabled) 
  {
    print_log(MODULE "AWS Not Enabled\n");
    return;
  }
  
  print_log(MODULE "Init\n");  

  load_certs();

   
  connect();

}







void AWS::update(unsigned long current) 
{

  if (!enabled) return;
  
  aws_client.update();

  process_events();


  if (aws_mode == AWS_MODE_CONNECTED)
    set_timeout(network_timeout, current + NETWORK_TIMEOUT);
  
  if (check_timeout(network_timeout, current) && aws_mode != AWS_MODE_CONNECTED)
  { 
    print_log(MODULE "AWS Timeout\n");

    aws_mode = AWS_MODE_CONNECTING;
    
    // reset timeout
   
    connect();
  }


  if (check_timeout(pulse_timeout, current))
  {
    if (!get_connected()) return;
    
    set_timeout(pulse_timeout, current + 30000);

    char value[512];
    int temp = random(50, 100);
    sprintf(value,"%d",temp);
 
    publish_value("Temperature1", value);
  }
 
}


void AWS::second()
{
 
  
  

/*  if (network_type == NET_WIFI)
  {
    print_log(MODULE "RSSI %d\n", get_rssi());
    print_log(MODULE "Mode: %d\n", WiFi.getMode());
    print_log(MODULE "Status: %d\n", WiFi.status());
  }*/
        
}


/* COnfig
 *  
 */


bool AWS::set_config(const char *name, const char *value)
{
  if (!strcmp(name, "enabled")) enabled = strcmp(value, "on") == 0;
  if (!strcmp(name, "client_id")) strncpy(client_id, value, CONFIG_CLIENT_MAX);
  if (!strcmp(name, "host")) strncpy(host, value, CONFIG_HOST_MAX);
  if (!strcmp(name, "pub_topic")) strncpy(pub_topic, value, CONFIG_HOST_MAX);
  if (!strcmp(name, "sub_topic")) strncpy(sub_topic, value, CONFIG_HOST_MAX);
}

void AWS::show_config()
{
  print_log(MODULE " Enabled: %d\n", enabled);
  print_log(MODULE " Client ID: %s\n", client_id);
  print_log(MODULE " Host: %s\n", host);
  print_log(MODULE " Pub Topic: %s\n", pub_topic);
  print_log(MODULE " Sub Topic: %s\n", sub_topic);
    
}







/* 
  Internal 
*/





void AWS::connect(void)
{
    aws_mode = AWS_MODE_CONNECTING;

    // Reset network timer
    set_timeout(network_timeout, millis() + 5000);
  
  /*if (!certs_ok)
  {
    print_log(MODULE "Certs not loaded\n");
    return;
  }*/
  
  // make sure network is up
  if (!network.get_connected())
  {
    set_timeout(network_timeout, millis() + 1000);
    return;
  }

 
  print_log(MODULE "Connecting to %s\n", host);


  if(aws_client.connect(host, client_id)== 0) 
  {
      print_log(MODULE "Connected to AWS\n");
      //connected = true;

      aws_mode = AWS_MODE_CONNECTED;
  }
  else 
  {
    print_log(MODULE "AWS connection failed\n");
    return;
  }

  delay(1000); // Why is this delaty needed?
  
  if(aws_client.subscribe(sub_topic,event) == 0)
  {
    print_log(MODULE "Subscribe Successfull\n");
  }
  else
  {
    print_log(MODULE "Subscribe Failed");
    return;
  }
}







int AWS::publish_value(const char *name, const char *value)
{
  if (!enabled) return true;
  
  if (aws_mode != AWS_MODE_CONNECTED) return true;
  
  // need to check sizes
  char payload[512];
  //char topic[512];
  
  if (strlen(value)>=sizeof(payload))
  {
    print_log(MODULE "publish_value: Value too long\n");
    return true;
  }

  /*if (strlen(value)>=sizeof(topic))
  {
    print_log(MODULE "publish_value: Topic too long\n");
    return true;
  }*/
    
  sprintf(payload,"{\"state\":{\"reported\":{\"%s\":\"%s\"}}}",name, value);
  //sprintf(topic, "$aws/things/%s/shadow/update", config.aws_client_id);

  print_log(MODULE "Topic: %s Payload: %s\n", pub_topic, payload);
  
  int rc = aws_client.publish(pub_topic, payload);
  
  if(rc != 0) 
  {
    print_log(MODULE "Message was not published (%d)\n", rc);
  }
  
  return false;
}



void AWS::payload_recv (char *topicName, int payloadLen, char *payLoad)
{
  if (payloadLen > sizeof(rcvdPayload))
  {
    print_log(MODULE "Payload too large (%d)\n", payloadLen);
    return;
  }

  strncpy(rcvdTopic,topicName,strlen(topicName)+1);
  strncpy(rcvdPayload,payLoad,payloadLen);
  rcvdPayload[payloadLen] = 0;
  msgReceived = 1;
}

void AWS::process_messages()
{
  if(msgReceived == 1)
    {
        msgReceived = 0;
        print_log(MODULE "Recv: %s %s\n", rcvdTopic, rcvdPayload);

      if (strcmp(rcvdPayload, "off") == 0)digitalWrite(DOUTPUT_1, 0);
      if (strcmp(rcvdPayload, "on") == 0)digitalWrite(DOUTPUT_1, 1);
    }
}


    




/* 
 * Event Engine 
 */


void AWS::event (char *topicName, int payloadLen, char *payLoad)
{
    aws.payload_recv(topicName, payloadLen, payLoad);
/*    strncpy(rcvdPayload,payLoad,payloadLen);
    rcvdPayload[payloadLen] = 0;
    msgReceived = 1;*/
}


// Callback, load event to buffer 
/*void Network::event(WiFiEvent_t event) 
{
  //print_log("Event: %d\n", event);

  if (network.event_fifo->push(event) == false)
  {
    print_log(MODULE "Event buffer full. Very Bad\n");
  }
}*/

void AWS::process_events()
{

  process_messages();
  
    

  
/*while (!event_fifo->empty())
{
  int event = event_fifo->pop();
  
  print_log(MODULE "Process Event: %d\n", event);
  
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

      
    default:
      print_log(MODULE "Unknown network event: %d\n", event);
      break;
  }
}
*/
  
}



/* 
 * End of Event Engine 
 */



bool AWS::load_file(const String path, char *buffer, int max, int &length)
{
  print_log(MODULE "Loading: %s\n", path.c_str());
  
  File file = SPIFFS.open(path, "r");
    
  if(!file || file.isDirectory())
  {
      print_log(MODULE " Failed to open file for reading");
      return true;
  }

  print_log(MODULE " Read from file:");
  
  while(file.available())
  {
    Serial.write(file.read());
  }

  return false;

}


bool AWS::load_certs()
{
  print_log(MODULE "Loading certs from flash\n");

  char tmp[2049];
  int loaded = 0;
  if (load_file("/certs/root.crt", tmp, sizeof(tmp), loaded))
  {
    print_log(MODULE "Unable to load root cert\n");
    return true;
  }

  return false;
}












/* 
 * Helper
 */


bool AWS::get_connected() 
{ 
  return aws_mode == AWS_MODE_CONNECTED; 
}
