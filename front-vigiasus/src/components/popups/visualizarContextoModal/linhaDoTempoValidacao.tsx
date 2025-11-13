// src/components/popups/visualizarContextoModal/LinhaDoTempoValidacao.tsx
"use client";

import React, { useMemo } from 'react';
import { CheckCircle, Clock, FileWarning, Send, UserCheck, UserCog, CircleCheckBig, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HistoricoEvento } from '@/components/validar/typesDados';
import { StatusContexto } from '@/components/validar/typesDados';
import type { Comment } from "@/constants/types";
import CommentItem from '@/components/notifications/commentItem';

interface LinhaDoTempoValidacaoProps {
    historico: HistoricoEvento[];
    status: StatusContexto;
}

const LinhaDoTempoValidacao = ({ historico, status }: LinhaDoTempoValidacaoProps) => {
    // A definição das etapas permanece a mesma
    const etapasWorkflow = [
        { nome: "Submetido", status: [], icon: Send }, // Os status aqui não são mais usados para lógica de índice
        { nome: "Análise Gerente", status: [], icon: UserCog },
        { nome: "Análise Diretor", status: [], icon: UserCheck },
        { nome: "Finalizado", status: [], icon: CircleCheckBig}
    ];

    const statusAtual = status; 

    // --- INÍCIO DA CORREÇÃO ---
    // Substituímos o .findIndex() por um mapeamento direto (switch).
    // Isso garante que o status correto seja mapeado para a etapa correta da timeline.
    
    let indiceEtapaAtual: number;
    
    switch (statusAtual) {
        case StatusContexto.AguardandoCorrecao:
            indiceEtapaAtual = 0; // Se aguarda correção, a etapa "Submetido" fica ativa (piscando)
            break;
        case StatusContexto.AguardandoGerente:
            indiceEtapaAtual = 1; // Se aguarda gerente, a etapa "Análise Gerente" fica ativa
            break;
        case StatusContexto.AguardandoDiretor:
            indiceEtapaAtual = 2; // Se aguarda diretor, a etapa "Análise Diretor" fica ativa
            break;
        case StatusContexto.Publicado:
        case StatusContexto.Deferido:
        case StatusContexto.Indeferido:
            indiceEtapaAtual = 3; // Se finalizado, a etapa "Finalizado" fica ativa
            break;
        default:
            indiceEtapaAtual = 0; // Fallback
    }
    // --- FIM DA CORREÇÃO ---


    let indiceEtapaDevolvida = -1;
    // Esta lógica está correta, mas ajustamos o índice
    if (statusAtual === StatusContexto.AguardandoCorrecao) {
        const ultimoEventoAnalise = [...(historico || [])].reverse().find(h =>
            h.acao.toLowerCase().includes("análise gerente") || h.acao.toLowerCase().includes("análise diretor")
        );
         if (ultimoEventoAnalise?.acao.toLowerCase().includes("análise diretor")) {
             indiceEtapaDevolvida = 2; // Devolvido pelo Diretor
         } else if (ultimoEventoAnalise?.acao.toLowerCase().includes("análise gerente")) {
             indiceEtapaDevolvida = 1; // Devolvido pelo Gerente
         } else {
             indiceEtapaDevolvida = 1; // Fallback
         }
        // A etapa atual (piscando) é a 0 (Submetido), pois aguarda nova submissão
        indiceEtapaAtual = 0;
    }

    // A função getUltimoEventoParaEtapa permanece a mesma
    const getUltimoEventoParaEtapa = (etapaIndex: number): HistoricoEvento | undefined => {
        const etapa = etapasWorkflow[etapaIndex];
         const eventosRelevantes = (historico || []).filter(e => {
            const acaoLower = e.acao.toLowerCase();
            if (etapa.nome === "Submetido" && acaoLower.includes("submetido")) return true;
            if (etapa.nome === "Análise Gerente" && acaoLower.includes("análise gerente")) return true;
            if (etapa.nome === "Análise Diretor" && acaoLower.includes("análise diretor")) return true;
            if (etapa.nome === "Finalizado" && (acaoLower.includes("finalizado como publicado") || acaoLower.includes("finalizado como indeferido") || acaoLower.includes("indeferido"))) return true;
            return false;
        });
        return eventosRelevantes.length > 0 ? eventosRelevantes[eventosRelevantes.length - 1] : undefined;
    };
    
    // A lógica de comentários permanece a mesma
    const comentariosParaExibir: Comment[] = useMemo(() => {
        const eventos = historico || []; 
        return eventos
            .filter(h => h.acao.toLowerCase().includes("justificativa:") || h.acao.toLowerCase().includes("comentário:"))
            .map((h, index): Comment => {
                const textMatch = h.acao.match(/(?:justificativa|comentário):\s*(.*)/i);
                const eventDate = new Date(h.data);
                return {
                    id: index,
                    author: h.autor,
                    text: textMatch ? textMatch[1].trim() : h.acao,
                    time: eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    date: eventDate.toLocaleDateString('pt-BR'),
                    isMyComment: false, 
                    role: h.autor.toLowerCase().includes("gerente") ? "gerencia" :
                          h.autor.toLowerCase().includes("diretor") ? "diretoria" : "info",
                };
            });
    }, [historico]); 

    return (
        <div className="space-y-6 pt-4">
            {/* Timeline Visual */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 px-3">Linha do Tempo da Versão</h4>
                <div className="flex items-start justify-between px-4">
                    {etapasWorkflow.map((etapa, index) => {
                        const evento = getUltimoEventoParaEtapa(index);
                        
                        // Lógica de renderização (agora funciona com o indiceEtapaAtual correto)
                        const isFinalizada = (statusAtual === StatusContexto.Publicado || statusAtual === StatusContexto.Indeferido) && index <= indiceEtapaAtual;
                        const isConcluida = !isFinalizada && index < indiceEtapaAtual && index !== indiceEtapaDevolvida;
                        const isAtual = !isFinalizada && index === indiceEtapaAtual && index !== indiceEtapaDevolvida;
                        const isDevolvida = index === indiceEtapaDevolvida;
                        const isPendente = index > indiceEtapaAtual && !isDevolvida && !isFinalizada;

                        let corIcone = "text-gray-400"; let corTexto = "text-gray-500"; let corFundoIcone = "bg-gray-100";
                        let IconeStatus = etapa.icon;

                        if (isConcluida || isFinalizada) {
                            corIcone = "text-green-600"; corTexto = "text-green-700"; corFundoIcone = "bg-green-100"; IconeStatus = CheckCircle;
                        } else if (isAtual) {
                            corIcone = "text-blue-600"; corTexto = "text-blue-700"; corFundoIcone = "bg-blue-100 animate-pulse"; IconeStatus = Clock;
                        } else if (isDevolvida) {
                            corIcone = "text-orange-600"; corTexto = "text-orange-700"; corFundoIcone = "bg-orange-100"; IconeStatus = FileWarning;
                        }

                        return (
                            <React.Fragment key={etapa.nome}>
                                <div className="flex flex-col items-center text-center w-32 flex-shrink-0">
                                    <div className={cn("h-10 w-10 rounded-xl border flex items-center justify-center mb-2 transition-colors", corFundoIcone, isConcluida || isFinalizada ? "border-green-200" : isAtual ? "border-blue-200" : isDevolvida ? "border-orange-200" : "border-gray-200")}>
                                        <IconeStatus size={20} className={cn("transition-colors", corIcone)} />
                                    </div>
                                    <p className={cn("text-xs font-semibold transition-colors", corTexto)}>{etapa.nome}</p>
                                    {evento && !isPendente && (
                                        <>
                                            <p className="mt-1 text-xs text-gray-500">{new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {' às '} {new Date(evento.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-xs text-gray-500 truncate w-full" title={evento.autor}>por {evento.autor}</p>
                                        </>
                                    )}
                                    {isDevolvida && (<p className="text-xs font-medium text-orange-600 mt-1">Devolvido</p>)}
                                </div>
                                {index < etapasWorkflow.length - 1 && (
                                    <div className={`flex-1 mt-[19px] h-0.5 transition-colors ${
                                        (isConcluida || isFinalizada || (isAtual && index < indiceEtapaAtual) || (isDevolvida && index < indiceEtapaDevolvida)) ? 'bg-green-300' : 'bg-gray-200'
                                    } min-w-[10px]`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {/* Seção de Comentários/Justificativas (Sem alterações) */}
            {comentariosParaExibir.length > 0 && (
                <div className="px-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <MessageSquare size={16} /> Justificativas da Versão
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-custom border shadow-inner border-gray-200 rounded-xl p-3 bg-gray-50/25">
                        {comentariosParaExibir.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinhaDoTempoValidacao;