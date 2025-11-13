"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    authService.logout();
    // small delay to allow UI feedback if needed
    const t = setTimeout(() => router.replace("/login"), 200);
    return () => clearTimeout(t);
  }, [router]);

  return null;
}
