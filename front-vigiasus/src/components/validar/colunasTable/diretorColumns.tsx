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
      const backgroundColor = getGerenciaColor(row.gerencia || 'N/A'); // Adiciona fallback
      const style = {
        backgroundColor: backgroundColor,
        color: "#fff", 
      };
      
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full`} style={style}>{row.gerencia}</span>;
    },
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