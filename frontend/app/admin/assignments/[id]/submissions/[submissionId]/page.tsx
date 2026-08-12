"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, SubmissionDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export default function AdminSubmissionDetailPage() {
      const params = useParams<{ id: string; submissionId: string }>();
      const router = useRouter();
      const assignmentId = params.id;
      const submissionId = params.submissionId;

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
      const submission = submissionsQuery.data?.find((s) => s.id === submissionId) ?? null;
      const loading = assignmentQuery.isPending || submissionsQuery.isPending;
      const error =
            assignmentQuery.error instanceof ApiError
                  ? assignmentQuery.error.message
                  : submissionsQuery.error instanceof ApiError
                    ? submissionsQuery.error.message
                    : assignmentQuery.error || submissionsQuery.error
                      ? "Failed to load submission."
                      : null;

      if (loading) return <LoadingBlock label="Loading submission…" />;
      if (error) return <ErrorBlock message={error} />;
      if (!assignment) return <ErrorBlock message="Assignment not found." />;
      if (!submission) return <ErrorBlock message="Submission not found." />;

      return (
            <div>
                  <button
                        type="button"
                        onClick={() => router.push(`/admin/assignments/${assignmentId}`)}
                        className="mb-4 text-sm text-(--color-ink-soft) hover:underline"
                  >
                        ← Back to assignment
                  </button>

                  <PageHeader
                        title={submission.studentName}
                        description={`${assignment.title} · ${assignment.className} · ${assignment.subjectName}`}
                        actions={<SubmissionStatusBadge status={submission.status} />}
                  />

                  <div className="mb-4 flex flex-wrap gap-4 text-sm">
                        <div>
                              <span className="text-(--color-ink-soft)">Assignment status: </span>
                              <AssignmentStatusBadge status={assignment.status} />
                        </div>
                        <div>
                              <span className="text-(--color-ink-soft)">Submitted: </span>
                              <span className="font-medium">{formatDateTime(submission.submittedAt)}</span>
                        </div>
                        <div>
                              <span className="text-(--color-ink-soft)">Marks: </span>
                              <span className="font-medium">
                                    {submission.marks !== null ? `${submission.marks} / ${submission.maxMarks}` : "Not graded"}
                              </span>
                        </div>
                  </div>

                  <div className="sm-card mb-6 p-5">
                        <p className="text-sm text-(--color-ink-soft)">Answer</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{submission.answer}</p>
                  </div>

                  {submission.feedback && (
                        <div className="sm-card p-5">
                              <p className="text-sm text-(--color-ink-soft)">Teacher feedback</p>
                              <p className="mt-2 whitespace-pre-wrap text-sm">{submission.feedback}</p>
                        </div>
                  )}
            </div>
      );
}
