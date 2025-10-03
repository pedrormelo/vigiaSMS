import React from 'react';

interface DataTableInputProps {
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "text" | "number";
    className?: string;
    isHeader?: boolean;
}

export const DataTableInput: React.FC<DataTableInputProps> = ({ 
    value, 
    onChange, 
    placeholder, 
    type = "text",
    className = "",
    isHeader = false,
}) => {
    const baseStyle = "w-full bg-transparent outline-none text-center transition-all duration-200";
    const headerStyle = "text-sm font-semibold text-blue-900 placeholder-blue-400 border-b-2 border-transparent focus:border-blue-500";
    const cellStyle = "text-sm text-gray-700 placeholder-gray-400 rounded-md p-2 focus:bg-white focus:ring-2 focus:ring-blue-400";

    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseStyle} ${isHeader ? headerStyle : cellStyle} ${className}`}
        />
    );
};