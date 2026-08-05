"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ErrorBlock, LoadingBlock } from "@/components/StateMessage";
import { ApiError, AppSettingDto, get, put } from "@/lib/api";

const ALLOW_LATE_KEY = "AllowLateSubmissions";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<AppSettingDto[]>("/api/settings");
      setSettings(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const allowLate = settings.find((s) => s.key === ALLOW_LATE_KEY);
  const isAllowed = allowLate?.value?.toLowerCase() === "true";

  const toggleAllowLate = async () => {
    setSaving(true);
    setError(null);
    try {
      const nextValue = (!isAllowed).toString();
      await put<AppSettingDto>(`/api/settings/${ALLOW_LATE_KEY}`, { value: nextValue });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update setting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="System-wide configuration for the school." />

      {loading && <LoadingBlock label="Loading settings…" />}
      {error && <ErrorBlock message={error} />}

      {!loading && (
        <div className="sm-card max-w-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-primary-dark)]">Allow late submissions</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                When enabled, students can submit assignment answers after the deadline has passed.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAllowed}
              onClick={toggleAllowLate}
              disabled={saving}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                isAllowed ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-strong)]"
              } disabled:opacity-60`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  isAllowed ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Other settings</p>
            <div className="mt-2 space-y-1">
              {settings
                .filter((s) => s.key !== ALLOW_LATE_KEY)
                .map((s) => (
                  <div key={s.key} className="flex justify-between text-sm">
                    <span className="text-[var(--color-ink-soft)]">{s.key}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              {settings.length <= 1 && (
                <p className="text-sm text-[var(--color-ink-soft)]">No other settings configured.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
