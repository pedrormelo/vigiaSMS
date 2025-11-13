// src/constants/diretorias.ts

interface Gerencia {
  id: string;
  nome: string;
  sigla?: string;
  descricao?: string;
  image?: string;
}

interface Diretoria {
  id: string;
  nome: string;
  /** token de cor para UI ("blue" | "green" | "orange" | "red" | "cyan") */
  corUI?: "blue" | "green" | "orange" | "red" | "cyan";
  // objeto com as cores do gradiente
  cores: {
    from: string; // Cor inicial em hexadecimal
    to: string;   // Cor final em hexadecimal
  };
  // caminho (a partir de /public) para um banner de imagem opcional
  // Quando presente, use esta imagem em vez do gradiente
  bannerImage?: string;
  gerencias: Gerencia[];
}

// Exporta a configuração completa com as cores
export const diretoriasConfig: { [key: string]: Diretoria } = {
  "atencao-saude": {
    id: "atencao-saude",
    nome: "Diretoria de Atenção à Saúde",
    corUI: "blue",
    cores: { from: "#1745FF", to: "#002BDB" },
    gerencias: [
      { 
        id: "g1", 
        nome: "Gerência de Fluxos Assistenciais",
        sigla: "GFA",
        descricao: "A Gerência de Fluxos Assistenciais é responsável por coordenar e otimizar os processos de atendimento na rede de saúde. Garante que os pacientes recebam o cuidado adequado no tempo certo, organizando fluxos entre diferentes níveis de atenção e promovendo a continuidade do cuidado.",
        image: ""
      },
      { 
        id: "g2", 
        nome: "Gerência de Atenção Básica",
        sigla: "GAB",
        descricao: "A Gerência de Atenção Básica coordena as ações de saúde no primeiro nível de atenção, supervisionando unidades básicas de saúde e estratégias de saúde da família. Foca na promoção, prevenção e cuidados primários para a população.",
        image: ""
      },
    ],
  },
  "regulacao-sus": {
    id: "regulacao-sus",
    nome: "Diretoria de Regulação do SUS",
    corUI: "cyan",
    cores: { from: "#00BDFF", to: "#07ABE4" },
    gerencias: [
      { 
        id: "g3", 
        nome: "Gerência de Leitos",
        sigla: "GL",
        descricao: "A Gerência de Leitos é responsável pela regulação e gestão da ocupação de leitos hospitalares na rede municipal. Coordena a disponibilidade, alocação e controle de leitos para garantir acesso adequado aos serviços de internação.",
        image: ""
      },
      { 
        id: "g4", 
        nome: "Gerência de Regulação Ambulatorial",
        sigla: "GRA",
        descricao: "A Gerência de Regulação Ambulatorial coordena o acesso a consultas especializadas, exames e procedimentos ambulatoriais. Gerencia filas de espera e organiza fluxos para otimizar o atendimento na rede ambulatorial.",
        image: ""
      },
      { 
        id: "g5", 
        nome: "Gerência de Controle e Avaliação",
        sigla: "GCA",
        descricao: "A Gerência de Controle e Avaliação monitora a qualidade dos serviços de saúde, realiza auditorias e avalia indicadores de desempenho. Garante conformidade com normas técnicas e promove a melhoria contínua dos serviços.",
        image: ""
      },
    ],
  },
  "gestao-sus": {
    id: "gestao-sus",
    nome: "Diretoria de Gestão do SUS",
    corUI: "green",
    cores: { from: "#109326", to: "#008C32" }, 
    gerencias: [
        { 
          id: "g6", 
          nome: "Gerência de Planejamento",
          sigla: "GPLAN",
          descricao: "A Gerência de Planejamento é responsável por planejar, implementar e gerenciar as atividades de planejamento da organização. Assim, busca garantir que os colaboradores estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de gestão de planejamento esteja sempre atualizada e capacitada para lidar com as demandas da gestão. Nossa equipe está comprometida em fornecer suporte e soluções que impulsionem a eficiência e a inovação.",
          image: ""
        },
        { 
          id: "g7", 
          nome: "Gerência de Tecnologia da Informação",
          sigla: "GTI",
          descricao: "A Gerência de Tecnologia da Informação é responsável por planejar, implementar e gerenciar a infraestrutura de TI da organização. Assim, busca garantir que os recursos tecnológicos estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de TI esteja sempre atualizada e capacitada para lidar com as demandas do gestão. Nossa equipe está comprometida em fornecer suporte e soluções tecnológicas que impulsionem a eficiência e a inovação.",
          image: "/gerencias/images/gti.jpg"
        },
    ],
  },

    "vigilancia-saude": {
    id: "vigilancia-saude",
    nome: "Diretoria de Vigilância em Saúde",
      corUI: "orange",
      cores: { from: "#FF8500", to: "#FD8400" }, 
    gerencias: [
        { 
          id: "g8", 
          nome: "Gerência de Insperção Sanitária",
          sigla: "GIS",
          descricao: "A Gerência de Inspeção Sanitária realiza fiscalização e controle sanitário de estabelecimentos, produtos e serviços. Atua na prevenção de riscos à saúde pública através de ações de vigilância sanitária e educação em saúde.",
          image: ""
        },
    ],
  },

    "administrativo-financeira": {
    id: "administrativo-financeira",
    nome: "Diretoria Administrativa Financeiro",
      corUI: "red",
    cores: { from: "#FB4242", to: "#EF2828" }, 
    gerencias: [
        { 
          id: "g9", 
          nome: "Gerência Administrativa Financeiro",
          sigla: "GAF",
          descricao: "A Gerência Administrativa Financeiro é responsável pela gestão orçamentária, financeira e administrativa da secretaria. Coordena processos de compras, contratos, recursos humanos e controle financeiro para garantir o funcionamento eficiente da organização.",
          image: ""
        },
    ],
  },

    "secretaria": {
    id: "secretaria",
    nome: "Página da Secretária",
      corUI: "orange",
    // Mantemos as cores por compatibilidade, mas prefira usar bannerImage quando disponível
    cores: { from: "#ffcb3e", to: "#f7721c" },
    // Imagem localizada em /public/secretaria/images/banner1.png
    bannerImage: "/secretaria/images/banner1.png",
    gerencias: [
        { id: "g10", nome: "Secretaria" },
    ],
  },
};