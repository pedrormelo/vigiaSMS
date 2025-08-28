import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const ScrollBar = ({
    orientation = "vertical", // 'vertical' or 'horizontal'
    size = "thin", // 'thin', 'medium', 'thick'
    variant = "modern", // 'modern', 'minimal', 'glass'
    className = "",
    onScroll = () => { },
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(0);
    const trackRef = useRef(null);

    const getSizeClass = () => {
        const sizes: Record<string, string> = {
            thin: orientation === "vertical" ? "w-1" : "h-1",
            medium: orientation === "vertical" ? "w-1.5" : "h-1.5",
            thick: orientation === "vertical" ? "w-2" : "h-2",
        };
        return sizes[size] || sizes.thin;
    };

    const getVariantClass = () => {
        const variants: Record<string, string> = {
            modern: "bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm",
            minimal: "bg-gray-400",
            glass: "bg-white/20 backdrop-blur-sm border border-white/10",
        };
        return variants[variant] || variants.modern;
    };

    const getTrackClass = () => {
        const variants: Record<string, string> = {
            modern: "bg-gradient-to-br from-gray-100 to-gray-200",
            minimal: "bg-gray-200",
            glass: "bg-black/5 backdrop-blur-sm",
        };
        return variants[variant] || variants.modern;
    };

    return (
        <div
            ref={trackRef}
            className={cn(
                "relative rounded-full transition-all duration-300 ease-out",
                orientation === "vertical" ? "h-full" : "w-full",
                getSizeClass(),
                getTrackClass(),
                isHovered ? "scale-110" : "scale-100",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            {/* Scroll Thumb */}
            <div
                className={cn(
                    "absolute rounded-full cursor-pointer transition-all duration-200 ease-out",
                    orientation === "vertical" ? "w-full left-0" : "h-full top-0",
                    getSizeClass(),
                    getVariantClass(),
                    isHovered || isDragging
                        ? "opacity-100 scale-110"
                        : "opacity-70 scale-100",
                    isDragging ? "shadow-lg" : "hover:shadow-md"
                )}
                style={{
                    [orientation === "vertical" ? "height" : "width"]: "30%",
                    [orientation === "vertical" ? "top" : "left"]: `${position}%`,
                    transform: isHovered
                        ? "scale(1.2)"
                        : isDragging
                            ? "scale(1.3)"
                            : "scale(1)",
                }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);

                    const handleMouseUp = () => {
                        setIsDragging(false);
                        document.removeEventListener("mouseup", handleMouseUp);
                    };

                    document.addEventListener("mouseup", handleMouseUp);
                }}
            />

            {/* Progress Indicator */}
            {isDragging && (
                <div
                    className={cn(
                        "absolute rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-30",
                        orientation === "vertical" ? "w-full left-0" : "h-full top-0"
                    )}
                    style={{
                        [orientation === "vertical" ? "height" : "width"]: `${position + 30
                            }%`,
                        [orientation === "vertical" ? "top" : "left"]: "0",
                    }}
                />
            )}
        </div>
    );
};

export default ScrollBar;
