"use client";

import RoleGuard from "@/components/RoleGuard";
import { UserRole } from "@/lib/api";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role={UserRole.Teacher}>{children}</RoleGuard>;
}
