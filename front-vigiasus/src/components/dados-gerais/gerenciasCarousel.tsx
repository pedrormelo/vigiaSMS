// src/components/dados-gerais/gerenciasCarousel.tsx
"use client"; // Add this if not already present

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
// Define the structure of the gerencia object expected from the parent
interface GerenciaParaFiltrar {
  id: string;
  slug?: string | null;
  label: string;
  color: string;
}

interface GerenciasCarouselProps {
  gerencias: GerenciaParaFiltrar[]; // Accept the filtered list as a prop
}
// --- END INTERFACE ---

// Função auxiliar para agrupar (mantida)
function chunk<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array)) { // Add a check for array type
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

// --- UPDATE COMPONENT SIGNATURE ---
export default function GerenciasCarousel({ gerencias }: GerenciasCarouselProps) {
  // REMOVED: Internal hardcoded 'gerencias' array
  const router = useRouter();

  // --- USE THE PROP ---
  // Transforma a lista RECEBIDA de gerências em colunas com 3 cards cada.
  const groupedGerencias = chunk(gerencias, 3);
  // --- END PROP USAGE ---

  // Handle empty state if no gerencias match the filter
  if (!gerencias || gerencias.length === 0) {
    return (
        <div className="text-center py-10 px-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Nenhuma gerência encontrada com os filtros aplicados.</p>
        </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        // loop: true, // Consider disabling loop if filtered list is small
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
                  // Use gerencia.id which should be unique, fallback to label
                  key={gerencia.id || gerencia.label}
                  label={gerencia.label}
                  color={gerencia.color}
                  onClick={() => router.push(`/gerencia/${gerencia.slug || gerencia.id}`)}
                />
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Only show arrows if there's more content than fits */}
       {groupedGerencias.length > 3 && ( // Adjust '3' based on lg:basis-1/3
         <>
           <CarouselPrevious className="hidden cursor-pointer sm:flex bg-gray-50/25 hover:bg-gray-200 text-gray-400 hover:text-gray-500" />
           <CarouselNext className="hidden cursor-pointer sm:flex bg-gray-50/25 hover:bg-gray-200 text-gray-400 hover:text-gray-500" />
         </>
       )}
    </Carousel>
  );
}