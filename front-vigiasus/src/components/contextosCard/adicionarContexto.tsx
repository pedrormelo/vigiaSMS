"use client"

import { FilePlus2 } from "lucide-react"


interface AddContextButtonProps {
    onClick: () => void
    id?: string
}

export function AddContextButton({ onClick, id }: AddContextButtonProps) {
    return (
        <button
            id={id}
            onClick={onClick}
            className="w-full min-h-[150px] md:min-h-[190px] border-2 cursor-pointer text-gray-400 hover:text-gray-500 border-dashed border-gray-300 hover:border-gray-400 rounded-xl md:rounded-3xl bg-gray-100/25 hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center justify-center gap-1.5 md:gap-2.5 group"
        >
            <FilePlus2 className="w-12 md:w-14 h-12 md:h-14" />
            <span className="font-medium text-[11px] md:text-base">Adicionar Contexto</span>
        </button>
    )
}