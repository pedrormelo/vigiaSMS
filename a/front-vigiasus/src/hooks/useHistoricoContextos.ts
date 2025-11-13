// src/hooks/useHistoricoContextos.ts
'use client';

import { useState, useEffect } from "react";
import { Contexto } from "@/components/validar/typesDados";
import { getHistoricoContextos } from "@/services/contextoService";

const ITEMS_PER_PAGE = 10;

// 1. Definir o tipo para o dateRange
type DateRange = { from: Date | undefined; to: Date | undefined };

export const useHistoricoContextos = (searchQuery: string, dateRange: DateRange) => {
  const [data, setData] = useState<Contexto[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Adicionar estado de isLoading
  const [isLoading, setIsLoading] = useState(true); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const carregarHistorico = async () => {
      // 3. Ativar o loading
      setIsLoading(true); 
      setError(null);
      
      try {
        // 4. Passar todos os filtros para o serviço
        const response = await getHistoricoContextos(searchQuery, dateRange, currentPage, ITEMS_PER_PAGE);
        setData(response.data);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      } catch (err) {
        setError("Não foi possível carregar o histórico. Tente novamente mais tarde.");
        console.error(err);
      } finally {
        // 5. Desativar o loading
        setIsLoading(false); 
      }
    };

    carregarHistorico();
  // 6. Adicionar dateRange às dependências
  }, [searchQuery, dateRange, currentPage]); 

  // Zera a página quando a pesquisa ou data mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange]);

  // 7. Retornar o isLoading
  return { data, error, isLoading, currentPage, totalPages, setCurrentPage };
};