// src/components/popups/addContextoModal/entradaTabelaDeDados.tsx
import React from 'react';

interface EntradaTabelaDeDadosProps {
    // Atualizado para aceitar null, pois as células do banco/estado podem ser nulas
    valor: string | number | null; 
    aoMudar: (valor: string) => void;
    placeholder?: string;
    tipo?: "text" | "number";
    className?: string;
    eCabecalho?: boolean;
}

export const EntradaTabelaDeDados: React.FC<EntradaTabelaDeDadosProps> = ({ 
    valor, 
    aoMudar, 
    placeholder, 
    tipo = "text",
    className = "",
    eCabecalho = false,
}) => {
    const estiloBase = "w-full min-w-0 overflow-hidden text-ellipsis bg-transparent outline-none transition-all duration-200";
    const estiloCabecalho = "text-sm font-semibold text-blue-900 placeholder-blue-400 border-b-2 border-transparent focus:border-blue-500 text-left";
    const estiloCelula = `text-sm text-gray-700 placeholder-gray-400 rounded-2xl px-2 py-1 
        focus:bg-white focus:ring-2 focus:ring-blue-400 
        ${tipo === "number" ? "text-right" : "text-left"}`;

    return (
        <input
            type={tipo}
            // Converte null para string vazia para evitar warnings do React (uncontrolled input)
            value={valor ?? ""} 
            onChange={(e) => aoMudar(e.target.value)}
            placeholder={placeholder}
            className={`${estiloBase} ${eCabecalho ? estiloCabecalho : estiloCelula} ${className}`}
        />
    );
};