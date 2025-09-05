// src/components/validar/colunasTable/gerenteColumns.tsx

import React from 'react';
import { Column, Contexto, StatusContexto } from "@/components/validar/typesDados";
import { FaEye } from 'react-icons/fa';
import IconeDocumento from '@/components/validar/iconeDocumento';

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
    render: () => (
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-semibold rounded-full">
            Aguardando validação
        </span>
    ),
  },
  {
    key: "acoes", header: "Ações",
    render: () => (
      <div className="flex items-center gap-4 text-gray-500">
        {/* 👇 2. O botão agora usa o ícone FaEye e o título correto */}
        <button className="hover:text-blue-600" title="Visualizar Contexto">
          <FaEye size={16} />
        </button>
      </div>
    ),
  },
];