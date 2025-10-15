// components/dados-gerais/GerenciasCarousel.tsx

import GerenciaCard from "@/components/dados-gerais/gerenciaCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Função auxiliar para agrupar o array 'gerencias' em colunas de um tamanho definido.
function chunk<T>(array: T[], size: number): T[][] {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}

interface Gerencia {
  id: number;
  label: string;
  color: string;
}

const gerencias: Gerencia[] = [
    { id: 1, label: "Gerência de Fluxos Assistenciais", color: "#2563EB" },
    { id: 2, label: "Gerência de Tecnologia da Informação", color: "#16A34A" },
    { id: 3, label: "Gerência de Atenção Primária", color: "#00B5E2" },
    { id: 4, label: "Gerência de Saúde Bucal", color: "#F59E0B" },
    { id: 5, label: "Gerência de Urgência e Emergência", color: "#EF4444" },
    { id: 6, label: "Gerência de Vigilância em Saúde", color: "#DC2626" },
    { id: 7, label: "Gerência de Saúde Mental", color: "#9333EA" },
    { id: 8, label: "Gerência Administrativa", color: "#F59E0B" },
    { id: 9, label: "Gerência Financeira", color: "#16A34A" },
    { id: 10, label: "Gerência de Urgência e Emergência", color: "#EF4444" },
    { id: 11, label: "Gerência de Vigilância em Saúde", color: "#DC2626" },
    { id: 12, label: "Gerência de Saúde Mental", color: "#9333EA" },
    { id: 13, label: "Gerência Administrativa", color: "#F59E0B" },
    { id: 14, label: "Gerência Financeira", color: "#16A34A" },
];

export default function GerenciasCarousel() {
  // Transforma a lista única de gerências em colunas com 3 cards cada.
  const groupedGerencias = chunk(gerencias, 3);

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-6xl mx-auto"
    >
      {/* A margem negativa '-ml-4' compensa o padding 'pl-4' dos itens, alinhando o carrossel. */}
      <CarouselContent className="-ml-4">
        {/* O map exterior itera sobre as colunas, e o map interior itera sobre os cards de cada coluna. */}
        {groupedGerencias.map((group, index) => (
          <CarouselItem
            key={index}
            // 'py-4' adiciona espaço vertical para a sombra do card inferior não ser cortada.
            // 'basis' controla quantas colunas são visíveis por breakpoint.
            className="pl-4 py-4 md:basis-1/2 lg:basis-1/3"
          >
            {/* Este div empilha os cards de cada grupo na vertical. */}
            <div className="flex flex-col gap-4">
              {group.map((gerencia) => (
                <GerenciaCard
                  key={gerencia.label}
                  label={gerencia.label}
                  color={gerencia.color}
                />
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="hidden cursor-pointer sm:flex bg-gray-50/25 hover:bg-gray-200 text-gray-400 hover:text-gray-500" />
      <CarouselNext className="hidden cursor-pointer sm:flex bg-gray-50/25 hover:bg-gray-200 text-gray-400 hover:text-gray-500" />
    </Carousel>
  );
}