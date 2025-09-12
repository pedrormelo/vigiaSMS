"use client";

import EventsSection from "@/components/conselho/eventSection";
//import DatasImportantes from "@/components/conselho/datasImportantes";
import Galeria from "@/components/conselho/galeria";
import HeroCMS from "@/components/conselho/heroCMS";
import { ContextModal as AddContextoModal } from "@/components/popups/addContexto-modal";
import Resolutions from "@/components/conselho/resolutions";
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { FileType } from "@/components/contextosCard/contextoCard";
import * as React from "react"
import { useEffect, useState } from "react";

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

const sampleFiles = [
    {
        id: "1",
        title: "Pagamento ESF e ESB - 2025",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "2",
        title: "Pagamento ESF e ESB - 2025",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "3",
        title: "Unidades com o PEC implementado",
        type: "resolucao" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "4",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
        {
        id: "5",
        title: "Pagamento ESF e ESB - 2025",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "6",
        title: "Unidades com o PEC implementado",
        type: "resolucao" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "7",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
        {
        id: "8",
        title: "Pagamento ESF e ESB - 2025",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    },
    {
        id: "9",
        title: "Unidades com o PEC implementado",
        type: "resolucao" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "10",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    }
]


const handleFileClick = (file: any) => {
    console.log("File clicked:", file)
    // Handle file click logic here
};


export default function CMSpage() {
    const [showAddContexto, setShowAddContexto] = useState(false);
    return (

        <main className="flex-1 bg-white mx-auto min-h-screen">
            <AddContextoModal
                isOpen={showAddContexto}
                onClose={() => setShowAddContexto(false)}
                onSubmit={() => setShowAddContexto(false)}
            />
            <HeroCMS />
            <EventsSection />
            <div className="pt-12 container justify-center mx-auto pb-20">
                <FilterBar />
                <FileGrid
                    files={sampleFiles}
                    onFileClick={handleFileClick}
                    onAddContextClick={() => setShowAddContexto(true)}
                />
            </div>
        </main>
    )
}
