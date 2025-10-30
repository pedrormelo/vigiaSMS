// src/app/conselho/page.tsx
"use client";

import EventsSection from "@/components/conselho/eventSection";
import HeroCMS from "@/components/conselho/heroCMS";
import { AddContentModal } from "@/components/popups/addContexto-modal"; // Corrigido de "addContexto-modal" para "addContextoModal" (se o nome do arquivo for index.tsx)
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { FileType } from "@/components/contextosCard/contextoCard";

// 1. IMPORTAÇÕES ADICIONADAS
import * as React from "react"
import { useState, useMemo } from "react"; // Adicionado useMemo
import { useDebounce } from "@/hooks/useDebounce"; // Adicionado useDebounce

//import AgendaLeis from "@/components/conselho/cardLeis";

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

    // 2. ESTADOS ADICIONADOS PARA OS FILTROS
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState<'recente' | 'todas'>("todas");
    const [selectedTypes, setSelectedTypes] = useState<FileType[]>([]);
    const debouncedSearchValue = useDebounce(searchValue, 300);

    // 3. FUNÇÕES ADICIONADAS PARA OS FILTROS
    const handleSelectedTypesChange = (type: FileType) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    // 4. LÓGICA DE FILTRAGEM ADICIONADA
    const filteredFiles = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return sampleFiles.filter(file => {
            const matchesSearch = file.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            
            // Tratamento de data
            const fileDate = new Date(file.insertedDate);
            const matchesTab = activeTab === 'todas' || fileDate >= sevenDaysAgo;
            
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
            
            return matchesSearch && matchesTab && matchesType;
        });
    }, [debouncedSearchValue, activeTab, selectedTypes]);


    return (

        <main className="flex-1 bg-white mx-auto min-h-screen">
            <AddContentModal
                isOpen={showAddContexto}
                onClose={() => setShowAddContexto(false)}
                onSubmit={() => setShowAddContexto(false)}
            />
            <HeroCMS />
            <EventsSection />
            <div className="pt-12 container justify-center mx-auto pb-2">
                
                {/* 5. PROPS ADICIONADAS AO FILTERBAR */}
                <FilterBar 
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedTypes={selectedTypes}
                    onSelectedTypesChange={handleSelectedTypesChange}
                    clearTypeFilter={() => setSelectedTypes([])}
                />
                
                <FileGrid
                    // 6. USAR OS ARQUIVOS FILTRADOS
                    files={filteredFiles} 
                    onFileClick={handleFileClick}
                    onAddContextClick={() => setShowAddContexto(true)}
                />
            </div>
        </main>
    )
}