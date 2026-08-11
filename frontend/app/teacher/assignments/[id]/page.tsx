"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, SubmissionDto, get, put } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
interface GradeDraft {
      marks: string;
      feedback: string;
}

export default function TeacherAssignmentDetailPage() {
      const params = useParams<{ id: string }>();
      const router = useRouter();

      const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});
      const [savingId, setSavingId] = useState<string | null>(null);
      const [rowError, setRowError] = useState<Record<string, string>>({});

      const queryClient = useQueryClient();
      const assignmentId = params.id;
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

      useEffect(() => {
            if (!submissionsQuery.data) return;
            setDrafts((prev) => {
                  const next = { ...prev };
                  submissionsQuery.data!.forEach((s) => {
                        if (!next[s.id]) {
                              next[s.id] = { marks: s.marks?.toString() ?? "", feedback: s.feedback ?? "" };
                        }
                  });
                  return next;
            });
      }, [submissionsQuery.data]);
      const updateDraft = (id: string, field: keyof GradeDraft, value: string) => {
            setDrafts((prev) => ({
                  ...prev,
                  [id]: { ...prev[id], [field]: value },
            }));
      };

      const submitGrade = async (submission: SubmissionDto) => {
            const draft = drafts[submission.id];
            const marksValue = Number(draft?.marks);
            if (!draft?.marks || Number.isNaN(marksValue)) {
                  setRowError((prev) => ({ ...prev, [submission.id]: "Enter a valid mark." }));
                  return;
            }
            if (marksValue < 0 || marksValue > submission.maxMarks) {
                  setRowError((prev) => ({ ...prev, [submission.id]: `Marks must be between 0 and ${submission.maxMarks}.` }));
                  return;
            }
            setRowError((prev) => ({ ...prev, [submission.id]: "" }));
            setSavingId(submission.id);
            try {
                  await put(`/api/submissions/${submission.id}/grade`, {
                        marks: marksValue,
                        feedback: draft.feedback ?? "",
                        status: null,
                  });
                  await queryClient.invalidateQueries({ queryKey: queryKeys.submissions(assignmentId) });
                  await queryClient.invalidateQueries({ queryKey: queryKeys.assignment(assignmentId) });
                  await queryClient.invalidateQueries({ queryKey: queryKeys.assignments });
                  await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
            } catch (err) {
                  setRowError((prev) => ({
                        ...prev,
                        [submission.id]: err instanceof ApiError ? err.message : "Failed to save grade.",
                  }));
            } finally {
                  setSavingId(null);
            }
      };

      if (loading) return <LoadingBlock label="Loading assignment…" />;
      if (error) return <ErrorBlock message={error} />;
      if (!assignment) return <ErrorBlock message="Assignment not found." />;

      return (
            <div>
                  <button
                        type="button"
                        onClick={() => router.push("/teacher/assignments")}
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
                              <div>
                                    <span className="text-(--color-ink-soft)">Submissions: </span>
                                    <span className="font-medium">{assignment.submissionCount}</span>
                              </div>
                        </div>
                  </div>

                  <h2 className="mb-3 text-lg font-semibold">Submissions</h2>
                  <div className="space-y-3">
                        {submissions.map((s) => (
                              <div key={s.id} className="sm-card p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div>
                                                <p className="font-medium text-(--color-primary-dark)">{s.studentName}</p>
                                                <p className="text-xs text-(--color-ink-soft)">Submitted {formatDateTime(s.submittedAt)}</p>
                                          </div>
                                          <SubmissionStatusBadge status={s.status} />
                                    </div>
                                    <p className="mt-3 whitespace-pre-wrap rounded-md bg-(--color-bg-soft) p-3 text-sm">{s.answer}</p>

                                    <div className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end">
                                          <div>
                                                <label className="sm-label" htmlFor={`marks-${s.id}`}>
                                                      Marks (/ {s.maxMarks})
                                                </label>
                                                <input
                                                      id={`marks-${s.id}`}
                                                      type="number"
                                                      min={0}
                                                      max={s.maxMarks}
                                                      className="sm-input"
                                                      value={drafts[s.id]?.marks ?? ""}
                                                      onChange={(e) => updateDraft(s.id, "marks", e.target.value)}
                                                />
                                          </div>
                                          <div>
                                                <label className="sm-label" htmlFor={`feedback-${s.id}`}>
                                                      Feedback
                                                </label>
                                                <input
                                                      id={`feedback-${s.id}`}
                                                      className="sm-input"
                                                      value={drafts[s.id]?.feedback ?? ""}
                                                      onChange={(e) => updateDraft(s.id, "feedback", e.target.value)}
                                                />
                                          </div>
                                          <button
                                                type="button"
                                                className="sm-btn sm-btn-primary"
                                                disabled={savingId === s.id}
                                                onClick={() => submitGrade(s)}
                                          >
                                                {savingId === s.id ? "Saving…" : "Save grade"}
                                          </button>
                                    </div>
                                    {rowError[s.id] && <p className="mt-2 text-xs text-(--color-danger)">{rowError[s.id]}</p>}
                              </div>
                        ))}
                        {submissions.length === 0 && (
                              <div className="sm-card p-8 text-center text-sm text-(--color-ink-soft)">No submissions yet.</div>
                        )}
                  </div>

                  <div className="mt-6">
                        <Link href="/teacher/assignments" className="sm-btn sm-btn-secondary">
                              Back to all assignments
                        </Link>
                  </div>
            </div>
      );
}
