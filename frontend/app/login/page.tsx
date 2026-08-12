"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api";
import { roleHome, useAuth } from "@/lib/auth";

const loginSchema = z.object({
      email: z.string().min(1, "Email is required").email("Enter a valid email"),
      password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
      { role: "Admin", email: "admin@school.com", password: "Admin123!" },
      { role: "Teacher", email: "teacher@school.com", password: "Teacher123!" },
      { role: "Student", email: "student1@school.com", password: "Student123!" },
];

export default function LoginPage() {
      const { user, loading, login } = useAuth();
      const router = useRouter();
      const [serverError, setServerError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);

      const {
            register,
            handleSubmit,
            setValue,
            formState: { errors },
      } = useForm<LoginFormValues>({
            resolver: zodResolver(loginSchema),
            defaultValues: { email: "", password: "" },
      });

      useEffect(() => {
            if (!loading && user) {
                  router.replace(roleHome(user.role));
            }
      }, [loading, user, router]);

      const onSubmit = async (values: LoginFormValues) => {
            setServerError(null);
            setSubmitting(true);
            try {
                  const loggedInUser = await login(values.email, values.password);
                  router.replace(roleHome(loggedInUser.role));
            } catch (err) {
                  setServerError(err instanceof ApiError ? err.message : "Unable to log in. Please try again.");
            } finally {
                  setSubmitting(false);
            }
      };

      const fillDemo = (email: string, password: string) => {
            setValue("email", email);
            setValue("password", password);
      };

      return (
            <div className="flex flex-1 items-center justify-center px-4 py-12">
                  <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                              <h1 className="text-3xl font-semibold">School Management</h1>
                              <p className="mt-2 text-sm text-(--color-ink-soft)">Sign in to access your dashboard</p>
                        </div>

                        <div className="sm-card p-6 sm:p-8">
                              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                    {serverError && <div className="sm-alert sm-alert-danger">{serverError}</div>}

                                    <div>
                                          <label className="sm-label" htmlFor="email">
                                                Email
                                          </label>
                                          <input
                                                id="email"
                                                type="email"
                                                className="sm-input"
                                                placeholder="you@school.com"
                                                autoComplete="email"
                                                {...register("email")}
                                          />
                                          {errors.email && <p className="mt-1 text-xs text-(--color-danger)">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                          <label className="sm-label" htmlFor="password">
                                                Password
                                          </label>
                                          <input
                                                id="password"
                                                type="password"
                                                className="sm-input"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                {...register("password")}
                                          />
                                          {errors.password && <p className="mt-1 text-xs text-(--color-danger)">{errors.password.message}</p>}
                                    </div>

                                    <button type="submit" className="sm-btn sm-btn-primary w-full" disabled={submitting}>
                                          {submitting ? "Signing in…" : "Sign in"}
                                    </button>
                              </form>
                        </div>

                        <div className="sm-card mt-4 p-4">
                              <p className="sm-label mb-2">Demo credentials</p>
                              <div className="space-y-1.5">
                                    {DEMO_ACCOUNTS.map((account) => (
                                          <button
                                                key={account.email}
                                                type="button"
                                                onClick={() => fillDemo(account.email, account.password)}
                                                className="flex w-full items-center justify-between rounded-md border border-(--color-border) bg-(--color-surface-raised) px-3 py-2 text-left text-xs transition hover:border-(--color-primary-soft)"
                                          >
                                                <span className="font-semibold text-(--color-primary-dark)">{account.role}</span>
                                                <span className="text-(--color-ink-soft)">
                                                      {account.email} / {account.password}
                                                </span>
                                          </button>
                                    ))}
                              </div>
                        </div>
                  </div>
            </div>
      );
}
