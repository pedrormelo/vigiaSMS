// src/components/dados-gerais/gerenciasCarousel.tsx
"use client";

import GerenciaCard from "@/components/dados-gerais/gerenciaCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter } from "next/navigation";

// --- INTERFACE FOR PROPS ---
// Define a estrutura esperada pelo componente.
// ATENÇÃO: Adicionei o campo 'slug' aqui.
interface GerenciaParaFiltrar {
  id: string;
  slug?: string | null; // <--- CORREÇÃO: Adicionado campo slug opcional
  label: string;
  color: string;
}

interface GerenciasCarouselProps {
  gerencias: GerenciaParaFiltrar[]; 
  tourId?: string;
}
// --- END INTERFACE ---

// Função auxiliar para agrupar
function chunk<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array)) {
      console.error("chunk function received non-array:", array);
      return [];
  }
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}

export default function GerenciasCarousel({ gerencias, tourId }: GerenciasCarouselProps) {
  const router = useRouter();

  // Transforma a lista de gerências em grupos de 3 para os slides
  const groupedGerencias = chunk(gerencias, 3);

  if (!gerencias || gerencias.length === 0) {
    return (
        <div className="text-center py-10 px-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Nenhuma gerência encontrada com os filtros aplicados.</p>
        </div>
    );
  }

  return (
    <div id={tourId}>
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-6xl mx-auto"
    >
      <CarouselContent className="-ml-4">
        {groupedGerencias.map((group, index) => (
          <CarouselItem
            key={index}
            className="pl-4 py-4 md:basis-1/2 lg:basis-1/3"
          >
            <div className="flex flex-col gap-4">
              {group.map((gerencia) => (
                <GerenciaCard
                  // Usa id ou label como key
                  key={gerencia.id || gerencia.label}
                  label={gerencia.label}
                  color={gerencia.color}
                  // <--- CORREÇÃO PRINCIPAL AQUI:
                  // Verifica se existe slug. Se sim, usa. Se não, usa ID.
                  onClick={() => router.push(`/gerencia/${gerencia.slug || gerencia.id}`)}
                />
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

       {groupedGerencias.length > 3 && (
         <>
           <CarouselPrevious className="hidden cursor-pointer sm:flex bg-gray-50/25 hover:bg-gray-200 text-gray-400 hover:text-gray-500" />
           <CarouselNext className="hidden cursor-pointer sm:flex bg-gray-50/25 hover:bg-gray-200 text-gray-400 hover:text-gray-500" />
         </>
       )}
    </Carousel>
    </div>
  );
}