/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: System.h
  
*/

#define MODULE_SYSTEM

#include <Arduino.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>

//#include "asyncHTTPrequest.h"

#include "System.h"

#include "AsyncTCP.h"
#include "Utility.h"
#include "Config.h"
#include "Network.h"


System::System(const char * _name, const char * _ip)
{
  aClient = NULL;
  cur_client = NULL;
  
  connected = false;
  connecting = false;
  
  last_update = 0;
  pending = false;
  
  //request = NULL;
  next = NULL;

  name = (char *) malloc(strlen(_name) + 1);
  strcpy(name, _name);

  ip = (char *) malloc(strlen(_ip) + 1);
  strcpy(ip, _ip);

  create_client();

}

bool System::init()
{
  //request = new asyncHTTPrequest();
  
  
  
  return false;
}


void System::show()
{
  print_log(MODULE  "%s   %s \n", name, ip);
}


void System::update(unsigned long current)
{
  check_request();
 
  unsigned long dt = current - last_update; 

  if(millis() < 15000) return;


  if (dt > 100)
  {
    //print_log("system update\n");
    last_update = current;

    //print_log(MODULE "%d  Heap: %d\n", dt, ESP.getFreeHeap());

    check_connection();
    
    unsigned long s = millis();
    http_request(current);
    //print_log("Request time: %d\n", millis() - s);


    
  }
  
  /*if (check_timeout(save_timeout, current))
  {
    print_log(MODULE "Config save failed");
    save_timeout = 0;
    config_file.close();
    //esp_restart(); // reboot to load new config
  }*/

}


void System::check_connection()
{
 // Do not send request if disconnected
  if (!network.get_connected()) return;

  if (connected) return;
  if (connecting) return;

  
  if (aClient == NULL)
  {
    print_log(MODULE "No client for request\n");

    return;
  }



  
    //char host[] = "10.0.0.100";
  //char host[] = "10.0.0.101";
  
  int port = 81;
    if(!aClient->connect(ip, port))
  {
      Serial.println(MODULE "Connect Fail");
      pending = 0;
      
      /*AsyncClient * client = aClient;
      aClient = NULL;
       delete client;*/
       return;
    }
    //print_log("Connect time %d\n", millis() - s);


  connecting = true;

  
}











void System::create_client()
{
  /*if(aClient)//client already exists
  {
    print_log("Client exists\n");
    delete aClient;

    aClient = NULL;
    
    //return;
  }*/

  if (aClient == NULL)
  {
    aClient = new AsyncClient();
  }
  
  if(!aClient)//could not allocate client
  {
    print_log("Could not allocate\n");
    return;
  }
  
  aClient->setRxTimeout(5);
  aClient->setNoDelay(true);

  aClient->onError([&](void * arg, AsyncClient * client, int error) { onError(arg, client, error); }, NULL);
  aClient->onConnect([&](void * arg, AsyncClient * client) { onConnect(arg, client); }, NULL);
  aClient->onTimeout([&](void* arg, AsyncClient * c, uint32_t time) { onTimeout(arg, c, time); }, NULL);
  aClient->onDisconnect([&](void * arg, AsyncClient * c){onDisconnect(arg, c);}, NULL);
  aClient->onData([&](void * arg, AsyncClient * c, void * data, size_t len){ onData(arg, c, data, len); }, NULL);
}


void System::onError(void * arg, AsyncClient * client, int error)
{
   //  aClient->onError([&](void * arg, AsyncClient * client, int error){
   print_log("Connect error: %d\n", error);

  connected = false;
  connecting = false;
  
  if (cur_client)
    cur_client->close();

  
  pending = 0;
  //client->close();
   
   // aClient = NULL;
    //delete client;
  //}, NULL);
  //}

}



void System::onConnect(void * arg, AsyncClient * client)
{

  cur_client = client;

  connected = true;
  connecting = false;
  
  

  
}

void System::onDisconnect(void * arg, AsyncClient * client)
{
  //Serial.println("Disconnected");
  pending = 0;

connected = false;

//  client->close();

//print_log("disconnect complete %d\n", millis() - start_time);
//  aClient = NULL;
 
  //delete client;
}

void System::onTimeout(void* arg, AsyncClient * client, uint32_t time) 
{
  
  //client.onTimeout([](void* arg, AsyncClient * c, uint32_t time) {
    Serial.printf("Timeout\n\n");
  client->close();
    pending = 0;
    connected = false;
 // });

}
  

void System::onData(void * arg, AsyncClient * c, void * data, size_t len)
{
  //print_log(MODULE "New Data (%d)\n", len);

  uint8_t * d = (uint8_t*)data;

  //d[len] = 0; // Todo is there space for this null? 

  Serial.printf(MODULE "RX (");
  Serial.write((uint8_t*)data, len);
  Serial.printf(")\n");

  /*print_log("-->");
  
  for(size_t i=0; i<len;i++)
    print_log("%c", d[i]);

  print_log("<--\n");*/


 /* char *pch = strstr((char*)d, "\r\n\r\n") + 4;

  if (pch != NULL)
  {
    print_log(MODULE "Data ->%s<-\n", pch);
  }
*/

  //c->close();

  //print_log("on data complete %d\n", millis() - start_time);

//  pending = 0;
}

  

void System::http_request(unsigned long current)
{
  if (!connected) return;
  if (pending) return;
  if (cur_client == NULL) return;

  start_time = current;
  print_log(MODULE "Request %s  %s\n", name, ip);

  unsigned long s = millis();;
  //Serial.println("Connected");

  char item[] = "Bit_01";
  char req_string[strlen(item) + 50];

  sprintf(req_string, "{\"cmd\"=\"getvalue\", \"item=%s\"}", item);

  //print_log("Req String: %s\n", req_string);

  //client->write("GET  HTTP/1.0\r\nHost: 10.0.0.100\r\n\r\n");

  cur_client->write(req_string);

  //print_log("onconnect time: %d\n", millis() - s);

  //print_log("onconnect complete %d\n", millis() - start_time);




    //print_log("http_request complete %d\n", millis() - start_time);
}





void System::check_request()
{
    /*if (pending == false) return;

    pending = false;

 
    if(request.readyState() != 4)
    {
        return;// UNIXtime() + 1; 
    }

      
    if(request.responseHTTPcode() != 200)
    {
        print_log(MODULE "Post failed: %d\n", request.responseHTTPcode());  
        //state = sendPost;
        return ;//UNIXtime() + 1;
      }
    
      String response = request.responseText();

      Serial.println("Resp: " +  response);
      
      if( ! response.startsWith("ok"))
      {
        print_log("EmonService: response not ok. Retrying.");
        //state = sendPost;
        return;
        //return UNIXtime() + 1;
      }
*/
      
//      reqData = "";
//      reqEntries = 0;    
//      state = post;
//      return UnixNextPost;
   

}




 
