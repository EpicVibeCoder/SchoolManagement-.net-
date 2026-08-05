"use client";

import RoleGuard from "@/components/RoleGuard";
import { UserRole } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role={UserRole.Admin}>{children}</RoleGuard>;
}
