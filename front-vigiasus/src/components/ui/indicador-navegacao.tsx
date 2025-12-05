// src/components/ui/indicador-navegacao.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Componente que exibe um indicador de carregamento durante navegação entre páginas
 * Fornece feedback visual ao usuário enquanto a nova página está sendo carregada
 */
export default function IndicadorNavegacao() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaCarregando, setEstaCarregando] = useState(false);

  useEffect(() => {
    // Quando a rota muda, o loading deve parar
    setEstaCarregando(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercepta cliques em links para mostrar loading
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Só mostra loading se for navegação interna e para página diferente
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          setEstaCarregando(true);
        }
      }
    };

    // Intercepta navegação programática (router.push, etc)
    const handlePopState = () => {
      setEstaCarregando(true);
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (!estaCarregando) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9998] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-blue-50 rounded-full">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-800">Navegando...</h2>
          <p className="text-sm text-gray-500 max-w-md">Aguarde enquanto a página é carregada.</p>
        </div>
      </div>
    </div>
  );
}
