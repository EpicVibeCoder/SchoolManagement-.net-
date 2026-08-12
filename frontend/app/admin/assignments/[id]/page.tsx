"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, SubmissionDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PAGE_SIZE, paginate } from "@/lib/paginate";
import { queryKeys } from "@/lib/query-keys";

export default function AdminAssignmentDetailPage() {
      const params = useParams<{ id: string }>();
      const router = useRouter();
      const assignmentId = params.id;
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);

      const assignmentQuery = useQuery({
            queryKey: queryKeys.assignment(assignmentId),
            queryFn: () => get<AssignmentDto>(`/api/assignments/${assignmentId}`),
            enabled: !!assignmentId,
      });
      const submissionsQuery = useQuery({
            queryKey: queryKeys.submissions(assignmentId),
            queryFn: () => get<SubmissionDto[]>(`/api/assignments/${assignmentId}/submissions`),
            enabled: !!assignmentId,
      });

      const assignment = assignmentQuery.data ?? null;
      const submissions = submissionsQuery.data ?? [];
      const loading = assignmentQuery.isPending || submissionsQuery.isPending;
      const error =
            assignmentQuery.error instanceof ApiError
                  ? assignmentQuery.error.message
                  : submissionsQuery.error instanceof ApiError
                    ? submissionsQuery.error.message
                    : assignmentQuery.error || submissionsQuery.error
                      ? "Failed to load assignment."
                      : null;

      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            if (!q) return submissions;
            return submissions.filter(
                  (s) =>
                        s.studentName.toLowerCase().includes(q) ||
                        s.status.toLowerCase().includes(q),
            );
      }, [submissions, search]);

      const { pageItems, totalPages, currentPage, total } = paginate(filtered, page);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      if (loading) return <LoadingBlock label="Loading assignment…" />;
      if (error) return <ErrorBlock message={error} />;
      if (!assignment) return <ErrorBlock message="Assignment not found." />;

      return (
            <div>
                  <button
                        type="button"
                        onClick={() => router.push("/admin/assignments")}
                        className="mb-4 text-sm text-(--color-ink-soft) hover:underline"
                  >
                        ← Back to assignments
                  </button>

                  <PageHeader
                        title={assignment.title}
                        description={`${assignment.className} · ${assignment.subjectName} · Due ${formatDateTime(assignment.deadline)}`}
                        actions={<AssignmentStatusBadge status={assignment.status} />}
                  />

                  <div className="sm-card mb-6 p-5">
                        <p className="text-sm text-(--color-ink-soft)">Description</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{assignment.description}</p>
                        <div className="mt-4 flex flex-wrap gap-6 text-sm">
                              <div>
                                    <span className="text-(--color-ink-soft)">Teacher: </span>
                                    <span className="font-medium">{assignment.teacherName}</span>
                              </div>
                              <div>
                                    <span className="text-(--color-ink-soft)">Max marks: </span>
                                    <span className="font-medium">{assignment.maxMarks}</span>
                              </div>
                              <div>
                                    <span className="text-(--color-ink-soft)">Submissions: </span>
                                    <span className="font-medium">{assignment.submissionCount}</span>
                              </div>
                        </div>
                  </div>

                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold">Student submissions</h2>
                        <input
                              type="search"
                              className="sm-input sm:max-w-xs"
                              placeholder="Search by student or status…"
                              value={search}
                              onChange={(e) => onSearchChange(e.target.value)}
                        />
                  </div>
                  <div className="sm-card overflow-x-auto">
                        <table className="sm-table">
                              <thead>
                                    <tr>
                                          <th>Student</th>
                                          <th>Submitted</th>
                                          <th>Status</th>
                                          <th>Marks</th>
                                    </tr>
                              </thead>
                              <tbody>
                                    {pageItems.map((s) => (
                                          <tr key={s.id}>
                                                <td>
                                                      <Link
                                                            href={`/admin/assignments/${assignmentId}/submissions/${s.id}`}
                                                            className="font-[550] text-(--color-primary-dark) underline-offset-2 hover:text-(--color-primary-soft) hover:underline"
                                                      >
                                                            {s.studentName}
                                                      </Link>
                                                </td>
                                                <td>{formatDateTime(s.submittedAt)}</td>
                                                <td>
                                                      <SubmissionStatusBadge status={s.status} />
                                                </td>
                                                <td>{s.marks !== null ? `${s.marks} / ${s.maxMarks}` : "—"}</td>
                                          </tr>
                                    ))}
                                    {pageItems.length === 0 && (
                                          <tr>
                                                <td colSpan={4} className="text-center text-(--color-ink-soft)">
                                                      {submissions.length === 0
                                                            ? "No submissions yet."
                                                            : "No submissions match your search."}
                                                </td>
                                          </tr>
                                    )}
                              </tbody>
                        </table>
                  </div>
                  <ListPagination
                        page={currentPage}
                        totalPages={totalPages}
                        total={total}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                  />
            </div>
      );
}
