// src/app/ajuda/gerenciando-conteudo/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  FileUp,
  BarChart3,
  Gauge,
  CopyPlus,
  FilePlus, // Ícone da Área
  UploadCloud,
  FileText as FileTextIcon,
  Link as LinkIcon,
  Eye,
  Trash2,
  Database,
  Upload,
  PieChart,
  AreaChart,
  Heart,
  FileSymlink,
  LayoutDashboard,
  Expand,
  Users,
  History, // Adicionado para NovaVersaoContent
} from "lucide-react";
import { Button } from "@/components/ui/button"; //
import { cn } from "@/lib/utils"; //
// Remover imports não usados se Card não for usado diretamente aqui

// --- Componentes de Conteúdo dos Tópicos ---

const OQueEContextoContent = () => (
    <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-blue-600"/> O que é um &ldquo;Contexto&rdquo;?
            </h1>
            <p className="text-lg text-gray-600">
                A unidade fundamental de informação no VigiaSUS.
            </p>
        </header>

        <section className="prose max-w-none text-gray-700 space-y-4">
            <p>
                No VigiaSUS, um <strong>&ldquo;Contexto&rdquo;</strong> representa qualquer peça de informação relevante que você deseja registrar, compartilhar e acompanhar dentro da sua gerência ou diretoria. Pense nele como um container para seus dados importantes.
            </p>
            <p>
                Os contextos são a base para a organização e visualização das informações na plataforma. Eles podem ser de diferentes tipos, cada um adequado para um tipo específico de dado:
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Tipos de Contexto:</h2>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><FileTextIcon className="w-5 h-5 text-blue-600"/> Arquivos (PDF, DOC, Excel, etc.)</h3>
                <p className="text-sm text-gray-600">Para documentos estáticos como relatórios, planilhas, resoluções, portarias, comprovantes. Você faz o upload do arquivo.</p>
            </div>
             <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-green-600"/> Links Externos</h3>
                <p className="text-sm text-gray-600">Para referenciar páginas web, dashboards externos, documentos online (Google Drive, etc.) que não estão armazenados diretamente no VigiaSUS.</p>
            </div>
             <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-600"/> Dashboards (Gráficos)</h3>
                <p className="text-sm text-gray-600">Para visualizações de dados interativas (Pizza, Barras, Linha/Área) criadas diretamente na plataforma, seja inserindo os dados manualmente ou via upload de CSV.</p>
            </div>
             <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><Gauge className="w-5 h-5 text-teal-600"/> Indicadores (KPIs)</h3>
                <p className="text-sm text-gray-600">Para monitorar métricas chave de desempenho, com valor atual, meta (opcional), unidade, e comparação visual (tendência, cor, ícone).</p>
            </div>
        </section>

        <section className="prose max-w-none text-gray-700 mt-6">
            <p>
                Ao adicionar um contexto, ele passará por um <Link href="/ajuda/validacao/fluxo" className="text-blue-600 hover:underline">fluxo de validação</Link> para garantir sua qualidade e relevância antes de ser publicado na página da sua gerência.
            </p>
        </section>
    </div>
);

const AddArquivoLinkContent = () => (
    <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FileUp className="w-8 h-8 text-blue-600"/> Guia: Adicionando Arquivos ou Links
            </h1>
            <p className="text-lg text-gray-600">
                Compartilhe documentos importantes (PDF, Word, Excel) ou referencie páginas externas.
            </p>
        </header>

        <section className="prose max-w-none text-gray-700 space-y-4">
            <p>Adicionar arquivos ou links é o tipo mais comum de contexto. Siga estes passos:</p>

            <ol className="list-decimal pl-5 space-y-3">
                <li>
                    <strong>Abra o Modal:</strong> Clique no botão &ldquo;Adicionar Contexto&rdquo; (ícone <FilePlus className="inline w-4 h-4 mx-1"/>) na página da sua gerência ou na seção de validação/page.tsx].
                </li>
                <li>
                    <strong>Selecione a Aba &ldquo;Contexto&rdquo;:</strong> Certifique-se de que a aba &ldquo;Contexto&rdquo; (ícone <FilePlus className="inline w-4 h-4 mx-1"/>) esteja selecionada no topo do modal.
                    <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Modal Add Contexto com aba Contexto destacada]</span>
                </li>
                 <li>
                    <strong>Título:</strong> Dê um título claro e descritivo para o seu contexto. Este título aparecerá no card. Ex: <span className="italic">&ldquo;Relatório Mensal de Atendimentos - Setembro/2025&rdquo;</span>.
                </li>
                <li>
                    <strong>Anexar Fonte:</strong> Escolha <strong>uma</strong> das opções:
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>
                            <strong>Arquivo (<UploadCloud className="inline w-4 h-4 mx-1"/>):</strong> Arraste e solte o arquivo desejado (PDF, DOCX, XLSX, etc.) na área indicada, ou clique nela para selecionar o arquivo do seu computador. O nome e tamanho do arquivo aparecerão.
                            <br/>
                            <span className="text-xs italic text-gray-500">[IMAGEM: Área de Arrastar/Soltar ou seleção de arquivo]</span>
                        </li>
                        <li>
                            <strong>Link (<LinkIcon className="inline w-4 h-4 mx-1"/>):</strong> Clique no botão com ícone de link (🔗). Uma caixa de diálogo pedirá a URL completa. Cole o endereço web (ex: <span className="italic">https://site.com/documento.pdf</span>). O link inserido será exibido na área de anexo.
                        </li>
                    </ul>
                     <p className="text-xs text-gray-500 mt-1"><strong>Dica:</strong> Você pode usar os botões <Eye className="inline w-4 h-4 mx-0.5"/> (para links) e <Trash2 className="inline w-4 h-4 mx-0.5"/> para visualizar ou remover o anexo atual.</p>
                </li>
                 <li>
                    <strong>Detalhes (Descrição):</strong> Escreva uma breve descrição explicando o que é o arquivo/link e qual sua relevância ou período de referência.
                </li>
                <li>
                    <strong>Submeter:</strong> Clique no botão &ldquo;Submeter&rdquo; (ícone <FileSymlink className="inline w-4 h-4 mx-1"/>) no canto inferior direito. Seu contexto será enviado para validação.
                </li>
            </ol>
             <p className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <strong>Atenção:</strong> O título e o anexo (arquivo ou link) são obrigatórios para submeter o contexto.
             </p>
        </section>
    </div>
);


const AddGraficoContent = () => (
   <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600"/> Guia: Criando Gráficos (Dashboards)
            </h1>
            <p className="text-lg text-gray-600">
                Transforme seus dados em gráficos interativos de Pizza, Barras ou Linha/Área.
            </p>
        </header>

        <section className="prose max-w-none text-gray-700 space-y-4">
            <p>Crie visualizações dinâmicas diretamente no VigiaSUS:</p>

            <ol className="list-decimal pl-5 space-y-3">
                <li>
                    <strong>Abra o Modal:</strong> Clique em &ldquo;Adicionar Contexto&rdquo; (<FilePlus className="inline w-4 h-4 mx-1"/>).
                </li>
                <li>
                    <strong>Selecione a Aba &ldquo;Dashboard&rdquo;:</strong> Escolha a aba &ldquo;Dashboard&rdquo; (ícone <LayoutDashboard className="inline w-4 h-4 mx-1"/>) no topo do modal.
                </li>
                <li>
                    <strong>Título e Detalhes:</strong> Dê um título claro ao gráfico (Ex: <span className="italic">&ldquo;Atendimentos por Complexidade - 1º Semestre&rdquo;</span>) e uma descrição opcional sobre os dados.
                </li>
                <li>
                    <strong>Escolha o Tipo de Gráfico:</strong> Selecione entre Pizza (<PieChart className="inline w-4 h-4 mx-1"/>), Barras (<BarChart3 className="inline w-4 h-4 mx-1"/>) ou Área/Linha (<AreaChart className="inline w-4 h-4 mx-1"/>). A estrutura da tabela de dados se ajustará ligeiramente.
                    <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Seletor de tipo de gráfico destacando as opções]</span>
                </li>
                 <li>
                    <strong>Fonte dos Dados:</strong> Escolha como fornecer os dados:
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>
                            <strong>Dados Manuais (<Database className="inline w-4 h-4 mx-1"/>):</strong> Preencha a tabela interativa diretamente na tela.
                            <ul className="list-circle pl-5 mt-1 space-y-1">
                                <li>Use os botões <strong>&ldquo;+ Linha&rdquo;</strong> e <strong>&ldquo;+ Série (Coluna)&rdquo;</strong> para adicionar mais categorias ou séries de valores.</li>
                                <li>Clique nos títulos das colunas para renomeá-las.</li>
                                <li>Use o seletor abaixo do título da coluna de valor para definir o <strong>Formato</strong> (Número, Percentual, Moeda) - isso afeta a exibição no gráfico.</li>
                                <li>Use o ícone <Trash2 className="inline w-4 h-4 mx-0.5"/> para remover linhas ou colunas (exceto a primeira coluna e a primeira série de valores).</li>
                            </ul>
                             <span className="text-xs italic text-gray-500">[IMAGEM: Tabela de dados manuais com destaques nos botões e seletor de formato]</span>
                           
                        </li>
                        <li>
                            <strong>Upload de Arquivo (<Upload className="inline w-4 h-4 mx-1"/>):</strong> Baixe o arquivo modelo CSV clicando em <strong>&ldquo;Baixar template de exemplo&rdquo;</strong>. Preencha o CSV com seus dados (mantendo os cabeçalhos) e faça o upload clicando na área indicada ou arrastando o arquivo.
                            <br/>
                            <span className="text-xs italic text-gray-500">[IMAGEM: Área de upload de arquivo com botão de template]</span>
                        </li>
                    </ul>
                </li>
                 <li>
                    <strong>Tema de Cores (Opcional):</strong> Escolha uma paleta de cores predefinida para o seu gráfico.
                </li>
                <li>
                    <strong>Gerar Pré-visualização:</strong> Clique no botão <strong>&ldquo;Gerar Gráfico&rdquo; / &ldquo;Atualizar Gráfico&rdquo;</strong> para ver como ele ficará. Você pode visualizar em tela cheia (<Expand className="inline w-4 h-4 mx-1"/>).
                     <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Pré-visualização do gráfico com botão de atualizar]</span>
                </li>
                <li>
                    <strong>Submeter:</strong> Se estiver satisfeito, clique em &ldquo;Submeter&rdquo; (<FileSymlink className="inline w-4 h-4 mx-1"/>).
                </li>
            </ol>
        </section>
    </div>
);

const AddIndicadorContent = () => (
   <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Gauge className="w-8 h-8 text-blue-600"/> Guia: Adicionando Indicadores (KPIs)
            </h1>
            <p className="text-lg text-gray-600">
                Monitore métricas importantes com cards visuais de desempenho.
            </p>
        </header>

         <section className="prose max-w-none text-gray-700 space-y-4">
            <p>Indicadores (KPIs - Key Performance Indicators) são ótimos para destacar e acompanhar métricas chave de forma rápida e visual.</p>

            <ol className="list-decimal pl-5 space-y-3">
                <li>
                    <strong>Abra o Modal:</strong> Clique em &ldquo;Adicionar Contexto&rdquo; (<FilePlus className="inline w-4 h-4 mx-1"/>).
                </li>
                <li>
                    <strong>Selecione a Aba &ldquo;Indicador&rdquo;:</strong> Escolha a aba &ldquo;Indicador&rdquo; (ícone <Gauge className="inline w-4 h-4 mx-1"/>) no topo do modal.
                    <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Modal Add Contexto com aba Indicador destacada]</span>
                </li>
                 <li>
                    <strong>Título:</strong> Nome claro para o indicador (Ex: <span className="italic">&ldquo;Cobertura Vacinal Pólio&rdquo;</span>).
                </li>
                <li>
                    <strong>Descrição:</strong> Explicação breve do que o indicador mede (Ex: <span className="italic">&ldquo;% Crianças menores de 1 ano vacinadas&rdquo;</span>).
                </li>
                 <li>
                    <strong>Valor Atual:</strong> O número ou percentual mais recente do indicador (Ex: <span className="italic">&ldquo;92%&rdquo;</span> ou <span className="italic">&ldquo;1.250&rdquo;</span>). Este é um campo obrigatório.
                </li>
                 <li>
                    <strong>Unidade:</strong> Selecione a unidade de medida na lista (%, R$, Pessoas, Dias, Nenhum, etc.).
                     <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Dropdown de Unidades]</span>
                </li>
                 <li>
                    <strong>Valor Alvo (Meta - Opcional):</strong> Defina a meta a ser alcançada (Ex: <span className="italic">&ldquo;95%&rdquo;</span>).
                </li>
                 <li>
                    <strong>Texto Comparativo (Opcional):</strong> Uma frase curta para dar contexto (Ex: <span className="italic">&ldquo;+2% vs mês anterior&rdquo;</span>, <span className="italic">&ldquo;-5 dias na fila&rdquo;</span>, <span className="italic">&ldquo;— Sem alteração&rdquo;</span>). Use `+`, `-` ou `—` no início para indicar a tendência (positivo, negativo, neutro) - isso afetará a cor e o ícone (▲/▼) no card.
                </li>
                 <li>
                    <strong>Ícone e Cor:</strong> Escolha um ícone (<Heart className="inline w-4 h-4 mx-0.5"/>, <Users className="inline w-4 h-4 mx-0.5"/>, etc.) e uma cor que representem o indicador visualmente. A cor será usada na borda do card.
                     <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Seletores de Ícone e Cor]</span>
                </li>
                 <li>
                    <strong>Pré-visualização:</strong> Um card de exemplo será atualizado automaticamente à medida que você preenche os campos, mostrando como o indicador final aparecerá.
                     <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Pré-visualização do card do indicador]</span>
                </li>
                <li>
                    <strong>Submeter:</strong> Clique em &ldquo;Submeter&rdquo; (<FileSymlink className="inline w-4 h-4 mx-1"/>).
                </li>
            </ol>
             <p className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <strong>Atenção:</strong> Título e Valor Atual são obrigatórios para submeter um indicador.
             </p>
        </section>
    </div>
);

const NovaVersaoContent = () => (
   <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <CopyPlus className="w-8 h-8 text-blue-600"/> Como criar uma Nova Versão?
            </h1>
            <p className="text-lg text-gray-600">
                Mantenha seus contextos atualizados ou corrija informações.
            </p>
        </header>

         <section className="prose max-w-none text-gray-700 space-y-4">
            <p>
                Quando um contexto precisa ser atualizado (ex: um relatório mensal, dados de um gráfico que mudaram) ou corrigido, você não edita o original diretamente. Em vez disso, você cria uma <strong>Nova Versão</strong>. Isso mantém um histórico de como a informação evoluiu.
            </p>
             <p className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                <strong>Importante:</strong> Geralmente, apenas o criador original do contexto (Perfil Membro) pode criar novas versões, especialmente se o contexto foi devolvido para correção.
             </p>

            <h2 className="text-xl font-semibold text-gray-800 pt-4">Passos para Criar uma Nova Versão:</h2>

            <ol className="list-decimal pl-5 space-y-3">
                <li>
                    <strong>Localize o Contexto:</strong> Encontre o card do contexto que você deseja atualizar na página da sua gerência ou na seção &ldquo;Contextos Enviados&rdquo;.
                </li>
                <li>
                    <strong>Abra os Detalhes:</strong> Clique no card para abrir a janela de visualização de detalhes.
                </li>
                <li>
                    <strong>Vá para a Aba &ldquo;Versões&rdquo;:</strong> Clique na aba &ldquo;Versões&rdquo; (ícone <History className="inline w-4 h-4 mx-1"/>).
                     <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Modal de Visualização com aba Versões destacada]</span>
                </li>
                 <li>
                    <strong>Clique em &ldquo;Criar Nova Versão&rdquo;:</strong> Se você tiver permissão, verá um botão &ldquo;+ Criar Nova Versão&rdquo;. Clique nele.
                 </li>
                 <li>
                    <strong>Modal de Nova Versão:</strong> O modal de &ldquo;Adicionar Contexto&rdquo; abrirá, mas pré-preenchido com as informações da versão anterior (Título, tipo, etc.) e marcado como &ldquo;NOVA VERSÃO&rdquo;.
                     <br/>
                    <span className="text-xs italic text-gray-500">[IMAGEM: Modal Add Contexto no modo Nova Versão]</span>
                 </li>
                  <li>
                    <strong>Atualize a Fonte:</strong> Anexe o <strong>novo arquivo</strong>, insira o <strong>novo link</strong>, atualize os <strong>dados manuais</strong> do gráfico ou insira o <strong>novo valor</strong> do indicador. <strong>Este passo é obrigatório.</strong>.
                </li>
                <li>
                    <strong>Descreva a Alteração:</strong> Selecione o <strong>Motivo da Alteração</strong> (Ex: &ldquo;Correção&rdquo;, &ldquo;Atualização Mensal&rdquo;) e escreva uma <strong>Descrição das Alterações</strong> detalhando o que mudou nesta versão (Ex: <span className="italic">&ldquo;Atualizados dados para Outubro/2025&rdquo;</span>, <span className="italic">&ldquo;Corrigido valor da Linha 5&rdquo;</span>). <strong>A descrição é obrigatória</strong>.
                </li>
                <li>
                    <strong>Submeter:</strong> Clique em &ldquo;Submeter&rdquo;. A nova versão será enviada para o fluxo de validação normal (começando pelo Gerente).
                </li>
            </ol>
             <p className="mt-4 text-sm text-gray-600">
                A versão antiga permanecerá no histórico, acessível pela aba &ldquo;Versões&rdquo;. A nova versão se tornará a principal após ser aprovada.
             </p>
        </section>
    </div>
);


// --- Mapeamentos e Componente Principal ---
const contentComponents: { [key: string]: React.FC } = {
  "/ajuda/gerenciando-conteudo/o-que-e-contexto": OQueEContextoContent,
  "/ajuda/gerenciando-conteudo/add-arquivo-link": AddArquivoLinkContent,
  "/ajuda/gerenciando-conteudo/add-grafico": AddGraficoContent,
  "/ajuda/gerenciando-conteudo/add-indicador": AddIndicadorContent,
  "/ajuda/gerenciando-conteudo/nova-versao": NovaVersaoContent,
};

const iconMap: { [key: string]: React.ElementType } = {
  "/ajuda/gerenciando-conteudo/o-que-e-contexto": HelpCircle,
  "/ajuda/gerenciando-conteudo/add-arquivo-link": FileUp,
  "/ajuda/gerenciando-conteudo/add-grafico": BarChart3,
  "/ajuda/gerenciando-conteudo/add-indicador": Gauge,
  "/ajuda/gerenciando-conteudo/nova-versao": CopyPlus,
};

const topicos = [
  { titulo: "O que é um \"Contexto\"?", href: "/ajuda/gerenciando-conteudo/o-que-e-contexto" },
  { titulo: "Guia: Add Arquivos/Links", href: "/ajuda/gerenciando-conteudo/add-arquivo-link" },
  { titulo: "Guia: Criar Gráficos", href: "/ajuda/gerenciando-conteudo/add-grafico" },
  { titulo: "Guia: Add Indicadores", href: "/ajuda/gerenciando-conteudo/add-indicador" },
  { titulo: "Criar Nova Versão", href: "/ajuda/gerenciando-conteudo/nova-versao" },
];

export default function GerenciandoConteudoPage() {
  const [activeTopicHref, setActiveTopicHref] = useState(topicos[0].href);
  const ActiveContentComponent = contentComponents[activeTopicHref] || OQueEContextoContent;

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho Fixo da Área */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/ajuda" className="hover:text-blue-600 transition-colors"> Ajuda </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Adicionando Conteúdo</span>
          </div>
          <div className="flex items-center gap-3">
            <FilePlus className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Adicionando e Gerenciando Conteúdo</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Sidebar */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
         {/* Sidebar Esquerda (Navegação) */}
        <aside className="w-full md:w-64 flex-shrink-0 order-last md:order-first">
          <div className="sticky top-40">
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
                    onClick={() => {
                      setActiveTopicHref(topico.href);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
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