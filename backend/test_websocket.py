#!/usr/bin/env python3
"""
Simple WebSocket test script for MoringaDesk notifications
Run this to test WebSocket connectivity and events
"""

import socketio
import time
import json

# Create a SocketIO client
sio = socketio.Client()

@sio.event
def connect():
    print("Connected to WebSocket server!")

@sio.event
def disconnect():
    print("Disconnected from WebSocket server!")

@sio.event
def new_notification(data):
    print(f"Received new notification: {data}")

@sio.event
def notification_count_update(data):
    print(f"Notification count updated: {data}")

def test_websocket():
    try:
        # Connect to the WebSocket server
        # Replace with your actual server URL
        sio.connect('http://localhost:5000', auth={'token': 'your-jwt-token-here'})
        
        # Wait for events
        print("Listening for WebSocket events... Press Ctrl+C to stop")
        sio.wait()
        
    except KeyboardInterrupt:
        print("\nStopping WebSocket client...")
        sio.disconnect()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_websocket()
