#!/usr/bin/python
 
import time
from datetime import date, timedelta as td

print "hello, it me"


fileToWrite = open("dias.txt",'w')

#AAAA,MM,DD
d1 = date(2015, 6, 15)
d2 = date(int(time.strftime("%Y")), int(time.strftime("%m")), int(time.strftime("%d")))

delta = d2 - d1

for i in range(delta.days + 1):
    dia = d1 + td(days=i)
    fileToWrite.write(str(dia).replace("-", "") + "\n")                

fileToWrite.close()