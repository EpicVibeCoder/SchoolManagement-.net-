"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

const PAGE_SIZE = 10;

export default function AdminAssignmentsPage() {
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);

      const {
            data: assignments = [],
            isPending: loading,
            error,
      } = useQuery({
            queryKey: queryKeys.assignments,
            queryFn: () => get<AssignmentDto[]>("/api/assignments"),
      });

      const errorMessage = error instanceof ApiError ? error.message : error ? "Failed to load assignments." : null;

      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            if (!q) return assignments;
            return assignments.filter(
                  (a) =>
                        a.title.toLowerCase().includes(q) ||
                        a.className.toLowerCase().includes(q) ||
                        a.subjectName.toLowerCase().includes(q) ||
                        a.teacherName.toLowerCase().includes(q) ||
                        a.status.toLowerCase().includes(q),
            );
      }, [assignments, search]);

      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      const currentPage = Math.min(page, totalPages);
      const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      return (
            <div>
                  <PageHeader title="Assignments" description="All assignments across the school (read-only)." />

                  <div className="mb-4">
                        <input
                              type="search"
                              className="sm-input sm:max-w-sm"
                              placeholder="Search by title, class, subject, teacher…"
                              value={search}
                              onChange={(e) => onSearchChange(e.target.value)}
                        />
                  </div>

                  {loading && <LoadingBlock label="Loading assignments…" />}
                  {errorMessage && <ErrorBlock message={errorMessage} />}

                  {!loading && !errorMessage && (
                        <>
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
                                                {pageItems.map((a) => (
                                                      <tr key={a.id}>
                                                            <td>
                                                                  <Link
                                                                        href={`/admin/assignments/${a.id}`}
                                                                        className="font-[550] text-(--color-primary-dark) underline-offset-2 hover:text-(--color-primary-soft) hover:underline"
                                                                  >
                                                                        {a.title}
                                                                  </Link>
                                                            </td>
                                                            <td>{a.className}</td>
                                                            <td>{a.subjectName}</td>
                                                            <td>{a.teacherName}</td>
                                                            <td>{formatDateTime(a.deadline)}</td>
                                                            <td>{a.maxMarks}</td>
                                                            <td>{a.submissionCount}</td>
                                                            <td>
                                                                  <AssignmentStatusBadge status={a.status} />
                                                            </td>
                                                      </tr>
                                                ))}
                                                {pageItems.length === 0 && (
                                                      <tr>
                                                            <td colSpan={8} className="text-center text-(--color-ink-soft)">
                                                                  {assignments.length === 0 ? "No assignments yet." : "No assignments match your search."}
                                                            </td>
                                                      </tr>
                                                )}
                                          </tbody>
                                    </table>
                              </div>

                              {filtered.length > 0 && (
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                                          <p className="text-(--color-ink-soft)">
                                                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                                                {filtered.length}
                                          </p>
                                          <div className="flex items-center gap-2">
                                                <button
                                                      type="button"
                                                      className="sm-btn sm-btn-secondary"
                                                      disabled={currentPage <= 1}
                                                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                >
                                                      Previous
                                                </button>
                                                <span className="text-(--color-ink-soft)">
                                                      Page {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                      type="button"
                                                      className="sm-btn sm-btn-secondary"
                                                      disabled={currentPage >= totalPages}
                                                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                >
                                                      Next
                                                </button>
                                          </div>
                                    </div>
                              )}
                        </>
                  )}
            </div>
      );
}
