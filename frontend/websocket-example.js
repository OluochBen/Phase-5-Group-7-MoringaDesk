// WebSocket client example for MoringaDesk notifications
// This shows how to connect to the WebSocket server from the frontend

import { io } from 'socket.io-client';

class NotificationWebSocket {
    constructor(baseURL, token) {
        this.socket = io(baseURL, {
            auth: {
                token: token
            }
        });
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
        
        this.socket.on('new_notification', (data) => {
            console.log('New notification received:', data);
            // Update UI with new notification
            this.handleNewNotification(data);
        });
        
        this.socket.on('notification_count_update', (data) => {
            console.log('Notification count updated:', data);
            // Update notification badge count
            this.updateNotificationCount(data.unread_count);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }
    
    handleNewNotification(notification) {
        // Show notification toast/popup
        // You can use a notification library like react-toastify
        console.log('Showing notification:', notification);
    }
    
    updateNotificationCount(count) {
        // Update the notification badge in the navbar
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }
    
    joinNotifications() {
        this.socket.emit('join_notifications');
    }
    
    leaveNotifications() {
        this.socket.emit('leave_notifications');
    }
    
    disconnect() {
        this.socket.disconnect();
    }
}

// Usage example:
// const notificationWS = new NotificationWebSocket('http://localhost:5000', userToken);
// notificationWS.joinNotifications();

export default NotificationWebSocket;
