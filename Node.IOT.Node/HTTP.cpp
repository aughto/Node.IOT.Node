/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: http.cpp
*/

#define MODULE_HTTP

#include <Arduino.h>
#include <WiFiClient.h>
#include <SPIFFS.h>
#include <Update.h>

#include "AsyncTCP.h"
#include "ESPAsyncWebServer.h"

#include "Utility.h"
#include "Network.h"
#include "Config.h"
#include "Hardware.h"
#include "HTTP.h"
#include "IOT.h"
#include "Logic.h"


HTTP http;

/* 
   Public 
 */


HTTP::HTTP()
{
  strcpy(user, CONFIG_NULL);
  strcpy(pass, CONFIG_NULL);
}


void HTTP::init()
{
  print_log(MODULE "Init\n");

  server = new AsyncWebServer (port);
  ws = new AsyncWebSocket("/ws"); // access at ws://[esp ip]/ws
  events = new AsyncEventSource("/events"); // event source (Server-Sent events)

  // attach AsyncWebSocket
  ws->onEvent(onEvent);
  server->addHandler(ws);

  // attach AsyncEventSource
  server->addHandler(events);

  // Serve files in /www
  // disable cache for now
  //server.serveStatic("/", SPIFFS, "/www").setDefaultFile("index.html").setCacheControl("max-age=60000");
  server->serveStatic("/", SPIFFS, "/www").setDefaultFile("/www/index.html");
 
  // Load page handlers   
  load_handlers(server);

  server->begin();
}


void HTTP::update(unsigned long current)
{
  /*static char temp[128];
  sprintf(temp, "Seconds since boot: %u", millis()/1000);
  events->send(temp, "time"); //send event "time"*/
}

// Set config vaule
bool HTTP::set_config(const char *name, const char *value)
{
  if (!strcmp(name, "port")) port = atoi(value);
  if (!strcmp(name, "user")) strncpy(user, value, CONFIG_USER_MAX);
  if (!strcmp(name, "pass")) strncpy(pass, value, CONFIG_PASS_MAX);
}  

// Show config values
void HTTP::show_config()
{
  print_log(MODULE " Port: %d\n", port);
  print_log(MODULE " User: %s\n", user);
  print_log(MODULE " Pass: %s\n", pass);
}

// Send message to all web socket clients
void HTTP::send_message(char * message)
{
  //print_log(MODULE "Send message %s\n", message);
  ws->printfAll("%s", message);
 
}


/* 
   End of public 
 */


/* 
 *  Request processing 
*/

void HTTP::load_handlers(AsyncWebServer *server)
{

  // respond to GET requests on URL /heap
  /*server.on("/heap", HTTP_GET, [](AsyncWebServerRequest *request)
  {
    request->send(200, "text/plain", String(ESP.getFreeHeap()));
  });*/

  // upload a file to /upload
  /*server.on("/upload", HTTP_POST, [](AsyncWebServerRequest *request)
  {
    request->send(200);
  }, onUpload);*/

  // send a file when /index is requested
  /*server.on("/index", HTTP_ANY, [](AsyncWebServerRequest *request)
  {
    request->send(SPIFFS, "/www/index.htm");
  });*/


  

  // send a file when /index is requested
  server->on("/", HTTP_ANY, [](AsyncWebServerRequest *request)
  {
    print_log(MODULE "ON ANY Request %s\n", request->url().c_str());
    request->send(SPIFFS, "/www/index.html");
  });

  


/*

  // TODO Replace with Generic
  // Write config file
  server->on("/set_mainconfig", HTTP_POST, 
            [&](AsyncWebServerRequest *request){ process_saveconfig_post(request, MAINCONFIG_FILENAME);},
            NULL, 
            [&](AsyncWebServerRequest *request,uint8_t *data, size_t len, size_t index, size_t total){ process_saveconfig_body(request, MAINCONFIG_FILENAME, data, len, index, total);});

  // Send current config.  TODO auth
  server->on("/get_mainconfig", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, MAINCONFIG_FILENAME);
  });

  // TODO Replace with Generic
  // Write config file
  server->on("/set_ioconfig", HTTP_POST, 
            [&](AsyncWebServerRequest *request){ process_saveconfig_post(request, IOCONFIG_FILENAME);},
            NULL, 
            [&](AsyncWebServerRequest *request,uint8_t *data, size_t len, size_t index, size_t total)
            { process_saveconfig_body(request, IOCONFIG_FILENAME, data, len, index, total);}
            );

  // Send current config.  TODO auth
  server->on("/get_ioconfig", HTTP_GET, [](AsyncWebServerRequest *request)
  {
    request->send(SPIFFS, IOCONFIG_FILENAME);
  });


  // TODO Replace with Generic
  // Write bytecode
  server->on("/save_bytecode", HTTP_POST, 
            [&](AsyncWebServerRequest *request){ process_savebytecode_post(request, BYTECODE_FILENAME);},
            NULL, 
            [&](AsyncWebServerRequest *request,uint8_t *data, size_t len, size_t index, size_t total)
            { process_savebytecode_body(request, BYTECODE_FILENAME, data, len, index, total);}
            );

*/

 
  // Generic get system file
  // TODO Replace with Generic
  /*server->on("/get_logic", HTTP_GET, [](AsyncWebServerRequest *request)
  {
    request->send(SPIFFS, LOGIC_FILENAME);
  });*/

  // Generic save system file
  server->on("/save_systemfile", HTTP_POST, 
              [&](AsyncWebServerRequest *request){ process_savesystemfile_post(request);},
              NULL, 
              [&](AsyncWebServerRequest *request,uint8_t *data, size_t len, size_t index, size_t total)
              { process_savesystemfile_body(request, data, len, index, total);}
            );


  // Generic get system file
  server->on("/get_systemfile", HTTP_POST, 
              [&](AsyncWebServerRequest *request){ process_getsystemfile_post(request);},
              NULL, 
              NULL
            );
            

  // Request system restart.  Need to replace with generic commands
  server->on("/system_restart", HTTP_GET, [](AsyncWebServerRequest *request)
  {  
    print_log("\n\nOn restart\n\n");
    hardware.restart(); 
    request->send(200, "text/plain", "Restarting");
    //request->redirect("/");
  });



/*
  server.onRequestBody([](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){

  print_log("Request body\n");

    
  //if (request->url() == "/saveconfig") {
    if (!handleTest(request, data)) request->send(200, "text/plain", "false");
    request->send(200, "text/plain", "true");
  //}
  });

*/

  // HTTP basic authentication
  /*server.on("/login", HTTP_GET, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
        return request->requestAuthentication();
    request->send(200, "text/plain", "Login Success!");
  });*/

  // Simple Firmware Update Form
  /*server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/html", "<form method='POST' action='/update' enctype='multipart/form-data'><input type='file' name='update'><input type='submit' value='Update'></form>");
  });
  server.on("/update", HTTP_POST, [](AsyncWebServerRequest *request){
    shouldReboot = !Update.hasError();
    AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", shouldReboot?"OK":"FAIL");
    response->addHeader("Connection", "close");
    request->send(response);
  },[](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final){
    if(!index){
      Serial.printf("Update Start: %s\n", filename.c_str());
      Update.runAsync(true);
      if(!Update.begin((ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000)){
        Update.printError(Serial);
      }
    }
    if(!Update.hasError()){
      if(Update.write(data, len) != len){
        Update.printError(Serial);
      }
    }
    if(final){
      if(Update.end(true)){
        Serial.printf("Update Success: %uB\n", index+len);
      } else {
        Update.printError(Serial);
      }
    }
  });*/



 
  // attach filesystem root at URL /fs
  //server.serveStatic("/fs", SPIFFS, "/");

  // Catch-All Handlers
  // Any request that can not find a Handler that canHandle it
  // ends in the callbacks below.
  server->onNotFound(onNotFound);
  server->onFileUpload(onUpload);
  //server.onRequestBody(onBody);

}





void HTTP::process_savesystemfile_post(AsyncWebServerRequest *request)
{
  //print_log(MODULE "process_savesystemfile_post called\n");

  //show_params("process_savesystemfile_post", request);

  /*request->send(200, "text/plain", "Saved");
  
  print_log(MODULE "process_savelogic_post: Sent saved\n");*/
}



// Process request for save system file 
void HTTP::process_savesystemfile_body(AsyncWebServerRequest *request,  uint8_t *data, size_t len, size_t index, size_t total)
{
  //print_log(MODULE "process_savesystemfile_body called\n");
  //show_params("process_savesystemfile_body params ", request);

  int  filetype = FILETYPE_NONE;
  char filename[FILENAME_MAX]; // TODO need to range check filename
  filename[0] = 0;

  //Get type
  if(request->hasHeader("filetype"))
  {
    AsyncWebHeader* h = request->getHeader("filetype");
    print_log("Filetype: %s\n", h->value().c_str());
  
    // Detect type of special files
    if (!strcmp(h->value().c_str(), "logic")) filetype = FILETYPE_LOGIC; 
    if (!strcmp(h->value().c_str(), "bytecode")) filetype = FILETYPE_BYTECODE; 
  }


  //Get Filename
  if(request->hasHeader("filename"))
  {
    AsyncWebHeader* h = request->getHeader("filename");
    strcpy(filename, h->value().c_str());
  }
  else
  {
    print_log(MODULE "No filename supplied\n");
    return;
  }

  print_log(MODULE "Filename: %s Type: %d Index %d Total %d Len %d\n", filename, filetype, index, total, len);
  
  if (index == 0)   // Start
  {
    save_systemfile(filename, filetype, 0, 0, SAVE_START);
  }

  // Save chunk
  save_systemfile(filename, filetype, data, len, SAVE_CHUNK);
  
  if (index + len == total)  // End
  {
    save_systemfile(filename, filetype, 0, 0, SAVE_END);
  
    request->send(200, "text/plain", "Saved");
    
    print_log(MODULE "Sent saved\n");
  }
}


// process request for get system file 
void HTTP::process_getsystemfile_post(AsyncWebServerRequest *request)
{
  print_log(MODULE "process_savesystemfile_post called\n");

  show_params("process_getsystemfile_post", request);

  char filename[FILENAME_MAX]; // TODO need to range check filename

  //Get Filename
  if(request->hasHeader("filename"))
  {
    AsyncWebHeader* h = request->getHeader("filename");
    strcpy(filename, h->value().c_str());
  }
  else
  {
    print_log(MODULE "No filename supplied\n");
    return;
  }

  // Send the file
  request->send(SPIFFS, filename);  
}












/* 
  End of request processing 
*/











void HTTP::onNotFound(AsyncWebServerRequest *request)
{
  print_log(MODULE "ON Not found Request %s\n", request->url().c_str());

   request->send(404, "text/plain", "Not Found");
  //Handle Unknown Request
  //request->send(404);
}



void HTTP::onRequest(AsyncWebServerRequest *request)
{
  print_log(MODULE "ON Request %s\n", request->url().c_str());

      request->send(200, "text/plain", "Bare request");
  //Handle Unknown Request
  request->send(404);
}


void HTTP::onBody(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total)
{
  print_log(MODULE "ON Body %s\n", request->url().c_str());
  //Handle body


}

void HTTP::onUpload(AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final)
{
  print_log(MODULE "ON Upload %s\n", request->url().c_str());
  //Handle upload
}





// Websocket events

void HTTP::onEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len)
{
  //print_log(MODULE "Websocket event\n");

  //print_log(MODULE "ON event %d\n", type);

//  handle_message(data);

  if(type == WS_EVT_CONNECT)
  {
    print_log(MODULE "Client connected");
    iot.send_current();
  }

  if(type == WS_EVT_DATA)
  {
     //print_log(MODULE "WS Data");
    //data packet
    AwsFrameInfo * info = (AwsFrameInfo*)arg;
    
    if(info->final && info->index == 0 && info->len == len)
    {
      data[len] = 0;
    
      iot.handle_message(data);
      /*//the whole message is in a single frame and we got all of it's data
      os_printf("ws[%s][%u] %s-message[%llu]: ", server->url(), client->id(), (info->opcode == WS_TEXT)?"text":"binary", info->len);
      if(info->opcode == WS_TEXT){
        data[len] = 0;
        os_printf("%s\n", (char*)data);
      } else {
        for(size_t i=0; i < info->len; i++){
          os_printf("%02x ", data[i]);
        }
        os_printf("\n");
      }
      if(info->opcode == WS_TEXT)
        client->text("I got your text message");*/
    }
  }

  /*if (len >= 1000)
  {
    print_log("Message too long\n");
    return;
  
  }

  char str[len+1];
  memcpy(str, data, len);
  str[len] = 0;

  handle_message(str);*/
  


  
  //Handle WebSocket event
}




/*server.onRequestBody([](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
  if (request->url() == "/test") {
    if (!handleTest(request, data)) request->send(200, "text/plain", "false");
    request->send(200, "text/plain", "true");
  }
});

bool handleTest(AsyncWebServerRequest *request, uint8_t *datas) {

  Serial.printf("[REQUEST]\t%s\r\n", (const char*)datas);
  
  DynamicJsonBuffer jsonBuffer;
  JsonObject& _test = jsonBuffer.parseObject((const char*)datas); 
  if (!_test.success()) return 0;

  if (!_test.containsKey("command")) return 0;
  String _command = _test["command"].asString();
  Serial.println(_command);
  
  return 1;
}

*/








/* Generic system file save routine from HTTP */
// Only supports one save at a time
void HTTP::save_systemfile(const char *filename, int filetype, uint8_t *data, size_t len, int mode)
{
  static File file;             // Current file we are saving
  static bool saving = false;   // True with we are currently saving a file

  //print_log("Save System File. File: %s  Type: %d Len: %d Mode: %d\n", filename, filetype, len, mode);
 
  if (mode == SAVE_START)
  {
    // Previous save not complete
    if (saving == true)
    {
      print_log("Duplicate save detected\n");
      saving = false;
      return;
    }

    saving = true;
    
    file = SPIFFS.open(filename, FILE_WRITE);
    
    if(!file)
    {
      print_log(MODULE "Failed to open file for writing %s", filename);
      saving = false;

      return;
    }
  
    //set_timeout(save_timeout, millis() + CONFIG_TIMEOUT);
    
    print_log(MODULE "Save started for %s\n", filename);
  
  } else

  if (mode == SAVE_CHUNK)
  {
    // see if something wend wrong with previus call      
    if (!saving) return;
   
    if (!file.write(data, len))
    {
        print_log(MODULE "File write failed %s\n", filename);
        saving = false;
        return;    
    }
  
//    save_timeout = 0;
   
  } else
  
  if (mode == SAVE_END)
  {
    // see if something wend wrong with previus call      
    if (!saving) return;
    
    saving = false;
  
    file.close();
    
    print_log(MODULE "File saved for for %s\n", filename);

    // Other actions for system files
    if (filetype == FILETYPE_BYTECODE)  logic.request_reload();
  }
}






/* Debugging */


void HTTP::show_params(char * header, AsyncWebServerRequest *request)
{
  print_log(MODULE "Params %s\n", header);

  int headers = request->headers();

  print_log(MODULE "Headers\n");
  
  for(int i=0; i<headers; i++)
  {
    AsyncWebHeader* h = request->getHeader(i);
    print_log(MODULE " HEADER[%s]: %s\n", h->name().c_str(), h->value().c_str());
  }

  //get specific header by name
  //if(request->hasHeader("MyHeader"))
  //{
  //    AsyncWebHeader* h = request->getHeader("MyHeader");
    //Serial.printf("MyHeader: %s\n", h->value().c_str());
  //}

  //List all parameters
  print_log(MODULE "Parameters\n");
  
  int params = request->params();
  for(int i=0; i<params; i++)
  {
    AsyncWebParameter* p = request->getParam(i);
  
    if(p->isFile())
    { //p->isPost() is also true
      print_log(MODULE " FILE[%s]: %s, size: %u\n", p->name().c_str(), p->value().c_str(), p->size());
    } else 
    if(p->isPost())
    {
      print_log(MODULE " POST[%s]: %s\n", p->name().c_str(), p->value().c_str());
      // Try to set as parameter
      //config.set(p->name().c_str(),  p->value().c_str());
    } 
    else 
    {
      print_log(" GET[%s]: %s\n", p->name().c_str(), p->value().c_str());
    }
  }
  //config.save();

  if(request->hasParam("body", true))
  {
    AsyncWebParameter* p = request->getParam("body", true);

    print_log(MODULE "Body Data: %s\n", p->value().c_str());
  }
}
