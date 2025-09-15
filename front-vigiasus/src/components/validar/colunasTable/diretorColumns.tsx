// src/components/validar/colunasTable/diretorColumns.tsx

import React from 'react';
import { Column, Contexto } from "@/components/validar/typesDados";
import IconeDocumento from '@/components/validar/iconeDocumento';
import { Eye } from 'lucide-react'; // Ícone de olho do Lucide
import { getGerenciaColor } from "@/constants/gerenciaColor"; // Importa a função de cores
import { statusConfig } from './statusConfig'; // ✨ 1. Importar a configuração de status centralizada

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
      const backgroundColor = getGerenciaColor(row.gerencia);
      const style = {
        backgroundColor: backgroundColor,
        color: "#fff", // Para garantir que o texto seja legível
      };
      
      return <span className={`px-3 py-1 text-xs font-semibold rounded-full`} style={style}>{row.gerencia}</span>;
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
    // O status agora é lido de `row.situacao`
    // e usa a configuração central para exibir o texto e a cor corretos.
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
        <button className="hover:text-blue-600" title="Visualizar Contexto">
          <Eye size={16} />
        </button>
      </div>
    ),
  },
];