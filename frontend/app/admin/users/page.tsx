"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ListPagination from "@/components/ListPagination";
import PageHeader from "@/components/PageHeader";
import { ActiveBadge, RoleBadge } from "@/components/Badge";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, CreateUserRequest, PagedResult, UserDto, UserRole, del, get, post, put, userRoleOptions } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/paginate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const createUserSchema = z.object({
      email: z.string().min(1, "Email is required").email("Enter a valid email"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      fullName: z.string().min(1, "Full name is required"),
      role: z.enum(["Admin", "Teacher", "Student"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function AdminUsersPage() {
      const queryClient = useQueryClient();
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);
      const [roleFilter, setRoleFilter] = useState<string>("");
      const [formError, setFormError] = useState<string | null>(null);
      const [actionError, setActionError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);
      const [busyId, setBusyId] = useState<string | null>(null);

      const {
            data: result,
            isPending: loading,
            error,
      } = useQuery({
            queryKey: queryKeys.users(search, roleFilter || undefined, page),
            queryFn: () => {
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (roleFilter !== "") params.set("role", roleFilter);
                  params.set("page", String(page));
                  params.set("pageSize", String(PAGE_SIZE));
                  return get<PagedResult<UserDto>>(`/api/users?${params.toString()}`);
            },
      });
      const errorMessage = error instanceof ApiError ? error.message : error ? "Failed to load users." : null;

      const total = result?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const currentPage = Math.min(page, totalPages);

      const onSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
      };

      const onRoleFilterChange = (value: string) => {
            setRoleFilter(value);
            setPage(1);
      };

      const {
            register,
            handleSubmit,
            reset,
            formState: { errors },
      } = useForm<CreateUserFormValues>({
            resolver: zodResolver(createUserSchema),
            defaultValues: { email: "", password: "", fullName: "", role: UserRole.Student },
      });

      const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["users"] });

      const onCreate = async (values: CreateUserFormValues) => {
            setFormError(null);
            setSubmitting(true);
            try {
                  const payload: CreateUserRequest = {
                        email: values.email,
                        password: values.password,
                        fullName: values.fullName,
                        role: values.role,
                  };
                  await post<UserDto>("/api/users", payload);
                  reset({ email: "", password: "", fullName: "", role: UserRole.Student });
                  await invalidateUsers();
            } catch (err) {
                  setFormError(err instanceof ApiError ? err.message : "Failed to create user.");
            } finally {
                  setSubmitting(false);
            }
      };

      const toggleActive = async (targetUser: UserDto) => {
            setBusyId(targetUser.id);
            setActionError(null);
            try {
                  await put(`/api/users/${targetUser.id}`, {
                        fullName: targetUser.fullName,
                        role: targetUser.role,
                        isActive: !targetUser.isActive,
                        password: null,
                  });
                  await invalidateUsers();
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to update user.");
            } finally {
                  setBusyId(null);
            }
      };

      const deactivate = async (id: string) => {
            setBusyId(id);
            setActionError(null);
            try {
                  await del(`/api/users/${id}`);
                  await invalidateUsers();
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to deactivate user.");
            } finally {
                  setBusyId(null);
            }
      };

      return (
            <div>
                  <PageHeader title="Users" description="Manage administrators, teachers, and students." />

                  <div className="grid gap-6 lg:grid-cols-3">
                        <div className="sm-card p-5 lg:col-span-1 lg:order-2 h-fit">
                              <h2 className="text-lg font-semibold">Add user</h2>
                              <form onSubmit={handleSubmit(onCreate)} className="mt-4 space-y-3" noValidate>
                                    {formError && <div className="sm-alert sm-alert-danger">{formError}</div>}
                                    <div>
                                          <label className="sm-label" htmlFor="fullName">
                                                Full name
                                          </label>
                                          <input id="fullName" className="sm-input" {...register("fullName")} />
                                          {errors.fullName && <p className="mt-1 text-xs text-(--color-danger)">{errors.fullName.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="email">
                                                Email
                                          </label>
                                          <input id="email" type="email" className="sm-input" {...register("email")} />
                                          {errors.email && <p className="mt-1 text-xs text-(--color-danger)">{errors.email.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="password">
                                                Password
                                          </label>
                                          <input id="password" type="password" className="sm-input" {...register("password")} />
                                          {errors.password && <p className="mt-1 text-xs text-(--color-danger)">{errors.password.message}</p>}
                                    </div>
                                    <div>
                                          <label className="sm-label" htmlFor="role">
                                                Role
                                          </label>
                                          <select id="role" className="sm-input" {...register("role")}>
                                                {userRoleOptions.map((opt) => (
                                                      <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>
                                    <button type="submit" className="sm-btn sm-btn-primary w-full" disabled={submitting}>
                                          {submitting ? "Creating…" : "Create user"}
                                    </button>
                              </form>
                        </div>

                        <div className="lg:col-span-2 lg:order-1">
                              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                                    <input
                                          type="search"
                                          className="sm-input sm:max-w-xs"
                                          placeholder="Search by name or email…"
                                          value={search}
                                          onChange={(e) => onSearchChange(e.target.value)}
                                    />
                                    <select
                                          className="sm-input sm:max-w-[10rem]"
                                          value={roleFilter}
                                          onChange={(e) => onRoleFilterChange(e.target.value)}
                                    >
                                          <option value="">All roles</option>
                                          {userRoleOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                      {opt.label}
                                                </option>
                                          ))}
                                    </select>
                              </div>

                              {loading && <LoadingBlock label="Loading users…" />}
                              {(errorMessage || actionError) && <ErrorBlock message={errorMessage ?? actionError!} />}

                              {result && !loading && (
                                    <>
                                          <div className="sm-card overflow-x-auto">
                                                <table className="sm-table">
                                                      <thead>
                                                            <tr>
                                                                  <th>Name</th>
                                                                  <th>Email</th>
                                                                  <th>Role</th>
                                                                  <th>Status</th>
                                                                  <th>Joined</th>
                                                                  <th></th>
                                                            </tr>
                                                      </thead>
                                                      <tbody>
                                                            {result.items.map((u) => (
                                                                  <tr key={u.id}>
                                                                        <td className="font-medium text-(--color-primary-dark)">{u.fullName}</td>
                                                                        <td>{u.email}</td>
                                                                        <td>
                                                                              <RoleBadge role={u.role} />
                                                                        </td>
                                                                        <td>
                                                                              <ActiveBadge active={u.isActive} />
                                                                        </td>
                                                                        <td>{formatDate(u.createdAt)}</td>
                                                                        <td>
                                                                              <div className="flex justify-end gap-2">
                                                                                    <button
                                                                                          type="button"
                                                                                          className="sm-btn sm-btn-secondary"
                                                                                          disabled={busyId === u.id}
                                                                                          onClick={() => toggleActive(u)}
                                                                                    >
                                                                                          {u.isActive ? "Deactivate" : "Activate"}
                                                                                    </button>
                                                                                    {u.isActive && (
                                                                                          <button
                                                                                                type="button"
                                                                                                className="sm-btn sm-btn-danger"
                                                                                                disabled={busyId === u.id}
                                                                                                onClick={() => deactivate(u.id)}
                                                                                          >
                                                                                                Remove
                                                                                          </button>
                                                                                    )}
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))}
                                                            {result.items.length === 0 && (
                                                                  <tr>
                                                                        <td colSpan={6} className="text-center text-(--color-ink-soft)">
                                                                              {search || roleFilter
                                                                                    ? "No users match your search."
                                                                                    : "No users found."}
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
