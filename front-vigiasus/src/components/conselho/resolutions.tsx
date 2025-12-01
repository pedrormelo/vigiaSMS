"use client"

import { Plus, Search } from "lucide-react"

interface AddResolutionCardProps {
  label: string
}

function AddResolutionCard({ label }: AddResolutionCardProps) {
  return (
    <button
      type="button"
      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-4 text-center text-orange-600 transition hover:border-orange-400 hover:bg-orange-100"
    >
      <Plus className="h-6 w-6" aria-hidden="true" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  )
}
const resolutions = [
  "Resolução 20/07/2025",
  "Resolução 21/07/2025",
  "Resolução 22/07/2025",
  "Resolução 23/07/2025",
  "Resolução 24/07/2025",
]

export default function Resolutions() {
  return (
    <section className="py-12 px-6">
      <h2 className="text-xl font-bold mb-6">Resoluções</h2>

      {/* Barra de busca */}
      <div className="flex items-center gap-2 mb-6">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Pesquise pelo nome da Resolução..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AddResolutionCard label="Adicionar Resolução" />
        {resolutions.map((item, idx) => (
          <div key={idx} className="bg-orange-500 text-white rounded-xl p-4 text-center shadow">
            <p className="font-semibold">{item}</p>
            <p className="text-xs mt-2 opacity-90">25/07/2025</p>
          </div>
        ))}
      </div>
    </section>
  )
}
