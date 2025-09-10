"use client"

import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import Metrics from "@/components/landingPage/metrics"

// Interface simplificada, sem propriedades da onda
interface HeroProps {
  role?: string;
}

export default function Hero({ role = "Usuário" }: HeroProps) {
  return (
    // Seção limpa: sem 'relative' e com padding simétrico (pt-16 pb-16)
    <section className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white pt-16 pb-16 px-6">
      
      {/* O conteúdo do Hero continua o mesmo */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-blue-100">👋 Olá, {role}</h2>
          <h1 className="text-4xl font-bold">VigiaSUS</h1>
          <p className="mt-4 text-lg text-blue-100 max-w-xl">
            Plataforma digital da Secretaria de Saúde de Jaboatão dos Guararapes. 
            Centraliza dados, relatórios e informações estratégicas para apoiar 
            a gestão da saúde pública.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl px-6 py-3">
              Acesse os Dados Gerais
            </Button>
            <Button className="bg-white hover:bg-gray-100 text-blue-700 rounded-xl px-6 py-3">
              Acesse o Painel de Gráficos
            </Button>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center w-full lg:w-[300px]">
          <BarChart3 size={40} className="text-yellow-400 mb-2" />
          <p className="text-lg font-semibold">+2 mil Contextos</p>
          <span className="text-blue-100 text-sm">Cadastrados no sistema</span>
        </div>
      </div>
      <Metrics />
    </section>
  )
}