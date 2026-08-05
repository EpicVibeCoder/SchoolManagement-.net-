"use client";

import { useEffect, useState } from "react";
import { AssignmentStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    get<AssignmentDto[]>("/api/assignments")
      .then((data) => {
        if (!cancelled) setAssignments(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load assignments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Assignments" description="All assignments across the school (read-only)." />

      {loading && <LoadingBlock label="Loading assignments…" />}
      {error && <ErrorBlock message={error} />}

      {!loading && !error && (
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
                  <td className="font-medium text-[var(--color-primary-dark)]">{a.title}</td>
                  <td>{a.className}</td>
                  <td>{a.subjectName}</td>
                  <td>{a.teacherName}</td>
                  <td>{formatDateTime(a.deadline)}</td>
                  <td>{a.maxMarks}</td>
                  <td>{a.submissionCount}</td>
                  <td><AssignmentStatusBadge status={a.status} /></td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-[var(--color-ink-soft)]">
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
