// src/app/validar/historico/loading.tsx

import React from 'react';

// Um componente de loading simples e visualmente agradável.
// Pode personalizá-lo como quiser, usando Tailwind CSS ou outros componentes.
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8 min-h-[500px]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado */}
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
        <p className="text-lg font-semibold text-gray-600">A carregar o histórico...</p>
      </div>
    </div>
  );
}