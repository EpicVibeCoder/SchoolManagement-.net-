"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusBadge } from "@/components/Badge";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, get } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { PAGE_SIZE, paginate } from "@/lib/paginate";
import { queryKeys } from "@/lib/query-keys";

export default function StudentAssignmentsPage() {
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
                        a.description.toLowerCase().includes(q),
            );
      }, [assignments, search]);

      const { pageItems, totalPages, currentPage, total } = paginate(filtered, page);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      return (
            <div>
                  <PageHeader title="Assignments" description="Published assignments for your enrolled classes." />

                  <div className="mb-4">
                        <input
                              type="search"
                              className="sm-input sm:max-w-sm"
                              placeholder="Search by title, class, subject…"
                              value={search}
                              onChange={(e) => onSearchChange(e.target.value)}
                        />
                  </div>

                  {loading && <LoadingBlock label="Loading assignments…" />}
                  {errorMessage && <ErrorBlock message={errorMessage} />}

                  {!loading && !errorMessage && (
                        <>
                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {pageItems.map((a) => (
                                          <Link
                                                key={a.id}
                                                href={`/student/assignments/${a.id}`}
                                                className="sm-card block p-5 transition hover:border-(--color-primary-soft)"
                                          >
                                                <div className="flex items-start justify-between gap-2">
                                                      <h2 className="text-base font-semibold text-(--color-primary-dark)">{a.title}</h2>
                                                      <AssignmentStatusBadge status={a.status} />
                                                </div>
                                                <p className="mt-1 text-xs text-(--color-ink-soft)">
                                                      {a.className} · {a.subjectName}
                                                </p>
                                                <p className="mt-3 line-clamp-2 text-sm text-(--color-ink-soft)">{a.description}</p>
                                                <div className="mt-4 flex items-center justify-between text-xs text-(--color-ink-soft)">
                                                      <span>Due {formatDateTime(a.deadline)}</span>
                                                      <span>{a.maxMarks} marks</span>
                                                </div>
                                          </Link>
                                    ))}
                                    {pageItems.length === 0 && (
                                          <div className="sm-card p-8 text-center text-sm text-(--color-ink-soft) sm:col-span-2 lg:col-span-3">
                                                {assignments.length === 0
                                                      ? "No assignments have been published for your classes yet."
                                                      : "No assignments match your search."}
                                          </div>
                                    )}
                              </div>
                              <ListPagination
                                    page={currentPage}
                                    totalPages={totalPages}
                                    total={total}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={setPage}
                              />
                        </>
                  )}
            </div>
      );
}
