"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, ClassDto, EnrollmentDto, PagedResult, UserDto, UserRole, del, get, post } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { PAGE_SIZE, paginate } from "@/lib/paginate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const enrollmentSchema = z.object({
      studentId: z.string().min(1, "Student is required"),
      classId: z.string().min(1, "Class is required"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

export default function EnrollmentsPage() {
      const queryClient = useQueryClient();
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);
      const [classFilter, setClassFilter] = useState("");
      const [formError, setFormError] = useState<string | null>(null);
      const [actionError, setActionError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [busyId, setBusyId] = useState<string | null>(null);

      const studentsQuery = useQuery({
            queryKey: queryKeys.users("", UserRole.Student),
            queryFn: () => get<PagedResult<UserDto>>(`/api/users?role=${UserRole.Student}&pageSize=200`),
      });
      const classesQuery = useQuery({
            queryKey: queryKeys.classes,
            queryFn: () => get<ClassDto[]>("/api/classes"),
      });
      const enrollmentsQuery = useQuery({
            queryKey: queryKeys.enrollments(classFilter || undefined),
            queryFn: () => {
                  const query = classFilter ? `?classId=${classFilter}` : "";
                  return get<EnrollmentDto[]>(`/api/enrollments${query}`);
            },
      });

      const students = studentsQuery.data?.items ?? [];
      const classes = classesQuery.data ?? [];
      const enrollments = enrollmentsQuery.data ?? [];
      const loading = enrollmentsQuery.isPending;
      const error =
            enrollmentsQuery.error instanceof ApiError
                  ? enrollmentsQuery.error.message
                  : enrollmentsQuery.error
                    ? "Failed to load enrollments."
                    : null;

      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            if (!q) return enrollments;
            return enrollments.filter(
                  (e) => e.studentName.toLowerCase().includes(q) || e.className.toLowerCase().includes(q),
            );
      }, [enrollments, search]);

      const { pageItems, totalPages, currentPage, total } = paginate(filtered, page);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      const onClassFilterChange = (value: string) => {
            setClassFilter(value);
            setPage(1);
      };

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors },
      } = useForm<EnrollmentFormValues>({
            resolver: zodResolver(enrollmentSchema),
            defaultValues: { studentId: "", classId: "" },
      });

      const onSubmit = async (values: EnrollmentFormValues) => {
            setFormError(null);
            setSubmitting(true);
            try {
                  await post<EnrollmentDto>("/api/enrollments", values);
                  reset({ studentId: "", classId: "" });
                  await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to enroll student.");
            } finally {
                  setSubmitting(false);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            setActionError(null);
            try {
                  await del(`/api/enrollments/${id}`);
                  await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to remove enrollment.");
            } finally {
                  setBusyId(null);
            }
      };

      return (
            <div>
                  <PageHeader title="Enrollments" description="Enroll students into classes." />

                  <div className="grid gap-6 lg:grid-cols-3">
                        <div className="sm-card p-5 lg:order-2 h-fit">
                              <h2 className="text-lg font-semibold">Enroll student</h2>
                              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
                                    {formError && <div className="sm-alert sm-alert-danger">{formError}</div>}
                                    <div>
                                          <label className="sm-label" htmlFor="studentId">
                                                Student
                                          </label>
                                          <select id="studentId" className="sm-input" {...register("studentId")}>
                                                <option value="">Select a student</option>
                                                {students.map((s) => (
                                                      <option key={s.id} value={s.id}>
                                                            {s.fullName}
                                                      </option>
                                                ))}
                                          </select>
                                          {errors.studentId && <p className="mt-1 text-xs text-(--color-danger)">{errors.studentId.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="classId">
                                                Class
                                          </label>
                                          <select id="classId" className="sm-input" {...register("classId")}>
                                                <option value="">Select a class</option>
                                                {classes.map((klass) => (
                                                      <option key={klass.id} value={klass.id}>
                                                            {klass.name}
                                                      </option>
                                                ))}
                                          </select>
                                          {errors.classId && <p className="mt-1 text-xs text-(--color-danger)">{errors.classId.message}</p>}
                                    </div>
                                    <button type="submit" className="sm-btn sm-btn-primary w-full" disabled={submitting}>
                                          {submitting ? "Enrolling…" : "Enroll student"}
                                    </button>
                              </form>
                        </div>

                        <div className="lg:col-span-2 lg:order-1">
                              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                          type="search"
                                          className="sm-input sm:max-w-sm"
                                          placeholder="Search by student or class…"
                                          value={search}
                                          onChange={(e) => onSearchChange(e.target.value)}
                                    />
                                    <select
                                          className="sm-input sm:max-w-xs"
                                          value={classFilter}
                                          onChange={(e) => onClassFilterChange(e.target.value)}
                                    >
                                          <option value="">All classes</option>
                                          {classes.map((klass) => (
                                                <option key={klass.id} value={klass.id}>
                                                      {klass.name}
                                                </option>
                                          ))}
                                    </select>
                              </div>

                              {loading && <LoadingBlock label="Loading enrollments…" />}
                              {(error || actionError) && <ErrorBlock message={error ?? actionError!} />}

                              {!loading && (
                                    <>
                                          <div className="sm-card overflow-x-auto">
                                                <table className="sm-table">
                                                      <thead>
                                                            <tr>
                                                                  <th>Student</th>
                                                                  <th>Class</th>
                                                                  <th>Enrolled</th>
                                                                  <th></th>
                                                            </tr>
                                                      </thead>
                                                      <tbody>
                                                            {pageItems.map((enrollment) => (
                                                                  <tr key={enrollment.id}>
                                                                        <td className="font-medium text-(--color-primary-dark)">
                                                                              {enrollment.studentName}
                                                                        </td>
                                                                        <td>{enrollment.className}</td>
                                                                        <td>{formatDate(enrollment.enrolledAt)}</td>
                                                                        <td>
                                                                              <div className="flex justify-end">
                                                                                    <button
                                                                                          type="button"
                                                                                          className="sm-btn sm-btn-danger"
                                                                                          disabled={busyId === enrollment.id}
                                                                                          onClick={() => remove(enrollment.id)}
                                                                                    >
                                                                                          Remove
                                                                                    </button>
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))}
                                                            {pageItems.length === 0 && (
                                                                  <tr>
                                                                        <td colSpan={4} className="text-center text-(--color-ink-soft)">
                                                                              {enrollments.length === 0
                                                                                    ? "No enrollments yet."
                                                                                    : "No enrollments match your search."}
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
