import React, { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, text: "Your question received a new answer", time: "2m ago" },
    { id: 2, text: "Profile updated successfully", time: "1h ago" },
    { id: 3, text: "Welcome to MoringaDesk!", time: "1d ago" },
  ]);

  return (
    <div className="relative">
      {/* Bell icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative focus:outline-none"
      >
        <Bell size={22} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50">
          <h4 className="px-4 py-2 border-b font-semibold">Notifications</h4>
          <ul className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-2 text-sm">No notifications</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className="px-4 py-2 border-b last:border-none hover:bg-gray-100"
                >
                  <p className="text-sm">{n.text}</p>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
