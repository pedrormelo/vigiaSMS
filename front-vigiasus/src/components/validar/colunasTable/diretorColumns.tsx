// src/components/validar/colunasTable/diretorColumns.tsx

import React from 'react';
import { Column, Contexto } from "@/components/validar/typesDados";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { Eye } from 'lucide-react';
import { getGerenciaColor } from "@/constants/gerenciaColor";
import { statusConfig } from './statusConfig';

export const diretorColumns: Column<Contexto>[] = [
  {
    key: "solicitante",
    header: "Nome do Solicitante",
    render: (row) => (
      <div>
        <div className="font-medium text-gray-900">{row.solicitante}</div>
        <div className="text-sm text-gray-500">{row.email}</div>
      </div>
    ),
  },
  {
    key: "gerencia",
    header: "Gerência",
    render: (row) => {
      const backgroundColor = getGerenciaColor(row.gerencia || 'N/A'); 
      const style = {
        backgroundColor: backgroundColor,
        color: "#fff", 
      };
      
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full`} style={style}>{row.gerencia}</span>;
    },
  },
  {
    key: "title", 
    header: "Contexto",
    render: (row) => (
      <div className="flex items-center gap-3">
        <IconeDocumento type={row.type} /> 
        <span className="font-medium">{row.title}</span> 
      </div>
    ),
  },
  {
    key: "status",
    header: "Status", // Renomeado de "Situação"
    render: (row) => {
      // --- LÓGICA ATUALIZADA ---
      const config = statusConfig[row.status] || { text: row.status, className: "bg-gray-100 text-gray-800" };
      const versaoNum = row.versoes ? row.versoes.length : 1;
      const isNovaVersao = versaoNum > 1;

      return (
        <div className="flex flex-col gap-1.5 items-start">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>
            {config.text}
          </span>
          
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
      // --- FIM DA ATUALIZAÇÃO ---
    }
  },
  {
    key: "acoes",
    header: "Ações",
    render: () => (
      <div className="flex items-center gap-4 text-gray-500">
        <button className="hover:text-blue-600" title="Visualizar Contexto">
          <Eye size={16} />
        </button>
      </div>
    ),
  },
];