// components/dados-gerais/GerenciaCard.tsx

interface GerenciaCardProps {
  label: string;
  color: string;
}

export default function GerenciaCard({ label, color }: GerenciaCardProps) {
  return (
    // MUDANÇA 1: Adicionadas as classes 'w-full' e 'h-full'
    // para forçar o card a ocupar todo o espaço do seu container pai.
    <div className="flex h-full w-full items-center overflow-hidden rounded-lg bg-white shadow-md">
      <div
        className="w-3 self-stretch"
        style={{ backgroundColor: color }}
      ></div>

      {/* Truncate serve para limitar o tamanho do texto das diretorias "..."
      */}
      <span className="truncate py-3 px-4 m-2 font-medium text-gray-800">
        {label}
      </span>
    </div>
  );
}