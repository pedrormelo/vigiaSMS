// src/app/ajuda/validacao/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Bell,
  Home,
  BookCheck,
  GalleryVerticalEnd,
  Layers,
  MessageSquareMore,
  FolderClock,
  UserCog,
  UserCheck as UserCheckIcon,
  User as UserIcon,
  // Ícones específicos desta seção
  Send,
  FileCheck,
  FileX,
  BellRing,
  MessageSquare,
  History
} from "lucide-react";
import { HiOutlineLogout } from "react-icons/hi";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar-faq"; // Usando a mesma barra de busca de "primeiros-passos"

// --- Componentes de Conteúdo dos Tópicos ---

const FluxoValidacaoContent = () => (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
          <Send className="w-9 h-9 text-blue-600"/> O Fluxo de Validação
        </h1>
        <p className="text-xl text-gray-600">
          Garantindo a qualidade da informação em 3 etapas.
        </p>
      </div>

      {/* [IMAGEM: Um infográfico simples mostrando: (Membro) -> (Gerente) -> (Diretor) -> (Publicado)] */}
      <Image src="/ajuda/validar/1.png" width={1000} height={150} alt="Fluxo de validação: Membro envia para Gerente, que envia para Diretor, que Publica." className="rounded-lg shadow-md mb-4" />

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <p>
          Para garantir que todas as informações no <strong>VigiaSUS</strong> sejam precisas, relevantes e corretas, cada novo "Contexto" (seja um arquivo, gráfico ou indicador) passa por um fluxo de aprovação simples antes de se tornar público para a gerência ou diretoria.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">As Etapas do Fluxo:</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <UserIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"/>
              <div>
                  <h3 className="font-semibold text-gray-800">1. Submissão (Membro)</h3>
                  <p className="text-sm text-gray-600">Um usuário com perfil de <strong>Membro</strong> cria um novo contexto (ex: um relatório PDF ou um gráfico de dashboard) e o submete para análise. O status inicial é <span className="font-semibold text-yellow-700">"Aguardando Gerente"</span>.</p>
              </div>
          </div>
           <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <UserCog className="w-6 h-6 text-green-600 flex-shrink-0 mt-1"/>
              <div>
                  <h3 className="font-semibold text-gray-800">2. Análise do Gerente</h3>
                  <p className="text-sm text-gray-600">O <strong>Gerente</strong> daquela gerência recebe uma notificação. Ele revisa o conteúdo e pode tomar duas ações: "Deferir" (aprovar) ou "Indeferir" (pedir correção). Se aprovado, o status muda para <span className="font-semibold text-yellow-700">"Aguardando Diretor"</span>.</p>
              </div>
          </div>
           <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <UserCheckIcon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1"/>
              <div>
                  <h3 className="font-semibold text-gray-800">3. Análise do Diretor</h3>
                  <p className="text-sm text-gray-600">O <strong>Diretor(a)</strong> da diretoria correspondente recebe o contexto pré-aprovado pelo gerente. O Diretor faz a validação final. Se o Diretor "Deferir", o status muda para <span className="font-semibold text-blue-700">"Publicado"</span> e o contexto aparece na página da gerência.</p>
              </div>
          </div>
           <div className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50/50">
              <FileCheck className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1"/>
              <div>
                  <h3 className="font-semibold text-gray-800">4. Publicado</h3>
                  <p className="text-sm text-gray-600">O contexto está aprovado e visível para os usuários que têm permissão para vê-lo na plataforma.</p>
              </div>
          </div>
        </div>
      </div>
    </div>
);

const AcoesValidacaoContent = () => (
    <div className="space-y-10">
        <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <FileCheck className="w-9 h-9 text-blue-600"/> Ações: Deferir vs. Indeferir
            </h1>
            <p className="text-xl text-gray-600">O que acontece quando você aprova ou reprova um contexto.</p>
        </div>

        {/* [IMAGEM: Captura do modal "DetalhesContextoModal" mostrando os botões "Indeferir" (vermelho) e "Deferir" (verde) no rodapé] */}
        <Image src="/ajuda/validacao/botoes-validacao.png" width={1000} height={100} alt="Botões Deferir e Indeferir no modal de análise" className="rounded-lg shadow-md mb-4" />

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p>
                Quando um Gerente ou Diretor analisa um contexto pendente, ele utiliza o modal de <strong>"Análise de Contexto"</strong>. No rodapé deste modal, existem duas ações principais:
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-green-200 rounded-lg p-6 bg-green-50/50">
                <h3 className="text-2xl font-semibold text-green-800 mb-3 flex items-center gap-2"><FileCheck className="w-7 h-7"/> Deferir (Aprovar)</h3>
                <div className="prose text-gray-700">
                    <p>Esta ação significa que o conteúdo está correto e apropriado para publicação.</p>
                    <ul>
                        <li><strong>Se o Gerente defere:</strong> O contexto avança para o Diretor (Status: "Aguardando Diretor").</li>
                        <li><strong>Se o Diretor defere:</strong> O contexto é aprovado e se torna público (Status: "Publicado").</li>
                    </ul>
                </div>
            </div>
            <div className="border border-red-200 rounded-lg p-6 bg-red-50/50">
                <h3 className="text-2xl font-semibold text-red-800 mb-3 flex items-center gap-2"><FileX className="w-7 h-7"/> Indeferir (Pedir Correção)</h3>
                 <div className="prose text-gray-700">
                    <p>Esta ação é usada se o contexto contém erros, informações faltantes ou precisa de qualquer ajuste.</p>
                    <ul>
                        <li>Ao clicar em "Indeferir", um modal aparecerá solicitando uma <strong>justificativa obrigatória</strong>.</li>
                        <li>O contexto é devolvido ao Membro que o criou (Status: <span className="font-semibold text-red-700">"Aguardando Correção"</span>).</li>
                        <li>O Membro verá a justificativa nos comentários e poderá submeter uma <Link href="/ajuda/gerenciando-conteudo/nova-versao" className="text-blue-600 hover:underline">nova versão</Link> com os ajustes.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);


const CentralNotificacoesContent = () => (
  <div className="space-y-10">
    <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <BellRing className="w-9 h-9 text-blue-600"/> Central de Notificações
        </h1>
        <p className="text-xl text-gray-600">Mantenha-se informado sobre tudo o que acontece.</p>
    </div>
    
    {/* [IMAGEM: Captura de tela da Navbar destacando o ícone de sino (Bell) com um contador vermelho] */}
    <Image src="/ajuda/validacao/icone-notificacao.png" width={400} height={70} alt="Ícone de sino de notificações na barra de navegação" className="rounded-lg shadow-md mb-4" />


    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
      <p>
        O ícone de sino (<Bell className="inline w-5 h-5"/>) na barra de navegação é a sua <strong>Central de Notificações</strong>. Ele é o principal meio de comunicação sobre as atividades que exigem sua atenção ou atualizações importantes.
      </p>
    </div>

    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">O que você verá aqui:</h2>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800 mb-2">1. Solicitações de Validação (Para Gerentes/Diretores)</h3>
           <p className="text-sm text-gray-600">Você será notificado quando um novo contexto for submetido e estiver aguardando sua análise (Ex: <span className="italic">&ldquo;Aguardando análise do Gerente&rdquo;</span>).</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800 mb-2">2. Status de Contextos (Para Membros)</h3>
           <p className="text-sm text-gray-600">Você saberá quando o contexto que você enviou foi "Deferido", "Publicado" ou "Indeferido" (devolvido para correção).</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800 mb-2">3. Comentários e Menções</h3>
           <p className="text-sm text-gray-600">Se alguém adicionar um comentário em um contexto que você criou ou está validando, ou se você for mencionado, uma notificação aparecerá.</p>
        </div>
         <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800 mb-2">4. Avisos do Sistema</h3>
           <p className="text-sm text-gray-600">Notificações sobre atualizações da plataforma, manutenções programadas ou outros avisos importantes.</p>
        </div>
      </div>
    </div>
    
    {/* [IMAGEM: Captura de tela do modal "NotificationsModal" aberto, mostrando a lista de notificações à esquerda e o detalhe de uma notificação à direita] */}
    <Image src="/ajuda/validacao/modal-notificacoes.png" width={1000} height={500} alt="Modal da Central de Notificações" className="rounded-lg shadow-md mt-8" />
    
  </div>
);


const ComentariosContent = () => (
    <div className="space-y-10">
        <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <MessageSquare className="w-9 h-9 text-blue-600"/> Comentários e Histórico
            </h1>
            <p className="text-xl text-gray-600">Acompanhe a discussão e as mudanças em um contexto.</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p>
                Cada contexto possui um registro detalhado de todas as ações e discussões. Isso é crucial para a transparência e para entender por que uma decisão foi tomada.
            </p>
        </div>

        {/* [IMAGEM: Captura do modal "DetalhesContextoModal" aberto, com a aba "Histórico" selecionada, mostrando a timeline visual e a lista de comentários/justificativas] */}
        <Image src="/ajuda/validacao/aba-historico.png" width={1000} height={500} alt="Aba de Histórico e Comentários no modal de detalhes" className="rounded-lg shadow-md mb-4" />

        <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600"/> Comentários e Justificativas</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    Esta seção, dentro da aba "Histórico" do modal de detalhes, exibe todas as mensagens trocadas sobre o contexto.
                </p>
                <strong className="text-sm text-gray-800">Usos Principais:</strong>
                <div className="space-y-2 text-sm text-gray-600 mt-2">
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" /> <strong>Justificativas de Indeferimento:</strong> Quando um Gerente ou Diretor "Indefere" um contexto, o motivo escrito por ele aparece aqui como um comentário (geralmente com fundo verde ou roxo).</div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" /> <strong>Tirar Dúvidas:</strong> Qualquer pessoa com acesso ao modal (Membro, Gerente, Diretor) pode adicionar um comentário para pedir esclarecimentos ou fornecer informações adicionais.</div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><History className="w-5 h-5 text-gray-600"/> Histórico de Ações</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    Abaixo dos comentários, você encontra um registro cronológico de todas as ações automatizadas ou manuais realizadas no contexto.
                </p>
                 <strong className="text-sm text-gray-800">Exemplos de Ações:</strong>
                <div className="space-y-2 text-sm text-gray-600 mt-2">
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" /> <span className="italic">&ldquo;Submetido para análise por [Membro]&rdquo;</span></div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" /> <span className="italic">&ldquo;Análise Gerente: Deferido por [Gerente]&rdquo;</span></div>
                    <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" /> <span className="italic">&ldquo;Análise Diretor: Devolvido para correção por [Diretor]&rdquo;</span></div>
                     <div className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" /> <span className="italic">&ldquo;Finalizado como Publicado por Sistema&rdquo;</span></div>
                </div>
            </div>
        </div>
    </div>
);
// --- Fim dos Componentes de Conteúdo ---

// Mapeamento de Hrefs para Componentes
const contentComponents: { [key: string]: React.FC } = {
  "/ajuda/validacao/fluxo": FluxoValidacaoContent,
  "/ajuda/validacao/acoes": AcoesValidacaoContent,
  "/ajuda/validacao/notificacoes": CentralNotificacoesContent,
  "/ajuda/validacao/comentarios": ComentariosContent,
};

// Mapeamento de Hrefs para Ícones
const iconMap: { [key: string]: React.ElementType } = {
  "/ajuda/validacao/fluxo": Send,
  "/ajuda/validacao/acoes": FileCheck,
  "/ajuda/validacao/notificacoes": BellRing,
  "/ajuda/validacao/comentarios": MessageSquare,
};

// Tópicos desta seção
const topicos = [
  { titulo: "Fluxo de Validação", href: "/ajuda/validacao/fluxo" },
  { titulo: "Ações: Deferir/Indeferir", href: "/ajuda/validacao/acoes" },
  { titulo: "Central de Notificações", href: "/ajuda/validacao/notificacoes" },
  { titulo: "Comentários e Histórico", href: "/ajuda/validacao/comentarios" },
];

// --- Componente Principal da Página ---

export default function ValidacaoPage() {
  const [activeTopicHref, setActiveTopicHref] = useState(topicos[0].href);
  const ActiveContentComponent = contentComponents[activeTopicHref] || FluxoValidacaoContent;
  const [searchValue, setSearchValue] = useState("");

  const handleTopicSelect = (href: string) => {
      setActiveTopicHref(href);
      setSearchValue(""); // Limpa busca ao selecionar
       window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho Fixo da Área */}
      <div className="border-b border-gray-200 bg-blue-50 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-700/80 mb-2">
                <Link href="/ajuda" className="hover:text-blue-900 transition-colors">
                  Ajuda
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-blue-900">Validação e Colaboração</span>
              </div>
              <div className="flex items-center gap-3">
                <BookCheck className="w-7 h-7 text-blue-700" /> {/* Ícone da Seção */}
                <h1 className="text-2xl font-bold text-blue-900">Validação e Colaboração</h1>
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

      {/* Conteúdo Principal com Sidebar */}
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