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
import ExcluirContextoModal from "@/components/popups/excluirContextoModal";

// Definições e Tipos
import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";
import { Contexto, StatusContexto } from "@/components/validar/typesDados";
import { SubmitData } from '@/components/popups/addContextoModal/types';
import { RefreshCw, Eye, Trash, FilePenLine } from "lucide-react"; 
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
import { mapTipoGraficoParaBackend, normalizarNumero } from "@/lib/gerenciaUtils"; // Importado para conversão

// Serviços
import { 
    aprovarPeloGerente, 
    publicarPeloDiretor, 
    indeferirContexto, 
    solicitarCorrecao,
    getContextoById,
    criarVersao,
    deleteContexto 
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
  
  // Estados para exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contextoParaExcluir, setContextoParaExcluir] = useState<Contexto | null>(null);

  // Helper para saber se é rollback
  const isRollback = contextoParaExcluir 
      ? (contextoParaExcluir.versoes?.length || 0) > 1 
      : false;

  // Handlers
  const handleViewClick = async (contexto: Contexto) => {
    setSelectedContexto(contexto);
    setIsDetalhesModalOpen(true);

    try {
        const fullData = await getContextoById(contexto.id);
        if (fullData) {
            setSelectedContexto(fullData);
        }
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
  };

  const handleAbrirCorrecao = (contextoParaCorrigir: Contexto) => {
    setIsDetalhesModalOpen(false); 
    setContextoParaEditar(contextoParaCorrigir);
    setTimeout(() => { setIsCorrecaoModalOpen(true); }, 50);
  };

  const handleAbrirExclusao = (contexto: Contexto) => {
      setContextoParaExcluir(contexto);
      setIsDeleteModalOpen(true);
  };

  const handleConfirmarExclusao = async () => {
      if (!contextoParaExcluir) return;

      try {
          await deleteContexto(contextoParaExcluir.id);
          showSuccessToast("Contexto excluído com sucesso.");
          carregarContextos(); 
      } catch (err: any) {
          console.error("Erro ao excluir:", err);
          showErrorToast(err.message || "Erro ao excluir contexto.");
      } finally {
          setIsDeleteModalOpen(false);
          setContextoParaExcluir(null);
      }
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

  // [CORREÇÃO]: Extração correta dos dados baseada no tipo do payload
  const handleSubmeterCorrecao = async (dados: SubmitData) => {
    if (!contextoParaEditar || !contextoParaEditar.id) return;

    try {
        let payload: any = {};
        let file: File | null = null;

        // Extração condicional baseada no tipo
        if (dados.type === 'contexto') {
            payload = {
                titulo: dados.payload.title?.trim(),
                descricao: dados.payload.details?.trim(),
                tipo: 'ARQUIVO_LINK',
                linkUrl: dados.payload.url?.trim(),
                motivoNovaVersao: "Correção solicitada"
            };
            file = dados.payload.file ?? null;

        } else if (dados.type === 'dashboard') {
            payload = {
                titulo: dados.payload.title?.trim(),
                descricao: dados.payload.details?.trim(),
                tipo: 'DASHBOARD',
                tipoGrafico: mapTipoGraficoParaBackend(dados.payload.type),
                dashboardPayload: dados.payload.dataset
                    ? JSON.parse(JSON.stringify(dados.payload.dataset))
                    : undefined,
                motivoNovaVersao: "Correção solicitada"
            };

        } else if (dados.type === 'indicador') {
            payload = {
                titulo: dados.payload.titulo?.trim(),
                descricao: dados.payload.descricao?.trim(),
                tipo: 'INDICADOR',
                valorAtual: normalizarNumero(dados.payload.valorAtual),
                valorAlvo: normalizarNumero(dados.payload.valorAlvo),
                unidade: dados.payload.unidade,
                textoComparativo: dados.payload.textoComparativo,
                cor: dados.payload.cor,
                icone: dados.payload.icone,
                motivoNovaVersao: "Correção solicitada"
            };
        }

        if (!payload.titulo) {
             showErrorToast("Erro", "O título é obrigatório.");
             return;
        }

        await criarVersao(contextoParaEditar.id, payload, file);

        showSuccessToast("Sucesso", "Nova versão enviada para análise.");
        setIsCorrecaoModalOpen(false);
        setContextoParaEditar(null);
        carregarContextos();
    } catch (error) {
        console.error(error);
        showErrorToast("Erro", "Falha ao enviar correção.");
    }
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
          render: (row: Contexto) => {
            const statusStr = String(row.status || "").toLowerCase().replace(/_/g, ' ');
            const precisaCorrecao = statusStr.includes('aguardando correcao') || statusStr.includes('correção');
            
            const podeApagar = perfil === 'membro' && 
                               (row.status === StatusContexto.AguardandoGerente);

            return (
              <div className="flex items-center gap-3 text-gray-500">
                <button 
                    onClick={() => handleViewClick(row)} 
                    className="hover:text-blue-600 transition-colors p-1" 
                    title="Visualizar Detalhes e Histórico"
                >
                  <Eye size={18} />
                </button>
                
                {perfil === 'membro' && precisaCorrecao && (
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleAbrirCorrecao(row); }} 
                      className="hover:text-amber-600 text-amber-500 transition-colors p-1" 
                      title="Enviar Correção / Nova Versão"
                   >
                      <FilePenLine size={18} />
                   </button>
                )}

                {podeApagar && (
                  <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAbrirExclusao(row); 
                    }} 
                    className="hover:text-red-600 transition-colors p-1" 
                    title="Cancelar e Excluir Solicitação"
                  >
                    <Trash size={18} />
                  </button>
                )}
              </div>
            );
          }
        };
      }
      return col;
    });
  };

  const pageTitle = perfil === "membro" ? "Requisição de Contextos" : "Validar Contextos";

  return (
    <div className="p-8 bg-white h-screen overflow-auto">
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

      {/* Modal de Detalhes */}
      <VisualizarContextoModal
        estaAberto={isDetalhesModalOpen}
        aoFechar={() => setIsDetalhesModalOpen(false)}
        dadosDoContexto={selectedContexto}
        perfil={perfil}
        isValidation={perfil === 'gerente' || perfil === 'diretor'}
        aoCriarNovaVersao={perfil === 'membro' ? handleAbrirCorrecao : undefined}
        onDeferir={(id) => handleDeferir(id)} 
        onIndeferir={(id, just) => handleIndeferir(id, just)}
        onCorrigir={(id, just) => handleSolicitarCorrecao(id, just)}
        isEditing={false} 
        isFromHistory={false} 
        usuarioGerenciaId={user?.gerenciaId}
      />

      {/* Modal de Edição / Correção */}
      <ModalAdicionarConteudo
        estaAberto={isCorrecaoModalOpen}
        aoFechar={() => { setIsCorrecaoModalOpen(false); setContextoParaEditar(null); }}
        aoSubmeter={handleSubmeterCorrecao}
        // [CORREÇÃO]: Mapeamento de props correto
        dadosIniciais={contextoParaEditar ? {
             ...contextoParaEditar,
             // Garante que se for dashboard, payload está disponível
             payload: contextoParaEditar.payload
        } : undefined}
        modoEdicao={true}
      />

      <ExcluirContextoModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmarExclusao}
        contextoNome={contextoParaExcluir?.title || "este item"}
        isMultiplaVersao={isRollback}
      />
    </div>
  );
}