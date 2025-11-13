"use client"

import Hero from "@/components/landingPage/hero"
import WelcomeBar from "@/components/landingPage/welcomeBar";
//import Destaques from "@/components/landingPage/destaques"
import ComoFunciona from "@/components/landingPage/comoFunciona"
import Contato from "@/components/landingPage/contato"
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function LandingPage() {
  const user = useCurrentUser();
  const nivelLabel = user.role === 'diretor' ? 'Diretoria' : user.role === 'secretaria' ? 'Secretaria' : 'Usuário';
  return (
    <main className="flex flex-col">
      <WelcomeBar nivelAcesso={nivelLabel} nomeUser={user.name} />
      <Hero role={user.role} userName={user.name} diretoriaId={user.diretoriaId} gerenciaId={user.gerenciaId} />
      <section className="relative bg-white -mt-16"> {/* A PRÓXIMA SEÇÃO */}
        <ComoFunciona />
      </section>
      <Contato />
    </main>
  )
}
