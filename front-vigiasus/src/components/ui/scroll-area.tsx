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
    const isDragging = useRef(false)
    const dragStartY = useRef(0)
    const dragStartScroll = useRef(0)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const handleScroll = () => {
            setScrollTop(el.scrollTop)
            setScrollHeight(el.scrollHeight)
            setClientHeight(el.clientHeight)
        }
        el.addEventListener("scroll", handleScroll)
        // Initialize values on mount
        setScrollTop(el.scrollTop)
        setScrollHeight(el.scrollHeight)
        setClientHeight(el.clientHeight)
        return () => el.removeEventListener("scroll", handleScroll)
    }, [])

    // Drag logic for scrollbar thumb
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !scrollRef.current) return
            const el = scrollRef.current
            const deltaY = e.clientY - dragStartY.current
            const scrollableHeight = el.scrollHeight - el.clientHeight
            const trackHeight = el.clientHeight - thumbHeight
            if (trackHeight <= 0) return
            const newScrollTop = Math.min(
                Math.max(
                    dragStartScroll.current + (deltaY * scrollableHeight) / trackHeight,
                    0
                ),
                scrollableHeight
            )
            el.scrollTop = newScrollTop
        }
        const handleMouseUp = () => {
            isDragging.current = false
            document.body.style.userSelect = ""
        }
        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [scrollHeight, clientHeight])

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
                    "h-full w-full overflow-y-scroll pr-3 no-scrollbar",
                    snap && "snap-y snap-mandatory"
                )}
            >
                {children}
            </div>

            {/* Scrollbar fixa (sempre visível) */}
            <div className="absolute top-0 right-1 h-full w-2 rounded-full bg-gray-200">
                <div
                    className={cn(
                        "absolute right-0 w-2 rounded-full transition-all duration-200 cursor-pointer",
                        "bg-gradient-to-b from-green-400 to-green-500 hover:bg-gradient-to-b hover:from-green-300 hover:to-green-400 shadow-md"
                    )}
                    style={{
                        height: `${thumbHeight}px`,
                        top: `${thumbTop}px`,
                    }}
                    onMouseDown={e => {
                        isDragging.current = true
                        dragStartY.current = e.clientY
                        dragStartScroll.current = scrollTop
                        document.body.style.userSelect = "none"
                    }}
                />
            </div>
        </div>
    )
}