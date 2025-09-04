// components/dados-gerais/GerenciaCard.tsx
import clsx from "clsx";

interface GerenciaCardProps {
  label: string;
  color: string;
  onClick?: () => void;
  className?: string;
}

export default function GerenciaCard({
  label,
  color,
  onClick,
  className,
}: GerenciaCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex h-full w-full max-h-3x cursor-pointer items-center overflow-hidden rounded-2xl bg-white hover:bg-gray-100/25 hover:text-gray-800 shadow-md border border-[#e4e4e4] transition hover:shadow-lg",
        onClick && "hover:scale-[1.03] active:scale-[0.98]",
        className
      )}
    >
      {/* Faixa colorida da diretoria */}
      <div
        className="w-8 self-stretch rounded-l-2xl"
        style={{ backgroundColor: color }}
      ></div>

      {/* Texto da gerência */}
      <span className="truncate py-5 px-6 text-gray-700 font-medium text-md">
        {label}
      </span>
    </div>
  );
}

