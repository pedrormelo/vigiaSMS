"use client"

import { FilePlus2 } from "lucide-react"


interface AddContextButtonProps {
    onClick: () => void
}

export function AddContextButton({ onClick }: AddContextButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-full h-48 border-2 cursor-pointer text-gray-400 hover:text-gray-500  border-dashed border-gray-300 hover:border-gray-400 rounded-4xl bg-gray-100/25 hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center justify-center gap-3 group"
        >
            <FilePlus2 className="w-10 h-10" />
            <span className=" font-medium">Adicionar Contexto</span>
        </button>
    )
}