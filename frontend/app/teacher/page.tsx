"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { AssignmentStatusBadge } from "@/components/Badge";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, DashboardStatsDto, get } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export default function TeacherDashboardPage() {
      const { user } = useAuth();
      const dashboardQuery = useQuery({
            queryKey: queryKeys.dashboard,
            queryFn: () => get<DashboardStatsDto>("/api/dashboard"),
      });
      const assignmentsQuery = useQuery({
            queryKey: queryKeys.assignments,
            queryFn: () => get<AssignmentDto[]>("/api/assignments"),
            enabled: !!user?.id,
      });
      const teacherId = user?.id;
      const data = assignmentsQuery.data;
      const upcoming =
            !data || !teacherId
                  ? []
                  : data
                          .filter((a) => a.createdByTeacherId === teacherId)
                          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                          .slice(0, 5);
      const loading = dashboardQuery.isPending || assignmentsQuery.isPending;
      const error =
            dashboardQuery.error instanceof ApiError
                  ? dashboardQuery.error.message
                  : assignmentsQuery.error instanceof ApiError
                    ? assignmentsQuery.error.message
                    : dashboardQuery.error || assignmentsQuery.error
                      ? "Failed to load dashboard."
                      : null;
      const stats = dashboardQuery.data;

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
                                          {upcoming.map((a) => (
                                                <tr key={a.id}>
                                                      <td>
                                                            <Link
                                                                  href={`/teacher/assignments/${a.id}`}
                                                                  className="font-medium text-(--color-primary-dark) hover:underline"
                                                            >
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
                                          {upcoming.length === 0 && !loading && (
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
