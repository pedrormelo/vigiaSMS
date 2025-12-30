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
      // --- LÓGICA ATUALIZADA: Múltiplas versões ativas ---
      const config = statusConfig[row.status] || { text: row.status, className: "bg-gray-100 text-gray-800" };
      const versaoEspecifica = row.versoes?.find(v => v.status === row.status) || row.versoes?.[0];
      const versaoNum = versaoEspecifica?.id || 1;
      const totalVersoes = row.versoes ? row.versoes.length : 1;
      const versoesPublicadas = row.versoes ? row.versoes.filter(v => v.status === StatusContexto.Publicado).length : 0;
      const maiorVersao = row.versoes ? Math.max(...row.versoes.map(v => v.id)) : 1;
      const isVersaoMaisRecente = versaoNum === maiorVersao;
      
      // Texto do badge: mostra quantidade de versões publicadas ou se é a mais recente
      let versaoBadgeText = `v${versaoNum}`;
      if (isVersaoMaisRecente && totalVersoes > 1) {
        versaoBadgeText += versoesPublicadas > 1 ? ` (${versoesPublicadas} publicadas)` : ' - Mais Recente';
      } else if (totalVersoes > 1) {
        versaoBadgeText += ` de ${totalVersoes}`;
      }

      return (
        <div className="flex flex-col gap-1.5 items-start">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>
            {config.text}
          </span>
          
          <span className={`px-2 py-0.5 text-[10px] font-medium ${isVersaoMaisRecente && versoesPublicadas > 1 ? 'text-green-800 bg-green-100 border-green-200' : 'text-gray-600 bg-gray-100 border-gray-200'} rounded-full border`}>
            {versaoBadgeText}
          </span>
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