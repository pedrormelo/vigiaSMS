export const mockGraphs: GraphData[] = [
    {
        id: "1",
        title: "Distribuição de Atendimentos",
        type: "pie",
        gerencia: "GERAN",
        insertedDate: "2024-01-15",
        data: [
            ["Categoria", "Atendimentos"],
            ["Atendimento Básico", 45],
            ["Urgência", 25],
            ["Emergência", 15],
            ["Consulta", 15],
        ],
    },
    {
        id: "2",
        title: "Unidades com o PEC Implementado",
        type: "chart",
        gerencia: "CTI",
        insertedDate: "2024-01-10",
        data: [
            ["Unidade", "Implementado"],
            ["Unidade A", 80],
            ["Unidade B", 65],
            ["Unidade C", 90],
        ],
    },
    {
        id: "3",
        title: "Atendimento de Alta vs Média e Baixa Complexidade",
        type: "line",
        gerencia: "GERAN",
        insertedDate: "2024-01-20",
        data: [
            ["Mês", "Alta", "Média", "Baixa"],
            ["Jan", 100, 80, 50],
            ["Fev", 120, 85, 55],
            ["Mar", 130, 90, 60],
        ],
    },
]
