// src/app/ajuda/gerenciando-conteudo/page.tsx

"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, BookOpen, ChevronRight, Navigation, Users, HelpCircle, LayoutDashboard, History, FilePlus, FileSymlink, UploadCloud, FileText as FileTextIcon, Link as LinkIcon, Eye, Trash2, Database, Upload, PieChart, BarChart3, AreaChart, Gauge, CopyPlus, SearchX, FileUp, Expand, Heart,
  Settings,
  Loader2
} from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// ATUALIZADO: Importar a SearchBar padrão
import { SearchBar } from "@/components/ui/search-bar-faq";
import { buildHelpSearchTokens, searchAjudaEntries } from "@/lib/ajudaSearch";
import type { HelpSearchEntry } from "@/constants/ajudaSearchIndex";

// --- Componentes de Conteúdo dos Tópicos (Permanecem os mesmos) ---

const OQueEContextoContent = () => (
    <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-blue-600"/> O que é um &ldquo;Contexto&rdquo;?
            </h1>
            <p className="text-lg text-gray-600">
                A unidade fundamental de informação no SIGE.
            </p>
        </header>
        {/* [IMAGEM: Visão geral da tela de gerência mostrando cards de diferentes tipos de contexto] */}
        {/* <Image src="/caminho/para/imagem.png" width={800} height={200} alt="Visão geral dos cards de contexto" className="rounded-lg shadow-md mb-4" /> */}
        <section className="prose max-w-none text-gray-700 space-y-4">
            <p>No SIGE (Sistema Integrado de Gestão Estratégica em Saúde), um <strong>&ldquo;Contexto&rdquo;</strong> representa qualquer peça de informação relevante que você deseja registrar, compartilhar e acompanhar dentro da sua gerência ou diretoria. Pense nele como uma caixa organizadora para seus dados importantes.</p>
            <p>Os contextos são a base para a organização e visualização das informações na plataforma. Eles podem ser de diferentes tipos, cada um adequado para um tipo específico de dado:</p>
        </section>
        <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Tipos de Contexto:</h2>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50"><h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><FileTextIcon className="w-5 h-5 text-blue-600"/> Arquivos (PDF, DOC, Excel, etc.)</h3><p className="text-sm text-gray-600">Para documentos estáticos como relatórios, planilhas, resoluções, portarias, comprovantes. Você faz o upload do arquivo.</p></div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50"><h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-green-600"/> Links Externos</h3><p className="text-sm text-gray-600">Para referenciar páginas web, dashboards externos, documentos online (Google Drive, etc.) que não estão armazenados diretamente no SIGE.</p></div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50"><h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-600"/> Dashboards (Gráficos)</h3><p className="text-sm text-gray-600">Para visualizações de dados interativas (Pizza, Barras, Linha/Área) criadas diretamente na plataforma, seja inserindo os dados manualmente ou via upload de CSV.</p></div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50"><h3 className="font-medium text-gray-700 mb-1 flex items-center gap-2"><Gauge className="w-5 h-5 text-teal-600"/> Indicadores (KPIs)</h3><p className="text-sm text-gray-600">Para monitorar métricas chave de desempenho, com valor atual, meta (opcional), unidade, e comparação visual (tendência, cor, ícone).</p></div>
        </section>
        <section className="prose max-w-none text-gray-700 mt-6">
            <p>Ao adicionar um contexto, ele passará por um <Link href="/ajuda/validacao/fluxo" className="text-blue-600 hover:underline">fluxo de validação</Link> para garantir sua qualidade e relevância antes de ser publicado na página da sua gerência.</p>
        </section>
    </div>
);

const AddArquivoLinkContent = () => (
    <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3"><FileUp className="w-8 h-8 text-blue-600"/> Guia: Adicionando Arquivos ou Links</h1>
            <p className="text-lg text-gray-600">Compartilhe documentos importantes (PDF, Word, Excel) ou referencie páginas externas.</p>
        </header>
        <section className="prose max-w-none text-gray-700 space-y-4">
            <p>Adicionar arquivos ou links é o tipo mais comum de contexto. Siga estes passos:</p>
            <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Abra o Modal:</strong> Clique no botão &ldquo;Adicionar Contexto&rdquo; (ícone <FilePlus className="inline w-4 h-4 mx-1"/>) na página da sua gerência ou na seção de validação.</li>
                <li><strong>Título:</strong> Dê um título claro e descritivo para o seu contexto. Este título aparecerá no card. Ex: <span className="italic">&ldquo;Relatório Mensal de Atendimentos - Setembro/2025&rdquo;</span>.</li>
                <li><strong>Anexar Fonte:</strong> Escolha <strong>uma</strong> das opções:
                    <ul className="list-disc pl-5 mt-2 space-y-2">                   
                        <li><strong>Arquivo (<UploadCloud className="inline w-4 h-4 mx-1"/>):</strong> Arraste e solte o arquivo desejado (PDF, DOCX, XLSX, etc.) na área indicada, ou clique nela para selecionar o arquivo do seu computador. O nome e tamanho do arquivo aparecerão.<br/><Image src="/ajuda/contextos/1.png" width={1000} height={40} alt="IMAGEM: Detalhe da área de upload de arquivo, mostrando a opção de arrastar/soltar e o botão de selecionar" className="rounded-md my-2" /></li>
                        <li><strong>Link (<LinkIcon className="inline w-4 h-4 mx-1"/>):</strong> Clique no botão com ícone de link (🔗). Uma caixa de diálogo pedirá a URL completa. Cole o endereço web (ex: <span className="italic">https://site.com/documento.pdf</span>). O link inserido será exibido na área de anexo. <br/><Image src="/ajuda/contextos/2.png" width={1000} height={40} alt="IMAGEM: Botão de link destacado e a caixa de prompt para inserir a URL" className="rounded-md my-2" /></li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-1"><strong>Dica:</strong> Você pode usar os botões <Eye className="inline w-4 h-4 mx-0.5"/> (para links) e <Trash2 className="inline w-4 h-4 mx-0.5"/> para visualizar ou remover o anexo atual.</p>
                </li>
                <li><strong>Detalhes (Descrição):</strong> Escreva uma breve descrição explicando o que é o arquivo/link e qual sua relevância ou período de referência.</li>
                <li><strong>Submeter:</strong> Clique no botão &ldquo;Submeter&rdquo; (ícone <FileSymlink className="inline w-4 h-4 mx-1"/>) no canto inferior direito. Seu contexto será enviado para validação.</li>
            </ol>
            <p className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800"><strong>Atenção:</strong> O título e o anexo (arquivo ou link) são obrigatórios para submeter o contexto.</p>
        </section>
    </div>
);

const AddGraficoContent = () => (
   <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3"><BarChart3 className="w-8 h-8 text-blue-600"/> Guia: Criando Gráficos (Dashboards)</h1>
            <p className="text-lg text-gray-600">Transforme seus dados em gráficos interativos de Pizza, Barras ou Linha/Área.</p>
        </header>
        <section className="prose max-w-none text-gray-700 space-y-4">
            <p>Crie visualizações dinâmicas diretamente no SIGE:</p>
            <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Abra o Modal:</strong> Clique em &ldquo;Adicionar Contexto&rdquo; (<FilePlus className="inline w-4 h-4 mx-1"/>).</li>
                <li><strong>Selecione a Aba &ldquo;Dashboard&rdquo;:</strong> Escolha a aba &ldquo;Dashboard&rdquo; (ícone <LayoutDashboard className="inline w-4 h-4 mx-1"/>) no topo do modal. <br/><Image src="/ajuda/contextos/3.png" width={1000} height={40} alt="IMAGEM: Captura do modal &ldquo;Adicionar Contexto&rdquo; com a aba &ldquo;Dashboard&rdquo; selecionada" className="rounded-md my-2" /></li>
                <li><strong>Título e Detalhes:</strong> Dê um título claro ao gráfico (Ex: <span className="italic">&ldquo;Atendimentos por Complexidade - 1º Semestre&rdquo;</span>) e uma descrição opcional sobre os dados.</li>
                <li><strong>Escolha o Tipo de Gráfico:</strong> Selecione entre Pizza (<PieChart className="inline w-4 h-4 mx-1"/>), Barras (<BarChart3 className="inline w-4 h-4 mx-1"/>) ou Área/Linha (<AreaChart className="inline w-4 h-4 mx-1"/>). A estrutura da tabela de dados se ajustará ligeiramente.<br/><Image src="/ajuda/contextos/4.png" width={1000} height={40} alt="IMAGEM: Seletor de tipo de gráfico destacando as opções Pizza, Barras e Área" className="rounded-md my-2" /></li>
                <li><strong>Fonte dos Dados:</strong> Escolha como fornecer os dados:
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>Dados Manuais (<Database className="inline w-4 h-4 mx-1"/>):</strong> Preencha a tabela interativa diretamente na tela.
                            <ul className="list-circle pl-5 mt-1 space-y-1">
                                <li>Use os botões <strong>&ldquo;+ Adicionar Categoria (Linha)&rdquo;</strong> e <strong>&ldquo;+ Adicionar Série&rdquo;</strong> para adicionar mais categorias ou séries de valores.</li>
                                <li>Clique nos títulos das colunas para renomeá-las (Ex: &ldquo;Categoria &rdquo;, &ldquo;Série 1 &rdquo;).</li>
                                <li>Use o seletor (<Settings className="inline w-3 h-3"/>) abaixo do título da coluna de valor para definir o <strong>Formato</strong> (Número, Percentual, Moeda) - isso afeta a exibição no gráfico.</li>
                                <li>Use o ícone <Trash2 className="inline w-4 h-4 mx-0.5"/> para remover linhas ou colunas (exceto a primeira coluna e a primeira série de valores).</li>
                            </ul>
                             {/* [IMAGEM: Tabela de dados manuais com destaques nos botões de adicionar linha/coluna, edição de título e seletor de formato] */}
                             {/* <Image src="/caminho/para/tabela-manual.png" width={800} height={300} alt="Tabela de dados manuais" className="rounded-md my-2" /> */}
                        </li>
                        <li><strong>Upload de Arquivo (<Upload className="inline w-4 h-4 mx-1"/>):</strong> Baixe o arquivo modelo CSV clicando em <strong>&ldquo;Baixar template de exemplo&rdquo;</strong>. Preencha o CSV com seus dados (mantendo os cabeçalhos) e faça o upload clicando na área indicada ou arrastando o arquivo.<br/>
                            {/* [IMAGEM: Área de upload de arquivo CSV, destacando o botão de baixar template] */}
                            {/* <Image src="/caminho/para/upload-csv.png" width={800} height={150} alt="Área de upload de CSV" className="rounded-md my-2" /> */}
                        </li>
                    </ul>
                </li>
                <li><strong>Tema de Cores (Opcional):</strong> Escolha uma paleta de cores predefinida para o seu gráfico. <br/>
                    {/* [IMAGEM: Seção de seleção de tema de cores com as bolinhas coloridas] */}
                    {/* <Image src="/caminho/para/seletor-cores.png" width={800} height={100} alt="Seletor de cores" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Gerar Pré-visualização:</strong> Clique no botão <strong>&ldquo;Gerar Gráfico&rdquo; / &ldquo;Atualizar Gráfico&rdquo;</strong> para ver como ele ficará. Você pode visualizar em tela cheia (<Expand className="inline w-4 h-4 mx-1"/>).<br/>
                    {/* [IMAGEM: Área de pré-visualização do gráfico com o botão "Atualizar Gráfico" e o ícone de tela cheia] */}
                    {/* <Image src="/caminho/para/preview-grafico.png" width={800} height={300} alt="Preview do gráfico" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Submeter:</strong> Se estiver satisfeito, clique em &ldquo;Submeter&rdquo; (<FileSymlink className="inline w-4 h-4 mx-1"/>).</li>
            </ol>
        </section>
    </div>
);

const AddIndicadorContent = () => (
   <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3"><Gauge className="w-8 h-8 text-blue-600"/> Guia: Adicionando Indicadores (KPIs)</h1>
            <p className="text-lg text-gray-600">Monitore métricas importantes com cards visuais de desempenho.</p>
        </header>
         <section className="prose max-w-none text-gray-700 space-y-4">
            <p>Indicadores (KPIs - Key Performance Indicators) são ótimos para destacar e acompanhar métricas chave de forma rápida e visual.</p>
            <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Abra o Modal:</strong> Clique em &ldquo;Adicionar Contexto&rdquo; (<FilePlus className="inline w-4 h-4 mx-1"/>).</li>
                <li><strong>Selecione a Aba &ldquo;Indicador&rdquo;:</strong> Escolha a aba &ldquo;Indicador&rdquo; (ícone <Gauge className="inline w-4 h-4 mx-1"/>) no topo do modal.<br/>
                    {/* [IMAGEM: Captura do modal "Adicionar Contexto" com a aba "Indicador" selecionada] */}
                    {/* <Image src="/caminho/para/modal-indicador.png" width={800} height={100} alt="Modal com aba Indicador" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Título:</strong> Nome claro para o indicador (Ex: <span className="italic">&ldquo;Cobertura Vacinal Pólio&rdquo;</span>).</li>
                <li><strong>Descrição:</strong> Explicação breve do que o indicador mede (Ex: <span className="italic">&ldquo;% Crianças menores de 1 ano vacinadas&rdquo;</span>).</li>
                <li><strong>Valor Atual:</strong> O número ou percentual mais recente do indicador (Ex: <span className="italic">&ldquo;92%&rdquo;</span> ou <span className="italic">&ldquo;1.250&rdquo;</span>). Este é um campo obrigatório.</li>
                <li><strong>Unidade:</strong> Selecione a unidade de medida na lista (%, R$, Pessoas, Dias, Nenhum, etc.).<br/>
                    {/* [IMAGEM: Dropdown de Unidades mostrando opções como '%', 'R$', 'Pessoas'] */}
                    {/* <Image src="/caminho/para/dropdown-unidades.png" width={800} height={100} alt="Dropdown de Unidades" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Valor Alvo (Meta - Opcional):</strong> Defina a meta a ser alcançada (Ex: <span className="italic">&ldquo;95%&rdquo;</span>).</li>
                <li><strong>Texto Comparativo (Opcional):</strong> Uma frase curta para dar contexto (Ex: <span className="italic">&ldquo;+2% vs mês anterior&rdquo;</span>, <span className="italic">&ldquo;-5 dias na fila&rdquo;</span>, <span className="italic">&ldquo;— Sem alteração&rdquo;</span>). Use `+`, `-` ou `—` no início para indicar a tendência (positivo, negativo, neutro) - isso afetará a cor e o ícone (▲/▼) no card.</li>
                <li><strong>Ícone e Cor:</strong> Escolha um ícone (<Heart className="inline w-4 h-4 mx-0.5"/>, <Users className="inline w-4 h-4 mx-0.5"/>, etc.) e uma cor que representem o indicador visualmente. A cor será usada na borda do card.<br/>
                    {/* [IMAGEM: Grade de seleção de ícones e paleta de seleção de cores] */}
                    {/* <Image src="/caminho/para/seletor-icone-cor.png" width={800} height={150} alt="Seletores de ícone e cor" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Pré-visualização:</strong> Um card de exemplo será atualizado automaticamente à medida que você preenche os campos, mostrando como o indicador final aparecerá.<br/>
                    {/* [IMAGEM: Card de pré-visualização do indicador sendo atualizado dinamicamente] */}
                    {/* <Image src="/caminho/para/preview-indicador.png" width={300} height={200} alt="Preview do indicador" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Submeter:</strong> Clique em &ldquo;Submeter&rdquo; (<FileSymlink className="inline w-4 h-4 mx-1"/>).</li>
            </ol>
             <p className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800"><strong>Atenção:</strong> Título e Valor Atual são obrigatórios para submeter um indicador.</p>
        </section>
    </div>
);

const NovaVersaoContent = () => (
   <div className="space-y-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3"><CopyPlus className="w-8 h-8 text-blue-600"/> Como criar uma Nova Versão?</h1>
            <p className="text-lg text-gray-600">Mantenha seus contextos atualizados ou corrija informações.</p>
        </header>
         <section className="prose max-w-none text-gray-700 space-y-4">
            <p>Quando um contexto precisa ser atualizado (ex: um relatório mensal, dados de um gráfico que mudaram) ou corrigido, você não edita o original diretamente. Em vez disso, você cria uma <strong>Nova Versão</strong>. Isso mantém um histórico de como a informação evoluiu.</p>
             <p className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800"><strong>Importante:</strong> Geralmente, apenas o criador original do contexto (Perfil Membro) pode criar novas versões, especialmente se o contexto foi devolvido para correção.</p>
            <h2 className="text-xl font-semibold text-gray-800 pt-4">Passos para Criar uma Nova Versão:</h2>
            <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Localize o Contexto:</strong> Encontre o card do contexto que você deseja atualizar na página da sua gerência ou na seção &ldquo;Contextos Enviados&rdquo;.</li>
                <li><strong>Abra os Detalhes:</strong> Clique no card para abrir a janela de visualização de detalhes.</li>
                <li><strong>Vá para a Aba &ldquo;Versões&rdquo; / &ldquo;Histórico&rdquo;:</strong> Clique na aba correspondente (o nome pode variar, ícone <History className="inline w-4 h-4 mx-1"/>).<br/>
                    {/* [IMAGEM: Modal de visualização de detalhes, destacando a aba de Histórico/Versões] */}
                    {/* <Image src="/caminho/para/modal-detalhes-versoes.png" width={800} height={100} alt="Modal de detalhes com aba Versões" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Clique em &ldquo;Criar Nova Versão&rdquo;:</strong> Se você tiver permissão (geralmente perfil Membro e se o contexto permitir, como em &ldquo;Aguardando Correção&rdquo;), verá um botão &ldquo;+ Criar Nova Versão&rdquo;. Clique nele.<br/>
                    {/* [IMAGEM: Aba de Histórico/Versões com o botão "+ Criar Nova Versão" destacado] */}
                    {/* <Image src="/caminho/para/botao-nova-versao.png" width={800} height={150} alt="Botão Criar Nova Versão" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Modal de Nova Versão:</strong> O modal de &ldquo;Adicionar Contexto&rdquo; abrirá, mas pré-preenchido com as informações da versão anterior (Título, tipo, etc.) e marcado como &ldquo;NOVA VERSÃO&rdquo; no topo.<br/>
                    {/* [IMAGEM: Modal "Adicionar Contexto" mostrando o indicador "NOVA VERSÃO"] */}
                    {/* <Image src="/caminho/para/modal-nova-versao.png" width={800} height={200} alt="Modal de Nova Versão" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Atualize a Fonte:</strong> Anexe o <strong>novo arquivo</strong>, insira o <strong>novo link</strong>, atualize os <strong>dados manuais</strong> do gráfico ou insira o <strong>novo valor</strong> do indicador. <strong>Este passo é obrigatório.</strong>. <br/>
                    {/* [IMAGEM: Seção de anexo/dados do modal no modo Nova Versão] */}
                    {/* <Image src="/caminho/para/modal-nova-versao-fonte.png" width={800} height={200} alt="Atualizando a fonte na nova versão" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Descreva a Alteração:</strong> Selecione o <strong>Motivo da Alteração</strong> (Ex: &ldquo;Correção de Informação Incorreta&rdquo;, &ldquo;Atualização Mensal&rdquo;) e escreva uma <strong>Descrição das Alterações</strong> detalhando o que mudou nesta versão (Ex: <span className="italic">&ldquo;Atualizados dados para Outubro/2025&rdquo;</span>, <span className="italic">&ldquo;Corrigido valor da Linha 5&rdquo;</span>). <strong>A descrição é obrigatória</strong>.<br/>
                    {/* [IMAGEM: Seção "Detalhes da Nova Versão" no modal] */}
                    {/* <Image src="/caminho/para/modal-nova-versao-detalhes.png" width={800} height={200} alt="Detalhes da nova versão" className="rounded-md my-2" /> */}
                </li>
                <li><strong>Submeter:</strong> Clique em &ldquo;Submeter&rdquo;. A nova versão será enviada para o fluxo de validação normal (começando pelo Gerente).</li>
            </ol>
             <p className="mt-4 text-sm text-gray-600">A versão antiga permanecerá no histórico, acessível pela aba &ldquo;Versões&rdquo;. A nova versão se tornará a principal após ser aprovada.</p>
        </section>
    </div>
);
// --- Fim dos Componentes de Conteúdo ---


// --- Estrutura Global de Dados ---
interface HelpTopic { titulo: string; href: string; descricao: string; keywords?: string; }
interface HelpArea { id: string; nome: string; icon: React.ElementType; topicos: HelpTopic[]; }

// Dados simulados para todas as áreas (ajustar conforme necessário)
const allHelpData: HelpArea[] = [
  {
    id: "primeiros-passos",
    nome: "Primeiros Passos",
    icon: BookOpen,
    topicos: [
      { titulo: "O que é o SIGE?", href: "/ajuda/primeiros-passos/o-que-e", descricao: "Plataforma digital saúde Jaboatão gestão propósito objetivo" },
      { titulo: "Barra de Navegação", href: "/ajuda/primeiros-passos/navbar", descricao: "Menu superior navbar notificações sino menu lateral sidebar logo" },
      { titulo: "Menu Lateral", href: "/ajuda/primeiros-passos/sidebar", descricao: "Sidebar navegação links perfil dashboard dados gerais validar sair" },
      { titulo: "Perfis de Usuário", href: "/ajuda/primeiros-passos/perfis", descricao: "Roles membro gerente diretor secretário permissões acesso validar adicionar" },
    ],
  },
  {
    id: "gerenciando-conteudo",
    nome: "Adicionando Conteúdo",
    icon: FilePlus,
    topicos: [
      { titulo: "O que é um Contexto?", href: "/ajuda/gerenciando-conteudo/o-que-e-contexto", descricao: "Unidade informação arquivo link dashboard indicador kpi" },
      { titulo: "Guia: Add Arquivos/Links", href: "/ajuda/gerenciando-conteudo/add-arquivo-link", descricao: "Upload pdf doc excel anexar url externo" },
      { titulo: "Guia: Criar Gráficos", href: "/ajuda/gerenciando-conteudo/add-grafico", descricao: "Dashboard pizza barras linha área dados manual csv upload pré-visualização" },
      { titulo: "Guia: Add Indicadores", href: "/ajuda/gerenciando-conteudo/add-indicador", descricao: "KPI meta valor unidade comparativo ícone cor" },
      { titulo: "Criar Nova Versão", href: "/ajuda/gerenciando-conteudo/nova-versao", descricao: "Atualizar corrigir histórico versionamento" },
    ]
  },
  // --- Adicionar OUTRAS ÁREAS aqui ---
];
// --- Fim da Estrutura Global ---


// Mapeamento de ícones para TÓPICOS
const topicIconMap: { [key: string]: React.ElementType } = {
  // Primeiros Passos
  "/ajuda/primeiros-passos/o-que-e": HelpCircle,
  "/ajuda/primeiros-passos/navbar": Navigation,
  "/ajuda/primeiros-passos/sidebar": LayoutDashboard,
  "/ajuda/primeiros-passos/perfis": Users,
  // Gerenciando Conteúdo
  "/ajuda/gerenciando-conteudo/o-que-e-contexto": HelpCircle,
  "/ajuda/gerenciando-conteudo/add-arquivo-link": FileUp,
  "/ajuda/gerenciando-conteudo/add-grafico": BarChart3,
  "/ajuda/gerenciando-conteudo/add-indicador": Gauge,
  "/ajuda/gerenciando-conteudo/nova-versao": CopyPlus,
  // Adicionar ícones das outras áreas aqui
};

// Tópicos específicos desta área
const currentAreaId = 'gerenciando-conteudo';
const currentArea = allHelpData.find(area => area.id === currentAreaId);
const currentAreaTopics = currentArea?.topicos || [];

// Mapeamento de conteúdo
const contentComponents: { [key: string]: React.FC } = {
  "/ajuda/gerenciando-conteudo/o-que-e-contexto": OQueEContextoContent,
  "/ajuda/gerenciando-conteudo/add-arquivo-link": AddArquivoLinkContent,
  "/ajuda/gerenciando-conteudo/add-grafico": AddGraficoContent,
  "/ajuda/gerenciando-conteudo/add-indicador": AddIndicadorContent,
  "/ajuda/gerenciando-conteudo/nova-versao": NovaVersaoContent,
  // Adicionar mapeamento para componentes de conteúdo das OUTRAS ÁREAS
};

function GerenciandoConteudoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const topicParam = searchParams.get("topic");
  const topicPrefix = "/ajuda/gerenciando-conteudo/";
  const areaId = currentAreaId;

  const [activeTopicHref, setActiveTopicHref] = useState(currentAreaTopics[0]?.href || "");
  const ActiveContentComponent = contentComponents[activeTopicHref] || OQueEContextoContent;
  const [searchValue, setSearchValue] = useState("");
  const searchTokens = useMemo(() => buildHelpSearchTokens(searchValue), [searchValue]);
  const searchResults = useMemo<HelpSearchEntry[]>(
    () => searchAjudaEntries(areaId, searchTokens, 6),
    [searchTokens, areaId]
  );

  const scrollToTop = () => {
    const mainEl = document.getElementById("main-content-area");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!topicParam) return;
    const candidate = `${topicPrefix}${topicParam}`;
    if (candidate !== activeTopicHref && currentAreaTopics.some(topico => topico.href === candidate)) {
      setActiveTopicHref(candidate);
      scrollToTop();
    }
  }, [topicParam, activeTopicHref, topicPrefix]);

  const handleTopicSelect = (href: string) => {
    setActiveTopicHref(href);
    setSearchValue("");
    const slug = href.split("/").pop();
    if (slug) {
      router.replace(`${pathname}?topic=${slug}`, { scroll: false });
    } else {
      router.replace(pathname, { scroll: false });
    }
    scrollToTop();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-blue-50 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-700/80 mb-2">
                <Link href="/ajuda" className="hover:text-blue-900 transition-colors">
                  Ajuda
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-blue-900">Adicionando Conteúdo</span>
              </div>
              <div className="flex items-center gap-3">
                <FilePlus className="w-10 h-10 text-blue-700" />
                <h1 className="text-2xl font-bold text-blue-900">Adicionando e Gerenciando Conteúdo</h1>
              </div>
            </div>
            <div className="w-full md:w-full lg:max-w-3xl rounded-3xl">
              <SearchBar
                placeholder="Buscar nesta seção..."
                value={searchValue}
                onChange={setSearchValue}
                className="shadow-sm"
              />
              {searchTokens.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700">Resultados nesta seção</h3>
                  {searchResults.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleTopicSelect(result.href)}
                          className="w-full rounded-2xl border border-gray-200 bg-white/90 p-3 text-left transition-all duration-200 hover:border-blue-300 hover:shadow"
                        >
                          <div className="text-sm font-semibold text-gray-900">{result.title}</div>
                          <p className="mt-1 text-xs text-gray-600">{result.summary}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">Nenhum tópico encontrado. Tente outras palavras.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
        <aside className="w-full md:w-64 flex-shrink-0 order-last md:order-first mr-3">
          <div className="sticky top-52">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Nesta Seção
            </h2>
            <nav className="space-y-1">
              {currentAreaTopics.map((topico) => {
                const isActive = activeTopicHref === topico.href;
                const Icon = topicIconMap[topico.href] || ChevronRight;
                const displayTitle = topico.titulo.replace(/"/g, "");

                return (
                  <button
                    key={topico.href}
                    onClick={() => handleTopicSelect(topico.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors",
                      isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    <span className="truncate">{displayTitle}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

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

export default function GerenciandoConteudoPage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-label="Carregando gerenciamento de conteúdo" />
        </div>
      )}
    >
      <GerenciandoConteudoPageContent />
    </Suspense>
  );
}