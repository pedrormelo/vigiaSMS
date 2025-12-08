// src/components/ui/Paginacao.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Paginacao({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) {
    return null; // Não mostra a paginação se houver apenas uma página
  }

  return (
    <div className="flex items-center justify-center text-gray-600 gap-2 sm:gap-3 md:gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}