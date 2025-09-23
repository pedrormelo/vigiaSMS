"use client"

import {useRef } from "react"
import { cn } from "@/lib/utils"

interface GlobalScrollAreaProps {
    children: React.ReactNode
    className?: string
}

export default function GlobalScrollArea({ children, className }: GlobalScrollAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    return (
        <div
            ref={scrollRef}
            className={cn(
                "h-screen w-full overflow-y-auto bg-gradient-to-b from-gray-100 to-gray-300 scrollbar-custom",
                className
            )}
        >
            {children}
        </div>

    )
}