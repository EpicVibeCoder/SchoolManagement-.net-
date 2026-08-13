"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AssignmentStatusBadge } from "@/components/Badge";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AssignmentDto, AssignmentStatus, TeacherClassSubjectDto, del, get, post, put } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { dateInputToEndOfDayIso, formatDate, isoToDateInput } from "@/lib/format";
import { PAGE_SIZE, paginate } from "@/lib/paginate";
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

const emptyForm: AssignmentFormInput = {
      title: "",
      description: "",
      deadline: "",
      maxMarks: 100,
      classId: "",
      subjectId: "",
};

export default function TeacherAssignmentsPage() {
      const queryClient = useQueryClient();
      const { user } = useAuth();
      const assignmentsQuery = useQuery({
            queryKey: queryKeys.assignments,
            queryFn: () => get<AssignmentDto[]>("/api/assignments"),
            enabled: !!user?.id,
      });
      const teachingQuery = useQuery({
            queryKey: queryKeys.teacherAssignments(user?.id),
            queryFn: () => get<TeacherClassSubjectDto[]>("/api/teacher-assignments/mine"),
            enabled: !!user?.id,
      });

      const assignments = useMemo(
            () => (assignmentsQuery.data ?? []).filter((a) => a.createdByTeacherId === user?.id),
            [assignmentsQuery.data, user?.id],
      );
      const loading = assignmentsQuery.isPending || teachingQuery.isPending;
      const error =
            assignmentsQuery.error instanceof ApiError
                  ? assignmentsQuery.error.message
                  : assignmentsQuery.error
                    ? "Failed to load assignments."
                    : null;
      // Class/subject options from assignments you already created (no Admin API)
      const teachingAssignments = useMemo(
            () =>
                  (teachingQuery.data ?? []).map((t) => ({
                        classId: t.classId,
                        className: t.className,
                        subjectId: t.subjectId,
                        subjectName: t.subjectName,
                  })),
            [teachingQuery.data],
      );

      const [formError, setFormError] = useState<string | null>(null);
      const [actionError, setActionError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [busyId, setBusyId] = useState<string | null>(null);
      const [showForm, setShowForm] = useState(false);
      const [editingId, setEditingId] = useState<string | null>(null);
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);
      const {
            register,
            handleSubmit,
            control,
            reset,
            formState: { errors },
      } = useForm<AssignmentFormInput, unknown, AssignmentFormValues>({
            resolver: zodResolver(assignmentSchema),
            defaultValues: emptyForm,
      });
      const selectedClassId = useWatch({ control, name: "classId" });
      const editingAssignment = useMemo(
            () => (editingId ? (assignments.find((a) => a.id === editingId) ?? null) : null),
            [assignments, editingId],
      );
      const classes = useMemo(() => {
            const map = new Map<string, string>();
            teachingAssignments.forEach((t) => map.set(t.classId, t.className));
            if (editingAssignment) map.set(editingAssignment.classId, editingAssignment.className);
            return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
      }, [teachingAssignments, editingAssignment]);
      const subjectsForClass = useMemo(() => {
            const map = new Map<string, string>();
            teachingAssignments.filter((t) => t.classId === selectedClassId).forEach((t) => map.set(t.subjectId, t.subjectName));
            if (editingAssignment && editingAssignment.classId === selectedClassId) {
                  map.set(editingAssignment.subjectId, editingAssignment.subjectName);
            }
            return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
      }, [teachingAssignments, selectedClassId, editingAssignment]);

      const filtered = useMemo(() => {
            const q = search.trim().toLowerCase();
            if (!q) return assignments;
            return assignments.filter(
                  (a) =>
                        a.title.toLowerCase().includes(q) ||
                        a.className.toLowerCase().includes(q) ||
                        a.subjectName.toLowerCase().includes(q) ||
                        a.status.toLowerCase().includes(q),
            );
      }, [assignments, search]);

      const { pageItems, totalPages, currentPage, total } = paginate(filtered, page);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      const refresh = async (assignmentId?: string) => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.assignments });
            if (assignmentId) await queryClient.invalidateQueries({ queryKey: queryKeys.assignment(assignmentId) });
            await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      };

      const closeForm = () => {
            setShowForm(false);
            setEditingId(null);
            setFormError(null);
            reset(emptyForm);
      };

      const startEdit = (a: AssignmentDto) => {
            setEditingId(a.id);
            setFormError(null);
            reset({
                  title: a.title,
                  description: a.description,
                  deadline: isoToDateInput(a.deadline),
                  maxMarks: a.maxMarks,
                  classId: a.classId,
                  subjectId: a.subjectId,
            });
            setShowForm(true);
      };

      const onSave = async (values: AssignmentFormValues) => {
            setFormError(null);
            setSubmitting(true);
            const payload = { ...values, deadline: dateInputToEndOfDayIso(values.deadline) };
            try {
                  if (editingId) {
                        await put(`/api/assignments/${editingId}`, payload);
                  } else {
                        await post("/api/assignments", payload);
                  }
                  const savedId = editingId;
                  closeForm();
                  await refresh(savedId ?? undefined);
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : editingId ? "Failed to update assignment." : "Failed to create assignment.");
            } finally {
                  setSubmitting(false);
            }
      };

      const togglePublish = async (a: AssignmentDto) => {
            setBusyId(a.id);
            try {
                  const action = a.status === AssignmentStatus.Published ? "unpublish" : "publish";
                  await post(`/api/assignments/${a.id}/${action}`);
                  await refresh();
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to update assignment status.");
            } finally {
                  setBusyId(null);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            try {
                  await del(`/api/assignments/${id}`);
                  await refresh();
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to delete assignment.");
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
                              <button type="button" className="sm-btn sm-btn-primary" onClick={() => (showForm ? closeForm() : setShowForm(true))}>
                                    {showForm ? "Close" : "New assignment"}
                              </button>
                        }
                  />

                  {showForm && (
                        <div className="sm-card mb-6 p-5">
                              <h2 className="text-lg font-semibold">{editingId ? "Edit assignment" : "New assignment"}</h2>
                              <form onSubmit={handleSubmit(onSave)} className="mt-4 grid gap-3 sm:grid-cols-2" noValidate>
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
                                                {subjectsForClass.map((s) => (
                                                      <option key={s.id} value={s.id}>
                                                            {s.name}
                                                      </option>
                                                ))}
                                          </select>
                                          {errors.subjectId && <p className="mt-1 text-xs text-(--color-danger)">{errors.subjectId.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="deadline">
                                                Deadline
                                          </label>
                                          <input id="deadline" type="date" className="sm-input" {...register("deadline")} />
                                          {errors.deadline && <p className="mt-1 text-xs text-(--color-danger)">{errors.deadline.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="maxMarks">
                                                Max marks
                                          </label>
                                          <input id="maxMarks" type="number" className="sm-input" {...register("maxMarks")} />
                                          {errors.maxMarks && <p className="mt-1 text-xs text-(--color-danger)">{errors.maxMarks.message}</p>}
                                    </div>
                                    <div className="sm:col-span-2 flex gap-2">
                                          <button type="submit" className="sm-btn sm-btn-primary" disabled={submitting}>
                                                {submitting ? "Saving…" : editingId ? "Save changes" : "Create assignment"}
                                          </button>
                                          {editingId && (
                                                <button type="button" className="sm-btn sm-btn-secondary" onClick={closeForm}>
                                                      Cancel
                                                </button>
                                          )}
                                    </div>
                              </form>
                        </div>
                  )}

                  {loading && <LoadingBlock label="Loading assignments…" />}
                  {(error || actionError) && <ErrorBlock message={error ?? actionError!} />}

                  {!loading && (
                        <>
                              <div className="mb-4">
                                    <input
                                          type="search"
                                          className="sm-input sm:max-w-sm"
                                          placeholder="Search by title, class, subject…"
                                          value={search}
                                          onChange={(e) => onSearchChange(e.target.value)}
                                    />
                              </div>
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
                                                {pageItems.map((a) => (
                                                      <tr key={a.id}>
                                                            <td>
                                                                  <Link
                                                                        href={`/teacher/assignments/${a.id}`}
                                                                        className="font-[550] text-(--color-primary-dark) underline-offset-2 hover:text-(--color-primary-soft) hover:underline"
                                                                  >
                                                                        {a.title}
                                                                  </Link>
                                                            </td>
                                                            <td>
                                                                  {a.className} · {a.subjectName}
                                                            </td>
                                                            <td>{formatDate(a.deadline)}</td>
                                                            <td>{a.submissionCount}</td>
                                                            <td>
                                                                  <AssignmentStatusBadge status={a.status} />
                                                            </td>
                                                            <td>
                                                                  <div className="flex justify-end gap-2">
                                                                        <button
                                                                              type="button"
                                                                              className="sm-btn sm-btn-secondary"
                                                                              disabled={busyId === a.id}
                                                                              onClick={() => startEdit(a)}
                                                                        >
                                                                              Edit
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              className="sm-btn sm-btn-secondary"
                                                                              disabled={busyId === a.id}
                                                                              onClick={() => togglePublish(a)}
                                                                        >
                                                                              {a.status === AssignmentStatus.Published ? "Unpublish" : "Publish"}
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              className="sm-btn sm-btn-danger"
                                                                              disabled={busyId === a.id}
                                                                              onClick={() => remove(a.id)}
                                                                        >
                                                                              Delete
                                                                        </button>
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))}
                                                {pageItems.length === 0 && (
                                                      <tr>
                                                            <td colSpan={6} className="text-center text-(--color-ink-soft)">
                                                                  {assignments.length === 0
                                                                        ? "No assignments yet. Create your first one above."
                                                                        : "No assignments match your search."}
                                                            </td>
                                                      </tr>
                                                )}
                                          </tbody>
                                    </table>
                              </div>
                              <ListPagination page={currentPage} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
                        </>
                  )}
            </div>
      );
}
