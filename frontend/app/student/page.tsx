"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, DashboardStatsDto, SubmissionDto, get } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export default function StudentDashboardPage() {
      const { user } = useAuth();
      const dashboardQuery = useQuery({
            queryKey: queryKeys.dashboard,
            queryFn: () => get<DashboardStatsDto>("/api/dashboard"),
      });
      const assignmentsQuery = useQuery({
            queryKey: queryKeys.assignments,
            queryFn: () => get<AssignmentDto[]>("/api/assignments"),
      });
      const mySubmissionsQuery = useQuery({
            queryKey: queryKeys.mySubmissions,
            queryFn: () => get<SubmissionDto[]>("/api/submissions/mine"),
      });

      const upcoming = useMemo(() => {
            if (!assignmentsQuery.data) return [];
            return [...assignmentsQuery.data].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5);
      }, [assignmentsQuery.data]);

      const recentSubmissions = useMemo(() => {
            if (!mySubmissionsQuery.data) return [];
            return mySubmissionsQuery.data.slice(0, 5);
      }, [mySubmissionsQuery.data]);

      const loading = dashboardQuery.isPending || assignmentsQuery.isPending || mySubmissionsQuery.isPending;
      const error =
            dashboardQuery.error instanceof ApiError
                  ? dashboardQuery.error.message
                  : assignmentsQuery.error instanceof ApiError
                    ? assignmentsQuery.error.message
                    : mySubmissionsQuery.error instanceof ApiError
                      ? mySubmissionsQuery.error.message
                      : dashboardQuery.error || assignmentsQuery.error || mySubmissionsQuery.error
                        ? "Failed to load dashboard."
                        : null;
      const stats = dashboardQuery.data;

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
                                    <p className="text-3xl font-semibold text-(--color-primary-dark)" style={{ fontFamily: "var(--font-serif)" }}>
                                          {stats.assignments}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">Assignments</p>
                              </div>
                              <div className="sm-card p-4">
                                    <p className="text-3xl font-semibold text-(--color-primary-dark)" style={{ fontFamily: "var(--font-serif)" }}>
                                          {recentSubmissions.length}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">My Submissions</p>
                              </div>
                              <div className="sm-card p-4">
                                    <p className="text-3xl font-semibold text-(--color-primary-dark)" style={{ fontFamily: "var(--font-serif)" }}>
                                          {stats.dueSoon}
                                    </p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-ink-soft)">Due Soon</p>
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
                                                {upcoming.map((a) => (
                                                      <tr key={a.id}>
                                                            <td>
                                                                  <Link
                                                                        href={`/student/assignments/${a.id}`}
                                                                        className="font-medium text-(--color-primary-dark) hover:underline"
                                                                  >
                                                                        {a.title}
                                                                  </Link>
                                                            </td>
                                                            <td>{formatDateTime(a.deadline)}</td>
                                                            <td>
                                                                  <AssignmentStatusBadge status={a.status} />
                                                            </td>
                                                      </tr>
                                                ))}
                                                {upcoming.length === 0 && !loading && (
                                                      <tr>
                                                            <td colSpan={3} className="text-center text-(--color-ink-soft)">
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
                                                {recentSubmissions.map((s) => (
                                                      <tr key={s.id}>
                                                            <td className="font-medium text-(--color-primary-dark)">{s.assignmentTitle}</td>
                                                            <td>
                                                                  <SubmissionStatusBadge status={s.status} />
                                                            </td>
                                                            <td>{s.marks !== null ? `${s.marks} / ${s.maxMarks}` : "—"}</td>
                                                      </tr>
                                                ))}
                                                {recentSubmissions.length === 0 && !loading && (
                                                      <tr>
                                                            <td colSpan={3} className="text-center text-(--color-ink-soft)">
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
