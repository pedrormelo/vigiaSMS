"use client"

import { useMemo, useState, useEffect } from "react"
import { DashboardPreview, type GraphData } from "@/components/dashboard/dasboard-preview"
import type { LayoutType } from "@/components/dashboard/selecionarLayout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface GerenciaDashboardPreviewProps {
	graphs: (GraphData | null)[]
	gerencia: string
	className?: string
}

export function GerenciaDashboardPreview({ graphs, gerencia, className }: GerenciaDashboardPreviewProps) {
	// Filter only graphs that belong to this gerencia
	const filtered = useMemo(
		() => graphs.filter((g): g is GraphData => !!g && g.gerencia === gerencia),
		[graphs, gerencia]
	)

	// Choose a layout based on how many graphs we have (same approach used in secretaria)
	const chooseLayout = (n: number): LayoutType => {
		if (n >= 3) return "asymmetric" // capacity 3
		if (n === 2) return "sideBySide" // capacity 2
		return "grid" // capacity 4, will use 1 slot for a single graph
	}

	// Build pages with dynamic layouts per page
	const [page, setPage] = useState(0)
	
	// Calculate pages dynamically: fill each page optimally, then choose layout per page
	const pages = useMemo(() => {
		if (filtered.length === 0) return []
		
		const result: { graphs: GraphData[], layout: LayoutType }[] = []
		let remaining = [...filtered]
		
		while (remaining.length > 0) {
			// Determine optimal layout for remaining graphs
			const count = remaining.length
			let takeCount: number
			let layout: LayoutType
			
			if (count >= 3) {
				layout = "asymmetric"
				takeCount = 3
			} else if (count === 2) {
				layout = "sideBySide"
				takeCount = 2
			} else {
				layout = "grid"
				takeCount = 1
			}
			
			result.push({
				graphs: remaining.slice(0, takeCount),
				layout
			})
			remaining = remaining.slice(takeCount)
		}
		
		return result
	}, [filtered])

	const totalPages = Math.max(1, pages.length)
	
	// If filter changes and current page goes out of range, clamp it
	useEffect(() => {
		setPage((p) => (p >= totalPages ? Math.max(0, totalPages - 1) : p))
	}, [totalPages])

	const currentPage = pages[page] || { graphs: [], layout: "grid" as LayoutType }
	const pageGraphs = currentPage.graphs
	const layout = currentPage.layout

	if (filtered.length === 0) {
		return (
			<div className="bg-gray-50 rounded-2xl p-10 border-2 border-dashed border-gray-200 text-center text-gray-500">
				Nenhum gráfico cadastrado para esta gerência.
			</div>
		)
	}

	return (
		<div className={cn("relative", className)}>
			{/* Carousel body */}
			<DashboardPreview
				key={`${gerencia}-${layout}-${page}`}
				layout={layout}
				graphs={pageGraphs}
				onGraphSelect={() => {}}
				onGraphRemove={() => {}}
				onHighlightToggle={() => {}}
				editMode={false}
			/>

			{/* Controls: only show if multiple pages */}
			{totalPages > 1 && (
				<div className="mt-6 flex items-center justify-between gap-3">
					<Button
						size="icon"
						className="px-3 py-1.5 text-sm rounded-full border bg-white border-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:border-gray-400"
						onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
						disabled={page === 0}
					>
						<ArrowLeft className="h-4 w-4 text-gray-500" />
					</Button>
					
					<div className="flex gap-2">
						{Array.from({ length: totalPages }).map((_, i) => (
							<button
								key={i}
								aria-label={`Ir para página ${i + 1}`}
								className={cn(
									"w-2.5 h-2.5 rounded-full transition-colors",
									i === page ? "bg-[#2651FF]" : "bg-blue-300 hover:bg-blue-400"
								)}
								onClick={() => setPage(i)}
							/>
						))}
					</div>
					
					<Button
						size="icon"
						className="px-3 py-1.5 text-sm rounded-full border bg-white border-gray-500 hover:bg-gray-50 disabled:opacity-50"
						onClick={() => setPage((p) => (p + 1) % totalPages)}
						disabled={page === totalPages - 1}
					>
						<ArrowRight className="h-4 w-4 text-gray-500" />
					</Button>
				</div>
			)}
		</div>
	)
}

export default GerenciaDashboardPreview

