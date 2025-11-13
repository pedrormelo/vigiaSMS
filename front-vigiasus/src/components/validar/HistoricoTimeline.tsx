// src/components/validar/HistoricoTimeline.tsx
"use client";

import { useState } from "react";
import { HistoricoEvento, StatusContexto } from "@/components/validar/typesDados";
import { History, ChevronDown, ChevronUp, FileWarning  } from "lucide-react";

interface HistoricoTimelineProps {
  eventos?: HistoricoEvento[];
  statusAtual: StatusContexto;
}

export default function HistoricoTimeline({ eventos, statusAtual }: HistoricoTimelineProps) {
  const [isVisible, setIsVisible] = useState(false);

  const etapas = [
    { nome: "Submetido", keyword: "submetido" },
    { nome: "Em análise pelo Gerente", keyword: "gerente" },
    { nome: "Em análise pelo Diretor", keyword: "diretor" },
    { nome: "Finalizado", keyword: "finalizado" },
  ];

  if (!eventos || eventos.length === 0) {
    return null;
  }

  const ultimoEvento = eventos[eventos.length - 1];
  let indiceUltimaEtapa = -1;
  if (ultimoEvento) {
    indiceUltimaEtapa = etapas.findIndex(etapa => ultimoEvento.acao.toLowerCase().includes(etapa.keyword));
  }
  const isAguardandoCorrecao = statusAtual === StatusContexto.AguardandoCorrecao;

  const getEventoParaEtapa = (etapaNome: string): HistoricoEvento | undefined => {
      const keyword = etapas.find(e => e.nome === etapaNome)?.keyword;
      if (!keyword) return undefined;
      return [...eventos].reverse().find(e => e.acao.toLowerCase().includes(keyword));
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
            const eventoCorrespondente = getEventoParaEtapa(etapa.nome);

            const isConcluida = index < indiceUltimaEtapa;
            const isAtual = index === indiceUltimaEtapa && !isAguardandoCorrecao;
            const isDevolvida = index === indiceUltimaEtapa && isAguardandoCorrecao;

            return (
              <div key={index} className="flex items-start">
                <div className="flex flex-col items-center text-center w-40">
                  <div className={`h-4 w-4 rounded-full border-2 
                    ${isAtual ? 'bg-blue-500 border-blue-600 animate-pulse' : ''}
                    ${isConcluida ? 'bg-green-500 border-green-600' : ''}
                    ${isDevolvida ? 'bg-orange-500 border-orange-600' : ''}
                    ${!isAtual && !isConcluida && !isDevolvida ? 'bg-gray-300 border-gray-400' : ''}
                  `}></div>
                  <p className={`mt-2 text-sm font-semibold 
                    ${isAtual ? 'text-blue-600' : ''}
                    ${isConcluida ? 'text-green-600' : ''}
                    ${isDevolvida ? 'text-orange-600' : ''}
                    ${!isAtual && !isConcluida && !isDevolvida ? 'text-gray-800' : ''}
                  `}>{etapa.nome}</p>
                  
                  {eventoCorrespondente && (isConcluida || isAtual || isDevolvida) && (
                     <>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(eventoCorrespondente.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        {' às '}
                        {new Date(eventoCorrespondente.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500 truncate">por {eventoCorrespondente.autor}</p>
                    </>
                  )}

                  {isDevolvida && (
                    <div className="flex justify-between mx-3 text-center">
                      <div className="mt-1 ml-2 text-orange-500">
                        <FileWarning />
                      </div>

                      <p className="text-xs font-medium text-orange-600">
                        Devolvido para correção
                      </p>
                    </div>
                   
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