# VigiaSUS - Painel de Monitoramento Estratégico

## 🎯 Sobre o Projeto

O **VigiaSUS** é uma plataforma digital desenvolvida para a Secretaria Municipal de Saúde de Jaboatão dos Guararapes. Seu principal objetivo é centralizar dados, relatórios e informações estratégicas para apoiar a tomada de decisões e a gestão da saúde pública no município.

A aplicação permite que diferentes níveis hierárchicos (membros de equipe, gerentes e diretores) interajam com os dados, submetam novos "contextos" para aprovação e visualizem indicadores e dashboards de forma clara e intuitiva.

-----

## ✨ Principais Funcionalidades

O sistema foi construído com um conjunto robusto de funcionalidades para atender às necessidades da gestão:

  * **📤 Submissão de Conteúdo:** Um modal unificado permite que os usuários adicionem três tipos de conteúdo:
      * **Contextos:** Envio de arquivos (PDF, DOCX, etc.) ou links externos.
      * **Dashboards:** Criação de gráficos (Pizza, Barras, Linhas) a partir de inserção manual de dados ou upload de arquivos `.csv`.
      * **Indicadores:** Criação de cartões de métricas (KPIs) com valores, metas e comparações.
  * **🔄 Fluxo de Aprovação:** Os conteúdos submetidos por membros de equipe passam por um fluxo de validação de dois níveis (Gerente → Diretor) antes de serem publicados.
  * **📜 Versionamento de Conteúdo:** Todos os tipos de conteúdo possuem um sistema de histórico de versões, permitindo que alterações sejam rastreadas e documentadas.
  * **🎨 Personalização Visual:**
      * **Gráficos:** Os usuários podem personalizar a paleta de cores associada a cada série de dados de seus gráficos.
      * **Indicadores:** É possível escolher uma cor de destaque e um ícone temático para cada indicador.
  * **👥 Controle de Acesso por Perfil:** A interface se adapta ao perfil do usuário (membro, gerente, diretor), exibindo ou ocultando funcionalidades com base em suas permissões.
  * **📊 Visualização de Dados:**
      * Um modal de visualização permite inspecionar detalhes, pré-visualizar o conteúdo (PDFs, DOCX, gráficos, indicadores) e navegar pelo histórico de versões.
      * Painéis de gerência exibem os contextos e indicadores de forma organizada.
  * **💬 Sistema de Comentários e Notificações:** Uma central de notificações e uma seção de comentários integrada permitem a comunicação e o feedback sobre os contextos submetidos.

-----

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

  * **Framework:** [Next.js](https://nextjs.org/)
  * **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
  * **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
  * **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/)
  * **Ícones:** [Lucide React](https://lucide.dev/)
  * **Visualização de Gráficos:** [React Google Charts](https://www.react-google-charts.com/)
  * **Visualização de Documentos:** `react-pdf`, `docx-preview`
  * **Animações:** `Framer Motion`

-----

## 🛠️ Como Rodar o Projeto Localmente

Para executar o VigiaSUS em seu ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos

  * [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
  * [Yarn](https://yarnpkg.com/) ou [npm](https://www.npmjs.com/)

### 1\. Clonar o Repositório

```bash
git clone https://github.com/pedrormelo/vigiaSMS.git
cd front-vigiasus
```

### 2\. Instalar as Dependências

Instale todas as dependências do projeto com o seu gerenciador de pacotes preferido:

```bash
npm install
# ou
yarn
```

### 3\. Executar o Servidor de Desenvolvimento

Inicie o servidor de desenvolvimento. A aplicação estará disponível em `http://localhost:3000`.

```bash
npm run dev
# ou
yarn dev
```

-----

## 📁 Estrutura do Projeto

A arquitetura do projeto está organizada da seguinte forma dentro da pasta `src/`:

```
src/
├── app/                  # Rotas e páginas da aplicação (App Router)
├── components/           # Componentes React reutilizáveis
│   ├── ui/               # Componentes de UI base (shadcn)
│   ├── popups/           # Modais da aplicação
│   ├── dashboard/        # Componentes específicos para dashboards
│   ├── indicadores/      # Componentes para os cards de indicadores
│   └── ...
├── constants/            # Dados estáticos, mocks e configurações
├── hooks/                # Hooks customizados (ex: useDebounce)
├── lib/                  # Funções utilitárias (ex: cn)
└── services/             # Lógica de busca de dados (simula uma API)
```

-----

## 🗄️ Backend (vigiasus-backend)

O backend em Express + Prisma está em `vigiasus-backend/` e fornece a API consumida pelo front.

### Configuração

- Crie um arquivo `.env` em `vigiasus-backend/` com as variáveis de banco:
  - `DATABASE_URL` (string de conexão do Prisma, ex.: `mysql://user:pass@localhost:3306/vigiasus_db`)
  - Ou, para o cliente MySQL raw (`src/config/db.js`), defina: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

### Rodar servidor

```bash
cd vigiasus-backend
npm install
npm run dev
```

### Migrar e gerar Prisma Client

```bash
# gerar client
npm run prisma:generate

# criar/aplicar migrações (ambiente de desenvolvimento)
npm run prisma:migrate
```

### Popular dados de desenvolvimento (seed)

```bash
# Executa prisma/seed.js e cria diretoria, gerência, usuários e um contexto com duas versões
npm run prisma:seed
```

Credenciais padrão (senha: `123456`):

- membro@vigia.sus (MEMBRO)
- gerente@vigia.sus (GERENTE)
- diretor@vigia.sus (DIRETOR)
- secretaria@vigia.sus (SECRETARIA)

### Prisma Client vs MySQL raw

- Use Prisma Client para CRUD, relações e transações com tipos e validação.
- Use MySQL raw (`mysql2`) apenas para consultas específicas de alto desempenho ou funcionalidades de baixo nível. Ambos podem coexistir, mas prefira Prisma para manter consistência do schema e das migrações.

