"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, NotificationDto, get, put } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<NotificationDto[]>("/api/notifications");
      setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markRead = async (id: string) => {
    setBusyId(id);
    try {
      await put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to mark notification as read.");
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    setBusyId("all");
    try {
      await Promise.all(unread.map((n) => put(`/api/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to mark all as read.");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "You're all caught up."}
        actions={
          unreadCount > 0 ? (
            <button type="button" className="sm-btn sm-btn-secondary" disabled={busyId === "all"} onClick={markAllRead}>
              Mark all as read
            </button>
          ) : undefined
        }
      />

      {loading && <LoadingBlock label="Loading notifications…" />}
      {error && <ErrorBlock message={error} />}

      {!loading && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`sm-card flex items-start justify-between gap-4 p-4 ${n.isRead ? "" : "border-[var(--color-primary-soft)]"}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />}
                  <p className="font-medium text-[var(--color-primary-dark)]">{n.title}</p>
                </div>
                <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{n.body}</p>
                <p className="mt-2 text-xs text-[var(--color-muted)]">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  className="sm-btn sm-btn-secondary shrink-0"
                  disabled={busyId === n.id}
                  onClick={() => markRead(n.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="sm-card p-8 text-center text-sm text-[var(--color-ink-soft)]">No notifications yet.</div>
          )}
        </div>
      )}
    </AppShell>
  );
}
