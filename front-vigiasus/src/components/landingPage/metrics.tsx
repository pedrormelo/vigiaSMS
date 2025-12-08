"use client"

import { ReactNode, CSSProperties, useEffect, useMemo, useState } from 'react';
import { FileText, Users, Database, BarChart3 } from "lucide-react";
import { getGlobalMetrics, type GlobalMetrics } from "@/services/dashboardService";

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
        bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 md:p-6
        flex flex-col items-start gap-2 md:gap-4 
        transition-all duration-300 transform
        hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl
        ${className}
      `}
      style={style}
    >
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 md:p-3 rounded-full shadow-lg">
        {icon}
      </div>

      <div>
        <p className="text-3xl md:text-5xl font-bold text-white">{value}</p>
        <span className="text-xs md:text-sm text-blue-200">{label}</span>
      </div>
    </div>
  );
}

export default function Metrics() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
        try {
          const data = await getGlobalMetrics();
          if (active) {
            setMetrics(data);
          }
        } finally {
          if (active) setIsLoading(false);
        }
    })();
    return () => { active = false; };
  }, []);

  const formatValue = (value?: number | null) => {
    if (value === undefined || value === null) {
      return isLoading ? "..." : "0";
    }
    const formatter = new Intl.NumberFormat('pt-BR');
    const formatted = formatter.format(value);
    return value >= 1000 ? `+${formatted}` : formatted;
  };

  const cards = useMemo(() => {
    const contextos = metrics?.contextos ?? metrics?.documentos ?? null;
    return [
      {
        icon: <BarChart3 className="size-5 md:size-7 text-white" />,
        value: formatValue(contextos),
        label: "Contextos no sistema",
        delay: '0ms'
      },
      {
        icon: <FileText className="size-5 md:size-7 text-white" />,
        value: formatValue(metrics?.dashboards ?? null),
        label: "Dashboards",
        delay: '150ms'
      },
      {
        icon: <Users className="size-5 md:size-7 text-white" />,
        value: formatValue(metrics?.diretorias ?? null),
        label: "Diretorias",
        delay: '300ms'
      },
      {
        icon: <Database className="size-5 md:size-7 text-white" />,
        value: formatValue(metrics?.gerencias ?? null),
        label: "Gerências",
        delay: '450ms'
      }
    ];
  }, [metrics, isLoading]);

  return (
    <div className="max-w-6xl mx-auto px-4 -mt-6 md:-mt-10 mb-12 md:mb-16">
      <div id="tour-metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {cards.map((card, index) => (
          <MetricCard
            key={card.label}
            icon={card.icon}
            value={card.value}
            label={card.label}
            className="animate-fade-in-up"
            style={{ animationDelay: card.delay || `${index * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
