"use client"

export default function Galeria() {
  return (
    <section className="py-12 px-6">
      <h2 className="text-xl font-bold mb-6">Galeria de fotos</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center">
          <span className="text-gray-500">Foto</span>
        </div>
        <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center">
          <span className="text-gray-500">Foto</span>
        </div>
      </div>
    </section>
  )
}
