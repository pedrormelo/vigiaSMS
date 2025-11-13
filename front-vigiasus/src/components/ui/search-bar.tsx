"use client"

import type React from "react"

import { Search } from "lucide-react"

interface SearchBarProps {
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    onSearch?: (value: string) => void
    className?: string
}

export function SearchBar({
    placeholder = "Pesquise pelo nome da Gerência...",
    value = "",
    onChange,
    onSearch,
    className = "",
}: SearchBarProps) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange?.(newValue)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch?.(value)
        }
    }

    const handleSearchClick = () => {
        onSearch?.(value)
    }

    return (
        <div className={`relative max-w-full ${className}`}>
            <div className="relative flex items-center">
                <Search
                    strokeWidth={2.5}
                    className="absolute left-4 h-4.5 w-4.5 text-[#1745FF] cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={handleSearchClick}
                />
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-50 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
            </div>
        </div>
    )
}