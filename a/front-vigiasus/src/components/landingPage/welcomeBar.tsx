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
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <User size={16} />
        <p>
          <span className="font-semibold">Bem-vindo</span> ({nivelAcesso}) {nomeUser}!
        </p>
      </div>
    </div>
  );
}