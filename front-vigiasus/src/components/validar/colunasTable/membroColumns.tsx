// src/components/validar/colunasTable/membroColumns.tsx

import React from 'react';
import { Column, Contexto, StatusContexto } from "@/components/validar/typesDados";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { FaEye, FaTrash } from 'react-icons/fa';
import { statusConfig } from './statusConfig'; 

// Lista de status que são considerados "finais".
// Quando um contexto está num destes estados, não pode ser apagado.
const statusFinais: StatusContexto[] = [
  StatusContexto.Deferido,
  StatusContexto.Indeferido,
  StatusContexto.Publicado,
];

export const membroColumns: Column<Contexto>[] = [
  {
    key: "nome",
    header: "Contexto",
    render: (row) => (
      <div className="flex items-center gap-3">
        <IconeDocumento type={row.docType} />
        <span className="font-medium">{row.nome}</span>
      </div>
    ),
  },
  {
    key: "situacao",
    header: "Situação",
    render: (row) => {
      // Usa a configuração de status centralizada
      const config = statusConfig[row.situacao] || { text: row.situacao, className: "bg-gray-100 text-gray-800" };
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>{config.text}</span>;
    }
  },
  {
    key: "acoes",
    header: "Ações",
    // A renderização das ações agora recebe a `row`
    // para verificar o status do contexto.
    render: (row) => (
      <div className="flex items-center gap-4 text-gray-500">
        <button className="hover:text-blue-600" title="Visualizar Contexto">
          <FaEye size={16} />
        </button>

        {/* O botão de apagar só é renderizado
            se o status do contexto NÃO estiver na lista de status finais. */}
        {!statusFinais.includes(row.situacao) && (
          <button className="hover:text-red-600" title="Apagar Contexto">
            <FaTrash size={16} />
          </button>
        )}
      </div>
    ),
  },
];