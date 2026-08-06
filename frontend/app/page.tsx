"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";

export default function Home() {
      const { user, loading } = useAuth();
      const router = useRouter();

      useEffect(() => {
            if (loading) return;
            router.replace(user ? roleHome(user.role) : "/login");
      }, [loading, user, router]);

      return (
            <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-(--color-ink-soft)">Loading School Management…</p>
            </div>
      );
}
