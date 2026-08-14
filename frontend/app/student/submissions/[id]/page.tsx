"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, SubmissionDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export default function StudentSubmissionDetailPage() {
      const params = useParams<{ id: string }>();
      const router = useRouter();
      const submissionId = params.id;

      const submissionQuery = useQuery({
            queryKey: queryKeys.submission(submissionId),
            queryFn: () => get<SubmissionDto>(`/api/submissions/${submissionId}`),
            enabled: !!submissionId,
      });

      const submission = submissionQuery.data ?? null;
      const error =
            submissionQuery.error instanceof ApiError
                  ? submissionQuery.error.message
                  : submissionQuery.error
                    ? "Failed to load submission."
                    : null;

      if (submissionQuery.isPending) return <LoadingBlock label="Loading submission…" />;
      if (error) return <ErrorBlock message={error} />;
      if (!submission) return <ErrorBlock message="Submission not found." />;

      const isGraded = submission.marks !== null && submission.marks !== undefined;

      return (
            <div>
                  <button
                        type="button"
                        onClick={() => router.push("/student")}
                        className="mb-4 text-sm text-(--color-ink-soft) hover:underline"
                  >
                        ← Back to dashboard
                  </button>

                  <PageHeader
                        title={submission.assignmentTitle}
                        description={`${submission.className} · ${submission.subjectName} · ${submission.teacherName}`}
                        actions={<SubmissionStatusBadge status={submission.status} />}
                  />

                  <div className="sm-card mb-6 p-5">
                        <div className="flex items-center justify-between gap-3">
                              <h2 className="text-base font-semibold text-(--color-primary-dark)">Assignment</h2>
                              <AssignmentStatusBadge status={submission.assignmentStatus} />
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm">{submission.assignmentDescription}</p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                              <div>
                                    <span className="text-(--color-ink-soft)">Deadline: </span>
                                    <span className="font-medium">{formatDateTime(submission.deadline)}</span>
                              </div>
                              <div>
                                    <span className="text-(--color-ink-soft)">Max marks: </span>
                                    <span className="font-medium">{submission.maxMarks}</span>
                              </div>
                        </div>
                  </div>

                  <div className="sm-card mb-6 p-5">
                        <h2 className="text-base font-semibold text-(--color-primary-dark)">Your submission</h2>
                        <p className="mt-1 text-xs text-(--color-ink-soft)">
                              {submission.studentName} · Submitted {formatDateTime(submission.submittedAt)}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm">{submission.answer}</p>
                        <div className="mt-4">
                              <Link
                                    href={`/student/assignments/${submission.assignmentId}`}
                                    className="text-sm font-[550] text-(--color-primary-dark) underline-offset-2 hover:text-(--color-primary-soft) hover:underline"
                              >
                                    Update answer
                              </Link>
                        </div>
                  </div>

                  <div className="sm-card p-5">
                        <h2 className="text-base font-semibold text-(--color-primary-dark)">Teacher feedback</h2>
                        {isGraded ? (
                              <>
                                    <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                                          {submission.marks}{" "}
                                          <span className="text-sm font-normal text-(--color-ink-soft)">/ {submission.maxMarks}</span>
                                    </p>
                                    {submission.feedback ? (
                                          <p className="mt-3 whitespace-pre-wrap text-sm">{submission.feedback}</p>
                                    ) : (
                                          <p className="mt-3 text-sm text-(--color-ink-soft)">No written comments from your teacher.</p>
                                    )}
                              </>
                        ) : (
                              <p className="mt-3 text-sm text-(--color-ink-soft)">
                                    Your teacher has not graded this submission yet. Marks and comments will appear here once they do.
                              </p>
                        )}
                  </div>
            </div>
      );
}
