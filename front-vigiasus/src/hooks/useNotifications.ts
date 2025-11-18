// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotificationsWithComments, markNotificationRead } from "@/services/notificationsService";
import { Notification } from "@/constants/types";

export const useNotifications = (userName?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  
  // Estado local para rastrear notificações lidas (para atualização otimista da UI)
  const [readNotifications, setReadNotifications] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await getNotificationsWithComments();
        if (active) {
          setNotifications(data);
          // Inicializa a lista de lidos com o que já veio como "visto" do backend
          const seenIds = data.filter(n => n.status === 'visto').map(n => n.id);
          setReadNotifications(seenIds);
        }
      } catch (e) {
        console.error("Erro ao carregar notificações", e);
        if (active) setIsError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  // Função exposta para marcar como lida
  const markAsRead = useCallback(async (ids: number[]) => {
    // 1. Atualização otimista local
    setReadNotifications(prev => {
      const newSet = new Set([...prev, ...ids]);
      return Array.from(newSet);
    });

    // 2. Chamada ao serviço (API) para cada ID
    // Nota: Idealmente o backend teria um endpoint de "marcar vários", mas aqui iteramos.
    for (const id of ids) {
      await markNotificationRead(id).catch(err => console.error(`Erro ao marcar notificação ${id} como lida:`, err));
    }
  }, []);

  return { 
    notifications, 
    isLoading, 
    isError, 
    readNotifications, // Agora exportado
    markAsRead         // Agora exportado
  };
};