import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  AtSign,
  Award,
  Bell,
  BookmarkCheck,
  Gem,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

import { notificationsApi } from "../services/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

const TYPE_META = {
  answer: {
    label: "Answer",
    icon: MessageCircle,
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    pill: "bg-emerald-100 text-emerald-700",
  },
  vote: {
    label: "Vote",
    icon: ThumbsUp,
    bar: "bg-sky-500",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    pill: "bg-sky-100 text-sky-700",
  },
  mention: {
    label: "Mention",
    icon: AtSign,
    bar: "bg-orange-400",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    pill: "bg-orange-100 text-orange-700",
  },
  bounty: {
    label: "Bounty",
    icon: Gem,
    bar: "bg-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    pill: "bg-amber-100 text-amber-700",
  },
  badge: {
    label: "Badge",
    icon: Award,
    bar: "bg-violet-500",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    pill: "bg-violet-100 text-violet-700",
  },
  follow: {
    label: "Follow",
    icon: BookmarkCheck,
    bar: "bg-slate-400",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    pill: "bg-slate-100 text-slate-700",
  },
  update: {
    label: "Update",
    icon: Bell,
    bar: "bg-slate-300",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    pill: "bg-slate-100 text-slate-600",
  },
};

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function normalizeType(type) {
  if (!type) return "update";
  if (type === "new_answer") return "answer";
  return type;
}

export function NotificationsPanel({
  notifications: notificationsProp,
  onMarkAsRead,
  onMarkAllRead,
  onRefresh,
}) {
  const [items, setItems] = useState(
    Array.isArray(notificationsProp) ? notificationsProp : []
  );
  const [loading, setLoading] = useState(!Array.isArray(notificationsProp));
  const [err, setErr] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = onRefresh
        ? await onRefresh()
        : await notificationsApi.list({
            page: 1,
            per_page: 30,
            unread_only: false,
          });
      const list = Array.isArray(data)
        ? data
        : data?.notifications ?? data?.items ?? [];
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
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true, is_read: true } : n
        )
      );
      onMarkAsRead?.(id);
    } catch (e) {
      console.error("Failed to mark notification", e);
      setErr("Failed to mark notification");
    }
  };

  const markAll = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) =>
        prev.map((n) => ({ ...n, read: true, is_read: true }))
      );
      onMarkAllRead?.();
    } catch (e) {
      console.error("Failed to mark notifications", e);
      setErr("Failed to mark notifications");
    }
  };

  const counts = useMemo(() => {
    const totalByType = {};
    let unreadTotal = 0;

    items.forEach((item) => {
      const key = normalizeType(item.type);
      const isRead = item.read ?? item.is_read;

      totalByType[key] = (totalByType[key] || 0) + 1;
      if (!isRead) {
        unreadTotal += 1;
        totalByType[`${key}_unread`] =
          (totalByType[`${key}_unread`] || 0) + 1;
      }
    });

    return { totalByType, unreadTotal };
  }, [items]);

  const availableTypes = useMemo(() => {
    const set = new Set();
    items.forEach((item) => set.add(normalizeType(item.type)));
    return ["all", ...Array.from(set.values())];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const key = normalizeType(item.type);
      const matchesType = filterType === "all" || key === filterType;
      const isRead = item.read ?? item.is_read;
      const matchesUnread = !unreadOnly || !isRead;
      return matchesType && matchesUnread;
    });
  }, [items, filterType, unreadOnly]);

  const summaryCards = useMemo(() => {
    const { totalByType } = counts;
    return Object.entries(TYPE_META)
      .filter(([key]) => key !== "update")
      .map(([key, meta]) => ({
        key,
        label: meta.label,
        total: totalByType[key] || 0,
        unread: totalByType[`${key}_unread`] || 0,
        meta,
      }))
      .filter((entry) => entry.total > 0);
  }, [counts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-12 text-slate-500">
        <svg
          className="size-5 animate-spin text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        Loading notifications…
      </div>
    );
  }

  if (err) {
    return (
      <div className="px-6 py-12 text-center text-sm text-red-600">{err}</div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="rounded-3xl border bg-gradient-to-br from-sky-50 via-white to-sky-50/60 p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Notifications
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Stay on top of new answers, votes, mentions, and admin updates.
              Filter by type or focus on unread updates.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm text-slate-500">
            <span>
              Total notifications: {numberFormatter.format(items.length)}
            </span>
            <span>
              Unread: {numberFormatter.format(counts.unreadTotal || 0)}
            </span>
          </div>
        </div>
      </header>

      <Card className="border-none bg-white shadow-md ring-1 ring-slate-100">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All notifications" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => {
                  const meta =
                    TYPE_META[type] ??
                    TYPE_META[normalizeType(type)] ??
                    TYPE_META.update;
                  return (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All notifications" : meta.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 rounded-full border px-4 py-2">
              <Switch
                checked={unreadOnly}
                onCheckedChange={setUnreadOnly}
                id="toggle-unread"
              />
              <label
                htmlFor="toggle-unread"
                className="text-sm font-medium text-slate-600"
              >
                Unread only
              </label>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => load()}
            className="order-2 md:order-none"
          >
            Refresh feed
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-0">
          {filteredItems.length === 0 ? (
            <Card className="border border-dashed bg-slate-50 py-10 text-center text-sm text-slate-500">
              <CardContent>
                No notifications match the current filters.
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((notification) => {
              const type = normalizeType(notification.type);
              const meta = TYPE_META[type] ?? TYPE_META.update;
              const Icon = meta.icon || AlertTriangle;
              const isRead = notification.read ?? notification.is_read;

              return (
                <Card
                  key={notification.id}
                  className="relative overflow-hidden border-none bg-white shadow-sm ring-1 ring-slate-100"
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`}
                  />
                  <CardContent className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-start md:gap-6">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}
                    >
                      <Icon className={`size-5 ${meta.iconColor}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`${meta.pill} capitalize`}>
                          {meta.label}
                        </Badge>
                        {!isRead && (
                          <Badge className="bg-emerald-500 text-white">
                            New
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400">
                          {notification.created_at
                            ? dateFormatter.format(
                                new Date(notification.created_at)
                              )
                            : "—"}
                        </span>
                      </div>
                      <CardTitle className="text-base font-semibold text-slate-900">
                        {notification.title ||
                          (meta.label === "Answer"
                            ? "New answer received"
                            : "Notification update")}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600">
                        {notification.message ||
                          "You have a new notification."}
                      </CardDescription>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-700"
                        >
                          View details →
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markOne(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
        <CardFooter className="flex flex-col justify-between gap-4 border-t px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center">
          <span>
            {filteredItems.length} notifications shown ·{" "}
            {counts.unreadTotal} unread total
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={markAll}
              disabled={counts.unreadTotal === 0}
            >
              Mark all as read
            </Button>
          </div>
        </CardFooter>
      </Card>

      {summaryCards.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {summaryCards.map((entry) => (
            <Card
              key={entry.key}
              className="border bg-white shadow-sm ring-1 ring-slate-100"
            >
              <CardContent className="flex items-center justify-between gap-4 py-6">
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {entry.label}
                  </span>
                  <span className="text-2xl font-semibold text-slate-900">
                    {numberFormatter.format(entry.total)}
                  </span>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {numberFormatter.format(entry.unread)} unread
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
