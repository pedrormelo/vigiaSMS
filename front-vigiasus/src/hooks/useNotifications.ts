// src/hooks/useNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotificationsWithComments, markNotificationRead } from "@/services/notificationsService";
import { Notification } from "@/constants/types";

export const useNotifications = (userName?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  
  // Estado local para rastrear IDs de notificações lidas (number[])
  const [readNotifications, setReadNotifications] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await getNotificationsWithComments();
        if (active) {
          setNotifications(data);
          // Inicializa com o que já veio como "visto" do backend
          const seenIds = data
            .filter(n => n.status === 'visto')
            .map(n => n.id);
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

  // Função para marcar como lida (exportada para ser usada na Navbar e Modal)
  const markAsRead = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;

    // 1. Atualização Otimista: Remove do contador instantaneamente na tela
    setReadNotifications(prev => {
      const newSet = new Set([...prev, ...ids]);
      return Array.from(newSet);
    });

    // 2. Sincroniza com o Backend
    for (const id of ids) {
      try {
        await markNotificationRead(id);
      } catch (err) {
        console.error(`Erro ao sincronizar leitura da notificação ${id}:`, err);
      }
    }
  }, []);

  return { 
    notifications, 
    isLoading, 
    isError, 
    readNotifications, // Agora exportado corretamente
    markAsRead         // Agora exportado corretamente
  };
};