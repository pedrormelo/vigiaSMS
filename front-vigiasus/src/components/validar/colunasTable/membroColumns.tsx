// src/components/validar/colunasTable/membroColumns.tsx

import React from 'react';
import { Column, Contexto, StatusContexto } from "@/components/validar/typesDados";
import IconeDocumento from '@/components/validar/iconeDocumento';
// 👇 1. Trocamos FaCopy por FaEye (ícone de olho)
import { FaEye, FaTrash } from 'react-icons/fa';

// Configuração de status detalhada
const statusConfig: { [key in StatusContexto]?: { text: string; className: string } } = {
    [StatusContexto.AguardandoGerente]: { text: "Aguardando análise do Gerente", className: "bg-yellow-100 text-yellow-800" },
    [StatusContexto.AguardandoDiretor]: { text: "Aguardando análise do Diretor", className: "bg-yellow-100 text-yellow-800" },
    [StatusContexto.Indeferido]: { text: "Indeferido", className: "bg-red-100 text-red-800" },
    [StatusContexto.Deferido]: { text: "Deferido", className: "bg-green-100 text-green-800" },
    [StatusContexto.AguardandoAnalise]: { text: "Aguardando análise", className: "bg-yellow-100 text-yellow-800" },
};

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
      const config = statusConfig[row.situacao] || { text: row.situacao, className: "bg-gray-100 text-gray-800" };
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>{config.text}</span>;
    }
  },
  {
    key: "acoes",
    header: "Ações",
    render: () => (
      <div className="flex items-center gap-4 text-gray-500">
        {/* 👇 2. O botão agora usa o ícone FaEye e tem o título "Visualizar Contexto" */}
        <button className="hover:text-blue-600" title="Visualizar Contexto">
          <FaEye size={16} />
        </button>
        <button className="hover:text-red-600" title="Apagar Contexto">
          <FaTrash size={16} />
        </button>
      </div>
    ),
  },
];