"use client";

import { useState } from "react";
import Link from "next/link";
import { useValidarContextos } from "@/hooks/useValidarContextos";

// Componentes
import ContextoTable from "@/components/validar/ContextoTable";
// 1. IMPORTAÇÃO ATUALIZADA
// import DetalhesContextoModal from "@/components/popups/detalhesContextoModal"; // <-- REMOVIDO
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal"; // <-- ADICIONADO (O /index.tsx é automático)

import { Button } from "@/components/ui/button";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";

// Definições de colunas e tipos
import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";
import { Contexto } from "@/components/validar/typesDados";
import { FileType } from "@/components/contextosCard/contextoCard";
import { DetalhesContexto, SubmitData } from '@/components/popups/addContextoModal/types';
// Ícones
import { RefreshCw, Eye, Trash } from "lucide-react";

export default function ValidacaoContextos() {

  const { data, isLoading, error, carregarContextos } = useValidarContextos(); // Assumindo que isLoading está disponível
  const [perfil, setPerfil] = useState<"diretor" | "gerente" | "membro">("gerente");

  // Estados para os modais
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | null>(null);
  const [isCorrecaoModalOpen, setIsCorrecaoModalOpen] = useState(false);
  const [contextoParaEditar, setContextoParaEditar] = useState<Partial<DetalhesContexto> | null>(null);

  // Abre o modal de detalhes
  const handleViewClick = (contexto: Contexto) => {
    setSelectedContexto(contexto);
    setIsDetalhesModalOpen(true);
  };

  // Abre o modal de correção (chamado pelo modal de detalhes)
  const handleAbrirCorrecao = (contextoParaCorrigir: Contexto) => {
    setIsDetalhesModalOpen(false); // Fecha o modal de detalhes

    // Prepara os dados para o modal de edição
   const dadosParaEdicao: Partial<DetalhesContexto> = {
      id: contextoParaCorrigir.id,
      title: contextoParaCorrigir.nome,
      type: contextoParaCorrigir.docType as FileType, // Cast seguro
      insertedDate: contextoParaCorrigir.data,
      url: contextoParaCorrigir.url,
      payload: contextoParaCorrigir.payload, 
      description: contextoParaCorrigir.detalhes,
      solicitante: contextoParaCorrigir.solicitante,
      versoes: contextoParaCorrigir.historico?.map((h, i) => ({ id: i + 1, nome: `Versão ${i + 1}`, data: h.data, autor: h.autor })),
    };

    setContextoParaEditar(dadosParaEdicao);
    setTimeout(() => { setIsCorrecaoModalOpen(true); }, 50); // Abre o modal de correção
  };

  // Lida com o envio dos dados corrigidos
 const handleSubmeterCorrecao = (dados: SubmitData) => {
    console.log("Dados corrigidos submetidos:", dados);
    // TODO: Implementar chamada API para salvar a correção/nova versão
    setIsCorrecaoModalOpen(false);
    setContextoParaEditar(null);
    carregarContextos(); // Recarrega a lista
  };

  // Determina quais colunas exibir na tabela com base no perfil
  const getColumns = () => {
    const baseColumns =
      perfil === "membro" ? membroColumns :
      perfil === "gerente" ? gerenteColumns :
      diretorColumns;

    // Adiciona o botão de visualização às ações
    return baseColumns.map(col => {
      if (col.key === 'acoes') {
        return {
          ...col,
          render: (row: Contexto) => (
            <div className="flex items-center gap-4 text-gray-500">
              <button onClick={() => handleViewClick(row)} className="hover:text-blue-600" title="Visualizar Contexto">
                <Eye size={16} />
              </button>
              {/* Lógica do botão de apagar (se aplicável para membro) */}
              {perfil === 'membro' && !['Deferido', 'Indeferido', 'Publicado'].includes(row.situacao) && (
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

  // Exibe erro se a busca falhar
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-white h-screen">
      {/* Simulação de Perfil */}
      <div className="flex gap-2 mb-4 bg-yellow-100 p-2 rounded-md text-sm">
        <p className="font-bold my-auto">Simulação de Perfil:</p>
        <button onClick={() => setPerfil("diretor")} className={`px-3 py-1 rounded-md ${perfil === 'diretor' && 'bg-blue-200 font-semibold'}`}>Diretor</button>
        <button onClick={() => setPerfil("gerente")} className={`px-3 py-1 rounded-md ${perfil === 'gerente' && 'bg-blue-200 font-semibold'}`}>Gerente</button>
        <button onClick={() => setPerfil("membro")} className={`px-3 py-1 rounded-md ${perfil === 'membro' && 'bg-blue-200 font-semibold'}`}>Membro</button>
      </div>

      <h1 className="text-3xl font-bold text-[#1745FF] mb-8">{pageTitle}</h1>

      {/* Container da Tabela */}
      <div className="bg-gray-100/25 rounded-[2rem] p-6 shadow-sm">
        <h1 className="text-2xl font-regular text-[#1745FF] mb-4">Solicitações em Aberto</h1>
        {isLoading ? (
            <p className="text-center text-gray-500 py-4">Carregando...</p> // Indicador de loading
        ) : (
            <ContextoTable data={data} columns={getColumns()} />
        )}
        <div className="flex justify-end mt-6">
          <Link href="/validar/historico">
            <Button className="bg-white border border-gray-300 rounded-full shadow-sm">
              Histórico
              <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. MODAL INTEGRADO (ATUALIZADO) */}
      <VisualizarContextoModal
        estaAberto={isDetalhesModalOpen}
        aoFechar={() => setIsDetalhesModalOpen(false)}
        dadosDoContexto={selectedContexto}
        perfil={perfil}
        onDeferir={(contextoId, comentario) => { console.log("Deferir:", contextoId, comentario); carregarContextos(); }}
        onIndeferir={(contextoId, comentario) => { console.log("Indeferir:", contextoId, comentario); carregarContextos(); }}
        onCorrigir={handleAbrirCorrecao}
        
        // --- PROPS DE CONTROLE DE MODO ---
        // Na página de validação, nunca estamos no "modo de edição"
        isEditing={false} 
        // Esta não é a página de histórico
        isFromHistory={false} 
      />

      {/* Modal de Adição/Correção */}
      <ModalAdicionarConteudo
        estaAberto={isCorrecaoModalOpen}
        aoFechar={() => { setIsCorrecaoModalOpen(false); setContextoParaEditar(null); }}
        aoSubmeter={handleSubmeterCorrecao}
        dadosIniciais={contextoParaEditar} // Passa os dados para pré-preencher
      />
    </div>
  );
}