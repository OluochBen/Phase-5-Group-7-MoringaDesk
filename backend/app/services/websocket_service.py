from flask_socketio import emit, join_room, leave_room
from flask_jwt_extended import decode_token
from .. import socketio
import json

class WebSocketService:
    @staticmethod
    def send_notification_to_user(user_id, notification_data):
        """Send a notification to a specific user via WebSocket"""
        try:
            socketio.emit('new_notification', notification_data, room=f'user_{user_id}')
        except Exception as e:
            print(f"Error sending notification to user {user_id}: {e}")
    
    @staticmethod
    def send_notification_count_update(user_id, unread_count):
        """Send unread notification count update to a user"""
        try:
            socketio.emit('notification_count_update', {
                'unread_count': unread_count
            }, room=f'user_{user_id}')
        except Exception as e:
            print(f"Error sending notification count to user {user_id}: {e}")
    
    @staticmethod
    def handle_user_connect(user_id):
        """Handle user connecting to WebSocket"""
        join_room(f'user_{user_id}')
        print(f"User {user_id} connected to WebSocket")
    
    @staticmethod
    def handle_user_disconnect(user_id):
        """Handle user disconnecting from WebSocket"""
        leave_room(f'user_{user_id}')
        print(f"User {user_id} disconnected from WebSocket")
    
    @staticmethod
    def verify_token(token):
        """Verify JWT token and return user_id"""
        try:
            decoded_token = decode_token(token)
            return decoded_token.get('sub')
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None
