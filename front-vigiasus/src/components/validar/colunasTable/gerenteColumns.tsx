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
    key: "nome", header: "Contexto",
    render: (row) => (
      <div className="flex items-center gap-3">
        <IconeDocumento type={row.docType} />
        <span className="font-medium">{row.nome}</span>
      </div>
    ),
  },
  {
    key: "situacao", header: "Situação",
    //  O status agora é lido de `row.situacao`
    // e usa a configuração central para exibir o texto e a cor corretos.
    render: (row) => {
      const config = statusConfig[row.situacao] || { text: row.situacao, className: "bg-gray-100 text-gray-800" };
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