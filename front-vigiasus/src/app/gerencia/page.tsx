"use client"

import { useState, useEffect } from 'react';
import type { FileType } from "@/components/contextosCard/contextoCard";

// Componentes da UI
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import { Button } from "@/components/button";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { AddIndicatorButton } from "@/components/indicadores/adicionarIndicador";
import { IndicatorCard } from "@/components/indicadores/indicadorCard";
import { AddDashboardButton } from "@/components/gerencia/dashboard-btn1";

import { AddContentModal } from "@/components/popups/addContextoModal/index"; 

const indicators: {
    title: string;
    value: string;
    subtitle: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    borderColor: string;
    iconType: "cuidados" | "unidades" | "servidores" | "atividade" | "cruz" | "populacao" | "medicos";
}[] = [
        {
            title: "População Atendida",
            value: "68 milhões",
            subtitle: "Atendimento da Rede Municipal",
            change: "+32% em relação ao PMQA",
            changeType: "positive",
            borderColor: "border-l-blue-500",
            iconType: "cuidados",
        },
        {
            title: "Unidades de Saúde",
            value: "200",
            subtitle: "Unidades ativas",
            change: "— Sem alteração",
            changeType: "neutral",
            borderColor: "border-l-green-500",
            iconType: "unidades",
        },
        {
            title: "Profissionais Ativos",
            value: "2.345",
            subtitle: "Em toda Secretaria",
            change: "+4,2% em relação ao PMQA",
            changeType: "positive",
            borderColor: "border-l-red-500",
            iconType: "servidores",
        },
    ]

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
        nome: "Gerência de Tecnologia da Informação",
        descricao: "A Gerência de Tecnologia da Informação é responsável por planejar, implementar e gerenciar a infraestrutura de TI da organização. Assim, busca garantir que os recursos tecnológicos estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de TI esteja sempre atualizada e capacitada para lidar com as demandas do gestão. Nossa equipe está comprometida em fornecer suporte e soluções tecnológicas que impulsionem a eficiência e a inovação.",
        image: "/gerencias/images/gti.jpg"
    },
    {
        id: "2",
        sigla: "GPLAN",
        nome: "Gerência de Planejamento",
        descricao: "A Gerência de Planejamento é responsável por planejar, implementar e gerenciar as atividades de planejamento da organização. Assim, busca garantir que os colaboradores estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de gestão de planejamento esteja sempre atualizada e capacitada para lidar com as demandas da gestão. Nossa equipe está comprometida em fornecer suporte e soluções que impulsionem a eficiência e a inovação.",
        image: ""
    },
    {
        id: "3",
        sigla: "GPEP",
        nome: "Gerência de Políticas Estratégicas",
        descricao: "A Gerência de Políticas Estratégicas é responsável por planejar, implementar e gerenciar as políticas estratégicas da organização. Assim, busca garantir que os recursos estejam alinhados às necessidades da gestão. Por isso, é fundamental que a equipe de gestão de políticas esteja sempre atualizada e capacitada para lidar com as demandas da gestão. Nossa equipe está comprometida em fornecer suporte e soluções que impulsionem a eficiência e a inovação.",
        image: ""
    },
];



export default function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialTab, setInitialTab] = useState<'contexto' | 'dashboard'>('contexto');

    const [selectedGerenciaId, setSelectedGerenciaId] = useState<string>(mockGerencias[0].id);
    const [gerenciaDetails, setGerenciaDetails] = useState<{ sigla: string; nome: string; descricao: string, image: string } | null>(mockGerencias[0]);
    const [gerenciaLoading, setGerenciaLoading] = useState(false);
    const [gerenciaError, setGerenciaError] = useState<string | null>(null);

    useEffect(() => {
        setGerenciaLoading(true);
        setGerenciaError(null);
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


    const openModal = (tab: 'contexto' | 'dashboard') => {
        setInitialTab(tab);
        setIsModalOpen(true);
    };

    const handleContentSubmit = (data: { type: 'contexto' | 'dashboard'; payload: any }) => {
        console.log("Novo conteúdo recebido:", data);
        
        if (data.type === 'contexto') {
            console.log("Salvando um novo CONTEXTO:", data.payload);

        } else if (data.type === 'dashboard') {
            console.log("Salvando um novo DASHBOARD:", data.payload);
        }
    };

    const handleFileClick = (file: unknown) => {
        console.log("File clicked:", file)
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6">
            <AddContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleContentSubmit}
                initialTab={initialTab}
            />
            
            <div className="container mx-auto">
                <div className="mb-4 flex items-center gap-4">
                    <h1 className="text-6xl font-bold text-blue-700">GTI</h1>
                    <h2 className="text-4xl ml-2.5 text-blue-600">GERÊNCIA DE TECNOLOGIA DA INFORMAÇÃO</h2>
                </div>

                {/* Seção do Dashboard */}
                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    <AddDashboardButton onClick={() => openModal('dashboard')} />
                </div>

                {/* Seção de Indicadores */}
                <div className="flex justify-center items-center gap-4 mb-16 flex-wrap">
                    <AddIndicatorButton onClick={() => openModal('contexto')} />
                    {indicators.map((indicator, index) => (
                        <IndicatorCard key={index} {...indicator} />
                    ))}
                </div>
                
                {/* Seção de Contexto */}
                <FilterBar />
                <FileGrid
                    files={sampleFiles}
                    onFileClick={handleFileClick}
                    onAddContextClick={() => openModal('contexto')}
                />

                {/* Gerencia Selector */}
                <div className="flex gap-4 mt-18 mb-8">
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
                    <div>Carregando...</div>
                ) : gerenciaError ? (
                    <div>{gerenciaError}</div>
                ) : gerenciaDetails && (
                    <>
                        <div className="mb-2 flex flex-row items-start gap-8">
                            <div className="flex-1">
                                <div className="flex gap-4 justify-start items-center mb-4">
                                    <h1 className="text-6xl font-extrabold text-blue-700">{gerenciaDetails.sigla}</h1>
                                    <h3 className="text-4xl font-regular text-blue-600">{gerenciaDetails.nome}</h3>
                                </div>
                                <span className="text-2xl font-medium ml-2 text-blue-600">SOBRE</span>
                                <div className="mb-8 mt-3 max-w-[90%]">
                                    <p className="text-md ml-2 text-blue-600">{gerenciaDetails.descricao}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-[300px] h-[340px] rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-md">
                                {gerenciaDetails.image ? (
                                    <img src={gerenciaDetails.image} alt={gerenciaDetails.nome} className="object-cover w-full h-full" />
                                ) : (
                                    <span className="text-gray-400 text-lg">Sem imagem</span>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}