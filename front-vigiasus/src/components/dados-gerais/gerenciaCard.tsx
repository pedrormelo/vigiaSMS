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
        "flex h-full w-full cursor-pointer items-center overflow-hidden rounded-2xl bg-white shadow-md border border-[#e4e4e4] transition hover:shadow-lg",
        onClick && "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {/* Faixa colorida da diretoria */}
      <div
        className="w-6 self-stretch rounded-l-2xl"
        style={{ backgroundColor: color }}
      ></div>

      {/* Texto da gerência */}
      <span className="truncate py-3 px-4 text-gray-900 font-medium">
        {label}
      </span>
    </div>
  );
}
