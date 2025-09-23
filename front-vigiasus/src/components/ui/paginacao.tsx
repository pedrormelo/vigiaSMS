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
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm font-medium text-gray-600">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}