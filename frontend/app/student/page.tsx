"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, DashboardStatsDto, SubmissionDto, get } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [mySubmissions, setMySubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      get<DashboardStatsDto>("/api/dashboard"),
      get<AssignmentDto[]>("/api/assignments"),
      get<SubmissionDto[]>("/api/submissions/mine"),
    ])
      .then(([statsData, assignmentsData, submissionsData]) => {
        if (cancelled) return;
        setStats(statsData);
        setAssignments(
          assignmentsData
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 5)
        );
        setMySubmissions(submissionsData.slice(0, 5));
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
      <PageHeader
        title="Student Dashboard"
        description={`Welcome back, ${user?.fullName ?? ""}.`}
        actions={
          <Link href="/student/assignments" className="sm-btn sm-btn-primary">
            View Assignments
          </Link>
        }
      />

      {loading && <LoadingBlock label="Loading dashboard…" />}
      {error && <ErrorBlock message={error} />}

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="sm-card p-4">
            <p className="text-3xl font-semibold text-[var(--color-primary-dark)]" style={{ fontFamily: "var(--font-serif)" }}>
              {stats.assignments}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">Assignments</p>
          </div>
          <div className="sm-card p-4">
            <p className="text-3xl font-semibold text-[var(--color-primary-dark)]" style={{ fontFamily: "var(--font-serif)" }}>
              {mySubmissions.length}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">My Submissions</p>
          </div>
          <div className="sm-card p-4">
            <p className="text-3xl font-semibold text-[var(--color-primary-dark)]" style={{ fontFamily: "var(--font-serif)" }}>
              {stats.dueSoon}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">Due Soon</p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Upcoming assignments</h2>
          <div className="sm-card overflow-x-auto">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/student/assignments/${a.id}`} className="font-medium text-[var(--color-primary-dark)] hover:underline">
                        {a.title}
                      </Link>
                    </td>
                    <td>{formatDateTime(a.deadline)}</td>
                    <td><AssignmentStatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {assignments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="text-center text-[var(--color-ink-soft)]">
                      No assignments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent submissions</h2>
          <div className="sm-card overflow-x-auto">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Status</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium text-[var(--color-primary-dark)]">{s.assignmentTitle}</td>
                    <td><SubmissionStatusBadge status={s.status} /></td>
                    <td>{s.marks !== null ? `${s.marks} / ${s.maxMarks}` : "—"}</td>
                  </tr>
                ))}
                {mySubmissions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="text-center text-[var(--color-ink-soft)]">
                      No submissions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
