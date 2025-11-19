// src/app/validar/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useValidarContextos } from "@/hooks/useValidarContextos";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Componentes
import ContextoTable from "@/components/validar/ContextoTable";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal";
import { Button } from "@/components/ui/button";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";

// Definições e Tipos
import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";
import { Contexto } from "@/components/validar/typesDados";
import { SubmitData } from '@/components/popups/addContextoModal/types';
import { RefreshCw, Eye, Trash } from "lucide-react"; 
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";

// Serviços
import { 
    aprovarPeloGerente, 
    publicarPeloDiretor, 
    indeferirContexto, 
    solicitarCorrecao,
    getContextoById // <--- 1. NOVO IMPORT
} from "@/services/contextoService";

export default function ValidacaoContextos() {
  const { data, isLoading, error, carregarContextos } = useValidarContextos();
  const user = useCurrentUser();
  const perfil = (user?.role?.toLowerCase() as "diretor" | "gerente" | "membro") || "membro";

  // Estados
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | null>(null);
  const [isCorrecaoModalOpen, setIsCorrecaoModalOpen] = useState(false);
  const [contextoParaEditar, setContextoParaEditar] = useState<Partial<Contexto> | null>(null);

  // Handlers
  const handleViewClick = async (contexto: Contexto) => {
    // 2. CORREÇÃO: Abre modal com dados parciais e busca os completos (com URL assinada)
    setSelectedContexto(contexto);
    setIsDetalhesModalOpen(true);

    try {
        const fullData = await getContextoById(contexto.id);
        if (fullData) {
            setSelectedContexto(fullData);
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes do arquivo:", error);
    }
  };

  const handleAbrirCorrecao = (contextoParaCorrigir: Contexto) => {
    setIsDetalhesModalOpen(false);
    setContextoParaEditar(contextoParaCorrigir);
    setTimeout(() => { setIsCorrecaoModalOpen(true); }, 50);
  };

  // Ações API
  const handleDeferir = async (contextoId: string) => {
      try {
          if (perfil === 'gerente') {
              await aprovarPeloGerente(contextoId);
              showSuccessToast("Aprovado e enviado para a Diretoria.");
          } else if (perfil === 'diretor') {
              await publicarPeloDiretor(contextoId);
              showSuccessToast("Contexto publicado com sucesso!");
          }
          setIsDetalhesModalOpen(false);
          carregarContextos(); 
      } catch (err) {
          console.error(err);
          showErrorToast("Erro ao processar aprovação.");
      }
  };

  const handleIndeferir = async (contextoId: string, justificativa?: string) => {
      try {
          await indeferirContexto(contextoId, justificativa || "");
          showSuccessToast("Contexto indeferido.");
          setIsDetalhesModalOpen(false);
          carregarContextos();
      } catch (err) {
          showErrorToast("Erro ao indeferir.");
      }
  };

  const handleSolicitarCorrecao = async (contextoId: string, justificativa?: string) => {
      try {
          await solicitarCorrecao(contextoId, justificativa || "");
          showSuccessToast("Correção solicitada ao autor.");
          setIsDetalhesModalOpen(false);
          carregarContextos();
      } catch (err) {
          showErrorToast("Erro ao solicitar correção.");
      }
  };

  const handleSubmeterCorrecao = (dados: SubmitData) => {
    // Implementar lógica de update no backend
    setIsCorrecaoModalOpen(false);
    setContextoParaEditar(null);
    carregarContextos();
  };

  const getColumns = () => {
    const baseColumns =
      perfil === "membro" ? membroColumns :
      perfil === "gerente" ? gerenteColumns :
      diretorColumns;

    return baseColumns.map(col => {
      if (col.key === 'acoes') {
        return {
          ...col,
          render: (row: Contexto) => (
            <div className="flex items-center gap-4 text-gray-500">
              <button onClick={() => handleViewClick(row)} className="hover:text-blue-600" title="Visualizar Contexto">
                <Eye size={16} />
              </button>
              {perfil === 'membro' && !['Deferido', 'Indeferido', 'Publicado'].includes(row.status) && (
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

  return (
    <div className="p-8 bg-white h-screen">
      <h1 className="text-3xl font-bold text-[#1745FF] mb-8">{pageTitle}</h1>

      <div className="bg-gray-100/25 rounded-[2rem] p-6 shadow-sm">
        <h1 className="text-2xl font-regular text-[#1745FF] mb-4">Solicitações em Aberto</h1>
        
        {error ? (
             <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-100 text-center">
                {error}
                <Button onClick={carregarContextos} variant="outline" className="mt-2 ml-2 h-8">Tentar Novamente</Button>
             </div>
        ) : isLoading ? (
            <div className="flex justify-center py-12">
               <RefreshCw className="animate-spin text-blue-600 w-8 h-8" />
            </div>
        ) : (
            // REMOVIDO: A verificação de data.length === 0 agora é interna na tabela
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

      <VisualizarContextoModal
        estaAberto={isDetalhesModalOpen}
        aoFechar={() => setIsDetalhesModalOpen(false)}
        dadosDoContexto={selectedContexto}
        perfil={perfil}
        
        // 3. CORREÇÃO: Força o modo de validação para mostrar os botões Deferir/Indeferir
        isValidation={true} 

        onDeferir={(id) => handleDeferir(id)} 
        onIndeferir={(id, just) => handleIndeferir(id, just)}
        onCorrigir={(id, just) => handleSolicitarCorrecao(id, just)}
        isEditing={false} 
        isFromHistory={false} 
      />

      <ModalAdicionarConteudo
        estaAberto={isCorrecaoModalOpen}
        aoFechar={() => { setIsCorrecaoModalOpen(false); setContextoParaEditar(null); }}
        aoSubmeter={handleSubmeterCorrecao}
        dadosIniciais={contextoParaEditar} 
      />
    </div>
  );
}