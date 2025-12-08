// src/components/gerencia/sections/IndicadoresSection.tsx
"use client";

import React, { useMemo, useRef } from "react";
import { AddIndicatorButton } from "@/components/indicadores/adicionarIndicador";
import { IndicatorCard } from "@/components/indicadores/indicadorCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { Contexto } from "@/components/validar/typesDados";
import { toIndicatorCardProps } from "@/lib/gerenciaUtils";

interface IndicadoresSectionProps {
    indicadores: Contexto[];
    modo: 'visualizacao' | 'edicao';
    onAddIndicator: () => void;
    onClickIndicator: (ctx: Contexto) => void;
}

export default function IndicadoresSection({ indicadores, modo, onAddIndicator, onClickIndicator }: IndicadoresSectionProps) {
    const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }));

    const items = useMemo(() => {
        const cards = indicadores.map((indicatorCtx) => {
            const { id, ...cardProps } = toIndicatorCardProps(indicatorCtx);
            return (
                <IndicatorCard key={id} {...cardProps} onClick={() => onClickIndicator(indicatorCtx)} />
            );
        });
        if (modo === 'edicao') {
            cards.unshift(<AddIndicatorButton key="add-indicator" onClick={onAddIndicator} />);
        }
        return cards;
    }, [indicadores, modo, onAddIndicator, onClickIndicator]);

    if (items.length === 0) {
        return <div className="text-xs md:text-sm text-center text-gray-500 py-4">(Nenhum indicador publicado)</div>;
    }

    const useCarousel = items.length > 4 && modo === 'visualizacao';

    return (
        <div className="mb-8 md:mb-16">
            {useCarousel ? (
                <Carousel
                    plugins={[autoplayPlugin.current]}
                    opts={{ align: "start", loop: true }}
                    className="w-full max-w-full mx-auto"
                    onMouseEnter={() => autoplayPlugin.current?.stop?.()}
                    onMouseLeave={() => autoplayPlugin.current?.play?.()}
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {items.map((item, index) => (
                            <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div className="p-1 h-full">{item}</div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            ) : (
                <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
                    {items}
                </div>
            )}
        </div>
    );
}
