"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AssignmentStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export default function StudentAssignmentsPage() {
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
                  <PageHeader title="Assignments" description="Published assignments for your enrolled classes." />

                  {loading && <LoadingBlock label="Loading assignments…" />}
                  {error && <ErrorBlock message={error} />}

                  {!loading && !error && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {assignments.map((a) => (
                                    <Link key={a.id} href={`/student/assignments/${a.id}`} className="sm-card block p-5 transition hover:border-[var(--color-primary-soft)]">
                                          <div className="flex items-start justify-between gap-2">
                                                <h2 className="text-base font-semibold text-[var(--color-primary-dark)]">{a.title}</h2>
                                                <AssignmentStatusBadge status={a.status} />
                                          </div>
                                          <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                                                {a.className} · {a.subjectName}
                                          </p>
                                          <p className="mt-3 line-clamp-2 text-sm text-[var(--color-ink-soft)]">{a.description}</p>
                                          <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                                                <span>Due {formatDateTime(a.deadline)}</span>
                                                <span>{a.maxMarks} marks</span>
                                          </div>
                                    </Link>
                              ))}
                              {assignments.length === 0 && <div className="sm-card p-8 text-center text-sm text-[var(--color-ink-soft)] sm:col-span-2 lg:col-span-3">No assignments have been published for your classes yet.</div>}
                        </div>
                  )}
            </div>
      );
}
