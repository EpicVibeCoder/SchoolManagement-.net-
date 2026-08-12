"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get, UserRole, userRoleLabels } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";

interface NavLink {
      href: string;
      label: string;
}

const NAV_LINKS: Record<UserRole, NavLink[]> = {
      [UserRole.Admin]: [
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/classes", label: "Classes" },
            { href: "/admin/subjects", label: "Subjects" },
            { href: "/admin/teacher-assignments", label: "Teacher Assignments" },
            { href: "/admin/enrollments", label: "Enrollments" },
            { href: "/admin/assignments", label: "Assignments" },
            { href: "/admin/submissions", label: "Submissions" },
            { href: "/admin/settings", label: "Settings" },
      ],
      [UserRole.Teacher]: [
            { href: "/teacher", label: "Dashboard" },
            { href: "/teacher/assignments", label: "Assignments" },
      ],
      [UserRole.Student]: [
            { href: "/student", label: "Dashboard" },
            { href: "/student/assignments", label: "Assignments" },
      ],
};

export default function AppShell({ children }: { children: React.ReactNode }) {
      const { user, logout } = useAuth();
      const pathname = usePathname();
      const router = useRouter();
      const [menuOpen, setMenuOpen] = useState(false);

      const unreadQuery = useQuery({
            queryKey: [...queryKeys.notificationsUnread, pathname],
            queryFn: () => get<number>("/api/notifications/unread-count"),
            enabled: !!user,
      });
      const unreadCount = unreadQuery.data ?? 0;

      const links = user ? (NAV_LINKS[user.role] ?? []) : [];

      const handleLogout = () => {
            logout();
            router.replace("/login");
      };

      return (
            <div className="flex min-h-screen flex-col">
                  <header className="sticky top-0 z-30 border-b border-(--color-border) bg-surface/95 backdrop-blur">
                        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                              <div className="flex items-center gap-6">
                                    <Link href={user ? "/" : "/login"} className="flex items-baseline gap-2">
                                          <span
                                                className="text-lg font-semibold text-(--color-primary-dark)"
                                                style={{ fontFamily: "var(--font-serif)" }}
                                          >
                                                School Management
                                          </span>
                                    </Link>
                                    <nav className="hidden items-center gap-1 lg:flex">
                                          {links.map((link) => {
                                                const isSectionRoot = link.href === "/admin" || link.href === "/teacher" || link.href === "/student";
                                                const active = pathname === link.href || (!isSectionRoot && !!pathname?.startsWith(link.href + "/"));
                                                return (
                                                      <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                                                  active
                                                                        ? "bg-primary text-(--color-on-primary)"
                                                                        : "text-(--color-ink-soft) hover:bg-(--color-bg-soft) hover:text-(--color-primary-dark)"
                                                            }`}
                                                      >
                                                            {link.label}
                                                      </Link>
                                                );
                                          })}
                                    </nav>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-3">
                                    <Link
                                          href="/notifications"
                                          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-primary-dark) transition hover:border-(--color-primary-soft)"
                                          aria-label="Notifications"
                                    >
                                          <BellIcon />
                                          {unreadCount > 0 && (
                                                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--color-danger) px-1 text-[10px] font-bold text-white">
                                                      {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                          )}
                                    </Link>

                                    <div className="hidden text-right sm:block">
                                          <p className="text-sm font-semibold leading-tight text-(--color-primary-dark)">{user?.fullName}</p>
                                          <p className="text-xs leading-tight text-(--color-ink-soft)">{user ? userRoleLabels[user.role] : ""}</p>
                                    </div>

                                    <button type="button" onClick={handleLogout} className="sm-btn sm-btn-secondary hidden sm:inline-flex">
                                          Log out
                                    </button>

                                    <button
                                          type="button"
                                          className="flex h-9 w-9 items-center justify-center rounded-md border border-(--color-border) lg:hidden"
                                          onClick={() => setMenuOpen((v) => !v)}
                                          aria-label="Toggle menu"
                                    >
                                          <MenuIcon />
                                    </button>
                              </div>
                        </div>

                        {menuOpen && (
                              <nav className="border-t border-(--color-border) px-4 py-2 lg:hidden">
                                    <div className="flex flex-col gap-1">
                                          {links.map((link) => {
                                                const isSectionRoot = link.href === "/admin" || link.href === "/teacher" || link.href === "/student";

                                                const active = pathname === link.href || (!isSectionRoot && !!pathname?.startsWith(link.href + "/"));
                                                return (
                                                      <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            onClick={() => setMenuOpen(false)}
                                                            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                                                  active
                                                                        ? "bg-primary text-(--color-on-primary)"
                                                                        : "text-(--color-ink-soft) hover:bg-(--color-bg-soft)"
                                                            }`}
                                                      >
                                                            {link.label}
                                                      </Link>
                                                );
                                          })}
                                          <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="mt-1 rounded-md px-3 py-2 text-left text-sm font-medium text-(--color-danger) hover:bg-(--color-danger-bg)"
                                          >
                                                Log out
                                          </button>
                                    </div>
                              </nav>
                        )}
                  </header>

                  <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
            </div>
      );
}

function BellIcon() {
      return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
      );
}

function MenuIcon() {
      return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
      );
}
