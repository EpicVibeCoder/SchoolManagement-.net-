"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { roleHome, useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/api";
import AppShell from "./AppShell";

export default function RoleGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
      const { user, loading } = useAuth();
      const router = useRouter();

      useEffect(() => {
            if (loading) return;
            if (!user) {
                  router.replace("/login");
                  return;
            }
            if (user.role !== role) {
                  router.replace(roleHome(user.role));
            }
      }, [loading, user, role, router]);

      if (loading || !user || user.role !== role) {
            return (
                  <div className="flex min-h-screen flex-1 items-center justify-center">
                        <p className="text-sm text-(--color-ink-soft)">Loading…</p>
                  </div>
            );
      }

      return <AppShell>{children}</AppShell>;
}
