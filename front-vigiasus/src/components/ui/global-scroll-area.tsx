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
    const [isMouseNear, setIsMouseNear] = useState(false)

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
            timeout = setTimeout(() => setIsVisible(false), 2200) // esconde após 2.2s parado
        }

        el.addEventListener("scroll", handleScroll)
        return () => el.removeEventListener("scroll", handleScroll)
    }, [])

    // Show thumb when mouse is near right edge
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const el = scrollRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            // If mouse is within 100px of right edge
            if (e.clientX > rect.right - 100 && e.clientX < rect.right + 24 && e.clientY > rect.top && e.clientY < rect.bottom) {
                setIsMouseNear(true)
                setIsVisible(true)
            } else {
                setIsMouseNear(false)
            }
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
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

    // Drag logic for scrollbar thumb
    const isDraggingRef = useRef(false)

    return (
        <div
            className={cn("relative w-full h-screen bg-gradient-to-b from-gray-200 to-gray-300 overflow-hidden", className)}
        >
            {/* Conteúdo scrollável */}
            <div
                ref={scrollRef}
                className="h-full w-full overflow-y-auto pr-2"
            >
                {children}
            </div>

            {/* Scrollbar lateral */}
            <div
                className={cn(
                    "absolute top-0 right-1 h-full w-2 rounded-full transition-opacity duration-700 ease-in-out",
                    (isVisible || isMouseNear) ? "opacity-100" : "opacity-0"
                )}
            >
                <div
                    className={cn(
                        "absolute right-0 w-1.5 rounded-full transition-all duration-300",
                        // isDraggingRef.current ? "cursor-grabbing" : "cursor-grab",
                        "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600",
                        "hover:bg-gradient-to-b hover:from-blue-300 hover:to-blue-400",
                        "shadow-lg"
                    )}
                    style={{
                        height: `${thumbHeight}px`,
                        top: `${thumbTop}px`,
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault()
                        isDraggingRef.current = true
                    }}
                />
            </div>
        </div>
    )
}
