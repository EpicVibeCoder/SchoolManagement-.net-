"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { AssignmentStatusBadge } from "@/components/Badge";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, DashboardStatsDto, get } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default function TeacherDashboardPage() {
      const { user } = useAuth();
      const [stats, setStats] = useState<DashboardStatsDto | null>(null);
      const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
            let cancelled = false;
            Promise.all([get<DashboardStatsDto>("/api/dashboard"), get<AssignmentDto[]>("/api/assignments")])
                  .then(([statsData, assignmentsData]) => {
                        if (cancelled) return;
                        setStats(statsData);
                        setAssignments(
                              assignmentsData
                                    .filter((a) => a.createdByTeacherId === user?.id)
                                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                                    .slice(0, 5),
                        );
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
      }, [user?.id]);

      return (
            <div>
                  <PageHeader
                        title="Teacher Dashboard"
                        description={`Welcome back, ${user?.fullName ?? ""}.`}
                        actions={
                              <Link href="/teacher/assignments" className="sm-btn sm-btn-primary">
                                    Manage Assignments
                              </Link>
                        }
                  />

                  {loading && <LoadingBlock label="Loading dashboard…" />}
                  {error && <ErrorBlock message={error} />}

                  {stats && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <div className="sm-card p-4">
                                    <p className="text-3xl font-semibold text-(--color-primary-dark)" style={{ fontFamily: "var(--font-serif)" }}>
                                          {stats.assignments}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">Assignments</p>
                              </div>
                              <div className="sm-card p-4">
                                    <p className="text-3xl font-semibold text-(--color-primary-dark)" style={{ fontFamily: "var(--font-serif)" }}>
                                          {stats.submissions}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">Submissions</p>
                              </div>
                              <div className="sm-card p-4">
                                    <p className="text-3xl font-semibold text-(--color-primary-dark)" style={{ fontFamily: "var(--font-serif)" }}>
                                          {stats.pendingGrading}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">Pending Grading</p>
                              </div>
                              <div className="sm-card p-4">
                                    <p className="text-3xl font-semibold text-(--color-primary-dark)" style={{ fontFamily: "var(--font-serif)" }}>
                                          {stats.dueSoon}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">Due Soon</p>
                              </div>
                        </div>
                  )}

                  <div className="mt-8">
                        <h2 className="mb-3 text-lg font-semibold">Your upcoming assignments</h2>
                        <div className="sm-card overflow-x-auto">
                              <table className="sm-table">
                                    <thead>
                                          <tr>
                                                <th>Title</th>
                                                <th>Class / Subject</th>
                                                <th>Deadline</th>
                                                <th>Status</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {assignments.map((a) => (
                                                <tr key={a.id}>
                                                      <td>
                                                            <Link href={`/teacher/assignments/${a.id}`} className="font-medium text-(--color-primary-dark) hover:underline">
                                                                  {a.title}
                                                            </Link>
                                                      </td>
                                                      <td>
                                                            {a.className} · {a.subjectName}
                                                      </td>
                                                      <td>{formatDateTime(a.deadline)}</td>
                                                      <td>
                                                            <AssignmentStatusBadge status={a.status} />
                                                      </td>
                                                </tr>
                                          ))}
                                          {assignments.length === 0 && !loading && (
                                                <tr>
                                                      <td colSpan={4} className="text-center text-(--color-ink-soft)">
                                                            No assignments yet.
                                                      </td>
                                                </tr>
                                          )}
                                    </tbody>
                              </table>
                        </div>
                  </div>
            </div>
      );
}
