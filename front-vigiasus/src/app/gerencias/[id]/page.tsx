// src/app/gerencias/[id]/page.tsx
"use client"; 

import { useParams } from "next/navigation";
import { diretoriasConfig } from "@/constants/diretorias";
import GerenciaCard from "@/components/dados-gerais/gerenciaCard";
import { Info, LayoutGrid } from "lucide-react"; // Ícones para o cabeçalho

const gerenciasMock = [
  { id: "g1", nome: "Gerência de Fluxos Assistenciais" },
  { id: "g2", nome: "Gerência de Fluxos Assistenciais" },
  { id: "g3", nome: "Gerência de Fluxos Assistenciais" },
  { id: "g4", nome: "Gerência de Fluxos Assistenciais" },
  { id: "g5", nome: "Gerência de Fluxos Assistenciais" },
  { id: "g6", nome: "Gerência de Fluxos Assistenciais" },
  { id: "g7", nome: "Gerência de Fluxos Assistenciais" },
  { id: "g8", nome: "Gerência de Fluxos Assistenciais" },
];

export default function GerenciasPage() {
  const params = useParams();
  const id = params.id as string;

  if (!id) {
    return <p className="text-center mt-10">Carregando...</p>;
  }

  const diretoria = diretoriasConfig[id];

  if (!diretoria) {
    return <p className="text-center mt-10">Diretoria não encontrada</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cabeçalho com gradiente da diretoria */}
      <div
        className={`p-6 bg-gradient-to-r ${diretoria.cor} text-white rounded-b-3xl shadow-lg`}
      >
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{diretoria.nome}</h1>
                <p className="text-xl opacity-90">Minhas Gerências</p>
            </div>
            <div className="flex items-center gap-4">
                <button className="hover:opacity-80 transition-opacity">
                    <Info size={24} />
                </button>
                <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors">
                    <LayoutGrid size={24} />
                </button>
            </div>
        </div>
      </div>

      {/* Grid de Gerências */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-8">
        {gerenciasMock.map((g) => (
          // O Link para cada gerência específica será adicionado aqui no futuro
          <GerenciaCard key={g.id} label={g.nome} color={diretoria.cor} />
        ))}
      </div>
    </div>
  );
}