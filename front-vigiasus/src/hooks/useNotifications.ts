"use client";

import { useState, useEffect } from "react";
import { getNotificationsWithComments, Notification } from "@/services/notificationsService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await getNotificationsWithComments();
        if (active) setNotifications(data);
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

  return { notifications, isLoading, isError };
};
