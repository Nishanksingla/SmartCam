import base64
import paho.mqtt.client as mqtt
import math
import random, string
import json
import numpy as np
import cv2


cap = cv2.VideoCapture(0)

packet_size=10000

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("commands")
        
mqttClient = mqtt.Client("client_02")
mqttClient.on_connect = on_connect
mqttClient.connect("54.187.15.61",1883)



def randomword(length):
    return ''.join(random.choice(string.lowercase) for i in range(length))

def publishEncodedImage(encoded):  
    print "publishing image"   
    end = packet_size
    start = 0
    length = len(encoded)
    picId = randomword(8)
    ##print picId
    pos = 0
    no_of_packets = math.ceil(length/packet_size)
    while start <= len(encoded):
        data = {"data": encoded[start:end], "pic_id":picId, "pos": pos, "size": no_of_packets}
        mqttClient.publish("dropcam",json.JSONEncoder().encode(data))
        mqttClient.loop(2)
        end += packet_size
        start += packet_size
       ## print "pos:" +str(pos)
        pos = pos +1

while(True):
    # Capture frame-by-frame
    ret, frame = cap.read()
    frame = cv2.flip(frame,1)
   ## print type(frame)
    ##cv2.imshow('frame',frame)
    cv2.imwrite('image.jpg',frame)
    encodedImage = base64.b64encode(open('image.jpg','rb').read())
    publishEncodedImage(encodedImage)

