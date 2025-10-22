
"use client"

import React, { useEffect, useRef, useState } from "react"
import { loadGoogleCharts } from "@/lib/googleCharts"
import type { GraphType } from "./graficoCard"

interface ChartPreviewProps {
    type: GraphType
    title: string
    data: any[] // Array esperado pelo Google Charts
    colors?: string[]
    isHighlighted?: boolean
    editMode?: boolean
    // quando mudar, força redesenho do gráfico (ex.: troca de layout/página)
    renderVersion?: number
}

export function ChartPreview({ type, title, data, colors, isHighlighted, editMode, renderVersion }: ChartPreviewProps) {
    const chartRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // Show error if data is not a valid array
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="bg-red-100 rounded-2xl border-3 text-2xl font-medium border-red-400 shadow-sm p-4 h-full flex items-center justify-center text-red-400">
                Dados indisponíveis
            </div>
        )
    }

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null
        let chartInstance: any = null
        let readyListener: any = null

        const draw = async () => {
            if (!chartRef.current) return
            try {
                const google = await loadGoogleCharts(['corechart', 'bar'])
                if (!google || !google.visualization) return

                const chartData = google.visualization.arrayToDataTable(data)

                const defaultColors = colors && colors.length > 0 ? colors : ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
                const options = {
                    title,
                    backgroundColor: "transparent",
                    chartArea: { width: "85%", height: "75%" },
                    legend: { position: "bottom" },
                    colors: defaultColors,
                }

                switch (type) {
                    case "pie":
                        chartInstance = new google.visualization.PieChart(chartRef.current)
                        break
                    case "chart": // barras
                        chartInstance = new google.visualization.BarChart(chartRef.current)
                        break
                    case "line":
                        chartInstance = new google.visualization.AreaChart(chartRef.current)
                        break
                    default:
                        chartInstance = new google.visualization.ColumnChart(chartRef.current)
                }

                // attach ready event to end loading when chart finishes drawing
                if (google.visualization && chartInstance) {
                    readyListener = google.visualization.events.addListener(chartInstance, 'ready', () => {
                        setIsLoading(false)
                    })
                }

                chartInstance.draw(chartData, options)
            } catch (err) {
                // console.error('Failed to draw google chart', err)
            }
        }

        // start loading on dependency changes
        setIsLoading(true)
        draw()

        // Redesenha ao mudar tamanho do container
        if (chartRef.current && (window as any).ResizeObserver) {
            resizeObserver = new ResizeObserver(() => draw())
            resizeObserver.observe(chartRef.current)
        }

        return () => {
            if (resizeObserver && chartRef.current) {
                resizeObserver.unobserve(chartRef.current)
                resizeObserver.disconnect()
            }
            if (readyListener && (window as any).google?.visualization?.events && chartInstance) {
                try {
                    (window as any).google.visualization.events.removeListener(readyListener)
                } catch {}
            }
            chartInstance = null
        }
    }, [type, data, title, renderVersion, colors])

    return (
        <div
            className={`relative bg-white rounded-2xl border p-4 h-full flex flex-col transition-all duration-200 ${
                isHighlighted && editMode
                    ? "border-blue-400 ring-2 ring-blue-400 ring-opacity-50 shadow-lg shadow-blue-400/25"
                    : "border-gray-200 shadow-md"
            }`}
            aria-busy={isLoading}
        >
            {/* Chart container */}
            <div className="flex-1">
                <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />
                    <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-3">
                        <svg className="h-6 w-6 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="text-xs font-medium text-gray-600">Carregando gráfico…</span>
                    </div>
                </div>
            )}
        </div>
    )
}


