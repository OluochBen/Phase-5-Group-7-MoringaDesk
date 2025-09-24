import { useEffect, useState } from "react";
import { notificationsApi } from "../services/api";

export function NotificationsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await notificationsApi.list({ page: 1, per_page: 20, unread_only: false });
      // backend might return { notifications: [...] } or { items: [...] }
      setItems(data.notifications ?? data.items ?? data ?? []);
    } catch (e) {
      setErr("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markOne(id) {
    await notificationsApi.markRead(id);
    await load();
  }

  async function markAll() {
    await notificationsApi.markAllRead();
    await load();
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button className="border px-3 py-1 rounded" onClick={markAll}>Mark all as read</button>
      </div>

      {items.length === 0 && <div>No notifications</div>}

      <div className="space-y-3">
        {items.map(n => (
          <div key={n.id} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{n.title ?? n.type ?? "Notification"}</div>
              {!n.read && (
                <button className="border px-2 py-1 rounded text-sm" onClick={() => markOne(n.id)}>
                  Mark read
                </button>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
            {n.actionUrl && (
              <a className="text-sm underline mt-1 inline-block" href={n.actionUrl}>
                View
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
