/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: FIFO.h
*/

#ifndef FIFO_H
#define FIFO_H

// Simple thread safe int FIFO
class FIFO
{
 public:
  FIFO(const int length);
  ~FIFO();
  
  bool push(const int v);
  int pop(void);
  bool empty(void);
  
  
 private:
  int *data;
  unsigned int head;
  unsigned int tail;
  unsigned int length;
};

#endif

 
