"use client";

import { Button } from "@/components/ui/button";

export default function Contato() {
  return (
    // A seção principal com fundo azul e posicionamento relativo para a onda
    <section className="relative bg-gradient-to-r from-[#1745FF] to-cyan-600 pt-32 pb-20 px-6 font-sans">

      {/* Elemento SVG que cria a forma de onda no topo */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-current text-white"
          ></path>
        </svg>
      </div>

      {/* Container principal para o conteúdo do formulário */}
      <div className="max-w-2xl mx-auto text-white">

        {/* Título */}
        <h2 className="text-4xl font-bold text-center mb-12">
          Contato
        </h2>

        {/* Formulário */}
        <form className="space-y-6">
          {/* Campo Nome */}
          <div className="space-y-2">
            <div className="pb-1.2">
              <label htmlFor="nome" className="font-medium text">
                Seu nome: *
              </label>
            </div>
            <input
              id="nome"
              type="text"
              placeholder="Ex: João"
              className="w-full p-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Campo E-mail */}
          <div className="space-y-2">
            <div className="pb-1.2">
              <label htmlFor="email" className="font-medium">
                Endereço de E-mail: *
              </label>
            </div>
            <input
              id="email"
              type="email"
              placeholder="exemplo@gmail.com"
              className="w-full p-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Campo Mensagem */}
          <div className="space-y-2">
            <div className="pb-1.2">

              <label htmlFor="mensagem" className="font-medium">
                Sua Mensagem: *
              </label>
            </div>
            <textarea
              id="mensagem"
              placeholder="Escreva aqui a sua dúvida, sugestão ou reclamação para a nossa equipe entrar em contato."
              className="w-full p-4 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[150px] resize-none"
              required
            ></textarea>
          </div>

          {/* Botão de Envio */}
          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-600 rounded-2xl py-5 text-lg font-bold shadow-lg transition-transform transform hover:scale-105">
            Enviar mensagem
          </Button>
        </form>
      </div>
    </section>
  );
}