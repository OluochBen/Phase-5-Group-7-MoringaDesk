from flask_socketio import emit, disconnect
from flask_jwt_extended import decode_token
from ..services import WebSocketService, NotificationService
from .. import socketio

@socketio.on('connect')
def handle_connect(auth=None):
    """Handle client connection"""
    if not auth or 'token' not in auth:
        print("No token provided for WebSocket connection")
        disconnect()
        return False
    
    user_id = WebSocketService.verify_token(auth['token'])
    if not user_id:
        print("Invalid token for WebSocket connection")
        disconnect()
        return False
    
    # Store user_id in session for later use
    socketio.session['user_id'] = user_id
    WebSocketService.handle_user_connect(user_id)
    
    # Send current unread count
    unread_count = NotificationService.get_unread_count(user_id)
    emit('notification_count_update', unread_count)
    
    print(f"User {user_id} connected successfully")
    return True

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    user_id = socketio.session.get('user_id')
    if user_id:
        WebSocketService.handle_user_disconnect(user_id)

@socketio.on('join_notifications')
def handle_join_notifications():
    """Handle user joining notification room"""
    user_id = socketio.session.get('user_id')
    if user_id:
        from flask_socketio import join_room
        join_room(f'user_{user_id}')
        print(f"User {user_id} joined notifications room")

@socketio.on('leave_notifications')
def handle_leave_notifications():
    """Handle user leaving notification room"""
    user_id = socketio.session.get('user_id')
    if user_id:
        from flask_socketio import leave_room
        leave_room(f'user_{user_id}')
        print(f"User {user_id} left notifications room")
