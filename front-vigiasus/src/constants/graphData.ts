import type { GraphData } from "@/components/dashboard/dasboard-preview"

export const mockGraphs: GraphData[] = [
    // GTI (g7) - Multiple graphs to test pagination
    {
        id: "1",
        title: "Infraestrutura de TI por Unidade",
        type: "chart",
        gerencia: "g7",
        insertedDate: "2024-01-15",
        data: [
            ["Unidade", "Servidores", "Computadores"],
            ["Hospital Central", 25, 120],
            ["UBS Norte", 8, 35],
            ["UBS Sul", 6, 28],
            ["UBS Leste", 10, 42],
        ],
    },
    {
        id: "2",
        title: "Status do Sistema PEC",
        type: "pie",
        gerencia: "g7",
        insertedDate: "2024-01-10",
        data: [
            ["Status", "Unidades"],
            ["Implementado", 75],
            ["Em Implementação", 15],
            ["Planejado", 10],
        ],
    },
    {
        id: "3",
        title: "Chamados de TI por Mês",
        type: "line",
        gerencia: "g7",
        insertedDate: "2024-01-20",
        data: [
            ["Mês", "Abertos", "Resolvidos", "Pendentes"],
            ["Jan", 150, 140, 10],
            ["Fev", 180, 175, 15],
            ["Mar", 165, 160, 20],
            ["Abr", 190, 185, 25],
            ["Mai", 175, 170, 30],
        ],
    },
    {
        id: "4",
        title: "Capacidade de Armazenamento",
        type: "chart",
        gerencia: "g7",
        insertedDate: "2024-02-01",
        data: [
            ["Servidor", "Usado (%)", "Disponível (%)"],
            ["Servidor Principal", 65, 35],
            ["Servidor Backup", 40, 60],
            ["Servidor Web", 80, 20],
        ],
    },
    {
        id: "5",
        title: "Uptime dos Sistemas",
        type: "line",
        gerencia: "g7",
        insertedDate: "2024-02-05",
        data: [
            ["Sistema", "PEC", "SISREG", "Portal"],
            ["Janeiro", 99.8, 99.5, 99.9],
            ["Fevereiro", 98.5, 99.2, 99.1],
            ["Março", 99.9, 99.8, 99.7],
        ],
    },

    // GPLAN (g6) - Planning charts
    {
        id: "6",
        title: "Orçamento por Programa",
        type: "pie",
        gerencia: "g6",
        insertedDate: "2024-01-25",
        data: [
            ["Programa", "Orçamento (M)"],
            ["Atenção Básica", 45],
            ["Média Complexidade", 35],
            ["Alta Complexidade", 25],
            ["Vigilância", 15],
        ],
    },
    {
        id: "7",
        title: "Execução Orçamentária",
        type: "chart",
        gerencia: "g6",
        insertedDate: "2024-02-10",
        data: [
            ["Trimestre", "Previsto", "Executado"],
            ["1º Tri", 25, 23],
            ["2º Tri", 30, 28],
            ["3º Tri", 25, 26],
            ["4º Tri", 20, 18],
        ],
    },
    {
        id: "8",
        title: "Indicadores de Saúde",
        type: "line",
        gerencia: "g6",
        insertedDate: "2024-02-15",
        data: [
            ["Indicador", "Meta", "Realizado"],
            ["Cobertura ESF", 85, 82],
            ["Vacinação", 90, 88],
            ["Pré-natal", 80, 85],
        ],
    },

    // GAB (g2) - Atenção Básica
    {
        id: "9",
        title: "Cobertura ESF por Distrito",
        type: "chart",
        gerencia: "g2",
        insertedDate: "2024-01-30",
        data: [
            ["Distrito", "Cobertura (%)"],
            ["Norte", 85],
            ["Sul", 78],
            ["Leste", 82],
            ["Oeste", 90],
            ["Centro", 75],
        ],
    },
    {
        id: "10",
        title: "Atendimentos por Tipo",
        type: "pie",
        gerencia: "g2",
        insertedDate: "2024-02-05",
        data: [
            ["Tipo", "Atendimentos"],
            ["Consulta Médica", 45],
            ["Consulta Enfermagem", 25],
            ["Procedimentos", 20],
            ["Vacinação", 10],
        ],
    },

    // GRA (g4) - Regulação Ambulatorial  
    {
        id: "11",
        title: "Fila de Espera por Especialidade",
        type: "chart",
        gerencia: "g4",
        insertedDate: "2024-02-08",
        data: [
            ["Especialidade", "Aguardando"],
            ["Cardiologia", 150],
            ["Ortopedia", 120],
            ["Neurologia", 80],
            ["Dermatologia", 90],
        ],
    },
    {
        id: "12",
        title: "Tempo Médio de Espera",
        type: "line",
        gerencia: "g4",
        insertedDate: "2024-02-12",
        data: [
            ["Mês", "Cardiologia", "Ortopedia", "Neurologia"],
            ["Jan", 45, 60, 30],
            ["Fev", 42, 55, 28],
            ["Mar", 38, 50, 25],
        ],
    },
]
