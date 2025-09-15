// src/services/contextoService.ts

import { mockData } from "@/constants/contextos"; 
import { mockDataHistorico } from "@/constants/contextosHistorico"; 
import { Contexto } from "@/components/validar/typesDados";

// Esta variável permite alternar facilmente entre o mock e a API real.
const USE_MOCKS = true;

/**
 * Busca os dados de contextos ABERTOS para validação.
 * No futuro, a chamada à API real (fetch, axios) será feita aqui.
 * @returns Uma promessa que resolve para um array de Contextos.
 */
export const getContextos = async (): Promise<Contexto[]> => {
  console.log("Service: buscando dados de contextos...");

  if (USE_MOCKS) {
    // Simula o tempo de espera de uma chamada de rede
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("Service: retornando dados mockados.");
        resolve(mockData);
      }, 500); // 500ms de atraso
    });
  } else {
    // Exemplo de como seria a chamada real no futuro:
    // const response = await fetch('https://api.com/contextos');
    // if (!response.ok) {
    //   throw new Error('Falha ao buscar dados da API');
    // }
    // return response.json();
    return []; // Retorna vazio enquanto a API não está pronta
  }
};

/**
 * função adicionada para buscar o HISTÓRICO de contextos.
 * Busca os dados de contextos já finalizados (Deferidos, Indeferidos, etc).
 * @returns Uma promessa que resolve para um array de Contextos do histórico.
 */
export const getHistoricoContextos = async (): Promise<Contexto[]> => {
  console.log("Service: buscando dados do HISTÓRICO...");

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("Service: retornando dados mockados do histórico.");
        // Retorna os dados do histórico importados
        resolve(mockDataHistorico); 
      }, 700); // Atraso um pouco diferente para diferenciar
    });
  } else {
    // No futuro, a chamada real da API de histórico ficará aqui
    // const response = await fetch('https://api.com/contextos/historico');
    // if (!response.ok) {
    //   throw new Error('Falha ao buscar dados da API de histórico');
    // }
    // return response.json();
    return [];
  }
};