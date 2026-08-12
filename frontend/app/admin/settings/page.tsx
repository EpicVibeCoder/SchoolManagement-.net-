"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AppSettingDto, get, put } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

const ALLOW_LATE_KEY = "AllowLateSubmissions";

export default function AdminSettingsPage() {
      const queryClient = useQueryClient();
      const {
            data: settings = [],
            isPending: loading,
            error,
      } = useQuery({
            queryKey: queryKeys.settings,
            queryFn: () => get<AppSettingDto[]>("/api/settings"),
      });
      const [actionError, setActionError] = useState<string | null>(null);
      const [saving, setSaving] = useState(false);

      const errorMessage = error instanceof ApiError ? error.message : error ? "Failed to load settings." : null;
      const displayError = errorMessage ?? actionError;

      const allowLate = settings.find((s) => s.key === ALLOW_LATE_KEY);
      const isAllowed = allowLate?.value?.toLowerCase() === "true";

      const toggleAllowLate = async () => {
            setSaving(true);
            setActionError(null);
            try {
                  const nextValue = (!isAllowed).toString();
                  await put<AppSettingDto>(`/api/settings/${ALLOW_LATE_KEY}`, { value: nextValue });
                  await queryClient.invalidateQueries({ queryKey: queryKeys.settings });
            } catch (err) {
                  setActionError(err instanceof ApiError ? err.message : "Failed to update setting.");
            } finally {
                  setSaving(false);
            }
      };

      return (
            <div>
                  <PageHeader title="Settings" description="System-wide configuration for the school." />

                  {loading && <LoadingBlock label="Loading settings…" />}
                  {displayError && <ErrorBlock message={displayError} />}

                  {!loading && (
                        <div className="sm-card max-w-xl p-6">
                              <div className="flex items-start justify-between gap-4">
                                    <div>
                                          <h2 className="text-base font-semibold text-(--color-primary-dark)">Allow late submissions</h2>
                                          <p className="mt-1 text-sm text-(--color-ink-soft)">
                                                When enabled, students can submit assignment answers after the deadline has passed.
                                          </p>
                                    </div>
                                    <button
                                          type="button"
                                          role="switch"
                                          aria-checked={isAllowed}
                                          onClick={toggleAllowLate}
                                          disabled={saving}
                                          className={`relative h-7 w-12 shrink-0 rounded-full transition ${isAllowed ? "bg-(--color-primary)" : "bg-(--color-border-strong)"} disabled:opacity-60`}
                                    >
                                          <span
                                                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${isAllowed ? "left-6" : "left-1"}`}
                                          />
                                    </button>
                              </div>

                              <div className="mt-6 border-t border-(--color-border) pt-4">
                                    <p className="text-xs uppercase tracking-wide text-(--color-ink-soft)">Other settings</p>
                                    <div className="mt-2 space-y-1">
                                          {settings
                                                .filter((s) => s.key !== ALLOW_LATE_KEY)
                                                .map((s) => (
                                                      <div key={s.key} className="flex justify-between text-sm">
                                                            <span className="text-(--color-ink-soft)">{s.key}</span>
                                                            <span className="font-medium">{s.value}</span>
                                                      </div>
                                                ))}
                                          {settings.length <= 1 && <p className="text-sm text-(--color-ink-soft)">No other settings configured.</p>}
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}
