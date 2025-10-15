// src/app/gerencias/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { diretoriasConfig } from "@/constants/diretorias";
import GerenciaCard from "@/components/dados-gerais/gerenciaCard";
import { Info, LayoutDashboard,  } from "lucide-react";

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
      {/* Header com gradiente dinâmico via 'style' */}
      <div
        className="relative p-8 text-white shadow-lg"
        //  Usa banner da diretoria quando disponível, senão aplica gradiente
        style={
          diretoria.bannerImage
            ? {
                backgroundImage: `url(${diretoria.bannerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(to right, ${diretoria.cores.from}, ${diretoria.cores.to})`
              }
        }
      >
        <div className="flex justify-between items-center">
          {/* Títulos */}
          <div>
            <h1 className="text-4xl font-bold">
              {diretoria.nome}
            </h1>
            <p className="text-2xl font-light opacity-90 mt-1">Minhas Gerências</p>
          </div>

          {/* Botões do canto direito */}
          <div className="flex flex-col items-center gap-3">
            <button className="flex items-center justify-center mb-9 w-8 h-8 cursor-pointer bg-[#ffffff] text-[#1745FF] rounded-full border-none hover:bg-white/80 transition-all duration-200 shadow-sm">
              <Info size={20} />
            </button>
            <button className="flex items-center justify-center w-11 h-11 cursor-pointer rounded-[0.6rem] bg-white text-gray-600 hover:bg-white/80 transition-all duration-200 shadow-sm">
              <LayoutDashboard size={25} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Gerências */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-8">
        {diretoria.gerencias.map((g) => (
          <GerenciaCard
            key={g.id}
            label={g.nome}
            // Passa a cor principal para o card
            color={diretoria.cores.from}
          />
        ))}
      </div>
    </div>
  );
}