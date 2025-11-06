// src/services/contextoService.ts

// 1. IMPORTAR A FONTE ÚNICA DE DADOS
import { allContextosMock } from "@/constants/mockDatabase";
import { Contexto, StatusContexto } from "@/components/validar/typesDados"; 
// 2. REMOVER A IMPORTAÇÃO DESNECESSÁRIA de diretoriasConfig
// import { diretoriasConfig } from "@/constants/diretorias"; 

const USE_MOCKS = true;

interface HistoricoResponse {
  data: Contexto[];
  total: number;
}

const STATUS_FINALIZADOS: StatusContexto[] = [
  StatusContexto.Publicado,
  StatusContexto.Indeferido,
];

/**
 * Busca contextos "Abertos" (para a página /validar).
 */
export const getContextos = async (): Promise<Contexto[]> => {
  console.log("Service: buscando dados de contextos 'abertos'...");

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        const dadosAbertos = allContextosMock.filter(
          contexto => !STATUS_FINALIZADOS.includes(contexto.status)
        );
        console.log(`Service: retornando ${dadosAbertos.length} contextos abertos.`);
        resolve(dadosAbertos); 
      }, 500); 
    });
  } else {
    console.warn("API real não implementada para getContextos");
    return [];
  }
};

/**
 * Busca contextos "Fechados" (para a página /validar/historico).
 */
export const getHistoricoContextos = async (
  searchQuery?: string,
  dateRange?: { from: Date | undefined; to: Date | undefined },
  page: number = 1,
  limit: number = 10
): Promise<HistoricoResponse> => {
  console.log(`Service: buscando HISTÓRICO - Página: ${page}, Limite: ${limit}, Termo: "${searchQuery || ''}", Datas:`, dateRange);

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        let dadosFiltrados = allContextosMock.filter(
          contexto => STATUS_FINALIZADOS.includes(contexto.status)
        );
        console.log(`Service: ${dadosFiltrados.length} contextos fechados (histórico) encontrados.`);

        // Aplicar filtros de pesquisa (nome/solicitante)
        if (searchQuery && searchQuery.trim() !== "") {
          const lowercasedQuery = searchQuery.toLowerCase().trim();
          dadosFiltrados = dadosFiltrados.filter((contexto: Contexto) =>
            contexto.title.toLowerCase().includes(lowercasedQuery) || 
            (contexto.solicitante && contexto.solicitante.toLowerCase().includes(lowercasedQuery))
          );
        }

        // Aplicar filtros de data
        if (dateRange?.from || dateRange?.to) {
          dadosFiltrados = dadosFiltrados.filter((contexto: Contexto) => {
            try {
              const dataContexto = new Date(contexto.insertedDate); 
              if (isNaN(dataContexto.getTime())) return false; 
              if (dateRange.from) {
                const dataInicio = new Date(dateRange.from);
                dataInicio.setHours(0, 0, 0, 0); 
                if (dataContexto < dataInicio) return false;
              }
              if (dateRange.to) {
                const dataFim = new Date(dateRange.to);
                dataFim.setHours(23, 59, 59, 999); 
                if (dataContexto > dataFim) return false;
              }
              return true; 
            } catch (e) {
              return false; 
            }
          });
        }

        // Aplicar paginação
        const total = dadosFiltrados.length;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const dataPaginada = dadosFiltrados.slice(startIndex, endIndex);

        console.log(`Service: Retornando página ${page} com ${dataPaginada.length} de ${total} itens do histórico.`);
        resolve({ data: dataPaginada, total: total });
      }, 500); 
    });
  } else {
    console.warn("API real não implementada para getHistoricoContextos");
    return { data: [], total: 0 };
  }
};

/**
 * Busca um contexto específico pelo ID.
 */
export const getContextoById = async (id: string): Promise<Contexto | null> => {
  console.log(`Service: buscando contexto específico com ID: ${id}`);

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        const encontrado = allContextosMock.find(contexto => contexto.id === id);

        if (encontrado) {
          console.log(`Service: Contexto com ID ${id} encontrado.`);
          resolve(encontrado); 
        } else {
          console.warn(`Service: Contexto com ID ${id} NÃO encontrado nos mocks.`);
          resolve(null); 
        }
      }, 300); 
    });
  } else {
    console.warn("API real não implementada para getContextoById");
    return null;
  }
};


// --- (FUNÇÃO CORRIGIDA) ---

/**
 * Busca todos os contextos associados a uma Gerência específica.
 * AGORA RETORNA TODOS OS STATUS (pendentes, publicados, etc.)
 * @param nomeGerencia O NOME COMPLETO da gerência (ex: "Gerência de Planejamento").
 */
export const getContextosPorGerencia = async (nomeGerencia: string): Promise<Contexto[]> => {
  console.log(`Service: buscando TODOS os contextos para a gerência NOME: ${nomeGerencia}`);

  if (!nomeGerencia) {
      console.warn(`Service: getContextosPorGerencia chamado com nome indefinido.`);
      return []; // Retorna vazio se o nome não for fornecido
  }

  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        
        // --- INÍCIO DA CORREÇÃO ---
        // Filtra APENAS pelo nome da gerência.
        const encontrados = allContextosMock.filter(
          contexto => contexto.gerencia === nomeGerencia
        );
        // --- FIM DA CORREÇÃO ---
        
        console.log(`Service: Encontrados ${encontrados.length} contextos (todos os status) para a gerência "${nomeGerencia}"`);
        resolve(encontrados);
      }, 500);
    });
  } else {
    // A lógica da API real seria algo como:
    // const response = await fetch(`/api/contextos?gerenciaNome=${encodeURIComponent(nomeGerencia)}&incluirPendentes=true`);
    // return await response.json();
    console.warn("API real não implementada para getContextosPorGerencia");
    return [];
  }
};