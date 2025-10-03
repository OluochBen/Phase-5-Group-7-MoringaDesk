import { useEffect, useState } from "react";
import { notificationsApi } from "../services/api";
import { Badge } from "./ui/badge";

export function NotificationsPanel({ notifications: initialNotifications = [], onMarkAsRead }) {
  const [items, setItems] = useState(initialNotifications);
  const [err, setErr] = useState("");

  useEffect(() => {
    setItems(initialNotifications);
  }, [initialNotifications]);

  async function markOne(id) {
    try {
      await notificationsApi.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      onMarkAsRead && onMarkAsRead(id);
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
      setErr("Failed to mark notification as read");
    }
  }

  async function markAll() {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      // Call onMarkAsRead for all unread notifications
      items.filter(n => !n.is_read).forEach(n => onMarkAsRead && onMarkAsRead(n.id));
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
      setErr("Failed to mark all notifications as read");
    }
  }

  if (err) return <div className="p-6 text-red-600">{err}</div>;

  const list = Array.isArray(items) ? items : [];

  const typeStyles = (type) => {
    switch (type) {
      case "new_answer":
        return { bar: "border-l-green-500", pill: "bg-green-100 text-green-700" };
      case "vote":
        return { bar: "border-l-blue-500", pill: "bg-blue-100 text-blue-700" };
      case "mention":
        return { bar: "border-l-orange-500", pill: "bg-orange-100 text-orange-700" };
      case "bounty":
        return { bar: "border-l-amber-500", pill: "bg-amber-100 text-amber-800" };
      case "badge":
        return { bar: "border-l-purple-500", pill: "bg-purple-100 text-purple-700" };
      case "follow":
        return { bar: "border-l-slate-400", pill: "bg-slate-100 text-slate-700" };
      default:
        return { bar: "border-l-muted", pill: "bg-muted text-foreground" };
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case "new_answer":
        return "Someone posted a new solution to a question you're following";
      case "vote":
        return "Someone upvoted your solution";
      default:
        return notification.message || "You have a new notification";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button className="border px-3 py-1 rounded" onClick={markAll}>Mark all as read</button>
      </div>

      {list.length === 0 && <div>No notifications</div>}

      <div className="space-y-3">
        {list.map((n) => {
          const s = typeStyles(n.type);
          return (
            <div key={n.id} className={`border rounded p-4 ${s.bar} border-l-4 ${n.is_read ? "bg-white" : "bg-green-50/50"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.type && (
                    <Badge variant="secondary" className={`${s.pill} capitalize`}>
                      {n.type === "new_answer" ? "New Answer" : n.type}
                    </Badge>
                  )}
                  <div className="font-medium">
                    {n.type === "new_answer" ? "New Solution" : 
                     n.type === "vote" ? "Solution Upvoted" : 
                     "Notification"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.is_read && <Badge className="bg-green-600 text-white">New</Badge>}
                  {!n.is_read && (
                    <button className="border px-2 py-1 rounded text-sm" onClick={() => markOne(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {getNotificationMessage(n)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
