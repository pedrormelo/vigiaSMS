// src/hooks/useDebounce.ts
"use client";

import { useState, useEffect } from 'react';

/**
 * Um custom hook que atrasa a atualização de um valor.
 * Muito útil para evitar chamadas excessivas à API em campos de pesquisa. (evita o nosso servidor de pifar ksksksk)
 * @param value O valor a ser "atrasado" (ex: o texto da pesquisa).
 * @param delay O tempo de atraso em milissegundos (ex: 500ms).
 * @returns O valor após o atraso ter passado.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um temporizador que só atualizará o valor "atrasado"
    // depois que o `delay` tiver passado desde a última mudança do `value`.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Esta função de limpeza é crucial. Ela cancela o temporizador anterior
    // sempre que o `value` muda, reiniciando a contagem.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Só re-executa se o valor ou o atraso mudarem

  return debouncedValue;
}