// src/components/ui/FullscreenLoader.tsx

import React from 'react';
import { Loader2 } from 'lucide-react';

// O componente do spinner, agora é local
const CNSpinner = () => {
  return (
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
  );
};

// O componente de carregamento principal, que usa o CNSpinner
export default function FullscreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/75 backdrop-blur-md drop-shadow-lg transition-all duration-300">
      <CNSpinner />
      <p className="mt-4 text-sm font-medium text-gray-700">Carregando...</p>
    </div>
  );
}