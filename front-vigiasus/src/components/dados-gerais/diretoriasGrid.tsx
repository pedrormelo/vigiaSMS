// components/dados-gerais/DiretoriaGrid.tsx

import DiretoriaCard from "@/components/dados-gerais/diretoriaCard";
import { diretoriasConfig } from "@/constants/diretorias";

export default function DiretoriasGrid() {
  // Build cards from configuration, excluding the Secretaria pseudo-page
  const cards = Object.values(diretoriasConfig)
    .filter((d) => d.id !== "secretaria")
    .map((d) => ({
      label: d.nome,
      colors: [d.cores.from, d.cores.to],
      href: `/dashboard/${d.id}`,
    }))

  // Optionally keep the Conselho card at the end
  const withConselho = [
    ...cards,
    { label: "Conselho Municipal de Saúde", colors: ["#B553FF", "#9234F6"], href: "/conselho" },
  ]

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-16 mb-20 mx-auto">
        {withConselho.map((d, i) => (
          <DiretoriaCard key={i} label={d.label} colors={d.colors} href={d.href} />
        ))}
      </div>
    </div>
  );
}
