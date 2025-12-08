// components/dados-gerais/DiretoriaGrid.tsx

import DiretoriaCard from "@/components/dados-gerais/diretoriaCard";
import type { Diretoria } from "@/services/organizacaoService";

interface DiretoriasGridProps {
  diretorias: Diretoria[];
  tourId?: string;
}

export default function DiretoriasGrid({ diretorias, tourId }: DiretoriasGridProps) {
  // Build cards from live diretorias, excluding the Secretaria pseudo-page if present
  const cards = (diretorias || [])
    .filter((d) => (d.slug || d.id) !== "secretaria")
    .map((d) => ({
      label: d.nome,
      colors: [d.corFrom || "#1745FF", d.corTo || "#002BDB"],
      href: `/dashboard/${d.slug || d.id}`,
    }));

  // Optionally keep the Conselho card at the end
  const withConselho = [
    ...cards,
    { label: "Conselho Municipal de Saúde", colors: ["#B553FF", "#9234F6"], href: "/conselho" },
  ];

  return (
    <div className="flex justify-center" id={tourId}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:gap-x-16 mb-12 md:mb-20 mx-auto w-full md:w-auto">
        {withConselho.map((d, i) => (
          <DiretoriaCard key={i} label={d.label} colors={d.colors} href={d.href} />
        ))}
      </div>
    </div>
  );
}
