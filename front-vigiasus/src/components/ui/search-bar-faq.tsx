// src/components/ui/search-bar-faq.tsx

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    className?: string;
    /** Start collapsed showing only the icon and expand on click */
    expandable?: boolean;
    /** Autofocus the input when it expands */
    autoFocusOnExpand?: boolean;
}

export function SearchBar({
    placeholder = "Pesquise...",
    value = "",
    onChange,
    onSearch,
    className = "",
    expandable = true,
    autoFocusOnExpand = true,
}: SearchBarProps) {
    const [expanded, setExpanded] = React.useState(!expandable);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    // Focus input when expanding
    React.useEffect(() => {
        if (expanded && autoFocusOnExpand) {
            const id = requestAnimationFrame(() => inputRef.current?.focus());
            return () => cancelAnimationFrame(id);
        }
    }, [expanded, autoFocusOnExpand]);

    // Collapse on outside click if empty
    React.useEffect(() => {
        if (!expandable) return;
        function handleDocMouseDown(e: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) {
                if (!value) setExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleDocMouseDown);
        return () => document.removeEventListener("mousedown", handleDocMouseDown);
    }, [expandable, value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onSearch?.(value);
        if (e.key === "Escape") {
            if (!value && expandable) setExpanded(false);
            (e.target as HTMLInputElement).blur();
        }
    };

    const handleIconClick = () => {
        if (expandable && !expanded) {
            setExpanded(true);
            return;
        }
        // If already expanded, treat as search trigger
        onSearch?.(value);
    };

    const handleClear = () => {
        onChange?.("");
        inputRef.current?.focus();
    };

    return (
        <div
            ref={wrapperRef}
            className={cn(
                "relative flex items-center",
                // Smoothly animate width/padding/border/shadow
                "transition-all duration-300 ease-in-out",
                // Collapsed: small round icon button footprint
                expandable && !expanded
                    ? "w-10 h-10 sm:w-11 sm:h-11 rounded-full"
                    : "w-full h-11 rounded-full",
                className
            )}
            aria-expanded={expandable ? expanded : true}
        >
            {/* Icon button (left) */}
            <button
                type="button"
                aria-label={expanded ? "Buscar" : "Abrir busca"}
                onClick={handleIconClick}
                className={cn(
                    "z-10 grid place-items-center rounded-full",
                    // Size matches the container height
                    "h-10 w-10 sm:h-11 sm:w-11",
                    // Visuals
                    "text-blue-600 hover:text-blue-500",
                    // When expanded, position absolute so the input can use the full width
                    expanded ? "absolute left-2" : "relative bg-white shadow-sm border border-gray-200"
                )}
            >
                <Search className="h-4 w-4" strokeWidth={2.5} />
            </button>

            {/* Input container */}
            <div
                className={cn(
                    "relative flex items-center overflow-hidden",
                    "transition-all duration-300 ease-in-out",
                    expandable && !expanded
                        ? "w-0 opacity-0 pointer-events-none"
                        : "w-full opacity-100 bg-white border border-gray-200 shadow-sm"
                )}
                // Rounded only when expanded (collapsed uses the icon button's circle)
                style={{ borderRadius: expanded ? 9999 : 0 }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder={placeholder}
                    className={cn(
                        "w-full pl-12 pr-10 text-sm text-gray-700 placeholder-gray-400",
                        "bg-transparent outline-none",
                        // Strong, visible focus style independent of theme tokens
                        "focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-full py-2.5"
                    )}
                    onBlur={() => {
                        // Collapse only if empty to avoid hiding user's input
                        if (expandable && !value) setExpanded(false);
                    }}
                />

                {/* Clear button when there is text */}
                {value && (
                    <button
                        type="button"
                        aria-label="Limpar busca"
                        onClick={handleClear}
                        className="absolute right-2 grid h-8 w-8 place-items-center text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}