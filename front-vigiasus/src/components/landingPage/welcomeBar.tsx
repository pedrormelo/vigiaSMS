"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface WelcomeBarProps {
  nivelAcesso?: string;
  nomeUser?: string;
}

export default function WelcomeBar({ nivelAcesso = "Usuário", nomeUser = "Visitante" }: WelcomeBarProps) {
  // Começamos como false para evitar "piscar" na tela se o usuário já viu
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Criamos uma chave única baseada no nome do usuário
    // Isso garante que se trocar de usuário, o novo veja a mensagem também
    const storageKey = `welcome_shown_${nomeUser}`;
    const hasShown = sessionStorage.getItem(storageKey);

    // Se NÃO tiver mostrado ainda nesta sessão
    if (!hasShown) {
      setIsVisible(true);

      // Marca como mostrado no sessionStorage (dura enquanto a aba estiver aberta)
      sessionStorage.setItem(storageKey, "true");

      // Configura o timer para fechar
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [nomeUser]);

  // Se não deve estar visível e a altura é 0, o CSS cuida de esconder,
  // mas o estado inicial false previne a renderização inicial indesejada.

  return (
    <div 
      className={`
        bg-[#68D0A1] text-white text-center text-sm overflow-hidden
        transition-all duration-700 ease-in-out
        ${isVisible ? 'max-h-20 py-2 px-6 opacity-100' : 'max-h-0 py-0 px-6 opacity-50'}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <User size={16} />
        <p>
          <span className="font-semibold">Bem-vindo</span> ({nivelAcesso}) {nomeUser}!
        </p>
      </div>
    </div>
  );
}