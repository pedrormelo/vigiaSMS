// src/app/validar/historico/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { useHistoricoContextos } from "@/hooks/useHistoricoContextos";

import ContextoTable from "@/components/validar/ContextoTable";
import DetalhesContextoModal from "@/components/popups/detalhesContextoModal";
import { Button } from "@/components/ui/button";
import HistoricoFilterBar from "@/components/validar/HistoricoFilterBar";

import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";
import { Contexto } from "@/components/validar/typesDados";

import { ArrowLeft, Eye } from "lucide-react";

export default function HistoricoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, error } = useHistoricoContextos(debouncedSearchQuery);

  const [perfil, setPerfil] = useState<"diretor" | "gerente" | "membro">("gerente");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | null>(null);

  const handleViewClick = (contexto: Contexto) => {
    setSelectedContexto(contexto);
    setIsModalOpen(true);
  };

  const getColumns = () => {
    const baseColumns =
      perfil === "membro"
        ? membroColumns
        : perfil === "gerente"
        ? gerenteColumns
        : diretorColumns;
    
    return baseColumns.map(col => {
      if (col.key === 'acoes') {
        return {
          ...col,
          render: (row: Contexto) => (
            <div className="flex items-center gap-4 text-gray-500">
              <button onClick={() => handleViewClick(row)} className="hover:text-blue-600" title="Visualizar Contexto">
                <Eye size={16} />
              </button>
            </div>
          )
        };
      }
      return col;
    });
  };

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-white">
      <div className="flex gap-2 mb-4 bg-yellow-100 p-2 rounded-md text-sm">
        <p className="font-bold my-auto">Simulação de Perfil:</p>
        <button onClick={() => setPerfil("diretor")} className={`px-3 py-1 rounded-md ${perfil === 'diretor' && 'bg-blue-200 font-semibold'}`}>Diretor</button>
        <button onClick={() => setPerfil("gerente")} className={`px-3 py-1 rounded-md ${perfil === 'gerente' && 'bg-blue-200 font-semibold'}`}>Gerente</button>
        <button onClick={() => setPerfil("membro")} className={`px-3 py-1 rounded-md ${perfil === 'membro' && 'bg-blue-200 font-semibold'}`}>Membro</button>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1745FF]">Histórico de Contextos</h1>
        <Link href="/validar">
          <Button variant="outline" className="bg-white rounded-full shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="bg-gray-50 rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1745FF] mb-4">Solicitações finalizadas</h2>
        
        <HistoricoFilterBar 
          searchValue={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
        
        <ContextoTable data={data} columns={getColumns()} />
      </div>

      <DetalhesContextoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contexto={selectedContexto}
        perfil={perfil}
      />
    </div>
  );
}