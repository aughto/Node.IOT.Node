# Node.IOT
IOT Platform

![Node.IOT](https://github.com/aughto/Node.IOT.Node/blob/master/Images/Image1.png "Node.IOT")


# Node.IOT Platform

Internal Technical Documentation for Node.IOT Platform.


## Introduction

The Node.IOT platform was designed to make smart IOT based devices easy and inexpensive. The killer feature is a Web-based real-time Ladder Logic processor to allow the creation of custom control logic.  The ladder editor runs in the browser and once the program is saved to the Node it runs independently. No other device is required, it is completely standalone.

The Node.IOT platform is divided into two logical systems: The core operating system Node.IOT.OS and the Web Interface and Node.IOT.Web.

The Node.IOT.OS operating system handles the real time network and hardware interface and service the web requests, AJAX, websockets, REST and TCP based IO. It also hosts the Logic engine which is used to run the ladder logic program.  The ladder logic can be emulated in the browser to make coding and debugging easier.   A extensive library of examples and demo projects will be provided

A minimum web server runs on the OS to serve the static HTML and process AJAX/WebSockets requests.   The static HTML and config files are stored in onboard flash and accessed through the XXX filesystem.  The javascript portion of the web interface runs on the client browser.

The ESP32 core is arduino compatible so that the project can be compiled with the normal Arduino IDE and work with Arduino libraries.

Todo:
Add install instructions
Need to set sketchbook location



## Logic Processor 

The logic processor processor emulates a simple bytecode based CPU.The CPU state is loaded from bytecode.txt during startup.

### Registers
The CPU has a single register called CR, or 'current result'.  The register contains the current evaluation state of rung processing.  It gets reset to with a '' command.  Operations that results in a 1 state will not affect it. An operation resulting in a 0 will clear it.

### CR Stack
The CR stack maintains previous CR results to allow branch evaluation

### OR Stack
The OR stack maintains the results of previous branches so that the COLLECT instruction can evaluate previous results.

### Memory
Memory is divided into partitions using a variable partition table.
The following types of memory are supported:

Bit | 1 bit value
Byte | 8 bit value
Word | 16 bit value
Int | 32 bit value
Float | 32 bit floating point 
Timer | 16 bit  timer

	PRE: 16 bit preset 
	TB:   Adjustable timebase.  0 =1ms, 1 = 0.01 sec, 2 = 0.1 sec, 3: 1 sec.
	ACC: 16 bit accumulator
	LAST: Last system millis when TB was passed.  


Counter | 16 bit counter
	PRE 	: 16bit preset
	ACC: 16 bit accumulator


Time | 3 byte time in HH:MM:SS format

### User Instruction Set

XIO	Examine if Open
XIC	Examine if Closed
OTE	Output Energize
OTL	Output Latch
OTU	Output UnLatch

TMR	Timer
	Takes a Time type variable as OP1


TIME	Time window compare.  True if current time is greater or equal to the low lim and less that the low limit.  Supports 24h wrap around






### Internal Instructions
These are generated by the compiler for housekeeping

PUSHCR	Push cr to cr stack
POPCR	Pop cr from cr stack

PUSHOR	Push cr to or stack
POPOR	Pop value from or stack and or CR with it 


## Web Interface

The web interface files are stored in the /data directory of the arduino project to allow the firmware tool to copy them to the device

The web interface is divider into modules accessed from the navigation bar on the left side.

### Project – Overall project control. Allows load, save, assemble
### HMI – Interactive display for displaying current values
### Liveview – Display all current inputs and outputs
### Weblogix – Live ladder logic editor
### Variables – Variable configuration 
### IO Setup – Name local and remove IO 
### Config – General configuration 
### System – System interface. Backup, Restore, restart, etc





## Config Files
There are a few config files stored on the device
project.txt: Main JSON encoded project. Contains the node list, variables, and configs.
bytecode.txt: Contains the CPU bytecode and the Variable state.
config.txt: Contains the config file in a format that is easy for the system to read.






