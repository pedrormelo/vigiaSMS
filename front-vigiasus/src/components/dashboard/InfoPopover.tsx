// src/components/dashboard/InfoPopover.tsx
"use client";

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

export interface InfoPopoverProps {
    trigger: React.ReactElement;
    heading?: string; // e.g., "Sobre"
    title?: string; // e.g., diretoria.nome
    description?: string;
    side?: Side;
    align?: Align;
    sideOffset?: number;
    alignOffset?: number;
    className?: string; // extra classes for PopoverContent
    showTail?: boolean;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({
    trigger,
    heading = "Sobre",
    title,
    description,
    side = "left",
    align = "end",
    sideOffset = 12,
        alignOffset = 0,
    className,
    showTail = true,
}) => {
    // Compute tail position based on side
    const tailStyle: React.CSSProperties | undefined = showTail
        ? side === "left"
            ? { right: -6, top: 18 }
            : side === "right"
                ? { left: -6, top: 18 }
                : side === "top"
                    ? { bottom: -6, right: 12 }
                    : { top: -6, right: 12 }
        : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                align={align}
                side={side}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
                className={cn(
                    "relative w-96 p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/40 shadow-xl",
                    className
                )}
            >
                <div className="space-y-2">
                    {heading && <div className="text-sm font-semibold text-blue-700">{heading}</div>}
                    {title && <div className="text-base font-medium text-gray-900 leading-snug">{title}</div>}
                    {description && (
                        <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                    )}
                </div>

                {showTail && (
                    <div
                        className="pointer-events-none absolute h-3 w-3 rotate-45 bg-white/80 backdrop-blur-lg border border-white/40 shadow"
                        style={tailStyle}
                    />
                )}
            </PopoverContent>
        </Popover>
    );
};

export default InfoPopover;
