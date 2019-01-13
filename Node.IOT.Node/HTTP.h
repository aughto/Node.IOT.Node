/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: http.h
*/

#ifndef HTTP_H
#define HTTP_H

#include <arduino.h>

#include "ESPAsyncWebServer.h"

#ifdef MODULE_HTTP
#define MODULE "[HTTP]      "

#define FILETYPE_NONE 0

// Special files
#define FILETYPE_LOGIC 1
#define FILETYPE_BYTECODE 2
#define FILENAME_MAX 200

#endif



class HTTP
{
 public:

  HTTP();

  void init();
  void update(unsigned long current);
  bool set_config(const char *name, const char *value);
  void show_config();

  //void show_params(char * header, AsyncWebServerRequest *request);

  void send_message(char *message);


 private:

  void log_request(const String header);
  void handle_notfound();
  int handle_fileread(String path);

  bool handle_get();
  bool handle_set();
   
  //void process_saveconfig(AsynchttpRequest *request int config_type );

  void load_handlers(AsyncWebServer *server);

  // Need to refactor this garbage
  void process_saveconfig_post(AsyncWebServerRequest *request, const char *filename );
  void process_saveconfig_body(AsyncWebServerRequest *request, const char *filename,  uint8_t *data, size_t len, size_t index, size_t total);

  void process_savebytecode_post(AsyncWebServerRequest *request, const char *filename);
  void process_savebytecode_body(AsyncWebServerRequest *request, const char *filename, uint8_t *data, size_t len, size_t index, size_t total);

  void process_savesystemfile_post(AsyncWebServerRequest *request);
  void process_savesystemfile_body(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total);

  void save_systemfile(const char *filename, int filetype, uint8_t *data, size_t len, int mode);

  void process_getsystemfile_post(AsyncWebServerRequest *request);

  void process_getvalue(AsyncWebServerRequest *request);
  void process_setvalue(AsyncWebServerRequest *request);
  

  static void onNotFound(AsyncWebServerRequest *request);
  static void onRequest(AsyncWebServerRequest *request);
  static void onBody(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total);
  static void onUpload(AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final);
  static void onEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len);





  //void save_systemfile(const char *filename, uint8_t *data, size_t len, int mode);


  //typedef std::function<void(AsynchttpRequest *request, const String& filename, size_t index, uint8_t *data, size_t len, bool final)> ArUploadHandlerFunction
 
  String get_contenttype(String filename);

  int port;

  AsyncWebServer *server;
  AsyncWebSocket *ws; // access at ws://[esp ip]/ws
  AsyncEventSource *events; // event source (Server-Sent events)

  char user[CONFIG_USER_MAX];
  char pass[CONFIG_PASS_MAX];

};

void show_params(char * header, AsyncWebServerRequest *request);


extern HTTP http;

#endif
