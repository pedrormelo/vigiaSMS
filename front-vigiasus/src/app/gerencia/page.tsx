"use client"

import { FileGrid } from "@/components/contextosCard/contextosGrid";
import type { FileType } from "@/components/contextosCard/contextoCard";
import { Button } from "@/components/button"
import { div } from "framer-motion/m";

import { Plus } from 'lucide-react';

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
    },    {
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

export default function HomePage() {
    const handleFileClick = (file: any) => {
        console.log("File clicked:", file)
        // Handle file click logic here
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6">
            <div className="container mx-auto">
                <div className="mb-4 flex">
                    <h1 className="text-4xl font-bold mb-2 text-blue-700">GTI</h1>
                    <h2 className="text-4xl ml-2.5 text-blue-600">GERÊNCIA DE TECNOLOGIA DA INFORMAÇÃO</h2>
                </div>

                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    <Button
                        size="icon"
                        onClick={() => ("")}
                        className="text-blue-500 hover:text-white bg-gradient-to-b from-[#e4eaff] to-[#9fb2ff] hover:from-[#486DFF]/70 hover:to-[#CDD7FF]/75 rounded-full h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-[#BFCCFF]/100 hover:border-[#9fb2ff]"
                    >
                        <Plus strokeWidth={2.55} className="h-6 w-6" />
                    </Button>
                </div>

                <FileGrid files={sampleFiles} onFileClick={handleFileClick} />
            </div>
        </div>
    )
}
