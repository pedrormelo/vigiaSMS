// components/dados-gerais/DiretoriaCard.tsx
import Link from "next/link";

interface DiretoriaCardProps {
  label: string;
  colors: string[];
  href: string; 
}

export default function DiretoriaCard({ label, colors, href }: DiretoriaCardProps) {
  const gradientStyle = {
    background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
  };

  return (
    <Link href={href}>
      <div
        className="text-white rounded-full px-4 py-3 md:px-6 md:py-4 min-w-0 md:min-w-xl font-semibold text-sm md:text-base text-center shadow-md cursor-pointer hover:scale-105 transition"
        style={gradientStyle}
      >
        {label}
      </div>
    </Link>
  );
}
