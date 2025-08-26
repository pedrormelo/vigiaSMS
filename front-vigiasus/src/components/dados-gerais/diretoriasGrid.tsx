// components/dados-gerais/DiretoriaGrid.tsx

import DiretoriaCard from "@/components/dados-gerais/diretoriaCard";

const diretorias = [
  { label: "Diretoria de Atenção à Saúde", colors: ["#1745FF", "#002BDB"] },
  { label: "Diretoria de Regulação do SUS", colors: ["#00BDFF", "#07ABE4"] },
  { label: "Diretoria de Gestão do SUS", colors: ["#109326", "#08902C", "#008C32"] },
  { label: "Diretoria de Vigilância em Saúde", colors: ["#FF8500", "#FD8400"] },
  { label: "Diretoria Administrativa e Financeira", colors: ["#FB4242", "#EF2828"] },
  { label: "Conselho Municipal de Saúde", colors: ["#B553FF", "#9234F6"] },
];

export default function DiretoriasGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {diretorias.map((d, i) => (
        // Passando o array 'colors' como prop.
        <DiretoriaCard key={i} label={d.label} colors={d.colors} />
      ))}
    </div>
  );
}