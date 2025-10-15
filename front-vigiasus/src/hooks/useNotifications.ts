"use client";

import { useState, useEffect } from "react";
import { notificationsData, Notification } from "@/constants/notificationsData";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    // Simula uma chamada à API
    const fetchNotifications = () => {
      try {
        setNotifications(notificationsData);
      } catch (error) {
        setIsError(true);
        console.error("Erro ao carregar notificações: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Usamos um pequeno timeout para simular a latência da rede
    const timer = setTimeout(fetchNotifications, 1000);
    
    // Limpa o timeout se o componente for desmontado
    return () => clearTimeout(timer);
  }, []);

  return { notifications, isLoading, isError };
};