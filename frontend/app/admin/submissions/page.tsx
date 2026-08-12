"use client";

import { useQuery } from "@tanstack/react-query";
import { SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, SubmissionDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export default function AdminSubmissionsPage() {
      const {
            data: submissions = [],
            isPending: loading,
            error,
      } = useQuery({
            queryKey: queryKeys.allSubmissions,
            queryFn: async () => {
                  const assignments = await get<AssignmentDto[]>("/api/assignments");
                  const results = await Promise.all(
                        assignments.map((a) => get<SubmissionDto[]>(`/api/assignments/${a.id}/submissions`).catch(() => [] as SubmissionDto[])),
                  );
                  return results.flat().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            },
      });
      const errorMessage = error instanceof ApiError ? error.message : error ? "Failed to load submissions." : null;

      return (
            <div>
                  <PageHeader title="Submissions" description="All student submissions across every assignment (read-only)." />

                  {loading && <LoadingBlock label="Loading submissions…" />}
                  {errorMessage && <ErrorBlock message={errorMessage} />}

                  {!loading && !errorMessage && (
                        <div className="sm-card overflow-x-auto">
                              <table className="sm-table">
                                    <thead>
                                          <tr>
                                                <th>Assignment</th>
                                                <th>Student</th>
                                                <th>Submitted</th>
                                                <th>Status</th>
                                                <th>Marks</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {submissions.map((s) => (
                                                <tr key={s.id}>
                                                      <td className="font-medium text-(--color-primary-dark)">{s.assignmentTitle}</td>
                                                      <td>{s.studentName}</td>
                                                      <td>{formatDateTime(s.submittedAt)}</td>
                                                      <td>
                                                            <SubmissionStatusBadge status={s.status} />
                                                      </td>
                                                      <td>{s.marks !== null ? `${s.marks} / ${s.maxMarks}` : "—"}</td>
                                                </tr>
                                          ))}
                                          {submissions.length === 0 && (
                                                <tr>
                                                      <td colSpan={5} className="text-center text-(--color-ink-soft)">
                                                            No submissions yet.
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
