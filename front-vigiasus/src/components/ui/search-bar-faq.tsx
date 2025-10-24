// src/components/ui/search-bar.tsx

import type React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils"; //

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    className?: string;
}

export function SearchBar({
    placeholder = "Pesquise...",
    value = "",
    onChange,
    onSearch,
    className = "",
}: SearchBarProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange?.(newValue);
    };

    // CORRIGIDO: Usando onKeyDown
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch?.(value);
        }
    };

    const handleSearchClick = () => {
        onSearch?.(value);
    };

    return (
        // Adicionado 'group' aqui
        <div className={cn("relative group", className)}>
             {/* Este div interno agora controla a largura e a transição */}
            <div
                className={cn(
                    "relative flex items-center w-full",
                    // Largura inicial e transição
                    "max-w-xs transition-all duration-300 ease-in-out",
                     // Expande quando um elemento DENTRO do 'group' (o input) está focado
                    "group-focus-within:max-w-lg" // Ajuste max-w-lg se precisar de mais/menos espaço
                )}
            >
                <Search
                    strokeWidth={2.5}
                    className="absolute left-4 h-4 w-4 text-[#1745FF] cursor-pointer hover:text-blue-400 transition-colors z-10" // Ajustado tamanho do ícone
                    onClick={handleSearchClick}
                />
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown} // CORRIGIDO: Usando onKeyDown
                    placeholder={placeholder}
                    // Input ocupa 100% do container pai (o div acima)
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" // Ajustado padding e tamanho
                />
            </div>
        </div>
    );
}