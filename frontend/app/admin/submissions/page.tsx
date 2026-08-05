"use client";

import { useEffect, useState } from "react";
import { SubmissionStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, SubmissionDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const assignments = await get<AssignmentDto[]>("/api/assignments");
        const results = await Promise.all(
          assignments.map((a) =>
            get<SubmissionDto[]>(`/api/assignments/${a.id}/submissions`).catch(() => [] as SubmissionDto[])
          )
        );
        if (!cancelled) {
          const flattened = results.flat().sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
          setSubmissions(flattened);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load submissions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Submissions" description="All student submissions across every assignment (read-only)." />

      {loading && <LoadingBlock label="Loading submissions…" />}
      {error && <ErrorBlock message={error} />}

      {!loading && !error && (
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
                  <td className="font-medium text-[var(--color-primary-dark)]">{s.assignmentTitle}</td>
                  <td>{s.studentName}</td>
                  <td>{formatDateTime(s.submittedAt)}</td>
                  <td><SubmissionStatusBadge status={s.status} /></td>
                  <td>{s.marks !== null ? `${s.marks} / ${s.maxMarks}` : "—"}</td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--color-ink-soft)]">
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
