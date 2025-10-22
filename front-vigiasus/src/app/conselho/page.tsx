"use client";

import EventsSection from "@/components/conselho/eventSection";
//import DatasImportantes from "@/components/conselho/datasImportantes";
//import Galeria from "@/components/conselho/galeria";
import HeroCMS from "@/components/conselho/heroCMS";
import { ContextModal } from "@/components/popups/addContexto-modal";
//import Resolutions from "@/components/conselho/resolutions";
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { FileType } from "@/components/contextosCard/contextoCard";
import * as React from "react"
import { useState } from "react";
import AgendaLeis from "@/components/conselho/cardLeis";

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
        type: "leis" as FileType,
        insertedDate: "2025-08-22",
    },
    {
        id: "10",
        title: "Servidores ativos - comissionados, efetivos e contratos",
        type: "resolucao" as FileType,
        insertedDate: "2024-06-23",
    }
]


const handleFileClick = (file: unknown) => {
    console.log("File clicked:", file)
    // Em breve
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
            <div className="pt-12 container justify-center mx-auto pb-2">
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
