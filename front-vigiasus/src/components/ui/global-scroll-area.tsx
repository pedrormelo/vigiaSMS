"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface GlobalScrollAreaProps {
    children: React.ReactNode
    className?: string
}

export default function GlobalScrollArea({ children, className }: GlobalScrollAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [scrollHeight, setScrollHeight] = useState(0)
    const [clientHeight, setClientHeight] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        let timeout: NodeJS.Timeout

        const handleScroll = () => {
            setScrollTop(el.scrollTop)
            setScrollHeight(el.scrollHeight)
            setClientHeight(el.clientHeight)
            setIsVisible(true)

            clearTimeout(timeout)
            timeout = setTimeout(() => setIsVisible(false), 800) // esconde após 800ms parado
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
            className={cn("relative w-full h-screen overflow-hidden", className)}
        >
            {/* Conteúdo scrollável */}
            <div
                ref={scrollRef}
                className="h-full w-full overflow-y-auto scroll-smooth pr-3"
            >
                {children}
            </div>

            {/* Scrollbar lateral */}
            <div
                className={cn(
                    "absolute top-0 right-2 h-full w-2 rounded-full transition-opacity duration-300 ease-in-out",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
            >
                <div
                    className={cn(
                        "absolute right-0 w-2 rounded-full transition-all duration-200",
                        "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600",
                        "shadow-lg"
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
