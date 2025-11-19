"use client"

import { useState, useEffect } from "react"; // 1. Importar Hooks
import Hero from "@/components/landingPage/hero"
import WelcomeBar from "@/components/landingPage/welcomeBar";
//import Destaques from "@/components/landingPage/destaques"
import ComoFunciona from "@/components/landingPage/comoFunciona"
import Contato from "@/components/landingPage/contato"
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false); // 2. Estado de montagem
  const user = useCurrentUser();

  // 3. Efeito para marcar como montado apenas no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 4. Evita renderizar o conteúdo dependente do usuário antes da hidratação
  if (!isMounted) {
    return null; // Ou pode retornar um <div className="h-screen bg-white" /> para evitar layout shift
  }

  const nivelLabel = user.role === 'diretor' ? 'Diretoria' : user.role === 'secretaria' ? 'Secretaria' : 'Usuário';
  
  return (
    <main className="flex flex-col">
      <WelcomeBar nivelAcesso={nivelLabel} nomeUser={user.name} />
      <Hero 
        role={user.role} 
        userName={user.name} 
        diretoriaId={user.diretoriaId} 
        diretoriaSlug={user.diretoriaSlug}
        gerenciaId={user.gerenciaId} 
        gerenciaSlug={user.gerenciaSlug}
      />
      <section className="relative bg-white -mt-16"> {/* A PRÓXIMA SEÇÃO */}
        <ComoFunciona />
      </section>
      <Contato />
    </main>
  )
}