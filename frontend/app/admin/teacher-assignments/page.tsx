"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, ClassDto, PagedResult, SubjectDto, TeacherAssignmentDto, UserDto, UserRole, del, get, post } from "@/lib/api";

const assignmentSchema = z.object({
      teacherId: z.string().min(1, "Teacher is required"),
      classId: z.string().min(1, "Class is required"),
      subjectId: z.string().min(1, "Subject is required"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function TeacherAssignmentsPage() {
      const [assignments, setAssignments] = useState<TeacherAssignmentDto[]>([]);
      const [teachers, setTeachers] = useState<UserDto[]>([]);
      const [classes, setClasses] = useState<ClassDto[]>([]);
      const [subjects, setSubjects] = useState<SubjectDto[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [formError, setFormError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [busyId, setBusyId] = useState<string | null>(null);

      const {
            register,
            handleSubmit,
            watch,
            reset,
            formState: { errors },
      } = useForm<AssignmentFormValues>({
            resolver: zodResolver(assignmentSchema),
            defaultValues: {
                  teacherId: "",
                  classId: "",
                  subjectId: "",
            },
      });

      const subjectsForClass = useMemo(() => subjects, [subjects]);

      const loadAll = async () => {
            setLoading(true);
            setError(null);
            try {
                  const [assignmentsData, teachersData, classesData, subjectsData] = await Promise.all([
                        get<TeacherAssignmentDto[]>("/api/teacher-assignments"),
                        get<PagedResult<UserDto>>(`/api/users?role=${UserRole.Teacher}&pageSize=200`),
                        get<ClassDto[]>("/api/classes"),
                        get<SubjectDto[]>("/api/subjects"),
                  ]);
                  setAssignments(assignmentsData);
                  setTeachers(teachersData.items);
                  setClasses(classesData);
                  setSubjects(subjectsData);
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to load teacher assignments.");
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            loadAll();
      }, []);

      const onSubmit = async (values: AssignmentFormValues) => {
            setFormError(null);
            setSubmitting(true);
            try {
                  await post<TeacherAssignmentDto>("/api/teacher-assignments", values);
                  reset({
                        teacherId: "",
                        classId: "",
                        subjectId: "",
                  });
                  await loadAll();
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to create assignment.");
            } finally {
                  setSubmitting(false);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            try {
                  await del(`/api/teacher-assignments/${id}`);
                  await loadAll();
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to remove assignment.");
            } finally {
                  setBusyId(null);
            }
      };

      return (
            <div>
                  <PageHeader title="Teacher Assignments" description="Assign teachers to subjects within a class." />

                  <div className="grid gap-6 lg:grid-cols-3">
                        <div className="sm-card p-5 lg:order-2 h-fit">
                              <h2 className="text-lg font-semibold">Assign teacher</h2>
                              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
                                    {formError && <div className="sm-alert sm-alert-danger">{formError}</div>}
                                    <div>
                                          <label className="sm-label" htmlFor="teacherId">
                                                Teacher
                                          </label>
                                          <select id="teacherId" className="sm-input" {...register("teacherId")}>
                                                <option value="">Select a teacher</option>
                                                {teachers.map((t) => (
                                                      <option key={t.id} value={t.id}>
                                                            {t.fullName}
                                                      </option>
                                                ))}
                                          </select>
                                          {errors.teacherId && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.teacherId.message}</p>}
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
                                          {errors.classId && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.classId.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="subjectId">
                                                Subject
                                          </label>
                                          <select id="subjectId" className="sm-input" {...register("subjectId")}>
                                                <option value="">Select a subject</option>
                                                {subjectsForClass.map((subject) => (
                                                      <option key={subject.id} value={subject.id}>
                                                            {subject.name}
                                                      </option>
                                                ))}
                                          </select>
                                          {errors.subjectId && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.subjectId.message}</p>}
                                    </div>
                                    <button type="submit" className="sm-btn sm-btn-primary w-full" disabled={submitting}>
                                          {submitting ? "Assigning…" : "Assign teacher"}
                                    </button>
                              </form>
                        </div>

                        <div className="lg:col-span-2 lg:order-1">
                              {loading && <LoadingBlock label="Loading assignments…" />}
                              {error && <ErrorBlock message={error} />}

                              {!loading && (
                                    <div className="sm-card overflow-x-auto">
                                          <table className="sm-table">
                                                <thead>
                                                      <tr>
                                                            <th>Teacher</th>
                                                            <th>Class</th>
                                                            <th>Subject</th>
                                                            <th></th>
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {assignments.map((a) => (
                                                            <tr key={a.id}>
                                                                  <td className="font-medium text-[var(--color-primary-dark)]">{a.teacherName}</td>
                                                                  <td>{a.className}</td>
                                                                  <td>{a.subjectName}</td>
                                                                  <td>
                                                                        <div className="flex justify-end">
                                                                              <button type="button" className="sm-btn sm-btn-danger" disabled={busyId === a.id} onClick={() => remove(a.id)}>
                                                                                    Remove
                                                                              </button>
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                      {assignments.length === 0 && (
                                                            <tr>
                                                                  <td colSpan={4} className="text-center text-[var(--color-ink-soft)]">
                                                                        No teacher assignments yet.
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
