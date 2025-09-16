// src/hooks/useHistoricoContextos.ts
'use client';

import { useState, useEffect } from "react";
import { Contexto } from "@/components/validar/typesDados";
import { getHistoricoContextos } from "@/services/contextoService";

//Aceita um `searchQuery` como argumento
export const useHistoricoContextos = (searchQuery: string) => {
  const [data, setData] = useState<Contexto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A função de busca agora está dentro do useEffect
  //    para ser chamada sempre que a `searchQuery` mudar.
  useEffect(() => {
    const carregarHistorico = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Passamos a pesquisa para o serviço
        const contextos = await getHistoricoContextos(searchQuery);
        setData(contextos);
      } catch (err) {
        setError("Não foi possível carregar o histórico. Tente novamente mais tarde.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    carregarHistorico();
  }, [searchQuery]); // A dependência é `searchQuery`

  return { data, isLoading, error };
};