// src/hooks/useHistoricoContextos.ts
'use client';

import { useState, useEffect, useCallback } from "react";
import { Contexto } from "@/components/validar/typesDados";
//  Importa a nova função do serviço
import { getHistoricoContextos } from "@/services/contextoService";

export const useHistoricoContextos = () => {
  const [data, setData] = useState<Contexto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarHistorico = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Chama a função correta para buscar o histórico
      const contextos = await getHistoricoContextos();
      setData(contextos);
    } catch (err) {
      setError("Não foi possível carregar o histórico. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  return { data, isLoading, error, carregarHistorico };
};