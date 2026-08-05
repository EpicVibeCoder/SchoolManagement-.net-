"use client";

import RoleGuard from "@/components/RoleGuard";
import { UserRole } from "@/lib/api";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role={UserRole.Student}>{children}</RoleGuard>;
}
