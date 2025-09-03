"use client"

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
    children: React.ReactNode;
    className?: string;
    height?: string;
    showScrollbar?: 'hover' | 'always' | 'never';
    orientation?: 'vertical' | 'horizontal' | 'both';
    scrollbarWidth?: 'thin' | 'medium' | 'thick';
    [key: string]: any;
}

const ScrollArea: React.FC<ScrollAreaProps> = ({
    children,
    className = '',
    height = '400px',
    showScrollbar = 'always',
    orientation = 'vertical',
    scrollbarWidth = 'thin',
    ...props
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [contentWidth, setContentWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        let scrollTimeout: NodeJS.Timeout;

        const updateScrollInfo = () => {
            setScrollTop(element.scrollTop);
            setScrollLeft(element.scrollLeft);
            setContentHeight(element.scrollHeight);
            setContentWidth(element.scrollWidth);
            setContainerHeight(element.clientHeight);
            setContainerWidth(element.clientWidth);
        };

        const handleScroll = () => {
            updateScrollInfo();
            setIsScrolling(true);
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        element.addEventListener('scroll', handleScroll);
        updateScrollInfo();

        // Update on resize
        const resizeObserver = new ResizeObserver(updateScrollInfo);
        resizeObserver.observe(element);

        return () => {
            element.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
            clearTimeout(scrollTimeout);
        };
    }, []);

    const scrollToPosition = (position: number, orientation: 'vertical' | 'horizontal' = 'vertical') => {
        if (!scrollRef.current) return;
        if (orientation === 'vertical') {
            scrollRef.current.scrollTo({
                top: position,
                behavior: 'auto'
            });
        } else {
            scrollRef.current.scrollTo({
                left: position,
                behavior: 'smooth'
            });
        }
    };

    const shouldShowVerticalScrollbar = () => {
        if (showScrollbar === 'never') return false;
        if (showScrollbar === 'always') return contentHeight > containerHeight;
        return (isHovered || isScrolling) && contentHeight > containerHeight;
    };

    const shouldShowHorizontalScrollbar = () => {
        if (showScrollbar === 'never') return false;
        if (showScrollbar === 'always') return contentWidth > containerWidth;
        return (isHovered || isScrolling) && contentWidth > containerWidth;
    };

    const getScrollbarWidth = () => {
        switch (scrollbarWidth) {
            case 'thin': return 4;
            case 'medium': return 6;
            case 'thick': return 8;
            default: return 4;
        }
    };

    const verticalThumbHeight = containerHeight > 0 ?
        Math.max(20, (containerHeight * containerHeight) / contentHeight) : 0;
    const verticalThumbTop = contentHeight > 0 ?
        (scrollTop * (containerHeight - verticalThumbHeight)) / (contentHeight - containerHeight) : 0;

    const horizontalThumbWidth = containerWidth > 0 ?
        Math.max(20, (containerWidth * containerWidth) / contentWidth) : 0;
    const horizontalThumbLeft = contentWidth > 0 ?
        (scrollLeft * (containerWidth - horizontalThumbWidth)) / (contentWidth - containerWidth) : 0;

    return (
        <div
            className={cn("relative", className)}
            style={{ height }}
            {...props}
        >
            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                className="h-full w-full overflow-y-auto overflow-x-hidden relative"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {children}
            </div>
            {/* Custom vertical scrollbar overlays scroll area */}
            {shouldShowVerticalScrollbar() && (
                <div
                    className="absolute right-2 top-2 bottom-2 w-2 rounded-full bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 shadow-md transition-opacity duration-200 pointer-events-none"
                    style={{
                        height: containerHeight - 4,
                        opacity: isHovered || isScrolling ? 1 : 0.5,
                    }}
                >
                    <div
                        className="absolute left-0 w-full rounded-full bg-blue-600 hover:bg-blue-700 cursor-pointer transition-all duration-200 shadow-lg pointer-events-auto"
                        style={{
                            height: verticalThumbHeight,
                            top: verticalThumbTop,
                        }}
                        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            const startY = e.clientY;
                            const startScrollTop = scrollTop;
                            const handleMouseMove = (e: MouseEvent) => {
                                const deltaY = e.clientY - startY;
                                const scrollRatio = deltaY / (containerHeight - verticalThumbHeight);
                                const newScrollTop = startScrollTop + (scrollRatio * (contentHeight - containerHeight));
                                scrollToPosition(Math.max(0, Math.min(newScrollTop, contentHeight - containerHeight)));
                            };
                            const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ScrollArea;