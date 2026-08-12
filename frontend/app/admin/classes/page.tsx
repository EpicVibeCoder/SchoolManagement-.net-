"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, ClassDto, del, get, post, put } from "@/lib/api";
import { PAGE_SIZE, paginate } from "@/lib/paginate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 16 }, (_, i) => (currentYear - 5 + i).toString());

const classSchema = z
      .object({
            name: z.string().min(1, "Name is required"),
            code: z.string().min(1, "Code is required"),
            startYear: z.string().min(1, "Start year is required"),
            endYear: z.string().min(1, "End year is required"),
      })
      .refine((data) => parseInt(data.endYear, 10) >= parseInt(data.startYear, 10), {
            message: "End year must be greater than or equal to start year",
            path: ["endYear"],
      });

type ClassFormValues = z.infer<typeof classSchema>;

export default function AdminClassesPage() {
      const queryClient = useQueryClient();
      const {
            data: classes = [],
            isPending: loading,
            error,
      } = useQuery({
            queryKey: queryKeys.classes,
            queryFn: () => get<ClassDto[]>("/api/classes"),
      });
      const errorMessage = error instanceof ApiError ? error.message : error ? "Failed to load classes." : null;
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);
      const [formError, setFormError] = useState<string | null>(null);
      const [actionError, setActionError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [editingId, setEditingId] = useState<string | null>(null);
      const [busyId, setBusyId] = useState<string | null>(null);

      const filteredClasses = useMemo(() => {
            const q = search.trim().toLowerCase();
            if (!q) return classes;
            return classes.filter(
                  (klass) =>
                        klass.name.toLowerCase().includes(q) ||
                        klass.code.toLowerCase().includes(q) ||
                        klass.academicYear.toLowerCase().includes(q),
            );
      }, [classes, search]);

      const { pageItems, totalPages, currentPage, total } = paginate(filteredClasses, page);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      const parseAcademicYear = (academicYear: string) => {
            const parts = academicYear.split("-").map((s) => s.trim());
            const startYear = parts[0] || currentYear.toString();
            const endYear = parts[1] || startYear;
            return { startYear, endYear };
      };

      const {
            register,
            handleSubmit,
            reset,
            control,
            setValue,
            formState: { errors },
      } = useForm<ClassFormValues>({
            resolver: zodResolver(classSchema),
            defaultValues: {
                  name: "",
                  code: "",
                  startYear: currentYear.toString(),
                  endYear: (currentYear + 1).toString(),
            },
      });

      const watchStartYear = useWatch({ control, name: "startYear" });
      const watchEndYear = useWatch({ control, name: "endYear" });


     useEffect(() => {
           if (watchStartYear) {
                 const startNum = parseInt(watchStartYear, 10);
                 const currentEndNum = parseInt(watchEndYear || "0", 10);
                 if (isNaN(currentEndNum) || currentEndNum < startNum) {
                       setValue("endYear", (startNum + 1).toString(), { shouldValidate: true });
                 }
           }
     }, [watchStartYear, watchEndYear, setValue]);

      const startEdit = (klass: ClassDto) => {
            setEditingId(klass.id);
            setFormError(null);
            const { startYear, endYear } = parseAcademicYear(klass.academicYear);
            reset({ name: klass.name, code: klass.code, startYear, endYear });
      };

      const cancelEdit = () => {
            setEditingId(null);
            reset({
                  name: "",
                  code: "",
                  startYear: currentYear.toString(),
                  endYear: (currentYear + 1).toString(),
            });
      };

      const onSubmit = async (values: ClassFormValues) => {
            setFormError(null);
            setSubmitting(true);
            const academicYear = `${values.startYear}-${values.endYear}`;
            try {
                  if (editingId) {
                        await put<ClassDto>(`/api/classes/${editingId}`, {
                              name: values.name,
                              code: values.code,
                              academicYear,
                        });
                  } else {
                        await post<ClassDto>("/api/classes", {
                              name: values.name,
                              code: values.code,
                              academicYear,
                        });
                  }
                  cancelEdit();
                  await queryClient.invalidateQueries({ queryKey: queryKeys.classes });
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to save class.");
            } finally {
                  setSubmitting(false);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            setActionError(null);
            try {
                  await del(`/api/classes/${id}`);
                  await queryClient.invalidateQueries({ queryKey: queryKeys.classes });
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to delete class.");
            } finally {
                  setBusyId(null);
            }
      };

      return (
            <div>
                  <PageHeader title="Classes" description="Manage the classes offered at your school." />

                  <div className="grid gap-6 lg:grid-cols-3">
                        <div className="sm-card p-5 lg:order-2 h-fit">
                              <h2 className="text-lg font-semibold">{editingId ? "Edit class" : "Add class"}</h2>
                              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
                                    {formError && <div className="sm-alert sm-alert-danger">{formError}</div>}
                                    <div>
                                          <label className="sm-label" htmlFor="name">
                                                Name
                                          </label>
                                          <input id="name" className="sm-input" placeholder="Grade 10 A" {...register("name")} />
                                          {errors.name && <p className="mt-1 text-xs text-(--color-danger)">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="code">
                                                Code
                                          </label>
                                          <input id="code" className="sm-input" placeholder="G10A" {...register("code")} />
                                          {errors.code && <p className="mt-1 text-xs text-(--color-danger)">{errors.code.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label">Academic year</label>
                                          <div className="grid grid-cols-2 gap-2 mt-1">
                                                <div>
                                                      <label className="text-xs text-(--color-ink-soft) font-medium block mb-1" htmlFor="startYear">
                                                            Start Year
                                                      </label>
                                                      <select id="startYear" className="sm-input" {...register("startYear")}>
                                                            {yearOptions.map((year) => (
                                                                  <option key={year} value={year}>
                                                                        {year}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                      {errors.startYear && (
                                                            <p className="mt-1 text-xs text-(--color-danger)">{errors.startYear.message}</p>
                                                      )}
                                                </div>
                                                <div>
                                                      <label className="text-xs text-(--color-ink-soft) font-medium block mb-1" htmlFor="endYear">
                                                            End Year
                                                      </label>
                                                      <select id="endYear" className="sm-input" {...register("endYear")}>
                                                            {yearOptions.map((year) => (
                                                                  <option key={year} value={year}>
                                                                        {year}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                      {errors.endYear && (
                                                            <p className="mt-1 text-xs text-(--color-danger)">{errors.endYear.message}</p>
                                                      )}
                                                </div>
                                          </div>
                                    </div>
                                    <div className="flex gap-2">
                                          <button type="submit" className="sm-btn sm-btn-primary flex-1" disabled={submitting}>
                                                {submitting ? "Saving…" : editingId ? "Save changes" : "Create class"}
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
                                          placeholder="Search by name, code, or year…"
                                          value={search}
                                          onChange={(e) => onSearchChange(e.target.value)}
                                    />
                              </div>

                              {loading && <LoadingBlock label="Loading classes…" />}
                              {(errorMessage || actionError) && <ErrorBlock message={errorMessage ?? actionError!} />}

                              {!loading && (
                                    <>
                                          <div className="sm-card overflow-x-auto">
                                                <table className="sm-table">
                                                      <thead>
                                                            <tr>
                                                                  <th>Name</th>
                                                                  <th>Code</th>
                                                                  <th>Academic Year</th>
                                                                  <th></th>
                                                            </tr>
                                                      </thead>
                                                      <tbody>
                                                            {pageItems.map((klass) => (
                                                                  <tr key={klass.id}>
                                                                        <td className="font-medium text-(--color-primary-dark)">{klass.name}</td>
                                                                        <td>{klass.code}</td>
                                                                        <td>{klass.academicYear}</td>
                                                                        <td>
                                                                              <div className="flex justify-end gap-2">
                                                                                    <button
                                                                                          type="button"
                                                                                          className="sm-btn sm-btn-secondary"
                                                                                          onClick={() => startEdit(klass)}
                                                                                    >
                                                                                          Edit
                                                                                    </button>
                                                                                    <button
                                                                                          type="button"
                                                                                          className="sm-btn sm-btn-danger"
                                                                                          disabled={busyId === klass.id}
                                                                                          onClick={() => remove(klass.id)}
                                                                                    >
                                                                                          Delete
                                                                                    </button>
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))}
                                                            {pageItems.length === 0 && (
                                                                  <tr>
                                                                        <td colSpan={4} className="text-center text-(--color-ink-soft)">
                                                                              {classes.length === 0 ? "No classes yet." : "No classes match your search."}
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
