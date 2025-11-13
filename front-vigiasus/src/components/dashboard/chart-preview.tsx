
"use client"

import React, { useEffect, useRef } from "react"
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

                chartInstance.draw(chartData, options)
            } catch (err) {
                // console.error('Failed to draw google chart', err)
            }
        }

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
            chartInstance = null
        }
    }, [type, data, title, renderVersion, colors])

    return (
        <div
            className={`bg-white rounded-2xl border p-4 h-full flex flex-col transition-all duration-200 ${
                isHighlighted && editMode
                    ? "border-blue-400 ring-2 ring-blue-400 ring-opacity-50 shadow-lg shadow-blue-400/25"
                    : "border-gray-200 shadow-md"
            }`}
        >
            <div className="flex-1">
                <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
            </div>
        </div>
    )
}


