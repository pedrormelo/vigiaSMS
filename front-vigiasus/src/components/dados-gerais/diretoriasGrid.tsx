// components/dados-gerais/DiretoriaGrid.tsx

import DiretoriaCard from "@/components/dados-gerais/diretoriaCard";

const diretorias = [
  { label: "Diretoria de Atenção à Saúde", colors: ["#1745FF", "#002BDB"], href: "/diretorias/atencao-saude" },
  { label: "Diretoria de Regulação do SUS", colors: ["#00BDFF", "#07ABE4"], href: "/diretorias/regulacao-sus" },
  { label: "Diretoria de Gestão do SUS", colors: ["#109326", "#08902C", "#008C32"], href: "/diretorias/gestao-sus" },
  { label: "Diretoria de Vigilância em Saúde", colors: ["#FF8500", "#FD8400"], href: "/diretorias/vigilancia-saude" },
  { label: "Diretoria Administrativa e Financeira", colors: ["#FB4242", "#EF2828"], href: "/diretorias/admin-financeira" },
  { label: "Conselho Municipal de Saúde", colors: ["#B553FF", "#9234F6"], href: "/conselho" },
];

export default function DiretoriasGrid() {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-16 mb-20 mx-auto">
        {diretorias.map((d, i) => (
          <DiretoriaCard key={i} label={d.label} colors={d.colors} href={d.href} />
        ))}
      </div>
    </div>
  );
}
