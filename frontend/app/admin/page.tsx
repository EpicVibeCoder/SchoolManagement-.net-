"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, DashboardStatsDto, get } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const STAT_CARDS: { key: keyof DashboardStatsDto; label: string; href: string }[] = [
  { key: "users", label: "Users", href: "/admin/users" },
  { key: "classes", label: "Classes", href: "/admin/classes" },
  { key: "assignments", label: "Assignments", href: "/admin/assignments" },
  { key: "submissions", label: "Submissions", href: "/admin/submissions" },
  { key: "pendingGrading", label: "Pending Grading", href: "/admin/submissions" },
  { key: "dueSoon", label: "Due Soon", href: "/admin/assignments" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    get<DashboardStatsDto>("/api/dashboard")
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Admin Dashboard" description={`Welcome back, ${user?.fullName ?? ""}.`} />

      {loading && <LoadingBlock label="Loading dashboard…" />}
      {error && <ErrorBlock message={error} />}

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STAT_CARDS.map((card) => (
            <Link key={card.key} href={card.href} className="sm-card block p-4 transition hover:border-[var(--color-primary-soft)]">
              <p className="text-3xl font-semibold text-[var(--color-primary-dark)]" style={{ fontFamily: "var(--font-serif)" }}>
                {stats[card.key]}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">
                {card.label}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 sm-card p-6">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/users" className="sm-btn sm-btn-secondary">Manage Users</Link>
          <Link href="/admin/classes" className="sm-btn sm-btn-secondary">Manage Classes</Link>
          <Link href="/admin/subjects" className="sm-btn sm-btn-secondary">Manage Subjects</Link>
          <Link href="/admin/teacher-assignments" className="sm-btn sm-btn-secondary">Teacher Assignments</Link>
          <Link href="/admin/enrollments" className="sm-btn sm-btn-secondary">Enrollments</Link>
          <Link href="/admin/settings" className="sm-btn sm-btn-secondary">Settings</Link>
        </div>
      </div>
    </div>
  );
}
