// src/services/contextoService.ts

import { mockData } from "@/constants/contextos";
import { mockDataHistorico } from "@/constants/contextosHistorico";
import { Contexto } from "@/components/validar/typesDados";

// Esta variável permite alternar facilmente entre o mock e a API real.
const USE_MOCKS = true;

/**
 * Busca os dados de contextos ABERTOS para validação.
 */
export const getContextos = async (): Promise<Contexto[]> => {
  console.log("Service: buscando dados de contextos...");

  if (USE_MOCKS) {
    // Simula o tempo de espera de uma chamada de rede
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
 *
 * Busca o HISTÓRICO de contextos, agora com suporte para pesquisa (filtro).
 * @param searchQuery O termo opcional a ser pesquisado.
 * @returns Uma promessa que resolve para um array de Contextos já filtrados.
 */
export const getHistoricoContextos = async (searchQuery?: string): Promise<Contexto[]> => {
  console.log(`Service: buscando HISTÓRICO com o termo: "${searchQuery}"`);

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        let dadosFiltrados = mockDataHistorico;

        // SIMULAÇÃO DO BACK-END: Se uma pesquisa foi enviada, o "servidor" filtra os dados.
        if (searchQuery && searchQuery.trim() !== "") {
          const lowercasedQuery = searchQuery.toLowerCase();
          dadosFiltrados = mockDataHistorico.filter(contexto =>
            contexto.nome.toLowerCase().includes(lowercasedQuery) ||
            contexto.solicitante.toLowerCase().includes(lowercasedQuery)
          );
        }
        
        console.log(`Service: retornando ${dadosFiltrados.length} registos filtrados.`);
        resolve(dadosFiltrados);
      }, 500); // Atraso para simular a resposta da rede
    });
  } else {
    // No futuro, a chamada real da API enviaria a pesquisa como um query param:
    // const response = await fetch(`https://api.com/contextos/historico?search=${searchQuery}`);
    // if (!response.ok) {
    //   throw new Error('Falha ao buscar dados da API de histórico');
    // }
    // return response.json();
    return [];
  }
};