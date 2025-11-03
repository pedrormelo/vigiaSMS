// src/app/ajuda/suporte/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  // Ícones específicos desta seção
  LifeBuoy, // Ícone da Área
  Mail,
  Bug,
  MessageSquareQuoteIcon,
  User as UserIcon, // Renomeado para evitar conflito
  RefreshCw,
  ListOrdered,
  Camera,
  Terminal,
  Send
} from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar-faq";

// --- Componentes de Conteúdo dos Tópicos ---

const ContatoGTIContent = () => (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
          <Mail className="w-9 h-9 text-blue-600"/> Contato GTI
        </h1>
        <p className="text-xl text-gray-600">
          Como entrar em contato com a equipe de Tecnologia da Informação.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p>
          Se você tiver problemas técnicos, precisar de redefinição de senha ou tiver sugestões para a plataforma VigiaSUS, a Gerência de Tecnologia da Informação (GTI) é o seu ponto de contato.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Canais de Atendimento:</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"/>
              <div>
                  <h3 className="font-semibold text-gray-800">E-mail (Preferencial)</h3>
                  <p className="text-sm text-gray-600">Para solicitações formais e envio de anexos (como prints de tela), utilize nosso e-mail de suporte:</p>
                  <a href="mailto:suporte.gti@jaboatao.saude.gov.br" className="text-sm text-blue-700 font-medium hover:underline">suporte.gti@jaboatao.saude.gov.br</a>
              </div>
          </div>
           <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <UserIcon className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1"/>
              <div>
                  <h3 className="font-semibold text-gray-800">Atendimento Presencial</h3>
                  <p className="text-sm text-gray-600">Para questões urgentes, você pode se dirigir à sala da GTI, localizada na sede da Secretaria de Saúde.</p>
              </div>
          </div>
        </div>
      </div>
    </div>
);

// NOVA VERSÃO DO ReportarBugContent
const ReportarBugContent = () => (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
          <Bug className="w-9 h-9 text-blue-600" /> Reportar um Problema
        </h1>
        <p className="text-xl text-gray-600">
          Encontrou um erro ou algo que não funciona? Veja como nos ajudar a corrigi-lo.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                  <h3 className="font-semibold text-blue-800">Primeiro passo: Atualize a página</h3>
                  <p className="text-sm text-blue-700">Muitos problemas são temporários e se resolvem ao recarregar a página (pressione F5 ou Ctrl+R).</p>
              </div>
          </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">O que incluir no seu reporte</h2>
        <p className="text-gray-600 mb-6 -mt-4">Para resolvermos o problema o mais rápido possível, por favor, inclua estas informações no seu e-mail:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-start gap-4">
                <MessageSquareQuoteIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">1. Descrição do Problema</h3>
                    <p className="text-sm text-gray-600 mt-1">O que você estava tentando fazer e o que aconteceu de errado?</p>
                </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-start gap-4">
                <ListOrdered className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">2. Passos para Reproduzir</h3>
                    <p className="text-sm text-gray-600 mt-1">Liste as ações que você tomou e que levaram ao erro. Ex: "1. Abri a página X. 2. Cliquei no botão Y..."</p>
                </div>
            </div>

            {/* Card 3 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4 md:col-span-2">
                <Camera className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-lg text-green-800">3. Captura de Tela (Print) - Essencial!</h3>
                    <p className="text-sm text-green-700 mt-1">Uma imagem da tela inteira mostrando o erro é a informação mais útil que você pode nos fornecer.</p>
                </div>
            </div>

            {/* Card 4 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-start gap-4 md:col-span-2">
                <Terminal className="w-8 h-8 text-gray-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">4. Informações do Console (Opcional, Avançado)</h3>
                    <p className="text-sm text-gray-600 mt-1">Se souber como, aperte <strong>F12</strong> no seu navegador, clique na aba <strong>"Console"</strong> e anexe um print de qualquer mensagem de erro (em vermelho) que aparecer.</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-blue-800 mb-2">Pronto para enviar?</h3>
        <p className="text-blue-700 mb-4">Envie todas as informações que você reuniu para o nosso e-mail de suporte.</p>
        <a href="mailto:suporte.gti@jaboatao.saude.gov.br" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow">
            <Send className="w-5 h-5" /> Enviar E-mail para a GTI
        </a>
      </div>
    </div>
);


const FAQContent = () => (
  <div className="space-y-10">
    <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <MessageSquareQuoteIcon className="w-9 h-9 text-blue-600"/> Perguntas Frequentes (FAQ)
        </h1>
        <p className="text-xl text-gray-600">Respostas rápidas para as dúvidas mais comuns.</p>
    </div>

    <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-50/50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800">P: Esqueci minha senha. Como recupero o acesso?</h3>
            </div>
            <div className="p-4 prose text-gray-700 text-sm">
                <p>R: Na tela de login, clique no link "Esqueci minha senha". Você receberá instruções no seu e-mail cadastrado. Se não tiver acesso ao e-mail, entre em contato com a GTI.</p>
            </div>
        </div>

        <div className="border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-50/50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800">P: Enviei um contexto para validação, mas o status não muda. O que fazer?</h3>
            </div>
            <div className="p-4 prose text-gray-700 text-sm">
                <p>R: O contexto precisa passar pela aprovação do Gerente e depois do Diretor. Verifique na aba "Histórico" do contexto para ver com quem está a pendência. Você também pode adicionar um comentário no contexto perguntando sobre o status (o responsável será notificado).</p>
            </div>
        </div>

        <div className="border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-50/50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800">P: Tentei subir um arquivo e deu "Arquivo muito grande". Qual o limite?</h3>
            </div>
            <div className="p-4 prose text-gray-700 text-sm">
                <p>R: O limite atual para upload de arquivos (PDF, DOC, Excel) é de 15 MB. Para arquivos maiores, recomendamos subi-los para o Google Drive (ou similar) e adicionar o contexto como "Link Externo".</p>
            </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-50/50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800">P: Posso editar um contexto que já foi publicado?</h3>
            </div>
            <div className="p-4 prose text-gray-700 text-sm">
                <p>R: Não. Para garantir o histórico, contextos publicados não podem ser editados. Você deve criar uma "Nova Versão" dele. Vá até o contexto, abra os detalhes, clique na aba "Versões" e use o botão "+ Criar Nova Versão".</p>
                <p>Para mais detalhes, veja o guia <Link href="/ajuda/gerenciando-conteudo/nova-versao" className="text-blue-600 hover:underline">Criar Nova Versão</Link>.</p>
            </div>
        </div>
    </div>
  </div>
);
// --- Fim dos Componentes de Conteúdo ---

// Mapeamento de Hrefs para Componentes
const contentComponents: { [key: string]: React.FC } = {
  "/ajuda/suporte/contato": ContatoGTIContent,
  "/ajuda/suporte/reportar-bug": ReportarBugContent,
  "/ajuda/suporte/faq": FAQContent,
};

// Mapeamento de Hrefs para Ícones
const iconMap: { [key: string]: React.ElementType } = {
  "/ajuda/suporte/contato": Mail,
  "/ajuda/suporte/reportar-bug": Bug,
  "/ajuda/suporte/faq": MessageSquareQuoteIcon,
};

// Tópicos desta seção
const topicos = [
  { titulo: "Contato GTI", href: "/ajuda/suporte/contato" },
  { titulo: "Reportar um Problema", href: "/ajuda/suporte/reportar-bug" },
  { titulo: "Perguntas Frequentes (FAQ)", href: "/ajuda/suporte/faq" },
];

// --- Componente Principal da Página ---

export default function SuportePage() {
  const [activeTopicHref, setActiveTopicHref] = useState(topicos[0].href);
  const ActiveContentComponent = contentComponents[activeTopicHref] || ContatoGTIContent; // Fallback para o primeiro
  const [searchValue, setSearchValue] = useState("");

  const handleTopicSelect = (href: string) => {
      setActiveTopicHref(href);
      setSearchValue(""); // Limpa busca ao selecionar
       window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho Fixo da Área (Idêntico a primeiros-passos) */}
      <div className="border-b border-gray-200 bg-blue-50 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-700/80 mb-2">
                <Link href="/ajuda" className="hover:text-blue-900 transition-colors">
                  Ajuda
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-blue-900">Suporte</span>
              </div>
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-7 h-7 text-blue-700" /> {/* Ícone da Seção */}
                <h1 className="text-2xl font-bold text-blue-900">Suporte</h1>
              </div>
            </div>
            {/* Barra de Busca (Estilo "primeiros-passos") */}
            <div className="w-full md:w-full lg:max-w-3xl rounded-3xl">
               <SearchBar
                 placeholder="Buscar nesta seção..."
                 value={searchValue}
                 onChange={setSearchValue}
                 className="shadow-sm"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Sidebar (Layout idêntico) */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
        {/* Barra Lateral (Sidebar) */}
        <aside className="w-full md:w-64 flex-shrink-0 order-last md:order-first mr-3">
          <div className="sticky top-52">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Nesta Seção
            </h2>
            <nav className="space-y-1">
              {topicos.map((topico) => {
                const isActive = activeTopicHref === topico.href;
                const Icon = iconMap[topico.href] || ChevronRight;
                return (
                  <button
                    key={topico.href}
                    onClick={() => { handleTopicSelect(topico.href); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />
                    <span className="truncate">{topico.titulo.replace(/"/g, '&quot;')}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Conteúdo Principal (Direita) */}
        <main id="main-content-area" className="flex-1 min-w-0">
          <ActiveContentComponent />
          <div className="mt-16 pt-8 border-t border-gray-200">
            <Link href="/ajuda">
              <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-900 gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Central de Ajuda
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}