"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { useHistoricoContextos } from "@/hooks/useHistoricoContextos";

import ContextoTable from "@/components/validar/ContextoTable";
import DetalhesContextoModal from "@/components/popups/detalhesContextoModal";
import { Button } from "@/components/ui/button";
import Paginacao from "@/components/ui/paginacao";
import { SearchBar } from "@/components/ui/search-bar";
// 1. Importar o DateInputFilter
import DateInputFilter from "@/components/validar/dateInputFilter"; 
// 2. Importar ícones para os novos estados
import { ArrowLeft, Eye, Loader2, SearchX } from "lucide-react"; 

import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";
import { Contexto } from "@/components/validar/typesDados";

export default function HistoricoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // 3. Passar o dateRange para o hook e receber o isLoading
  const { data, error, isLoading, currentPage, totalPages, setCurrentPage } = useHistoricoContextos(
    debouncedSearchQuery,
    dateRange // Passando o estado do filtro de data
  );

  const [perfil, setPerfil] = useState<"diretor" | "gerente" | "membro">("gerente");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | null>(null);

  const handleViewClick = (contexto: Contexto) => {
    setSelectedContexto(contexto);
    setIsModalOpen(true);
  };

  const handleDateFilterChange = useCallback((range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    console.log("Novo filtro de datas selecionado:", range);
  }, []);

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

  // 4. Componente auxiliar para renderizar o conteúdo da tabela
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="mt-2 font-medium">A carregar histórico...</p>
        </div>
      );
    }
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
          <SearchX className="w-12 h-12" />
          <p className="mt-2 font-semibold">Nenhum resultado encontrado</p>
          <p className="text-sm">Tente ajustar os filtros de pesquisa ou data.</p>
        </div>
      );
    }
    return <ContextoTable data={data} columns={getColumns()} />;
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex gap-2 mb-4 bg-yellow-100 p-2 rounded-md text-sm">
        <p className="font-bold my-auto">Simulação de Perfil:</p>
        <button onClick={() => setPerfil("diretor")} className={`px-3 py-1 rounded-md ${perfil === 'diretor' && 'bg-blue-200 font-semibold'}`}>Diretor</button>
        <button onClick={() => setPerfil("gerente")} className={`px-3 py-1 rounded-md ${perfil === 'gerente' && 'bg-blue-200 font-semibold'}`}>Gerente</button>
        <button onClick={() => setPerfil("membro")} className={`px-3 py-1 rounded-md ${perfil === 'membro' && 'bg-blue-200 font-semibold'}`}>Membro</button>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1745FF]">Histórico de Contextos</h1>
        <Link href="/validar">
          <Button className="bg-white rounded-full border border-gray-300 shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="bg-gray-100/25 rounded-[2rem] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Pesquise por nome ou solicitante..."
            className="w-full md:w-auto md:flex-1"
          />
          {/* 5. Adicionar o seletor de data ao JSX */}
          <DateInputFilter onDateChange={handleDateFilterChange} />
        </div>
        
        {/* 6. Chamar o novo renderizador */}
        {renderTableContent()}

        {/* 7. Só mostrar paginação se houver dados e mais de uma página */}
        {!isLoading && data.length > 0 && totalPages > 1 && (
          <Paginacao 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <DetalhesContextoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contexto={selectedContexto}
        perfil={perfil}
        isFromHistory={true}
      />
    </div>
  );
}