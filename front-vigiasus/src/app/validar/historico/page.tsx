// src/app/validar/historico/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, SearchX, Loader2 } from "lucide-react";

// Componentes de UI
import { Button } from "@/components/ui/button";
import SpinnerCarregamento from "@/components/ui/spinner-carregamento";
import { SearchBar } from "@/components/ui/search-bar";
import DateInputFilter from "@/components/validar/dateInputFilter";
import Paginacao from "@/components/ui/paginacao";
import ContextoTable from "@/components/validar/ContextoTable";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts"; // Importar Toasts

// Modais
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal";

// Hooks e Tipos
import { useDebounce } from "@/hooks/useDebounce";
import { useHistoricoContextos, type HistoricoDateRange } from "@/hooks/useHistoricoContextos";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Contexto } from "@/components/validar/typesDados";
import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";

// Serviço para buscar detalhes
import { getContextoById } from "@/services/contextoService";

type PartialContexto = Partial<Contexto> & { id: string };

export default function HistoricoPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [dateRange, setDateRange] = useState<HistoricoDateRange>(undefined);

    const {
        data,
        isLoading,
        error,
        currentPage,
        totalPages,
        totalItems,
        setCurrentPage
    } = useHistoricoContextos(debouncedSearch, dateRange);

    const user = useCurrentUser();
    const perfil = (user?.role?.toLowerCase() as "diretor" | "gerente" | "membro") || "membro";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContexto, setSelectedContexto] = useState<Contexto | PartialContexto | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false); // Estado para loader

    // --- LÓGICA DE ABERTURA INTELIGENTE ---
    const handleRowClick = async (row: Contexto) => {
        console.log(`🔍 [Clique] Versão clicada:`, { 
            id: row.id, 
            title: row.title, 
            status: row.status,
            dbIdVersao0: row.versoes?.[0]?.dbId,
            versaoNumero0: row.versoes?.[0]?.id,
            todasVersoes: row.versoes?.map(v => ({ id: v.id, status: v.status }))
        });
        
        // IMPORTANTE: Salvamos o dbId da versão específica que foi clicada
        const versaoClicadaDbId = row.versoes?.[0]?.dbId;
        
        // 1. Abre imediatamente com os dados parciais da tabela
        setSelectedContexto(row);
        setIsModalOpen(true);
        setIsFetchingDetails(true);

        try {
            // 2. Busca os dados completos no backend
            const fullData = await getContextoById(row.id);
            if (fullData) {
                // CORREÇÃO: Mantém a versão específica que foi clicada no modal
                // Se foi clicada uma versão específica do histórico, reorganiza para mostrar ela primeiro
                if (versaoClicadaDbId && fullData.versoes && fullData.versoes.length > 1) {
                    const indexVersaoClicada = fullData.versoes.findIndex(v => v.dbId === versaoClicadaDbId);
                    if (indexVersaoClicada > 0) {
                        // Move a versão clicada para o começo do array
                        const [versaoClicada] = fullData.versoes.splice(indexVersaoClicada, 1);
                        fullData.versoes.unshift(versaoClicada);
                    }
                }
                setSelectedContexto(fullData);
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes:", error);
            showErrorToast("Erro", "Não foi possível carregar os detalhes do arquivo.");
        } finally {
            setIsFetchingDetails(false);
        }
    };
    // --------------------------------------

    const getColumns = () => {
        const baseColumns = perfil === "diretor" ? diretorColumns
            : perfil === "gerente" ? gerenteColumns
                : membroColumns;

        return baseColumns.map(col => {
            if (col.key === 'acoes') {
                return {
                    ...col,
                    render: (row: Contexto) => (
                        <div className="flex items-center gap-4 text-gray-500">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
                                className="hover:text-blue-600 transition-colors"
                                title="Ver Detalhes"
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                    )
                };
            }
            return col;
        });
    };

    return (
        // Layout Simétrico com a página de Validação
        <div className="p-8 bg-white min-h-screen">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1745FF]">Histórico de Contextos</h1>
                    <p className="text-gray-500 mt-1 text-sm">Registro completo de todas as movimentações.</p>
                </div>
                <Link href="/validar">
                    <Button className="bg-white rounded-full border border-gray-300 shadow-sm text-gray-700 hover:bg-gray-50">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </Link>
            </div>

            {/* Container Branco Arredondado (Igual ao da Validação) */}
            <div className="bg-gray-100/25 rounded-[2rem] p-6 shadow-sm">

                {/* Barra de Filtros */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6" id="tour-historico-filtros">
                    <div className="flex-1" id="tour-historico-search">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Pesquise por título, autor ou ID..."
                            className="w-full"
                        />
                    </div>
                    <div className="w-full md:w-auto" id="tour-historico-daterange">
                        <DateInputFilter onDateChange={setDateRange} />
                    </div>
                </div>

                {/* Conteúdo da Tabela */}
                {isLoading ? (
                    <div className="py-12">
                        <SpinnerCarregamento
                            mensagem="A carregar histórico..."
                            tamanho="medio"
                        />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-red-500 mb-2">{error}</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Tentar Novamente
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Tabela com Estado Vazio Customizado */}
                        <div id="tour-historico-table">
                            <ContextoTable
                                data={data}
                                columns={getColumns()}
                                onRowClick={handleRowClick} // Usa o novo handler
                                emptyState={{
                                    title: "Nenhum registro encontrado",
                                    description: "Tente ajustar os filtros de busca ou data.",
                                    icon: SearchX
                                }}
                            />
                        </div>

                        {/* Rodapé com Total e Paginação */}
                        {data.length > 0 && (
                            <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200" id="tour-historico-paginacao">
                                <div className="text-sm text-gray-500 mb-4 md:mb-0">
                                    Total de {totalItems} registro(s)
                                </div>

                                {totalPages > 1 && (
                                    <Paginacao
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de Visualização */}
            <VisualizarContextoModal
                estaAberto={isModalOpen}
                aoFechar={() => setIsModalOpen(false)}
                dadosDoContexto={selectedContexto}
                perfil={perfil}
                isEditing={false}
                isFromHistory={true}
                onDeferir={undefined}
                onIndeferir={undefined}
                onCorrigir={undefined}
            />

            {/* Loader flutuante para feedback (opcional, mas recomendado) */}
            {isFetchingDetails && (
                <div className="fixed bottom-6 right-6 bg-white px-4 py-3 rounded-full shadow-xl border border-blue-100 flex items-center gap-3 z-[60] animate-in slide-in-from-bottom-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">A carregar arquivo completo...</span>
                </div>
            )}
        </div>
    );
}