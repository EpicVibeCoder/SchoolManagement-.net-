"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, SubjectDto, del, get, post, put } from "@/lib/api";
import { PAGE_SIZE, paginate } from "@/lib/paginate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const subjectSchema = z.object({
      name: z.string().min(1, "Name is required"),
      code: z.string().min(1, "Code is required"),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function AdminSubjectsPage() {
      const queryClient = useQueryClient();
      const {
            data: subjects = [],
            isPending: loading,
            error,
      } = useQuery({
            queryKey: queryKeys.subjects,
            queryFn: () => get<SubjectDto[]>("/api/subjects"),
      });
      const errorMessage = error instanceof ApiError ? error.message : error ? "Failed to load subjects." : null;
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);
      const [formError, setFormError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [editingId, setEditingId] = useState<string | null>(null);
      const [busyId, setBusyId] = useState<string | null>(null);
      const [actionError, setActionError] = useState<string | null>(null);

      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            if (!q) return subjects;
            return subjects.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
      }, [subjects, search]);

      const { pageItems, totalPages, currentPage, total } = paginate(filtered, page);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors },
      } = useForm<SubjectFormValues>({
            resolver: zodResolver(subjectSchema),
            defaultValues: { name: "", code: "" },
      });

      const startEdit = (subject: SubjectDto) => {
            setEditingId(subject.id);
            setFormError(null);
            reset({ name: subject.name, code: subject.code });
      };

      const cancelEdit = () => {
            setEditingId(null);
            reset({ name: "", code: "" });
      };

      const onSubmit = async (values: SubjectFormValues) => {
            setFormError(null);
            setSubmitting(true);
            try {
                  if (editingId) {
                        await put<SubjectDto>(`/api/subjects/${editingId}`, values);
                  } else {
                        await post<SubjectDto>("/api/subjects", values);
                  }
                  cancelEdit();
                  queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to save subject.");
            } finally {
                  setSubmitting(false);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            setActionError(null);
            try {
                  await del(`/api/subjects/${id}`);
                  await queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to delete subject.");
            } finally {
                  setBusyId(null);
            }
      };

      return (
            <div>
                  <PageHeader title="Subjects" description="Manage subjects offered within each class." />

                  <div className="grid gap-6 lg:grid-cols-3">
                        <div className="sm-card p-5 lg:order-2 h-fit">
                              <h2 className="text-lg font-semibold">{editingId ? "Edit subject" : "Add subject"}</h2>
                              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
                                    {formError && <div className="sm-alert sm-alert-danger">{formError}</div>}
                                    <div>
                                          <label className="sm-label" htmlFor="name">
                                                Name
                                          </label>
                                          <input id="name" className="sm-input" placeholder="Mathematics" {...register("name")} />
                                          {errors.name && <p className="mt-1 text-xs text-(--color-danger)">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="code">
                                                Code
                                          </label>
                                          <input id="code" className="sm-input" placeholder="MATH" {...register("code")} />
                                          {errors.code && <p className="mt-1 text-xs text-(--color-danger)">{errors.code.message}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                          <button type="submit" className="sm-btn sm-btn-primary flex-1" disabled={submitting}>
                                                {submitting ? "Saving…" : editingId ? "Save changes" : "Create subject"}
                                          </button>
                                          {editingId && (
                                                <button type="button" className="sm-btn sm-btn-secondary" onClick={cancelEdit}>
                                                      Cancel
                                                </button>
                                          )}
                                    </div>
                              </form>
                        </div>

                        <div className="lg:col-span-2 lg:order-1">
                              <div className="mb-4">
                                    <input
                                          type="search"
                                          className="sm-input sm:max-w-sm"
                                          placeholder="Search by name or code…"
                                          value={search}
                                          onChange={(e) => onSearchChange(e.target.value)}
                                    />
                              </div>

                              {loading && <LoadingBlock label="Loading subjects…" />}
                              {(errorMessage || actionError) && <ErrorBlock message={errorMessage ?? actionError!} />}

                              {!loading && (
                                    <>
                                          <div className="sm-card overflow-x-auto">
                                                <table className="sm-table">
                                                      <thead>
                                                            <tr>
                                                                  <th>Name</th>
                                                                  <th>Code</th>
                                                                  <th></th>
                                                            </tr>
                                                      </thead>
                                                      <tbody>
                                                            {pageItems.map((subject) => (
                                                                  <tr key={subject.id}>
                                                                        <td className="font-medium text-(--color-primary-dark)">{subject.name}</td>
                                                                        <td>{subject.code}</td>
                                                                        <td>
                                                                              <div className="flex justify-end gap-2">
                                                                                    <button
                                                                                          type="button"
                                                                                          className="sm-btn sm-btn-secondary"
                                                                                          onClick={() => startEdit(subject)}
                                                                                    >
                                                                                          Edit
                                                                                    </button>
                                                                                    <button
                                                                                          type="button"
                                                                                          className="sm-btn sm-btn-danger"
                                                                                          disabled={busyId === subject.id}
                                                                                          onClick={() => remove(subject.id)}
                                                                                    >
                                                                                          Delete
                                                                                    </button>
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))}
                                                            {pageItems.length === 0 && (
                                                                  <tr>
                                                                        <td colSpan={3} className="text-center text-(--color-ink-soft)">
                                                                              {subjects.length === 0
                                                                                    ? "No subjects yet."
                                                                                    : "No subjects match your search."}
                                                                        </td>
                                                                  </tr>
                                                            )}
                                                      </tbody>
                                                </table>
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
                  </div>
            </div>
      );
}
