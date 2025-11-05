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
    key: "status", // situacao -> status
    header: "Situação",
    render: (row) => {
      // situacao -> status
      const config = statusConfig[row.status] || { text: row.status, className: "bg-gray-100 text-gray-800" };
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>{config.text}</span>;
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