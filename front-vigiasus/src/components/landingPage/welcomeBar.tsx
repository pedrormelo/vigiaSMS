"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface WelcomeBarProps {
  nivelAcesso?: string;
  nomeUser?: string;
}

export default function WelcomeBar({ nivelAcesso = "Usuário", nomeUser = "Visitante" }: WelcomeBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`
        bg-[#68D0A1] text-white text-center text-sm overflow-hidden
        transition-all duration-700 ease-in-out
        ${isVisible ? 'max-h-20 py-2 px-6 opacity-100' : 'max-h-0 py-0 px-6 opacity-50'}
      `}
    >
      {/* DOCUMENTAÇÃO:
        - A animação de 'transform' por 'max-height'.
        - overflow-hidden: Essencial para que o conteúdo não vaze enquanto a altura diminui.
        - Se 'isVisible' for true:
          - max-h-20: Uma altura máxima grande o suficiente para a barra.
          - py-2 px-6: Padding normal.
          - opacity-100: Totalmente visível.
        - Se 'isVisible' for false:
          - max-h-0: A altura máxima colapsa para zero, removendo o espaço.
          - py-0: O padding vertical também vai a zero para um colapso suave.
          - opacity-50: A opacidade diminui junto com a altura.
      */}
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <User size={16} />
        <p>
          <span className="font-semibold">Bem-vindo</span> ({nivelAcesso}) {nomeUser}!
        </p>
      </div>
    </div>
  );
}