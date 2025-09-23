// src/services/contextoService.ts

import { mockData } from "@/constants/contextos";
import { mockDataHistorico } from "@/constants/contextosHistorico";
import { Contexto } from "@/components/validar/typesDados";

const USE_MOCKS = true;

// Agora ela inclui a lista de dados e o número total de itens.
interface HistoricoResponse {
  data: Contexto[];
  total: number;
}

/**
 * Busca os dados de contextos ABERTOS para validação.
 */
export const getContextos = async (): Promise<Contexto[]> => {
  console.log("Service: buscando dados de contextos...");

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("Service: retornando dados mockados.");
        resolve(mockData);
      }, 500);
    });
  } else {
    return [];
  }
};

/**
 * Busca o HISTÓRICO de contextos com suporte para pesquisa e paginação.
 * @param searchQuery O termo opcional a ser pesquisado.
 * @param page O número da página a ser retornada (padrão: 1).
 * @param limit O número de itens por página (padrão: 10).
 * @returns Uma promessa que resolve para um objeto com os dados da página e o total de registos.
 */
export const getHistoricoContextos = async (
  searchQuery?: string,
  page: number = 1,
  limit: number = 10
): Promise<HistoricoResponse> => {
  console.log(`Service: buscando HISTÓRICO página ${page}, termo: "${searchQuery}"`);

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        let dadosFiltrados = mockDataHistorico;

        // A lógica de filtro continua a mesma
        if (searchQuery && searchQuery.trim() !== "") {
          const lowercasedQuery = searchQuery.toLowerCase();
          dadosFiltrados = mockDataHistorico.filter((contexto: Contexto) =>
            contexto.nome.toLowerCase().includes(lowercasedQuery) ||
            contexto.solicitante.toLowerCase().includes(lowercasedQuery)
          );
        }
        
        // SIMULAÇÃO DO BACK-END: Pega o total de itens ANTES de fatiar.
        const total = dadosFiltrados.length;
        
        // "Fatia" o array para devolver apenas os itens da página pedida.
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const dataPaginada = dadosFiltrados.slice(startIndex, endIndex);

        console.log(`Service: retornando ${dataPaginada.length} de ${total} registos.`);
        
        // Devolve o objeto completo com os dados paginados e o total.
        resolve({ data: dataPaginada, total: total });
      }, 500);
    });
  } else {
    // A chamada real da API enviaria os parâmetros de paginação
    // const response = await fetch(`.../historico?search=${searchQuery}&page=${page}&limit=${limit}`);
    return { data: [], total: 0 };
  }
};