"use client"

import { useState, useEffect } from "react";
import Hero from "@/components/landingPage/hero"
import WelcomeBar from "@/components/landingPage/welcomeBar";
//import Destaques from "@/components/landingPage/destaques"
import ComoFunciona from "@/components/landingPage/comoFunciona"
import Contato from "@/components/landingPage/contato"
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SpinnerCarregamento from "@/components/ui/spinner-carregamento";

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const user = useCurrentUser();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <SpinnerCarregamento
        mensagem="Preparando página inicial..."
        tamanho="grande"
        centralizarTela={true}
      />
    );
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