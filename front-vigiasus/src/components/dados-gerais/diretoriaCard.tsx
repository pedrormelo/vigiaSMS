// components/dados-gerais/DiretoriaCard.tsx

interface DiretoriaCardProps {
  label: string;
  colors: string[];
}

export default function DiretoriaCard({ label, colors }: DiretoriaCardProps) {
  // A lógica para criar o gradiente
  const gradientStyle = {
    background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
  };

  return (
    <div
      className="text-white rounded-full px-6 py-4 min-w-xl font-semibold text-center shadow-md cursor-pointer hover:scale-105 transition"
      style={gradientStyle}
    >
      {label}
    </div>
  );
}