// src/components/popups/visualizarContextoModal/linhaDoTempoValidacao.tsx
"use client";

import React, { useMemo } from 'react';
import { 
    CheckCircle, Clock, Send, UserCog, UserCheck, 
    CircleCheckBig, CornerUpLeft, XCircle, FileWarning, Calendar, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- TYPES ---
export interface ItemHistorico {
    id: string;
    timestamp: string | Date;
    statusNovo: string;
    statusNovoLabel: string;
    autorNome?: string;
    justificativa?: string;
}

interface LinhaDoTempoValidacaoProps {
    historico: ItemHistorico[];
    status: string;
    canViewFullHistory: boolean;
    versionLabel?: string;
}

// --- HELPER: Avatar com Iniciais ---
const AvatarInicial = ({ nome, corBg, corTexto }: { nome: string, corBg: string, corTexto: string }) => {
    const iniciais = nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white", corBg, corTexto)}>
            {iniciais || <User size={14} />}
        </div>
    );
};

// --- COMPONENTS: Cards de Eventos ---
const CardEvento = ({ 
    tipo, 
    autor, 
    data, 
    texto 
}: { 
    tipo: 'correcao' | 'indeferido'; 
    autor: string; 
    data: string; 
    texto: string; 
}) => {
    const isCorrecao = tipo === 'correcao';
    const styles = isCorrecao ? {
        bg: "bg-amber-50/50 hover:bg-amber-50 transition-colors",
        border: "border-amber-200",
        iconBg: "bg-amber-100 text-amber-600",
        titleColor: "text-amber-900",
        textColor: "text-gray-700",
        quoteBorder: "border-amber-300",
        Icon: CornerUpLeft,
        label: "Correção Solicitada"
    } : {
        bg: "bg-red-50/50 hover:bg-red-50 transition-colors",
        border: "border-red-200",
        iconBg: "bg-red-100 text-red-600",
        titleColor: "text-red-900",
        textColor: "text-gray-700",
        quoteBorder: "border-red-300",
        Icon: XCircle,
        label: "Indeferido"
    };

    return (
        <div className={cn("group flex gap-4 items-start w-full animate-in slide-in-from-bottom-2 duration-500")}>
            <div className="flex flex-col items-center gap-2 pt-1">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border border-white/50", styles.iconBg)}>
                    <styles.Icon size={16} strokeWidth={2.5} />
                </div>
            </div>
            <div className={cn("flex-1 rounded-2xl border p-4 shadow-sm relative", styles.bg, styles.border)}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <AvatarInicial 
                            nome={autor} 
                            corBg={isCorrecao ? "bg-amber-200" : "bg-red-200"} 
                            corTexto={isCorrecao ? "text-amber-800" : "text-red-800"} 
                        />
                        <div>
                            <h4 className={cn("text-sm font-bold leading-tight", styles.titleColor)}>
                                {styles.label}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium">por {autor}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-white/60 px-2 py-1 rounded-full border border-gray-100">
                        <Calendar size={10} />
                        {data}
                    </div>
                </div>
                <div className="relative">
                    <div className={cn("absolute top-0 bottom-0 left-0 w-1 rounded-full", styles.quoteBorder)}></div>
                    <p className={cn("pl-3 text-sm leading-relaxed font-medium italic", styles.textColor)}>
                        "{texto}"
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

// Remove prefixos de cargo (Membro, Gerente, Diretor, etc.) e deixa só o nome
const limparCargoDoNome = (nome: string) => {
    if (!nome) return "";
    const regexCargo = /^(membro|gerente|diretor|admin|coordenador|coord\.?|tecnico|técnico)\s+/i;
    const semCargo = nome.trim().replace(regexCargo, "").trim();
    return semCargo || nome.trim();
};

const LinhaDoTempoValidacao = ({ historico, status, canViewFullHistory, versionLabel }: LinhaDoTempoValidacaoProps) => {
    const statusAtual = String(status || "").trim();

    const etapasWorkflow = [
        { nome: "Submetido", icon: Send },
        { nome: "Análise Gerente", icon: UserCog },
        { nome: "Análise Diretor", icon: UserCheck },
        { nome: "Finalizado", icon: CircleCheckBig}
    ];

    // 1. Determinar o Índice Atual
    let indiceEtapaAtual: number;
    // ✅ IMPORTANTE: O status pode ser tanto enum quanto string, então normalizar apropriadamente
    const statusUpper = statusAtual.toUpperCase().replace(/\s+/g, '_');
    
    console.log(`🔧 [Status] Status recebido: "${statusAtual}" -> Normalizado: "${statusUpper}"`);
    
    // Detectar se foi indeferido (tratamento especial)
    const isIndeferido = statusUpper.includes('INDEFERIDO');

    // ✅ CORREÇÃO: Verificar se contém a palavra-chave, não o padrão exato
    if (statusUpper.includes('CORRECA') || statusUpper.includes('CORREÇÃO')) {
        indiceEtapaAtual = 0; 
    } else if (statusUpper.includes('GERENTE')) {
        // "AGUARDANDO_ANÁLISE_DO_GERENTE" contém "GERENTE"
        indiceEtapaAtual = 1;
    } else if (statusUpper.includes('DIRETOR')) {
        // "AGUARDANDO_ANÁLISE_DO_DIRETOR" contém "DIRETOR"
        indiceEtapaAtual = 2;
    } else if (statusUpper.includes('PUBLICADO') || statusUpper.includes('DEFERIDO')) {
        indiceEtapaAtual = 3;
    } else if (isIndeferido) {
        // Indeferido: a etapa "Finalizado" mostra o resultado (indeferido)
        // Mas precisamos saber se passou pelo diretor ou apenas pelo gerente
        const eventoIndeferido = (historico || []).find(h => String(h.statusNovo).toUpperCase().includes('INDEFERIDO'));
        if (eventoIndeferido) {
            // Verifica se passou pela análise do diretor antes de ser indeferido
            const passouPeloDiretor = (historico || []).some(h => {
                const antes = new Date(h.timestamp).getTime() < new Date(eventoIndeferido.timestamp).getTime();
                const temDiretor = String(h.statusNovo).toUpperCase().includes('DIRETOR');
                return antes && temDiretor;
            });
            // Etapa 3 (Finalizado) sempre, mas guardamos info se passou pelo diretor
            indiceEtapaAtual = 3;
        } else {
            indiceEtapaAtual = 3; // fallback: vai para finalizado como indeferido
        }
    } else {
        indiceEtapaAtual = 0; 
    }

    // Contexto finalizado com sucesso (apenas PUBLICADO/DEFERIDO, não INDEFERIDO)
    const isContextoFinalizado = indiceEtapaAtual === 3;

    // 2. Lógica de Devolução
    let indiceEtapaDevolvida = -1;
    if (indiceEtapaAtual === 0 && (historico || []).length > 0) {
        const eventosOrdenados = [...historico].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const ultimoEventoCorrecao = eventosOrdenados.find(h => String(h.statusNovo).toUpperCase().includes('CORRE'));
        
        if (ultimoEventoCorrecao) {
            const jaEsteveNoDiretor = historico.some(h => String(h.statusNovo).toUpperCase().includes('DIRETOR'));
            if (jaEsteveNoDiretor) indiceEtapaDevolvida = 2; 
            else indiceEtapaDevolvida = 1; 
        }
    }

    // 3. Buscar Eventos
    const getUltimoEventoParaEtapa = (etapaIndex: number): ItemHistorico | undefined => {
        const eventos = historico || [];
        const sorted = [...eventos].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const eventosDaEtapa = sorted.filter(h => {
            const s = String(h.statusNovo).toUpperCase();
            // Submissão: criação ou envio para gerente (não mistura com aprovações do gerente)
            if (etapaIndex === 0) return s.includes('CRIADO') || s.includes('SUBMET') || s.includes('AGUARDANDO_GERENTE');
            // Análise Gerente: momento em que o gerente encaminha ao diretor
            if (etapaIndex === 1) return s.includes('AGUARDANDO_DIRETOR');
            // Análise Diretor: preferir decisão final (publicado/deferido/indeferido); se ainda pendente no diretor, usa o envio; devolução do diretor mantém linha
            if (etapaIndex === 2) return s.includes('PUBLICADO') || s.includes('DEFERIDO') || s.includes('INDEFERIDO') || s.includes('AGUARDANDO_DIRETOR') || (s.includes('CORRE') && indiceEtapaDevolvida === 2);
            // Finalizado: publicado ou deferido (sucesso); indeferido é tratado visualmente antes
            if (etapaIndex === 3) return s.includes('PUBLICADO') || s.includes('DEFERIDO');
            return false;
        });

        return eventosDaEtapa.length > 0 ? eventosDaEtapa[eventosDaEtapa.length - 1] : undefined;
    };
    
    // 4. Filtragem de Cards
    const eventosParaExibir = useMemo(() => {
        return (historico || [])
            .filter(h => {
                const s = String(h.statusNovo).toUpperCase();
                const ehCorrecao = s.includes('CORRE');
                const ehIndeferido = s.includes('INDEFERIDO');
                return (ehCorrecao || ehIndeferido) && h.justificativa && h.justificativa.trim().length > 0;
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((h) => {
                const eventDate = new Date(h.timestamp);
                const s = String(h.statusNovo).toUpperCase();
                let type: 'correcao' | 'indeferido' = 'correcao';
                if (s.includes('INDEFERIDO')) type = 'indeferido';
                
                return {
                    id: h.id,
                    author: limparCargoDoNome(h.autorNome || "Gestor"),
                    text: h.justificativa || "",
                    dateFormatted: `${eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • ${eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                    type: type
                };
            });
    }, [historico]); 

    return (
        <div className="space-y-8 pt-4">
            {/* A. Timeline Visual */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 px-3">
                    Linha do Tempo da Versão {versionLabel || ''}
                </h4>
                <div className="flex items-start justify-between px-4">
                    {etapasWorkflow.map((etapa, index) => {
                        const evento = getUltimoEventoParaEtapa(index);
                        
                        // Se foi indeferido, a etapa "Finalizado" (3) fica vermelha
                        const isIndeferida = isIndeferido && index === 3;
                        
                        // Etapa finalizada com sucesso (publicado)
                        const isFinalizada = !isIndeferido && (indiceEtapaAtual === 3) && index <= indiceEtapaAtual;
                        
                        // Etapas concluídas/aprovadas: apenas as anteriores à Finalizado
                        const isConcluida = index < 3 && index < indiceEtapaAtual && index !== indiceEtapaDevolvida;
                        
                        const isAtual = !isFinalizada && !isIndeferido && index === indiceEtapaAtual && index !== indiceEtapaDevolvida;
                        const isDevolvida = index === indiceEtapaDevolvida;
                        const isPendente = index > indiceEtapaAtual && !isDevolvida && !isFinalizada && !isIndeferida;

                        let corIcone = "text-gray-400"; 
                        let corTexto = "text-gray-500"; 
                        let corFundoIcone = "bg-gray-100";
                        let IconeStatus = etapa.icon;

                        if (isIndeferida) {
                            // Etapa "Finalizado" quando indeferido: vermelho
                            corIcone = "text-red-600"; 
                            corTexto = "text-red-700"; 
                            corFundoIcone = "bg-red-100"; 
                            IconeStatus = XCircle;
                        } else if (isConcluida || isFinalizada) {
                            // Etapas aprovadas (verde)
                            corIcone = "text-green-600"; 
                            corTexto = "text-green-700"; 
                            corFundoIcone = "bg-green-100"; 
                            IconeStatus = CheckCircle;
                        } else if (isAtual) {
                            corIcone = "text-blue-600"; 
                            corTexto = "text-blue-700"; 
                            corFundoIcone = "bg-blue-100 animate-pulse"; 
                            IconeStatus = Clock;
                        } else if (isDevolvida) {
                            corIcone = "text-orange-600"; 
                            corTexto = "text-orange-700"; 
                            corFundoIcone = "bg-orange-100"; 
                            IconeStatus = FileWarning;
                        }

                        const formatarNome = (n: string) => {
                            if (!n) return "";
                            const limpo = limparCargoDoNome(n);
                            const p = limpo.split(' ').filter(Boolean);
                            return p.length > 1 ? `${p[0]} ${p[p.length - 1]}` : p[0];
                        };

                        return (
                            <React.Fragment key={etapa.nome}>
                                <div className="flex flex-col items-center text-center w-32 flex-shrink-0">
                                    <div className={cn("h-10 w-10 rounded-xl border flex items-center justify-center mb-2 transition-colors", corFundoIcone, 
                                        isIndeferida ? "border-red-200" : 
                                        (isConcluida || isFinalizada) ? "border-green-200" : 
                                        isAtual ? "border-blue-200" : 
                                        isDevolvida ? "border-orange-200" : "border-gray-200")}>
                                        <IconeStatus size={20} className={cn("transition-colors", corIcone)} />
                                    </div>
                                    
                                    <p className={cn("text-xs font-semibold transition-colors", corTexto)}>{etapa.nome}</p>
                                    
                                    {/* Dados Abaixo do Ícone */}
                                    {evento && !isPendente && (
                                        <div className="animate-in fade-in slide-in-from-top-1">
                                            <p className="mt-1 text-[10px] text-gray-500 leading-tight">
                                                {new Date(evento.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                <span className="mx-1">·</span>
                                                {new Date(evento.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-[10px] text-gray-500 truncate w-full font-medium mt-0.5" title={evento.autorNome}>
                                                por {index === 3 ? "Sistema" : formatarNome(evento.autorNome || "")}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {isIndeferida && (<p className="text-[10px] font-bold text-red-600 mt-1">INDEFERIDO</p>)}
                                    {isDevolvida && (<p className="text-[10px] font-bold text-orange-600 mt-1">DEVOLVIDO</p>)}
                                </div>
                                
                                {index < etapasWorkflow.length - 1 && (
                                    <div className={cn("flex-1 mt-[19px] h-0.5 transition-colors min-w-[10px]",
                                        // Verde: linha entre etapas aprovadas
                                        (isConcluida || isFinalizada) && index < 3 ? 'bg-green-300' :
                                        // Laranja: devolvida
                                        (isDevolvida && index < indiceEtapaDevolvida) ? 'bg-orange-300' : 
                                        // Cinza: resto (pendente ou após falha)
                                        'bg-gray-200'
                                    )}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            
            {/* B. Lista de Solicitações (Cards Bonitos) */}
            {eventosParaExibir.length > 0 ? (
                <div className="mt-4 px-3">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wide">
                             Pendências
                        </h4>
                    </div>
                    
                    <div className="space-y-4">
                        {eventosParaExibir.map((evento) => (
                            <CardEvento
                                key={evento.id}
                                tipo={evento.type}
                                autor={evento.author}
                                data={evento.dateFormatted}
                                texto={evento.text}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                /* [CORREÇÃO DEFINITIVA]: 
                   Só mostra o estado vazio se:
                   1. O usuário tiver permissão de ver histórico (canViewFullHistory)
                   2. E o contexto NÃO estiver finalizado/publicado (porque se está publicado, é óbvio que não há pendências)
                */
                (canViewFullHistory && !isContextoFinalizado) && (
                    <div className="mt-4 px-4 py-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center mx-3">
                        <p className="text-xs text-gray-400">Nenhuma pendência registrada.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default LinhaDoTempoValidacao;