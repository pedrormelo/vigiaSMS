"use client";

import { usePathname } from "next/navigation";
import OnboardingModal from "./onboardingModal";

export default function OnboardingWrapper() {
  const pathname = usePathname();

  // Renderiza somente na Home
  if (pathname !== "/") return null;

  return <OnboardingModal />;
}
