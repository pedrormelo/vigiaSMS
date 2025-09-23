// src/hooks/useHistoricoContextos.ts
'use client';

import { useState, useEffect } from "react";
import { Contexto } from "@/components/validar/typesDados";
import { getHistoricoContextos } from "@/services/contextoService";

const ITEMS_PER_PAGE = 10;

export const useHistoricoContextos = (searchQuery: string) => {
  const [data, setData] = useState<Contexto[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const carregarHistorico = async () => {
      setError(null);
      try {
        const response = await getHistoricoContextos(searchQuery, currentPage, ITEMS_PER_PAGE);
        setData(response.data);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      } catch (err) {
        setError("Não foi possível carregar o histórico. Tente novamente mais tarde.");
        console.error(err);
      }
    };

    carregarHistorico();
  }, [searchQuery, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return { data, error, currentPage, totalPages, setCurrentPage };
};