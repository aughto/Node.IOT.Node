/* 
  ESP32 MQTT Client
 
 (C) 2018 Jason Hunt
  nulluser@gmail.com

  FILE: FIFO.h

  Need to verify thread safety for a single produce / consumer
*/

#include <stdlib.h>  

#include "FIFO.h"
#include "Utility.h"

// Simple Thread safe FIFO
FIFO::FIFO(const int length) : length(length)
{
  head = 0;
  tail = 0;
  data = (int *) malloc(length * sizeof(int));

  if (data == NULL)
  {
    print_log("Unable to get memory for ring buffer Size: %d\n", length);
    while(1);
  }
}

// Simple Thread safe FIFO
FIFO::~FIFO()
{
  head = 0;
  tail = 0;
  free(data);
}





// Return true if value added
bool FIFO::push(const int e)
{
  //print_log("Add Element: %d\n", e);

  int next_head = head+1;

  if (next_head > length-1) 
    next_head = 0;

  if (next_head == tail) return false;

  data[head] = e;

  head = next_head;

  return true;
}

// true true if value returned
int FIFO::pop(void)
{
  // Check empty
  if (empty()) return 0;

  int next_tail = tail+1;

  if (next_tail > length-1) 
    next_tail = 0;

  int val = data[tail];

  tail = next_tail;

  //print_log("Remove element: %d\n", val);

  return val;
}


bool FIFO::empty(void)
{
  return tail == head;
}
