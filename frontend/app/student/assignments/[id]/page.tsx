"use client";

import {  useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, SubmissionDto, get, post, put } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export default function StudentAssignmentDetailPage() {
      const params = useParams<{ id: string }>();
      const router = useRouter();
      const queryClient = useQueryClient();
      const assignmentId = params.id;

      const [draft, setDraft] = useState<string | null>(null);
      const [formError, setFormError] = useState<string | null>(null);
      const [success, setSuccess] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [now] = useState(() => Date.now());

      const assignmentQuery = useQuery({
            queryKey: queryKeys.assignment(assignmentId),
            queryFn: () => get<AssignmentDto>(`/api/assignments/${assignmentId}`),
            enabled: !!assignmentId,
      });
      const mySubmissionsQuery = useQuery({
            queryKey: queryKeys.mySubmissions,
            queryFn: () => get<SubmissionDto[]>("/api/submissions/mine"),
      });

      const assignment = assignmentQuery.data ?? null;
      const submission = mySubmissionsQuery.data?.find((s) => s.assignmentId === assignmentId) ?? null;
      const answer = draft ?? submission?.answer ?? "";

      const loading = assignmentQuery.isPending || mySubmissionsQuery.isPending;
      const error =
            assignmentQuery.error instanceof ApiError
                  ? assignmentQuery.error.message
                  : mySubmissionsQuery.error instanceof ApiError
                    ? mySubmissionsQuery.error.message
                    : assignmentQuery.error || mySubmissionsQuery.error
                      ? "Failed to load assignment."
                      : null;

      const onSubmit = async () => {
            if (!answer.trim()) {
                  setFormError("Please enter an answer before submitting.");
                  return;
            }
            setFormError(null);
            setSuccess(null);
            setSubmitting(true);
            try {
                  if (submission) {
                        await put(`/api/submissions/${submission.id}`, { answer });
                        setSuccess("Your answer has been updated.");
                  } else {
                        await post("/api/submissions", { assignmentId, answer });
                        setSuccess("Your answer has been submitted.");
                  }
                  await Promise.all([
                        queryClient.invalidateQueries({ queryKey: queryKeys.assignment(assignmentId) }),
                        queryClient.invalidateQueries({ queryKey: queryKeys.mySubmissions }),
                        queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
                        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
                  ]);
                  setDraft(null);
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to submit your answer.");
            } finally {
                  setSubmitting(false);
            }
      };

      if (loading) return <LoadingBlock label="Loading assignment…" />;
      if (error) return <ErrorBlock message={error} />;
      if (!assignment) return <ErrorBlock message="Assignment not found." />;

      const isPastDeadline = new Date(assignment.deadline).getTime() < now;
      const isGraded = submission?.marks !== null && submission?.marks !== undefined;

      return (
            <div>
                  <button
                        type="button"
                        onClick={() => router.push("/student/assignments")}
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
                                    <span className="text-(--color-ink-soft)">Max marks: </span>
                                    <span className="font-medium">{assignment.maxMarks}</span>
                              </div>
                              {isPastDeadline && <div className="text-(--color-danger)">Deadline has passed.</div>}
                        </div>
                  </div>

                  {isGraded && submission && (
                        <div className="sm-card mb-6 p-5">
                              <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-(--color-primary-dark)">Your grade</h2>
                                    <SubmissionStatusBadge status={submission.status} />
                              </div>
                              <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                                    {submission.marks} <span className="text-sm font-normal text-(--color-ink-soft)">/ {submission.maxMarks}</span>
                              </p>
                              {submission.feedback && (
                                    <div className="mt-2">
                                          <p className="text-xs uppercase tracking-wide text-(--color-ink-soft)">Feedback</p>
                                          <p className="mt-1 whitespace-pre-wrap text-sm">{submission.feedback}</p>
                                    </div>
                              )}
                        </div>
                  )}

                  <div className="sm-card p-5">
                        <div className="flex items-center justify-between">
                              <h2 className="text-base font-semibold">{submission ? "Your answer" : "Submit your answer"}</h2>
                              {submission && <SubmissionStatusBadge status={submission.status} />}
                        </div>

                        {formError && <div className="sm-alert sm-alert-danger mt-3">{formError}</div>}
                        {success && <div className="sm-alert sm-alert-success mt-3">{success}</div>}

                        <textarea
                              rows={8}
                              className="sm-input mt-3"
                              placeholder="Write your answer here…"
                              value={answer}
                              onChange={(e) => setDraft(e.target.value)}
                        />

                        <div className="mt-3 flex justify-end">
                              <button type="button" className="sm-btn sm-btn-primary" disabled={submitting} onClick={onSubmit}>
                                    {submitting ? "Saving…" : submission ? "Update answer" : "Submit answer"}
                              </button>
                        </div>

                        {submission && (
                              <p className="mt-2 text-xs text-(--color-ink-soft)">Last submitted {formatDateTime(submission.submittedAt)}</p>
                        )}
                  </div>
            </div>
      );
}
