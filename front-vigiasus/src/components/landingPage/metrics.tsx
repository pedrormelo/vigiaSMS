"use client"

// 1. Importamos CSSProperties e ReactNode do React
import { ReactNode, CSSProperties } from 'react'; 
import { FileText, Users, Database } from "lucide-react";

interface MetricCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  className?: string;
  style?: CSSProperties; // 2. ADICIONAMOS A PROPRIEDADE 'style' AQUI
}

function MetricCard({ icon, value, label, className, style }: MetricCardProps) { // 3. RECEBEMOS 'style' COMO PROP
  return (
    <div 
      className={`
        bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6
        flex flex-col items-start gap-4 
        transition-all duration-300 transform
        hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl
        ${className}
      `}
      style={style} // 4. APLICAMOS O 'style' NA DIV PRINCIPAL
    >
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-full shadow-lg">
        {icon}
      </div>
      
      <div>
        <p className="text-5xl font-bold text-white">{value}</p>
        <span className="text-sm text-blue-200">{label}</span>
      </div>
    </div>
  );
}

export default function Metrics() {
  return (
    <div className="max-w-6xl mx-auto mt-12 px-4 mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          icon={<FileText size={28} className="text-white" />}
          value="+70"
          label="Documentos"
          className="animate-fade-in-up"
        />
        <MetricCard 
          icon={<Users size={28} className="text-white" />}
          value="+30"
          label="Diretorias"
          className="animate-fade-in-up" 
        />
        <MetricCard 
          icon={<Database size={28} className="text-white" />}
          value="+40"
          label="Gerências"
          className="animate-fade-in-up" 
        />
      </div>
    </div>
  );
}

/*
  Lembre-se de adicionar este código ao seu CSS global (ex: globals.css)
  para a animação funcionar:

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0; 
  }
*/