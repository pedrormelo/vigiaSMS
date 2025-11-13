// src/components/validar/colunasTable/gerenteColumns.tsx

import React from 'react';
import { Column, Contexto } from "@/components/validar/typesDados";
import { FaEye } from 'react-icons/fa';
import IconeDocumento from '@/components/validar/iconeDocumento';
import { statusConfig } from './statusConfig'; 

export const gerenteColumns: Column<Contexto>[] = [
  {
    key: "solicitante", header: "Nome do Solicitante",
    render: (row) => (
      <div>
        <div className="font-medium text-gray-900">{row.solicitante}</div>
        <div className="text-sm text-gray-500">{row.email}</div>
      </div>
    ),
  },
  {
    key: "title", // nome -> title
    header: "Contexto",
    render: (row) => (
      <div className="flex items-center gap-3">
        <IconeDocumento type={row.type} /> {/* docType -> type */}
        <span className="font-medium">{row.title}</span> {/* nome -> title */}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status", // Renomeado de "Situação" para "Status"
    render: (row) => {
      // 1. Pega a configuração de cor/texto do status
      const config = statusConfig[row.status] || { text: row.status, className: "bg-gray-100 text-gray-800" };
      
      // 2. Calcula a versão atual
      const versaoNum = row.versoes ? row.versoes.length : 1;
      const isNovaVersao = versaoNum > 1;

      return (
        // 3. Renderiza os dois badges empilhados
        <div className="flex flex-col gap-1.5 items-start">
          {/* O status (Ex: "Aguardando Gerente") */}
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>
            {config.text}
          </span>
          
          {/* A versão (Ex: "v1 - Nova Submissão") */}
          {isNovaVersao ? (
            <span className="px-2 py-0.5 text-[10px] font-bold text-blue-800 bg-blue-100 rounded-full border border-blue-200">
              v{versaoNum} - Nova Versão
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded-full border border-gray-200">
              v1 - Nova Submissão
            </span>
          )}
        </div>
      );
    }
  },
  {
    key: "acoes", header: "Ações",
    render: () => (
      <div className="flex items-center gap-4 text-gray-500">
        <button className="hover:text-blue-600" title="Visualizar Contexto">
          <FaEye size={16} />
        </button>
      </div>
    ),
  },
];