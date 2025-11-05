// src/components/validar/colunasTable/membroColumns.tsx

import React from 'react';
// 1. IMPORTAR O NOVO TIPO 'Contexto'
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
    key: "title", // nome -> title
    header: "Contexto",
    render: (row) => (
      <div className="flex items-center gap-3">
        {/* 2. 'type' já está correto no 'Contexto' unificado */}
        <IconeDocumento type={row.type} /> 
        <span className="font-medium">{row.title}</span> {/* nome -> title */}
      </div>
    ),
  },
  {
    key: "status", // situacao -> status
    header: "Situação",
    render: (row) => {
      // 3. situacao -> status
      const config = statusConfig[row.status] || { text: row.status, className: "bg-gray-100 text-gray-800" };
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>{config.text}</span>;
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

        {/* 4. situacao -> status */}
        {!statusFinais.includes(row.status) && (
          <button className="hover:text-red-600" title="Apagar Contexto">
            <FaTrash size={16} />
          </button>
        )}
      </div>
    ),
  },
];