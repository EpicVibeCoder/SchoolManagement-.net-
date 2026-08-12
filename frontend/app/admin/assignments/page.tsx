"use client";

import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export default function AdminAssignmentsPage() {
      const {
            data: assignments = [],
            isPending: loading,
            error,
      } = useQuery({
            queryKey: queryKeys.assignments,
            queryFn: () => get<AssignmentDto[]>("/api/assignments"),
      });
      const errorMessage = error instanceof ApiError ? error.message : error ? "Failed to load assignments." : null;

      return (
            <div>
                  <PageHeader title="Assignments" description="All assignments across the school (read-only)." />

                  {loading && <LoadingBlock label="Loading assignments…" />}
                  {errorMessage && <ErrorBlock message={errorMessage} />}

                  {!loading && !errorMessage && (
                        <div className="sm-card overflow-x-auto">
                              <table className="sm-table">
                                    <thead>
                                          <tr>
                                                <th>Title</th>
                                                <th>Class</th>
                                                <th>Subject</th>
                                                <th>Teacher</th>
                                                <th>Deadline</th>
                                                <th>Max Marks</th>
                                                <th>Submissions</th>
                                                <th>Status</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {assignments.map((a) => (
                                                <tr key={a.id}>
                                                      <td className="font-medium text-(--color-primary-dark)">{a.title}</td>
                                                      <td>{a.className}</td>
                                                      <td>{a.subjectName}</td>
                                                      <td>{a.teacherName}</td>
                                                      <td>{formatDateTime(a.deadline)}</td>
                                                      <td>{a.maxMarks}</td>
                                                      <td>{a.submissionCount}</td>
                                                      <td>
                                                            <AssignmentStatusBadge status={a.status} />
                                                      </td>
                                                </tr>
                                          ))}
                                          {assignments.length === 0 && (
                                                <tr>
                                                      <td colSpan={8} className="text-center text-(--color-ink-soft)">
                                                            No assignments yet.
                                                      </td>
                                                </tr>
                                          )}
                                    </tbody>
                              </table>
                        </div>
                  )}
            </div>
      );
}
