"use client"

import { useEffect, useRef } from "react"
import type { GraphType } from "./graficoCard"

interface ChartPreviewProps {
    type: GraphType
    title: string
    data: any[] // Array esperado pelo Google Charts
    isHighlighted?: boolean
}

export function ChartPreview({ type, title, data, isHighlighted }: ChartPreviewProps) {
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const loadGoogleCharts = () => {
            if (!(window as any).google) {
                const script = document.createElement("script")
                script.src = "https://www.gstatic.com/charts/loader.js"
                script.onload = () => {
                    ; (window as any).google.charts.load("current", { packages: ["corechart", "bar"] })
                        ; (window as any).google.charts.setOnLoadCallback(drawChart)
                }
                document.head.appendChild(script)
            } else {
                drawChart()
            }
        }

        const drawChart = () => {
            if (!(window as any).google || !chartRef.current) return

            const google = (window as any).google
            const chartData = google.visualization.arrayToDataTable(data)

            let chart
            const options = {
                title,
                backgroundColor: "transparent",
                chartArea: { width: "85%", height: "70%" },
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

        loadGoogleCharts()
    }, [type, data, title])

    return (
        <div
            className={`bg-white rounded-lg border shadow-sm p-4 h-full flex flex-col ${isHighlighted ? "ring-2 ring-yellow-400 ring-opacity-50" : ""
                }`}
        >
            <div className="flex-1">
                <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
            </div>
        </div>
    )
}
