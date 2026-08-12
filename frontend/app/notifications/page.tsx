"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, NotificationDto, get, put } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { PAGE_SIZE, paginate } from "@/lib/paginate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export default function NotificationsPage() {
      const { user, loading: authLoading } = useAuth();
      const router = useRouter();
      const queryClient = useQueryClient();
      const [busyId, setBusyId] = useState<string | null>(null);
      const [actionError, setActionError] = useState<string | null>(null);
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);

      useEffect(() => {
            if (!authLoading && !user) {
                  router.replace("/login");
            }
      }, [authLoading, user, router]);

      const notificationsQuery = useQuery({
            queryKey: queryKeys.notifications,
            queryFn: () => get<NotificationDto[]>("/api/notifications"),
            enabled: !!user,
      });

      const notifications = useMemo(() => {
            if (!notificationsQuery.data) return [];
            return [...notificationsQuery.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }, [notificationsQuery.data]);

      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            if (!q) return notifications;
            return notifications.filter(
                  (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
            );
      }, [notifications, search]);

      const { pageItems, totalPages, currentPage, total } = paginate(filtered, page);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      const loading = notificationsQuery.isPending;
      const error =
            actionError ??
            (notificationsQuery.error instanceof ApiError
                  ? notificationsQuery.error.message
                  : notificationsQuery.error
                    ? "Failed to load notifications."
                    : null);

      const invalidateNotificationQueries = async () => {
            await Promise.all([
                  queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
                  queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread }),
            ]);
      };

      const markRead = async (id: string) => {
            setBusyId(id);
            setActionError(null);
            try {
                  await put(`/api/notifications/${id}/read`);
                  await invalidateNotificationQueries();
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to mark notification as read.");
            } finally {
                  setBusyId(null);
            }
      };

      const markAllRead = async () => {
            const unread = notifications.filter((n) => !n.isRead);
            if (unread.length === 0) return;
            setBusyId("all");
            setActionError(null);
            try {
                  await Promise.all(unread.map((n) => put(`/api/notifications/${n.id}/read`)));
                  await invalidateNotificationQueries();
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to mark all as read.");
            } finally {
                  setBusyId(null);
            }
      };

      if (authLoading || !user) {
            return (
                  <div className="flex min-h-screen flex-1 items-center justify-center">
                        <p className="text-sm text-(--color-ink-soft)">Loading…</p>
                  </div>
            );
      }

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return (
            <AppShell>
                  <PageHeader
                        title="Notifications"
                        description={
                              unreadCount > 0
                                    ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
                                    : "You're all caught up."
                        }
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
                        <>
                              <div className="mb-4">
                                    <input
                                          type="search"
                                          className="sm-input sm:max-w-sm"
                                          placeholder="Search notifications…"
                                          value={search}
                                          onChange={(e) => onSearchChange(e.target.value)}
                                    />
                              </div>
                              <div className="space-y-2">
                                    {pageItems.map((n) => (
                                          <div
                                                key={n.id}
                                                className={`sm-card flex items-start justify-between gap-4 p-4 ${n.isRead ? "" : "border-(--color-primary-soft)"}`}
                                          >
                                                <div>
                                                      <div className="flex items-center gap-2">
                                                            {!n.isRead && <span className="h-2 w-2 rounded-full bg-accent" />}
                                                            <p className="font-medium text-(--color-primary-dark)">{n.title}</p>
                                                      </div>
                                                      <p className="mt-1 text-sm text-(--color-ink-soft)">{n.body}</p>
                                                      <p className="mt-2 text-xs text-(--color-muted)">{formatDateTime(n.createdAt)}</p>
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
                                    {pageItems.length === 0 && (
                                          <div className="sm-card p-8 text-center text-sm text-(--color-ink-soft)">
                                                {notifications.length === 0
                                                      ? "No notifications yet."
                                                      : "No notifications match your search."}
                                          </div>
                                    )}
                              </div>
                              <ListPagination
                                    page={currentPage}
                                    totalPages={totalPages}
                                    total={total}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={setPage}
                              />
                        </>
                  )}
            </AppShell>
      );
}
