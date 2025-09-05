"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps {
    children: React.ReactNode
    className?: string
    height?: string | number
    snap?: boolean // habilitar snap
}

export default function ScrollArea({
    children,
    className,
    height = "400px",
    snap = false,
}: ScrollAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [scrollHeight, setScrollHeight] = useState(0)
    const [clientHeight, setClientHeight] = useState(0)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const handleScroll = () => {
            setScrollTop(el.scrollTop)
            setScrollHeight(el.scrollHeight)
            setClientHeight(el.clientHeight)
        }
        el.addEventListener("scroll", handleScroll)
        return () => el.removeEventListener("scroll", handleScroll)
    }, [])

    const thumbHeight =
        clientHeight > 0
            ? Math.max(40, (clientHeight * clientHeight) / scrollHeight)
            : 0

    const thumbTop =
        scrollHeight > 0
            ? (scrollTop * (clientHeight - thumbHeight)) /
            (scrollHeight - clientHeight)
            : 0

    return (
        <div
            className={cn("relative w-full", className)}
            style={{ height }}
        >
            {/* Conteúdo scrollável */}
            <div
                ref={scrollRef}
                className={cn(
                    "h-full w-full overflow-y-auto pr-3",
                    snap && "snap-y snap-mandatory"
                )}
            >
                {children}
            </div>

            {/* Scrollbar fixa (sempre visível) */}
            <div className="absolute top-0 right-1 h-full w-2 rounded-full bg-gray-200">
                <div
                    className={cn(
                        "absolute right-0 w-2 cursor-hold hover:cursor-holding rounded-full transition-all duration-200",
                        "bg-green-400 hover:bg-green-500 shadow-md"
                    )}
                    style={{
                        height: `${thumbHeight}px`,
                        top: `${thumbTop}px`,
                    }}
                />
            </div>
        </div>
    )
}
