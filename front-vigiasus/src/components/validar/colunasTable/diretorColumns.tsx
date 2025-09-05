// src/components/validar/colunasTable/diretorColumns.tsx

import React from 'react';
import { Column, Contexto } from "@/components/validar/typesDados";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { FaEye } from 'react-icons/fa'; // 👈 1. Importa o ícone de olho

// Mapeamento de gerências para cores (sem alteração)
const gerenciaColors: { [key: string]: string } = {
  "Gerência de Gestão Ensino e Serviço": "bg-green-100 text-green-800",
  "Gerência de Planejamento em Saúde": "bg-purple-100 text-purple-800",
  "Coordenação de Ouvidoria do SUS": "bg-cyan-100 text-cyan-800",
  "Gerência de Gestão do Trabalho": "bg-red-100 text-red-800",
};

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
      const colorClass = gerenciaColors[row.gerencia] || "bg-gray-100 text-gray-800";
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>{row.gerencia}</span>;
    },
  },
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
    render: () => <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-semibold rounded-full">Aguardando analise</span>,
  },
  {
    key: "acoes",
    header: "Ações",
    // 👇 2. Atualiza a renderização para usar o ícone de visualizar
    render: () => (
        <div className="flex items-center gap-4 text-gray-500">
            <button className="hover:text-blue-600" title="Visualizar Contexto">
                <FaEye size={16} />
            </button>
      </div>
    ),
  },
];