"use client"

interface AddGraphButtonProps {
    onClick: () => void
    className?: string
}

export function AddGraphButton({ onClick, className }: AddGraphButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full h-48 border-2 cursor-pointer text-gray-400 hover:text-gray-500 border-dashed border-gray-300 hover:border-gray-400 rounded-4xl bg-gray-100/25 hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center justify-center gap-3 group ${className}`}
        >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Escolher Gráfico</span>
        </button>
    )
}
