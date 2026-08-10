"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AssignmentStatusBadge } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, AssignmentStatus, TeacherAssignmentDto, del, get, post, put } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";


const assignmentSchema = z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      deadline: z.string().min(1, "Deadline is required"),
      maxMarks: z.coerce.number().int().min(1, "Must be at least 1"),
      classId: z.string().min(1, "Class is required"),
      subjectId: z.string().min(1, "Subject is required"),
});

type AssignmentFormInput = z.input<typeof assignmentSchema>;
type AssignmentFormValues = z.output<typeof assignmentSchema>;

export default function TeacherAssignmentsPage() {
      
      const { user } = useAuth();
      const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
      const [teachingAssignments, setTeachingAssignments] = useState<TeacherAssignmentDto[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [formError, setFormError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [busyId, setBusyId] = useState<string | null>(null);
      const [showForm, setShowForm] = useState(false);

      const {
            register,
            handleSubmit,
            watch,
            reset,
            formState: { errors },
      } = useForm<AssignmentFormInput, unknown, AssignmentFormValues>({
            resolver: zodResolver(assignmentSchema),
            defaultValues: { title: "", description: "", deadline: "", maxMarks: 100, classId: "", subjectId: "" },
      });

      const selectedClassId = watch("classId");
      const classes = useMemo(() => {
            const map = new Map<string, string>();
            teachingAssignments.forEach((t) => map.set(t.classId, t.className));
            return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
      }, [teachingAssignments]);
      const subjectsForClass = useMemo(() => teachingAssignments.filter((t) => !selectedClassId || t.classId === selectedClassId), [teachingAssignments, selectedClassId]);

      const load = async () => {
            if (!user) return;
            setLoading(true);
            setError(null);
            try {
                  const [assignmentsData, teacherAssignmentsData] = await Promise.all([get<AssignmentDto[]>("/api/assignments"), get<TeacherAssignmentDto[]>(`/api/teacher-assignments?teacherId=${user.id}`)]);
                  setAssignments(assignmentsData.filter((a) => a.createdByTeacherId === user.id));
                  setTeachingAssignments(teacherAssignmentsData);
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to load assignments.");
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            load();
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [user]);

      const onCreate = async (values: AssignmentFormValues) => {
            setFormError(null);
            setSubmitting(true);
            try {
                  await post("/api/assignments", {
                        ...values,
                        deadline: new Date(values.deadline).toISOString(),
                  });
                  reset({ title: "", description: "", deadline: "", maxMarks: 100, classId: "", subjectId: "" });
                  setShowForm(false);
                  await load();
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to create assignment.");
            } finally {
                  setSubmitting(false);
            }
      };

      const togglePublish = async (a: AssignmentDto) => {
            setBusyId(a.id);
            try {
                  const action = a.status === AssignmentStatus.Published ? "unpublish" : "publish";
                  await post(`/api/assignments/${a.id}/${action}`);
                  await load();
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to update assignment status.");
            } finally {
                  setBusyId(null);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            try {
                  await del(`/api/assignments/${id}`);
                  await load();
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to delete assignment.");
            } finally {
                  setBusyId(null);
            }
      };

      return (
            <div>
                  <PageHeader
                        title="Assignments"
                        description="Create, publish, and manage your assignments."
                        actions={
                              <button type="button" className="sm-btn sm-btn-primary" onClick={() => setShowForm((v) => !v)}>
                                    {showForm ? "Close" : "New assignment"}
                              </button>
                        }
                  />

                  {showForm && (
                        <div className="sm-card mb-6 p-5">
                              <h2 className="text-lg font-semibold">New assignment</h2>
                              <form onSubmit={handleSubmit(onCreate)} className="mt-4 grid gap-3 sm:grid-cols-2" noValidate>
                                    {formError && <div className="sm-alert sm-alert-danger sm:col-span-2">{formError}</div>}
                                    <div className="sm:col-span-2">
                                          <label className="sm-label" htmlFor="title">
                                                Title
                                          </label>
                                          <input id="title" className="sm-input" {...register("title")} />
                                          {errors.title && <p className="mt-1 text-xs text-(--color-danger)">{errors.title.message}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                          <label className="sm-label" htmlFor="description">
                                                Description
                                          </label>
                                          <textarea id="description" rows={3} className="sm-input" {...register("description")} />
                                          {errors.description && <p className="mt-1 text-xs text-(--color-danger)">{errors.description.message}</p>}
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
                                    <div>
                                          <label className="sm-label" htmlFor="subjectId">
                                                Subject
                                          </label>
                                          <select id="subjectId" className="sm-input" {...register("subjectId")}>
                                                <option value="">Select a subject</option>
                                                {subjectsForClass.map((t) => (
                                                      <option key={t.subjectId} value={t.subjectId}>
                                                            {t.subjectName}
                                                      </option>
                                                ))}
                                          </select>
                                          {errors.subjectId && <p className="mt-1 text-xs text-(--color-danger)">{errors.subjectId.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="deadline">
                                                Deadline
                                          </label>
                                          <input id="deadline" type="datetime-local" className="sm-input" {...register("deadline")} />
                                          {errors.deadline && <p className="mt-1 text-xs text-(--color-danger)">{errors.deadline.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="maxMarks">
                                                Max marks
                                          </label>
                                          <input id="maxMarks" type="number" className="sm-input" {...register("maxMarks")} />
                                          {errors.maxMarks && <p className="mt-1 text-xs text-(--color-danger)">{errors.maxMarks.message}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                          <button type="submit" className="sm-btn sm-btn-primary" disabled={submitting}>
                                                {submitting ? "Creating…" : "Create assignment"}
                                          </button>
                                    </div>
                              </form>
                        </div>
                  )}

                  {loading && <LoadingBlock label="Loading assignments…" />}
                  {error && <ErrorBlock message={error} />}

                  {!loading && (
                        <div className="sm-card overflow-x-auto">
                              <table className="sm-table">
                                    <thead>
                                          <tr>
                                                <th>Title</th>
                                                <th>Class / Subject</th>
                                                <th>Deadline</th>
                                                <th>Submissions</th>
                                                <th>Status</th>
                                                <th></th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {assignments.map((a) => (
                                                <tr key={a.id}>
                                                      <td>
                                                            <Link href={`/teacher/assignments/${a.id}`} className="font-medium text-(--color-primary-dark) hover:underline">
                                                                  {a.title}
                                                            </Link>
                                                      </td>
                                                      <td>
                                                            {a.className} · {a.subjectName}
                                                      </td>
                                                      <td>{formatDateTime(a.deadline)}</td>
                                                      <td>{a.submissionCount}</td>
                                                      <td>
                                                            <AssignmentStatusBadge status={a.status} />
                                                      </td>
                                                      <td>
                                                            <div className="flex justify-end gap-2">
                                                                  <button type="button" className="sm-btn sm-btn-secondary" disabled={busyId === a.id} onClick={() => togglePublish(a)}>
                                                                        {a.status === AssignmentStatus.Published ? "Unpublish" : "Publish"}
                                                                  </button>
                                                                  <button type="button" className="sm-btn sm-btn-danger" disabled={busyId === a.id} onClick={() => remove(a.id)}>
                                                                        Delete
                                                                  </button>
                                                            </div>
                                                      </td>
                                                </tr>
                                          ))}
                                          {assignments.length === 0 && (
                                                <tr>
                                                      <td colSpan={6} className="text-center text-(--color-ink-soft)">
                                                            No assignments yet. Create your first one above.
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
