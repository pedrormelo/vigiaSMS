// src/services/contextoService.ts

import { mockData } from "@/constants/contextos";
import { mockDataHistorico } from "@/constants/contextosHistorico";
import { Contexto } from "@/components/validar/typesDados"; // Certifique-se que StatusContexto está exportado aqui ou importe separadamente se necessário

const USE_MOCKS = true;

// Interface para a resposta do histórico, incluindo dados e total.
interface HistoricoResponse {
  data: Contexto[];
  total: number;
}

/**
 * Busca os dados de contextos ABERTOS para validação.
 * @returns Uma promessa que resolve para um array de Contextos abertos.
 */
export const getContextos = async (): Promise<Contexto[]> => {
  console.log("Service: buscando dados de contextos...");

  if (USE_MOCKS) {
    // Simula delay da API com dados mockados
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("Service: retornando dados mockados (abertos).");
        resolve(mockData); // Retorna os dados de contextos.ts
      }, 500); // Simula 500ms de espera
    });
  } else {
    // Implementação real da API (exemplo)
    // try {
    //   const response = await fetch('/api/contextos/abertos'); // Endpoint da sua API
    //   if (!response.ok) {
    //     throw new Error('Falha ao buscar contextos abertos');
    //   }
    //   const data: Contexto[] = await response.json();
    //   return data;
    // } catch (error) {
    //   console.error("Erro na API getContextos:", error);
    //   return []; // Retorna array vazio em caso de erro
    // }
    console.warn("API real não implementada para getContextos");
    return [];
  }
};

/**
 * Busca o HISTÓRICO de contextos com suporte para pesquisa e paginação.
 * @param searchQuery O termo opcional a ser pesquisado no nome ou solicitante.
 * @param page O número da página a ser retornada (começando em 1). Padrão: 1.
 * @param limit O número máximo de itens por página. Padrão: 10.
 * @returns Uma promessa que resolve para um objeto com os dados da página (`data`) e o número total de registros (`total`).
 */
export const getHistoricoContextos = async (
  searchQuery?: string,
  page: number = 1,
  limit: number = 10
): Promise<HistoricoResponse> => {
  console.log(`Service: buscando HISTÓRICO - Página: ${page}, Limite: ${limit}, Termo: "${searchQuery || ''}"`);

  if (USE_MOCKS) {
    // Simula delay e lógica de filtro/paginação com dados mockados
    return new Promise(resolve => {
      setTimeout(() => {
        let dadosFiltrados = mockDataHistorico; // Começa com todos os dados do histórico

        // Aplica o filtro de pesquisa se houver um termo
        if (searchQuery && searchQuery.trim() !== "") {
          const lowercasedQuery = searchQuery.toLowerCase().trim();
          dadosFiltrados = mockDataHistorico.filter((contexto: Contexto) =>
            contexto.nome.toLowerCase().includes(lowercasedQuery) ||
            contexto.solicitante.toLowerCase().includes(lowercasedQuery)
            // Adicione mais campos para busca se necessário (ex: gerencia)
            // || contexto.gerencia.toLowerCase().includes(lowercasedQuery)
          );
          console.log(`Service: ${dadosFiltrados.length} resultados após filtro por "${searchQuery}".`);
        }

        // Calcula o total de registros *antes* de paginar
        const total = dadosFiltrados.length;

        // Calcula os índices para a paginação
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit; // slice não inclui o endIndex

        // Pega apenas a "fatia" correspondente à página atual
        const dataPaginada = dadosFiltrados.slice(startIndex, endIndex);

        console.log(`Service: retornando ${dataPaginada.length} de ${total} registros históricos (página ${page}).`);

        // Resolve a promessa com os dados paginados e o total
        resolve({ data: dataPaginada, total: total });
      }, 500); // Simula 500ms de espera
    });
  } else {
    // Implementação real da API (exemplo)
    // try {
    //   const params = new URLSearchParams();
    //   if (searchQuery) params.append('search', searchQuery);
    //   params.append('page', page.toString());
    //   params.append('limit', limit.toString());
    //
    //   const response = await fetch(`/api/contextos/historico?${params.toString()}`); // Endpoint da API
    //   if (!response.ok) {
    //     throw new Error('Falha ao buscar histórico de contextos');
    //   }
    //   const data: HistoricoResponse = await response.json(); // API deve retornar { data: [...], total: ... }
    //   return data;
    // } catch (error) {
    //   console.error("Erro na API getHistoricoContextos:", error);
    //   return { data: [], total: 0 }; // Retorna vazio em caso de erro
    // }
    console.warn("API real não implementada para getHistoricoContextos");
    return { data: [], total: 0 };
  }
};

/**
 * Busca os detalhes de um contexto específico pelo seu ID.
 * Procura tanto nos dados de contextos abertos quanto nos dados de histórico (na versão mock).
 * @param id O ID único do contexto a ser buscado.
 * @returns Uma promessa que resolve para o objeto Contexto encontrado, ou `null` se não for encontrado.
 */
export const getContextoById = async (id: string): Promise<Contexto | null> => {
  console.log(`Service: buscando contexto específico com ID: ${id}`);

  if (USE_MOCKS) {
    // Simula delay da API
    return new Promise(resolve => {
      setTimeout(() => {
        // Combina ambos os arrays mockados para procurar em todos os lugares
        const todosOsContextos = [...mockData, ...mockDataHistorico];

        // Encontra o primeiro contexto que corresponde ao ID
        const encontrado = todosOsContextos.find(contexto => contexto.id === id);

        if (encontrado) {
          console.log(`Service: Contexto com ID ${id} encontrado.`);
          resolve(encontrado); // Retorna o contexto encontrado
        } else {
          console.warn(`Service: Contexto com ID ${id} NÃO encontrado nos mocks.`);
          resolve(null); // Retorna null se não encontrar
        }
      }, 300); // Simula 300ms de espera
    });
  } else {
    // Implementação real da API (exemplo)
    // try {
    //   const response = await fetch(`/api/contextos/${id}`); // Endpoint específico para buscar por ID
    //   if (response.status === 404) {
    //     return null; // Não encontrado
    //   }
    //   if (!response.ok) {
    //     throw new Error(`Falha ao buscar contexto ${id}`);
    //   }
    //   const data: Contexto = await response.json();
    //   return data;
    // } catch (error) {
    //   console.error(`Erro na API getContextoById para ID ${id}:`, error);
    //   return null; // Retorna null em caso de erro
    // }
    console.warn("API real não implementada para getContextoById");
    return null;
  }
};

/**
 * Obtém a data/hora do último contexto inserido no sistema (mock ou API real).
 * Considera tanto os contextos em aberto quanto o histórico e retorna o mais recente por campo `data`.
 */
export const getUltimaAtualizacao = async (): Promise<{
  id: string;
  nome: string;
  data: string; // ISO string
} | null> => {
  if (USE_MOCKS) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const todos: Contexto[] = [...mockData, ...mockDataHistorico];
          if (todos.length === 0) return resolve(null);
          const ordenados = [...todos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
          const ultimo = ordenados[0];
          resolve({ id: ultimo.id, nome: ultimo.nome, data: ultimo.data });
        } catch {
          resolve(null);
        }
      }, 200);
    });
  } else {
    // TODO: implementar chamada real à API quando disponível
    return null;
  }
};

// Você pode adicionar mais funções aqui conforme necessário, como:
// - updateContextoStatus(id: string, newStatus: StatusContexto, comentario?: string): Promise<boolean>
// - createContexto(data: Omit<Contexto, 'id' | 'data' | 'historico'>): Promise<Contexto | null>
// - deleteContexto(id: string): Promise<boolean>