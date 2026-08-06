"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, SubjectDto, del, get, post, put } from "@/lib/api";

const subjectSchema = z.object({
      name: z.string().min(1, "Name is required"),
      code: z.string().min(1, "Code is required"),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function AdminSubjectsPage() {
      const [subjects, setSubjects] = useState<SubjectDto[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [formError, setFormError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [editingId, setEditingId] = useState<string | null>(null);
      const [busyId, setBusyId] = useState<string | null>(null);

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors },
      } = useForm<SubjectFormValues>({
            resolver: zodResolver(subjectSchema),
            defaultValues: { name: "", code: "" },
      });

      const loadSubjects = async () => {
            setLoading(true);
            setError(null);
            try {
                  const data = await get<SubjectDto[]>("/api/subjects");
                  setSubjects(data);
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to load subjects.");
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            loadSubjects();
      }, []);

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
                  await loadSubjects();
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to save subject.");
            } finally {
                  setSubmitting(false);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            try {
                  await del(`/api/subjects/${id}`);
                  await loadSubjects();
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to delete subject.");
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
                                          {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="code">
                                                Code
                                          </label>
                                          <input id="code" className="sm-input" placeholder="MATH" {...register("code")} />
                                          {errors.code && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.code.message}</p>}
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
                              {loading && <LoadingBlock label="Loading subjects…" />}
                              {error && <ErrorBlock message={error} />}

                              {!loading && (
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
                                                      {subjects.map((subject) => (
                                                            <tr key={subject.id}>
                                                                  <td className="font-medium text-[var(--color-primary-dark)]">{subject.name}</td>
                                                                  <td>{subject.code}</td>
                                                                  <td>
                                                                        <div className="flex justify-end gap-2">
                                                                              <button type="button" className="sm-btn sm-btn-secondary" onClick={() => startEdit(subject)}>
                                                                                    Edit
                                                                              </button>
                                                                              <button type="button" className="sm-btn sm-btn-danger" disabled={busyId === subject.id} onClick={() => remove(subject.id)}>
                                                                                    Delete
                                                                              </button>
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                      {subjects.length === 0 && (
                                                            <tr>
                                                                  <td colSpan={3} className="text-center text-[var(--color-ink-soft)]">
                                                                        No subjects yet.
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
