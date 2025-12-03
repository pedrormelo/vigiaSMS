"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white">
      {/* Container circular com fundo suave */}
      <div className="p-4 bg-blue-50 rounded-full animate-in fade-in zoom-in duration-300">
        {/* Ícone de loading animado */}
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    </div>
  );
}