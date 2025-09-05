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
            timeout = setTimeout(() => setIsVisible(false), 1800) // esconde após 1.8s parado
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

    // Drag logic for scrollbar thumb
    const isDraggingRef = useRef(false)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !scrollRef.current) return
            const el = scrollRef.current
            const rect = el.getBoundingClientRect()
            const y = e.clientY - rect.top
            const scrollRatio = (y - thumbHeight / 2) / (clientHeight - thumbHeight)
            const newScrollTop = scrollRatio * (scrollHeight - clientHeight)
            el.scrollTop = Math.max(0, Math.min(newScrollTop, scrollHeight - clientHeight))
        }
        const handleMouseUp = () => {
            isDraggingRef.current = false
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
        if (isDraggingRef.current) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDraggingRef.current, clientHeight, scrollHeight, thumbHeight])

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
                    "absolute top-0 right-1 h-full w-2 rounded-full transition-opacity duration-300 ease-in-out",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
            >
                <div
                    className={cn(
                        "absolute right-0 w-2 rounded-full transition-all duration-200",
                        isDraggingRef.current ? "cursor-grabbing" : "cursor-grab",
                        "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600",
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
