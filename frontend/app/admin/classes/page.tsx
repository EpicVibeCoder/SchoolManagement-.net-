"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, ClassDto, del, get, post, put } from "@/lib/api";

const classSchema = z.object({
      name: z.string().min(1, "Name is required"),
      code: z.string().min(1, "Code is required"),
      academicYear: z.string().min(1, "Academic year is required"),
});

type ClassFormValues = z.infer<typeof classSchema>;

export default function AdminClassesPage() {
      const [classes, setClasses] = useState<ClassDto[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [search, setSearch] = useState("");
      const [formError, setFormError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [editingId, setEditingId] = useState<string | null>(null);
      const [busyId, setBusyId] = useState<string | null>(null);

      const filteredClasses = classes.filter((klass) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return (
                  klass.name.toLowerCase().includes(q) ||
                  klass.code.toLowerCase().includes(q) ||
                  klass.academicYear.toLowerCase().includes(q)
            );
      });

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors },
      } = useForm<ClassFormValues>({
            resolver: zodResolver(classSchema),
            defaultValues: { name: "", code: "", academicYear: "" },
      });

      const load = async () => {
            setLoading(true);
            setError(null);
            try {
                  const data = await get<ClassDto[]>("/api/classes");
                  setClasses(data);
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to load classes.");
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            load();
      }, []);

      const startEdit = (klass: ClassDto) => {
            setEditingId(klass.id);
            setFormError(null);
            reset({ name: klass.name, code: klass.code, academicYear: klass.academicYear });
      };

      const cancelEdit = () => {
            setEditingId(null);
            reset({ name: "", code: "", academicYear: "" });
      };

      const onSubmit = async (values: ClassFormValues) => {
            setFormError(null);
            setSubmitting(true);
            try {
                  if (editingId) {
                        await put<ClassDto>(`/api/classes/${editingId}`, values);
                  } else {
                        await post<ClassDto>("/api/classes", values);
                  }
                  cancelEdit();
                  await load();
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to save class.");
            } finally {
                  setSubmitting(false);
            }
      };

      const remove = async (id: string) => {
            setBusyId(id);
            try {
                  await del(`/api/classes/${id}`);
                  await load();
            } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to delete class.");
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
                                          {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="code">
                                                Code
                                          </label>
                                          <input id="code" className="sm-input" placeholder="G10A" {...register("code")} />
                                          {errors.code && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.code.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="academicYear">
                                                Academic year
                                          </label>
                                          <input id="academicYear" className="sm-input" placeholder="2025-2026" {...register("academicYear")} />
                                          {errors.academicYear && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.academicYear.message}</p>}
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
                              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                          type="text"
                                          className="sm-input sm:max-w-xs"
                                          placeholder="Search by name, code, or year…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                    />
                              </div>

                              {loading && <LoadingBlock label="Loading classes…" />}
                              {error && <ErrorBlock message={error} />}

                              {!loading && (
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
                                                      {filteredClasses.map((klass) => (
                                                            <tr key={klass.id}>
                                                                  <td className="font-medium text-[var(--color-primary-dark)]">{klass.name}</td>
                                                                  <td>{klass.code}</td>
                                                                  <td>{klass.academicYear}</td>
                                                                  <td>
                                                                        <div className="flex justify-end gap-2">
                                                                              <button type="button" className="sm-btn sm-btn-secondary" onClick={() => startEdit(klass)}>
                                                                                    Edit
                                                                              </button>
                                                                              <button type="button" className="sm-btn sm-btn-danger" disabled={busyId === klass.id} onClick={() => remove(klass.id)}>
                                                                                    Delete
                                                                              </button>
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                      {classes.length === 0 && (
                                                            <tr>
                                                                  <td colSpan={4} className="text-center text-[var(--color-ink-soft)]">
                                                                        No classes yet.
                                                                  </td>
                                                            </tr>
                                                      )}
                                                      {classes.length > 0 && filteredClasses.length === 0 && (
                                                            <tr>
                                                                  <td colSpan={4} className="text-center text-[var(--color-ink-soft)]">
                                                                        No classes match your search.
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
