"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HeroCMS() {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Texto */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold">
            CMS <span className="font-light">Conselho Municipal de Saúde</span>
          </h1>
          <p className="text-blue-100 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
            euismod, urna eu tincidunt consectetur, nisi nisl aliquet nunc, nec
            volutpat nunc nisl eu lectus. Aliquam erat volutpat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button className="bg-[#E2712A] hover:bg-[#E2713E] text-white rounded-2xl px-7 py-5">
              Veja as Resoluções
            </Button>
            <Button className="bg-white hover:bg-gray-100 text-indigo-700 rounded-2xl px-7 py-5">
              Baixe o Organograma
            </Button>
          </div>
        </div>

        {/* Imagem de destaque */}
        <div className="flex justify-center">
          <div className="relative w-[320px] h-[180px] lg:w-[400px] lg:h-[220px] rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="/cms-destaque.png" 
              alt="Conselho Municipal de Saúde"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
