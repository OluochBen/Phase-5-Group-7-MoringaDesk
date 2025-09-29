import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Polling every 10 seconds, for example
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const resp = await fetch(`/api/notifications/${userId}`);
        const data = await resp.json();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications', err);
      }
    };

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 10000); // every 10 sec

    return () => clearInterval(intervalId);
  }, [userId]);

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 shadow-lg rounded-lg z-50">
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map(n => (
                <li key={n.id} className="px-4 py-2 hover:bg-gray-100">
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
