// components/ui/data-table-input.tsx
interface DataTableInputProps {
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "text" | "number";
    className?: string;
}

export function DataTableInput({ 
    value, 
    onChange, 
    placeholder, 
    type = "text",
    className = "" 
}: DataTableInputProps) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-center ${className}`}
        />
    );
}