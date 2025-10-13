"use client"

import { useEffect, useRef } from "react"
import type { GraphType } from "./graficoCard"

interface ChartPreviewProps {
    type: GraphType
    title: string
    data: any[] // Array esperado pelo Google Charts
    isHighlighted?: boolean
    editMode?: boolean
    // quando mudar, força redesenho do gráfico (ex.: troca de layout/página)
    renderVersion?: number
}

export function ChartPreview({ type, title, data, isHighlighted, editMode, renderVersion }: ChartPreviewProps) {
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

        const draw = () => {
            if (!(window as any).google || !chartRef.current) return

            const google = (window as any).google
            const chartData = google.visualization.arrayToDataTable(data)

            let chart
            const options = {
                title,
                backgroundColor: "transparent",
                chartArea: { width: "85%", height: "75%" },
                legend: { position: "bottom" },
            }

            switch (type) {
                case "pie":
                    chart = new google.visualization.PieChart(chartRef.current)
                    break
                case "chart": // barras
                    chart = new google.visualization.BarChart(chartRef.current)
                    break
                case "line":
                    chart = new google.visualization.AreaChart(chartRef.current)
                    break
                default:
                    chart = new google.visualization.ColumnChart(chartRef.current)
            }

            chart.draw(chartData, options)
        }

        const loadGoogleCharts = () => {
            if (!(window as any).google) {
                const script = document.createElement("script")
                script.src = "https://www.gstatic.com/charts/loader.js"
                script.onload = () => {
                    ; (window as any).google.charts.load("current", { packages: ["corechart", "bar"] })
                        ; (window as any).google.charts.setOnLoadCallback(draw)
                }
                document.head.appendChild(script)
            } else {
                draw()
            }
        }

        loadGoogleCharts()

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
        }
    }, [type, data, title, renderVersion])

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


