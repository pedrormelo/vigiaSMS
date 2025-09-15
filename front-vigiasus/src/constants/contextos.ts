// src/mocks/contextos.ts

import { Contexto, StatusContexto } from "@/components/validar/typesDados";

// Os mesmos dados que estavam na sua página, agora em um arquivo separado.
export const mockData: Contexto[] = [
    {
        id: "1",
        solicitante: "Pedro Augusto Lorenzo",
        email: "pedro.augusto02@gmail.com",
        nome: "Monitoramento Financeiro COAPES",
        situacao: StatusContexto.AguardandoAnalise,
        docType: "excel",
        gerencia: "Gerência de Gestão Ensino e Serviço",
        data: "02-08-2025",
        detalhes: "Relatório detalhado contendo o monitoramento dos repasses financeiros para o Contrato Organizativo de Ação Pública Ensino-Saúde (COAPES) referente ao primeiro semestre de 2025."
    },
    {
        id: "2",
        solicitante: "Luiza Vitória de Alincatra",
        email: "luizaalcan_1234@yahoo.com.br",
        nome: "Emendas Parlamentares - 2025",
        situacao: StatusContexto.AguardandoGerente,
        docType: "excel",
        gerencia: "Gerência de Planejamento em Saúde",
        data: "02-08-2025",
        detalhes: "Planilha com a relação de todas as emendas parlamentares destinadas à saúde para o ano de 2025, incluindo valores, autores e status de execução."
    },
    // ... (cole o resto dos seus dados mockados aqui)
    {
        id: "3",
        solicitante: "Murilo Alencar Gomes",
        email: "muriloalencar@hotmail.com",
        nome: "Monitoramento Ouvidoria",
        situacao: StatusContexto.AguardandoDiretor,
        docType: "doc",
        gerencia: "Coordenação de Ouvidoria do SUS",
        data: "02-08-2025",
        detalhes: "Documento com a compilação e análise das principais demandas registradas na Ouvidoria do SUS no último trimestre, com foco em reclamações e sugestões sobre o atendimento nas unidades de saúde."
    },
    {
        id: "4",
        solicitante: "Julia Maria da Cunha Leite",
        email: "cunhajuliamaria02@gmail.com",
        nome: "Pagamento PV/JET - Julho de 2025",
        situacao: StatusContexto.Deferido,
        docType: "pdf",
        gerencia: "Gerência de Gestão do Trabalho",
        data: "02-08-2025",
        detalhes: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS (PV/JET) para o mês de Julho de 2025."
    },
    {
        id: "5",
        solicitante: "Carlos Eduardo",
        email: "cadu@exemplo.com",
        nome: "Relatório Epidemiológico",
        situacao: StatusContexto.Indeferido,
        docType: "dashboard",
        gerencia: "Gerência de Vigilância em Saúde",
        data: "02-08-2025",
        detalhes: "Apresentação do relatório epidemiológico semanal."
    },
];