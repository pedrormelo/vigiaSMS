// src/app/validar/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useValidarContextos } from "@/hooks/useValidarContextos";

// Componentes
import ContextoTable from "@/components/validar/ContextoTable";
import DetalhesContextoModal from "@/components/popups/detalhesContextoModal";
import { Button } from "@/components/ui/button";

// Definições de colunas e tipos
import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";
import { Contexto } from "@/components/validar/typesDados";

// Ícones
import { RefreshCw, Eye, Trash } from "lucide-react";

export default function ValidacaoContextos() {

  const { data, error } = useValidarContextos();
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
              {perfil === 'membro' && (
                <button className="hover:text-red-600" title="Apagar Contexto">
                  <Trash size={16} />
                </button>
              )}
            </div>
          )
        };
      }
      return col;
    });
  };

  const pageTitle = perfil === "membro" ? "Requisição de Contextos" : "Validar Contextos";

  // A verificação de erro ainda é necessária.
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }
  

  return (
    <div className="p-8 bg-white h-screen">
      <div className="flex gap-2 mb-4 bg-yellow-100 p-2 rounded-md text-sm">
        <p className="font-bold my-auto">Simulação de Perfil:</p>
        <button onClick={() => setPerfil("diretor")} className={`px-3 py-1 rounded-md ${perfil === 'diretor' && 'bg-blue-200 font-semibold'}`}>Diretor</button>
        <button onClick={() => setPerfil("gerente")} className={`px-3 py-1 rounded-md ${perfil === 'gerente' && 'bg-blue-200 font-semibold'}`}>Gerente</button>
        <button onClick={() => setPerfil("membro")} className={`px-3 py-1 rounded-md ${perfil === 'membro' && 'bg-blue-200 font-semibold'}`}>Membro</button>
      </div>

      <h1 className="text-3xl font-bold text-[#1745FF] mb-8">{pageTitle}</h1>

      <div className="bg-gray-50 rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1745FF] mb-4">Solicitações em aberto</h2>

        <ContextoTable data={data} columns={getColumns()} />
        
        <div className="flex justify-end mt-6">
          <Link href="/validar/historico">
            <Button variant="outline" className="bg-white rounded-full shadow-sm">
              Histórico
              <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
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