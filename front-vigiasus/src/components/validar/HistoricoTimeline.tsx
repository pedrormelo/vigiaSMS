// src/components/validar/HistoricoTimeline.tsx
"use client";

import { useState } from "react";
import { HistoricoEvento, StatusContexto } from "@/components/validar/typesDados";
import { History, ChevronDown, ChevronUp } from "lucide-react";

interface HistoricoTimelineProps {
  eventos?: HistoricoEvento[];
  statusAtual: StatusContexto;
}

export default function HistoricoTimeline({ eventos, statusAtual }: HistoricoTimelineProps) {
  const [isVisible, setIsVisible] = useState(false);

  // ✨ 1. Nomes das etapas melhorados ✨
  const etapas = [
    { nome: "Submetido", statusAssociados: [StatusContexto.AguardandoAnalise] },
    { nome: "Em análise pelo Gerente", statusAssociados: [StatusContexto.AguardandoGerente] },
    { nome: "Em análise pelo Diretor", statusAssociados: [StatusContexto.AguardandoDiretor] },
    { nome: "Finalizado", statusAssociados: [StatusContexto.Deferido, StatusContexto.Publicado, StatusContexto.Indeferido] },
  ];

  const indiceEtapaAtual = etapas.findIndex(etapa => etapa.statusAssociados.includes(statusAtual));

  if (!eventos || eventos.length === 0) {
    return null;
  }

  const getEventoParaEtapa = (etapaNome: string): HistoricoEvento | undefined => {
    const lowerCaseNome = etapaNome.toLowerCase();
    
    // As palavras-chave de busca foram ajustadas para corresponderem aos novos nomes
    if (lowerCaseNome.includes("submetido")) {
      return eventos.find(e => e.acao.toLowerCase().includes("submetido"));
    }
    if (lowerCaseNome.includes("gerente")) {
      return eventos.find(e => e.acao.toLowerCase().includes("gerente"));
    }
    if (lowerCaseNome.includes("diretor")) {
      return eventos.find(e => e.acao.toLowerCase().includes("diretor"));
    }
    if (lowerCaseNome.includes("finalizado")) {
      return eventos.find(e => e.acao.toLowerCase().includes("finalizado"));
    }
    return undefined;
  };

  return (
    <div>
      <button 
        className="w-full font-semibold text-gray-700 mb-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsVisible(!isVisible)}
      >
        <div className="flex items-center gap-2">
          <History size={18} />
          <span>Histórico de Alterações</span>
        </div>
        {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isVisible && (
        <div className="flex items-start justify-center pt-2">
          {etapas.map((etapa, index) => {
            const isConcluida = index < indiceEtapaAtual;
            const isAtual = index === indiceEtapaAtual;
            const eventoCorrespondente = getEventoParaEtapa(etapa.nome);

            return (
              <div key={index} className="flex items-start">
                <div className="flex flex-col items-center text-center w-40">
                  <div className={`h-4 w-4 rounded-full border-2 ${isAtual ? 'bg-blue-500 border-blue-600 animate-pulse' : isConcluida ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'}`}></div>
                  <p className={`mt-2 text-sm font-semibold ${isAtual ? 'text-blue-600' : isConcluida ? 'text-green-600' : 'text-gray-800'}`}>{etapa.nome}</p>
                  
                  {(isConcluida || isAtual) && eventoCorrespondente && (
                     <>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(eventoCorrespondente.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        {' às '}
                        {new Date(eventoCorrespondente.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500 truncate">por {eventoCorrespondente.autor}</p>
                    </>
                  )}
                </div>

                {index < etapas.length - 1 && (
                  <div className={`flex-1 mt-[7px] h-0.5 ${isConcluida ? 'bg-green-500' : 'bg-gray-300'} min-w-[20px]`}></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}