"use client"

import { FileGrid } from "@/components/contextosCard/contextosGrid";
import type { FileType } from "@/components/contextosCard/contextoCard";
import { Button } from "@/components/button";
import { Plus } from 'lucide-react';
import ScrollArea from '../../components/ui/scroll-area';
import ScrollBar from '../../components/ui/scroll-bar';
import { useState, useEffect } from 'react';

const sampleFiles = [
    {
        id: "1",
        title: "Pagamento ESF e ESB - 2025",
        type: "pdf" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "2",
        title: "Pagamento ESF e ESB - 2025",
        type: "doc" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "3",
        title: "Unidades com o PEC implementado",
        type: "dashboard" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "4",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "excel" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "5",
        title: "Resolução 20/07/2025",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "6",
        title: "Link para Dashboard Externo",
        type: "link" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "3",
        title: "Unidades com o PEC implementado",
        type: "dashboard" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "4",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "excel" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "5",
        title: "Resolução 20/07/2025",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "6",
        title: "Link para Dashboard Externo",
        type: "link" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "3",
        title: "Unidades com o PEC implementado",
        type: "dashboard" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "4",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "excel" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "5",
        title: "Resolução 20/07/2025",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "6",
        title: "Link para Dashboard Externo",
        type: "link" as FileType,
        insertedDate: "2024-06-23",
    }, {
        id: "3",
        title: "Unidades com o PEC implementado",
        type: "dashboard" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "4",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "excel" as FileType,
        insertedDate: "2024-06-23",
    },
]


const mockGerencias = [
    {
        id: "1",
        sigla: "GTI",
        nome: "Gestão de Tecnologia da Informação",
        descricao: "A Gestão de Tecnologia da Informação é responsável por planejar, implementar e gerenciar a infraestrutura de TI da organização. Assim, busca garantir que os recursos tecnológicos estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de TI esteja sempre atualizada e capacitada para lidar com as demandas do gestão. Nossa equipe está comprometida em fornecer suporte e soluções tecnológicas que impulsionem a eficiência e a inovação.",
    },
    {
        id: "2",
        sigla: "GPLAN",
        nome: "Gestão de Planejamento",
        descricao: "A Gestão de Planejamento é responsável por planejar, implementar e gerenciar as atividades de planejamento da organização. Assim, busca garantir que os colaboradores estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de gestão de planejamento esteja sempre atualizada e capacitada para lidar com as demandas da gestão. Nossa equipe está comprometida em fornecer suporte e soluções que impulsionem a eficiência e a inovação.",
    },
    {
        id: "3",
        sigla: "GPEP",
        nome: "Gestão de Contratos e Convênios",
        descricao: "A Gestão de Contratos e Convênios é responsável por planejar, implementar e gerenciar os contratos e convênios da organização. Assim, busca garantir que os recursos estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de gestão de contratos esteja sempre atualizada e capacitada para lidar com as demandas da gestão. Nossa equipe está comprometida em fornecer suporte e soluções que impulsionem a eficiência e a inovação.",
    },
];


export default function HomePage() {
    // State for selected gerencia
    const [selectedGerenciaId, setSelectedGerenciaId] = useState<string>(mockGerencias[0].id);
    const [gerenciaDetails, setGerenciaDetails] = useState<{ sigla: string; nome: string; descricao: string } | null>(mockGerencias[0]);
    const [gerenciaLoading, setGerenciaLoading] = useState(false);
    const [gerenciaError, setGerenciaError] = useState<string | null>(null);

    // Simulate loading logic (replace with real API in future)
    useEffect(() => {
        setGerenciaLoading(true);
        setGerenciaError(null);
        // Simulate async fetch
        setTimeout(() => {
            const found = mockGerencias.find(g => g.id === selectedGerenciaId);
            if (found) {
                setGerenciaDetails(found);
            } else {
                setGerenciaDetails(null);
                setGerenciaError('Gerência não encontrada');
            }
            setGerenciaLoading(false);
        }, 400);
    }, [selectedGerenciaId]);

    const handleFileClick = (file: any) => {
        console.log("File clicked:", file)
        // Handle file click logic here
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6">
            <div className="container mx-auto">

                <div className="mb-4 flex items-center gap-4">
                    <h1 className="text-6xl font-bold text-blue-700">GTI</h1>
                    <h2 className="text-4xl ml-2.5 text-blue-600">GERÊNCIA DE TECNOLOGIA DA INFORMAÇÃO</h2>
                </div>

                {/* Dashboard and FileGrid (still using sampleFiles for demo) */}
                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    <Button
                        size="icon"
                        onClick={() => ("")}
                        className="text-[#7C96FF] hover:text-white bg-gradient-to-b from-[#e4eaff] to-[#9fb2ff] hover:from-[#CDD7FF]/70 hover:to-[#486DFF]/75 rounded-full h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-[#BFCCFF]/100 hover:border-[#9fb2ff]"
                    >
                        <Plus strokeWidth={2.55} className="h-6 w-6" />
                    </Button>
                </div>
                <FileGrid files={sampleFiles} onFileClick={handleFileClick} />

                {/* Gerencia Selector (for demo, use buttons) */}
                <div className="flex gap-4 mt-22 mb-8">
                    {mockGerencias.map(g => (
                        <Button
                            key={g.id}
                            onClick={() => setSelectedGerenciaId(g.id)}
                            className={`rounded-xl px-6 py-2 text-base font-bold ${selectedGerenciaId === g.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-700'}`}
                        >
                            {g.sigla}
                        </Button>
                    ))}
                </div>

                {/* Gerencia Details */}
                {gerenciaLoading ? (
                    <div className="text-blue-600 text-xl font-bold">Carregando...</div>
                ) : gerenciaError ? (
                    <div className="text-red-500 text-xl font-bold">{gerenciaError}</div>
                ) : gerenciaDetails && (
                    <>
                        <div className="mb-4 flex items-center gap-4">
                            <h1 className="text-6xl font-extrabold text-blue-700">{gerenciaDetails.sigla}</h1>
                            <h3 className="text-4xl font-regular text-blue-600">{gerenciaDetails.nome}</h3>
                        </div>
                        <span className="text-2xl font-medium mb-8 ml-2 text-blue-600">SOBRE</span>
                        <div className="mb-8 max-w-[70%]">
                            <p className="text-md ml-2 text-blue-600">{gerenciaDetails.descricao}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
