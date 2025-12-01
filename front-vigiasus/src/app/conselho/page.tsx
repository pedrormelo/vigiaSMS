"use client"; // Adicionado para garantir compatibilidade se usar hooks futuramente
import { Construction } from "lucide-react";
export default function CMSpage() {
    return (
        <main className="flex-1 bg-gray-50 mx-auto min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Construction className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                    Em Construção
                </h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    A página do <strong>Conselho Municipal de Saúde</strong> está sendo preparada com muito cuidado.
                    Em breve teremos novidades!
                </p>
                {/* Barra de Progresso Simulada com Tailwind */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full w-1/2 animate-indeterminate-bar"></div>
                </div>
                <p className="text-xs text-gray-400 font-medium mt-2">Trabalhando nos últimos detalhes...</p>
            </div>
        </main>
    );
}







// // src/app/conselho/page.tsx
// "use client";

// import EventsSection from "@/components/conselho/eventSection";
// import HeroCMS from "@/components/conselho/heroCMS";
// import { AddContentModal } from "@/components/popups/addContexto-modal";
// //import Resolutions from "@/components/conselho/resolutions";
// import { FileGrid } from "@/components/contextosCard/contextosGrid";
// import FilterBar from "@/components/gerencia/painel-filterBar";
// import { FileType } from "@/components/contextosCard/contextoCard";

// // 1. IMPORTAÇÕES ADICIONADAS
// import * as React from "react"
// import { useState } from "react";
// // import AgendaLeis from "@/components/conselho/cardLeis";

// const sampleFiles = [
//     {
//         id: "1",
//         title: "Pagamento ESF e ESB - 2025",
//         type: "resolucao" as FileType,
//         insertedDate: "2024-06-23",
//     },
//     {
//         id: "2",
//         title: "Pagamento ESF e ESB - 2025",
//         type: "resolucao" as FileType,
//         insertedDate: "2024-06-23",
//     },
//     {
//         id: "3",
//         title: "Unidades com o PEC implementado",
//         type: "resolucao" as FileType,
//         insertedDate: "2025-08-22",
//     },
//     {
//         id: "4",
//         title: "Servidores ativos - comissionados, efetivos e contratos",
//         type: "resolucao" as FileType,
//         insertedDate: "2024-06-23",
//     },
//         {
//         id: "5",
//         title: "Pagamento ESF e ESB - 2025",
//         type: "resolucao" as FileType,
//         insertedDate: "2024-06-23",
//     },
//     {
//         id: "6",
//         title: "Unidades com o PEC implementado",
//         type: "resolucao" as FileType,
//         insertedDate: "2025-08-22",
//     },
//     {
//         id: "7",
//         title: "Servidores ativos - comissionados, efetivos e contratos",
//         type: "resolucao" as FileType,
//         insertedDate: "2024-06-23",
//     },
//         {
//         id: "8",
//         title: "Pagamento ESF e ESB - 2025",
//         type: "resolucao" as FileType,
//         insertedDate: "2024-06-23",
//     },
//     {
//         id: "9",
//         title: "Unidades com o PEC implementado",
//         type: "leis" as FileType,
//         insertedDate: "2025-08-22",
//     },
//     {
//         id: "10",
//         title: "Servidores ativos - comissionados, efetivos e contratos",
//         type: "resolucao" as FileType,
//         insertedDate: "2024-06-23",
//     }
// ]


// const handleFileClick = (file: unknown) => {
//     console.log("File clicked:", file)
//     // Em breve
// };


// export default function CMSpage() {
//     const [showAddContexto, setShowAddContexto] = useState(false);
//     const [searchValue, setSearchValue] = useState("");
//     const [activeTab, setActiveTab] = useState<"recente" | "todas">("recente");
//     const [selectedTypes, setSelectedTypes] = useState<FileType[]>([]);

//     const handleSelectedTypesChange = (type: FileType) => {
//         setSelectedTypes((prev) =>
//             prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
//         );
//     };

//     const clearTypeFilter = () => setSelectedTypes([]);

//     const filteredFiles = sampleFiles
//         .filter((f) =>
//             f.title.toLowerCase().includes(searchValue.toLowerCase())
//         )
//         .filter((f) => (selectedTypes.length ? selectedTypes.includes(f.type) : true))
//         .sort((a, b) => {
//             if (activeTab === "recente") {
//                 return new Date(b.insertedDate).getTime() - new Date(a.insertedDate).getTime();
//             }
//             return 0;
//         });
//     return (

//         <main className="flex-1 bg-white mx-auto min-h-screen">
//             <AddContentModal
//                 isOpen={showAddContexto}
//                 onClose={() => setShowAddContexto(false)}
//                 onSubmit={() => setShowAddContexto(false)}
//             />
//             <HeroCMS />
//             <EventsSection />
//             <div className="pt-12 container justify-center mx-auto pb-2">
//                 <FilterBar
//                     searchValue={searchValue}
//                     onSearchChange={setSearchValue}
//                     activeTab={activeTab}
//                     onTabChange={setActiveTab}
//                     selectedTypes={selectedTypes}
//                     onSelectedTypesChange={handleSelectedTypesChange}
//                     clearTypeFilter={clearTypeFilter}
//                 />
//                 <FileGrid
//                     files={filteredFiles}
//                     onFileClick={handleFileClick}
//                     onAddContextClick={() => setShowAddContexto(true)}
//                     isEditing
//                 />
//             </div>
//         </main>
//     )
// }