/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: AWS.h
*/

#ifndef AWS_H
#define AWS_H


// Private
#ifdef MODULE_AWS

#define MODULE "[AWS]       "

#endif

typedef enum 
{
  AWS_MODE_NONE,
  AWS_MODE_CONNECTING,
  AWS_MODE_CONNECTED,
} aws_mode_t;



class AWS
{
 public:

  AWS();
 
  void init();
  void update(unsigned long current);
  bool get_connected();

  int publish_value(const char *name, const char *value);

  // Config
  bool set_config(const char *name, const char *value);
  void show_config();
 
 private:

  void connect(void);
  void process_events();
  void process_messages();


  void second();
  
  
  static void event (char *topicName, int payloadLen, char *payLoad);

  void payload_recv (char *topicName, int payloadLen, char *payLoad);

  
  bool load_file(const String path, char *buffer, int max, int &length);
  bool load_certs();


  
  //bool connected;
  unsigned long network_timeout;  // future tick value for network timeout
  unsigned long pulse_timeout;  // future tick value for network timeout
  
  int msgReceived;
  char rcvdPayload[512];
  char rcvdTopic[512];
  
  aws_mode_t aws_mode;

  // Config options

  bool enabled;
  char host[CONFIG_HOST_MAX+1];
  char client_id[CONFIG_CLIENT_MAX+1];
  char pub_topic[CONFIG_TOPIC_MAX+1];
  char sub_topic[CONFIG_TOPIC_MAX+1];
  
  //char host[AWS_HOST_MAX+1];
  


  bool certs_ok;
};

extern AWS aws;

#endif
