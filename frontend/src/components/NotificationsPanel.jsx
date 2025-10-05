import { useEffect, useState } from "react";
import { notificationsApi } from "../services/api";
import { Badge } from "./ui/badge";

export function NotificationsPanel({
  notifications: notificationsProp,
  onMarkAsRead,
  onMarkAllRead,
  onRefresh,
}) {
  const [items, setItems] = useState(Array.isArray(notificationsProp) ? notificationsProp : []);
  const [loading, setLoading] = useState(!Array.isArray(notificationsProp));
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = onRefresh
        ? await onRefresh()
        : await notificationsApi.list({ page: 1, per_page: 20, unread_only: false });
      const list = Array.isArray(data) ? data : data?.notifications ?? data?.items ?? [];
      const normalized = Array.isArray(list) ? list : [];
      setItems(normalized);
      return normalized;
    } catch (e) {
      console.error("Failed to load notifications", e);
      setErr("Failed to load notifications");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(notificationsProp)) {
      setItems(notificationsProp);
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsProp]);

  const markOne = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n)));
      onMarkAsRead?.(id);
    } catch (e) {
      console.error("Failed to mark notification", e);
      setErr("Failed to mark notification");
    }
  };

  const markAll = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
      onMarkAllRead?.();
    } catch (e) {
      console.error("Failed to mark notifications", e);
      setErr("Failed to mark notifications");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  const list = Array.isArray(items) ? items : [];

  const typeStyles = (type) => {
    switch (type) {
      case "new_answer":
      case "answer":
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
      case "answer":
        return notification.message || "Someone posted a new solution to a question you're following";
      case "vote":
        return notification.message || "Someone upvoted your solution";
      default:
        return notification.message || "You have a new notification";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button className="border px-3 py-1 rounded" onClick={markAll}>
          Mark all as read
        </button>
      </div>

      {list.length === 0 && <div>No notifications</div>}

      <div className="space-y-3">
        {list.map((n) => {
          const isRead = n.read ?? n.is_read;
          const s = typeStyles(n.type);
          return (
            <div
              key={n.id}
              className={`border rounded p-4 ${s.bar} border-l-4 ${
                isRead ? "bg-white" : "bg-green-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.type && (
                    <Badge variant="secondary" className={`${s.pill} capitalize`}>
                      {n.type === "new_answer" ? "New Answer" : n.type}
                    </Badge>
                  )}
                  <div className="font-medium">
                    {n.type === "new_answer" || n.type === "answer"
                      ? "New Solution"
                      : n.type === "vote"
                      ? "Solution Upvoted"
                      : n.title || "Notification"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isRead && <Badge className="bg-green-600 text-white">New</Badge>}
                  {!isRead && (
                    <button
                      className="border px-2 py-1 rounded text-sm"
                      onClick={() => markOne(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{getNotificationMessage(n)}</div>
              {n.actionUrl && (
                <a className="text-sm underline mt-1 inline-block" href={n.actionUrl}>
                  View
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
