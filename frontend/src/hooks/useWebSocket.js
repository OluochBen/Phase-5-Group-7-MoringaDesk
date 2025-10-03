import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for WebSocket notifications
 * @param {string} baseURL - WebSocket server URL
 * @param {string} token - JWT authentication token
 * @param {boolean} enabled - Whether to enable WebSocket connection
 */
export const useWebSocket = (baseURL, token, enabled = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled || !token) return;

    // Initialize socket connection
    socketRef.current = io(baseURL, {
      auth: {
        token: token
      }
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Notification events
    socket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('notification_count_update', (data) => {
      console.log('Notification count updated:', data);
      setUnreadCount(data.unread_count);
    });

    // Join notifications room
    socket.emit('join_notifications');

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave_notifications');
        socket.disconnect();
      }
    };
  }, [baseURL, token, enabled]);

  const joinNotifications = () => {
    if (socketRef.current) {
      socketRef.current.emit('join_notifications');
    }
  };

  const leaveNotifications = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_notifications');
    }
  };

  return {
    isConnected,
    unreadCount,
    notifications,
    joinNotifications,
    leaveNotifications
  };
};

export default useWebSocket;
