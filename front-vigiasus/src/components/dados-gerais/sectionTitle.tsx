// components/dados-gerais/sectionTitle.tsx

import { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="text-4xl font-extralight text-[#1745FF] mb-6">
      {children}
    </h2>
  );
}
