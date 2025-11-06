// src/components/validar/colunasTable/membroColumns.tsx

import React from 'react';
import { Column, Contexto, StatusContexto } from "@/components/validar/typesDados";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { FaEye, FaTrash } from 'react-icons/fa';
import { statusConfig } from './statusConfig'; 

const statusFinais: StatusContexto[] = [
  StatusContexto.Deferido,
  StatusContexto.Indeferido,
  StatusContexto.Publicado,
];

export const membroColumns: Column<Contexto>[] = [
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
    render: (row) => (
      <div className="flex items-center gap-4 text-gray-500">
        <button className="hover:text-blue-600" title="Visualizar Contexto">
          <FaEye size={16} />
        </button>

        {!statusFinais.includes(row.status) && (
          <button className="hover:text-red-600" title="Apagar Contexto">
            <FaTrash size={16} />
          </button>
        )}
      </div>
    ),
  },
];