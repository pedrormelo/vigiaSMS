"use client"

import { ReactNode, CSSProperties } from "react";
import { Database, BarChart3, FileCheck2 } from "lucide-react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  style?: CSSProperties;
}

function FeatureCard({ icon, title, description, className, style }: FeatureCardProps) {
  return (
    <div 
      className={`
        bg-white rounded-2xl p-8 shadow-lg
        flex flex-col items-start text-left 
        transition-all duration-300 transform
        hover:-translate-y-2 hover:shadow-xl
        ${className}
      `}
      style={style}
    >
      {/* Ícone com fundo gradiente para destaque */}
      <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-xl mb-6 shadow-md">
        {icon}
      </div>
      
      {/* Título e descrição do card */}
      <h3 className="font-bold text-lg text-blue-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function ComoFunciona() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Título e subtítulo */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-600">
            Como Funciona?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Entenda em 3 passos simples como transformamos dados em decisões estratégicas.
          </p>
        </div>

        {/* Grid com os FeatureCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Database size={32} className="text-white" />}
            title="1. Coleta de Dados"
            description="Informações coletadas diretamente das gerências e diretorias, garantindo precisão e atualização constante."
            className="animate-fade-in-up"
          />
          <FeatureCard
            icon={<BarChart3 size={32} className="text-white" />}
            title="2. Análise e Visualização"
            description="Relatórios e gráficos interativos que permitem análises rápidas e assertivas para a gestão da saúde."
            className="animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          />
          <FeatureCard
            icon={<FileCheck2 size={32} className="text-white" />}
            title="3. Apoio à Decisão"
            description="As informações transformadas em conhecimento estratégico para embasar decisões e políticas públicas."
            className="animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          />
        </div>
      </div>
    </section>
  );
}