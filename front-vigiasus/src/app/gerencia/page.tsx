"use client"

import { FileGrid } from "@/app/components/contextosCard/contextosGrid";
import type { FileType } from "@/app/components/contextosCard/contextoCard";

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
]

export default function HomePage() {
    const handleFileClick = (file: any) => {
        console.log("File clicked:", file)
        // Handle file click logic here
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6">
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-white">File System</h1>
                    <p className="text-gray-400">Manage your documents, dashboards, and links with color-coded organization</p>
                </div>

                <FileGrid files={sampleFiles} onFileClick={handleFileClick} />
            </div>
        </div>
    )
}
