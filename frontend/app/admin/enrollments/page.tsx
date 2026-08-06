"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, ClassDto, EnrollmentDto, PagedResult, UserDto, UserRole, del, get, post } from "@/lib/api";
import { formatDate } from "@/lib/format";

const enrollmentSchema = z.object({
      studentId: z.string().min(1, "Student is required"),
      classId: z.string().min(1, "Class is required"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

export default function EnrollmentsPage() {
      const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
      const [students, setStudents] = useState<UserDto[]>([]);
      const [classes, setClasses] = useState<ClassDto[]>([]);
      const [classFilter, setClassFilter] = useState("");
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [formError, setFormError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [busyId, setBusyId] = useState<string | null>(null);

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors },
      } = useForm<EnrollmentFormValues>({
            resolver: zodResolver(enrollmentSchema),
            defaultValues: { studentId: "", classId: "" },
      });

      const loadReferenceData = async () => {
            const [studentsData, classesData] = await Promise.all([get<PagedResult<UserDto>>(`/api/users?role=${UserRole.Student}&pageSize=200`), get<ClassDto[]>("/api/classes")]);
            setStudents(studentsData.items);
            setClasses(classesData);
      };

      const loadEnrollments = async () => {
            setLoading(true);
            setError(null);
            try {
                  const query = classFilter ? `?classId=${classFilter}` : "";
                  const data = await get<EnrollmentDto[]>(`/api/enrollments${query}`);
                  setEnrollments(data);
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to load enrollments.");
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            loadReferenceData();
      }, []);

      useEffect(() => {
            loadEnrollments();
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [classFilter]);

      const onSubmit = async (values: EnrollmentFormValues) => {
            setFormError(null);
            setSubmitting(true);
            try {
                  await post<EnrollmentDto>("/api/enrollments", values);
                  reset({ studentId: "", classId: "" });
                  await loadEnrollments();
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to enroll student.");
            } finally {
                  setSubmitting(false);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            try {
                  await del(`/api/enrollments/${id}`);
                  await loadEnrollments();
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to remove enrollment.");
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
                              <div className="mb-4">
                                    <select className="sm-input sm:max-w-xs" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                                          <option value="">All classes</option>
                                          {classes.map((klass) => (
                                                <option key={klass.id} value={klass.id}>
                                                      {klass.name}
                                                </option>
                                          ))}
                                    </select>
                              </div>

                              {loading && <LoadingBlock label="Loading enrollments…" />}
                              {error && <ErrorBlock message={error} />}

                              {!loading && (
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
                                                      {enrollments.map((enrollment) => (
                                                            <tr key={enrollment.id}>
                                                                  <td className="font-medium text-(--color-primary-dark)">{enrollment.studentName}</td>
                                                                  <td>{enrollment.className}</td>
                                                                  <td>{formatDate(enrollment.enrolledAt)}</td>
                                                                  <td>
                                                                        <div className="flex justify-end">
                                                                              <button type="button" className="sm-btn sm-btn-danger" disabled={busyId === enrollment.id} onClick={() => remove(enrollment.id)}>
                                                                                    Remove
                                                                              </button>
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                      {enrollments.length === 0 && (
                                                            <tr>
                                                                  <td colSpan={4} className="text-center text-(--color-ink-soft)">
                                                                        No enrollments yet.
                                                                  </td>
                                                            </tr>
                                                      )}
                                                </tbody>
                                          </table>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
