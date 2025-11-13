// src/hooks/useValidarContextos.ts
'use client';

import { useState, useEffect, useCallback } from "react";
import { Contexto } from "@/components/validar/typesDados";
import { getContextos } from "@/services/contextoService";

export const useValidarContextos = () => {
  // Estado para os dados da tabela
  const [data, setData] = useState<Contexto[]>([]);
  // Estado para controlar o status de carregamento
  const [isLoading, setIsLoading] = useState(true);
  // Estado para armazenar qualquer erro que ocorra
  const [error, setError] = useState<string | null>(null);

  /**
   * Função para buscar os dados do serviço.
   * Usamos useCallback para garantir que a função não seja recriada
   * a cada renderização, otimizando a performance.
   */
  const carregarContextos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contextos = await getContextos();
      setData(contextos);
    } catch (err) {
      setError("Não foi possível carregar os contextos. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect para executar a busca de dados assim que o hook for utilizado
  useEffect(() => {
    carregarContextos();
  }, [carregarContextos]);

  // O hook retorna o estado e as funções que o componente precisará
  return { data, isLoading, error, carregarContextos };
};