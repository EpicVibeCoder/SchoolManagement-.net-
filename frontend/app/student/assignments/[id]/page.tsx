"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, SubmissionDto, get, post, put } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export default function StudentAssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assignmentId = params.id;

  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [submission, setSubmission] = useState<SubmissionDto | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignmentData, mineData] = await Promise.all([
        get<AssignmentDto>(`/api/assignments/${assignmentId}`),
        get<SubmissionDto[]>("/api/submissions/mine"),
      ]);
      setAssignment(assignmentData);
      const existing = mineData.find((s) => s.assignmentId === assignmentId) ?? null;
      setSubmission(existing);
      setAnswer(existing?.answer ?? "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load assignment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

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
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to submit your answer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading assignment…" />;
  if (error) return <ErrorBlock message={error} />;
  if (!assignment) return <ErrorBlock message="Assignment not found." />;

  const isPastDeadline = new Date(assignment.deadline).getTime() < Date.now();
  const isGraded = submission?.marks !== null && submission?.marks !== undefined;

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/student/assignments")}
        className="mb-4 text-sm text-[var(--color-ink-soft)] hover:underline"
      >
        ← Back to assignments
      </button>

      <PageHeader
        title={assignment.title}
        description={`${assignment.className} · ${assignment.subjectName} · Due ${formatDateTime(assignment.deadline)}`}
        actions={<AssignmentStatusBadge status={assignment.status} />}
      />

      <div className="sm-card mb-6 p-5">
        <p className="text-sm text-[var(--color-ink-soft)]">Description</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">{assignment.description}</p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-[var(--color-ink-soft)]">Max marks: </span>
            <span className="font-medium">{assignment.maxMarks}</span>
          </div>
          {isPastDeadline && (
            <div className="text-[var(--color-danger)]">Deadline has passed.</div>
          )}
        </div>
      </div>

      {isGraded && submission && (
        <div className="sm-card mb-6 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-primary-dark)]">Your grade</h2>
            <SubmissionStatusBadge status={submission.status} />
          </div>
          <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            {submission.marks} <span className="text-sm font-normal text-[var(--color-ink-soft)]">/ {submission.maxMarks}</span>
          </p>
          {submission.feedback && (
            <div className="mt-2">
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Feedback</p>
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
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="mt-3 flex justify-end">
          <button type="button" className="sm-btn sm-btn-primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Saving…" : submission ? "Update answer" : "Submit answer"}
          </button>
        </div>

        {submission && (
          <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
            Last submitted {formatDateTime(submission.submittedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
