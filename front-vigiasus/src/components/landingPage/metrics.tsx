"use client"

import { ReactNode, CSSProperties } from 'react'; 
import { FileText, Users, Database, BarChart3 } from "lucide-react"; 

interface MetricCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  className?: string;
  style?: CSSProperties;
}

function MetricCard({ icon, value, label, className, style }: MetricCardProps) {
  return (
    <div 
      className={`
        bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6
        flex flex-col items-start gap-4 
        transition-all duration-300 transform
        hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl
        ${className}
      `}
      style={style}
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
    <div className="max-w-6xl mx-auto px-4 -mt-10 mb-16">
     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <MetricCard 
          icon={<BarChart3 size={28} className="text-white" />}
          value="+2 mil"
          label="Contextos no sistema"
          className="animate-fade-in-up"
        />
        
        <MetricCard 
          icon={<FileText size={28} className="text-white" />}
          value="+70"
          label="Documentos"
          className="animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        />
        <MetricCard 
          icon={<Users size={28} className="text-white" />}
          value="+30"
          label="Diretorias"
          className="animate-fade-in-up" 
          style={{ animationDelay: '300ms' }}
        />
        <MetricCard 
          icon={<Database size={28} className="text-white" />}
          value="+40"
          label="Gerências"
          className="animate-fade-in-up" 
          style={{ animationDelay: '450ms' }}
        />
      </div>
    </div>
  );
}
