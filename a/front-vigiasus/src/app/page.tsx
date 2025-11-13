"use client"

import Hero from "@/components/landingPage/hero"
import WelcomeBar from "@/components/landingPage/welcomeBar";
//import Destaques from "@/components/landingPage/destaques"
import ComoFunciona from "@/components/landingPage/comoFunciona"
import Contato from "@/components/landingPage/contato"

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <WelcomeBar nivelAcesso="default" nomeUser="Carlos" />
      <Hero />
      <section className="relative bg-white -mt-16"> {/* A PRÓXIMA SEÇÃO */}
        <ComoFunciona />
      </section>
      <Contato />
    </main>
  )
}
