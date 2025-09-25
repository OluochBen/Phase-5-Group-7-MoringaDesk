import { useEffect, useMemo, useState } from "react";
import { notificationsApi } from "../services/api";
import { Badge } from "./ui/badge";

export function NotificationsPanel({ notifications: initialNotifications = [], onMarkAsRead }) {
  const DEMO_MODE = !import.meta.env.VITE_API_BASE;
  const initial = useMemo(() => (Array.isArray(initialNotifications) ? initialNotifications : []), [initialNotifications]);

  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      if (DEMO_MODE) {
        setItems(initial);
      } else {
        const data = await notificationsApi.list({ page: 1, per_page: 20, unread_only: false });
        const list = data?.notifications ?? data?.items ?? (Array.isArray(data) ? data : []);
        setItems(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      setErr("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markOne(id) {
    if (DEMO_MODE) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      onMarkAsRead && onMarkAsRead(id);
      return;
    }
    await notificationsApi.markRead(id);
    await load();
  }

  async function markAll() {
    if (DEMO_MODE) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      return;
    }
    await notificationsApi.markAllRead();
    await load();
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  const list = Array.isArray(items) ? items : [];

  const typeStyles = (type) => {
    switch (type) {
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
            <div key={n.id} className={`border rounded p-4 ${s.bar} border-l-4 ${n.read ? "bg-white" : "bg-green-50/50"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.type && (
                    <Badge variant="secondary" className={`${s.pill} capitalize`}>{n.type}</Badge>
                  )}
                  <div className="font-medium">{n.title ?? n.type ?? "Notification"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && <Badge className="bg-green-600 text-white">New</Badge>}
                  {!n.read && (
                    <button className="border px-2 py-1 rounded text-sm" onClick={() => markOne(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
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
