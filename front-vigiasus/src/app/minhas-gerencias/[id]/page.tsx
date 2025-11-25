// src/app/minhas-gerencias/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Info, LayoutDashboard, Loader2, AlertCircle } from "lucide-react";
import GerenciaCard from "@/components/dados-gerais/gerenciaCard";
import { 
    getDiretoriaById, 
    getDiretoriaBySlug, 
    getGerenciasPorDiretoria, 
    Diretoria, 
    Gerencia 
} from "@/services/organizacaoService";

// Componentes de UI para o Popover de Informação
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function MinhasGerenciasPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id as string;

  const [diretoria, setDiretoria] = useState<Diretoria | null>(null);
  const [gerencias, setGerencias] = useState<Gerencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
        if (!idOrSlug) return;
        
        setIsLoading(true);
        setError(null);

        try {
            let diretoriaData: Diretoria | null = null;

            // 1. Verifica se é UUID ou Slug
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
            
            if (isUuid) {
                diretoriaData = await getDiretoriaById(idOrSlug);
            } else {
                diretoriaData = await getDiretoriaBySlug(idOrSlug);
            }
            
            if (!diretoriaData) {
                throw new Error("Diretoria não encontrada.");
            }

            if (isMounted) setDiretoria(diretoriaData);

            // 2. Busca as Gerências
            const gerenciasData = await getGerenciasPorDiretoria(diretoriaData.id);
            
            if (isMounted) setGerencias(gerenciasData);

        } catch (err: any) {
            console.error("Erro ao carregar dados:", err);
            if (isMounted) setError("Não foi possível carregar as informações.");
        } finally {
            if (isMounted) setIsLoading(false);
        }
    }

    fetchData();

    return () => { isMounted = false; };
  }, [idOrSlug]);

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500">Carregando...</p>
        </div>
    );
  }

  if (error || !diretoria) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-600 text-lg">{error || "Diretoria não encontrada"}</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header com gradiente dinâmico */}
      <div
        className="relative p-8 text-white shadow-lg"
        style={
          diretoria.bannerImage
            ? {
                backgroundImage: `url(${diretoria.bannerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(to right, ${diretoria.corFrom || '#1e40af'}, ${diretoria.corTo || '#3b82f6'})`
              }
        }
      >
        {/* Overlay para melhorar leitura */}
        <div className="absolute inset-0 bg-black/20 z-0" />

        <div className="flex justify-between items-center relative z-10">
          {/* Títulos */}
          <div>
            <h1 className="text-4xl font-bold">
              {diretoria.nome}
            </h1>
            <p className="text-2xl font-light opacity-90 mt-1">Minhas Gerências</p>
          </div>

          {/* Botões do canto direito */}
          <div className="flex flex-col items-center gap-3">
            
            {/* Botão de Informação com Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <button className="flex items-center justify-center mb-9 w-8 h-8 cursor-pointer bg-[#ffffff] text-[#1745FF] rounded-full border-none hover:bg-white/80 transition-all duration-200 shadow-sm">
                        <Info size={20} />
                    </button>
                </PopoverTrigger>
                <PopoverContent 
                    align="end" 
                    side="left"
                    className="w-80 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border-none text-gray-700"
                >
                    <h4 className="font-bold text-lg text-[#1745FF] mb-2">{diretoria.nome}</h4>
                    <p className="text-sm leading-relaxed text-gray-600">
                        {diretoria.sobre || "Sem descrição disponível para esta diretoria."}
                    </p>
                </PopoverContent>
            </Popover>

            {/* Botão de Dashboard com Redirecionamento */}
            <button 
                onClick={() => router.push(`/dashboard/${diretoria.slug || diretoria.id}`)}
                className="flex items-center justify-center w-11 h-11 cursor-pointer rounded-[0.6rem] bg-white text-gray-600 hover:bg-white/80 transition-all duration-200 shadow-sm"
                title="Ir para Dashboard da Diretoria"
            >
              <LayoutDashboard size={25} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Gerências */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-8">
        {gerencias.map((g) => (
          // Envolvemos o card numa div clicável para navegação
          <div 
            key={g.id} 
            onClick={() => router.push(`/gerencia/${g.slug || g.id}`)}
            className="cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none"
            title={`Acessar ${g.nome}`}
          >
              <GerenciaCard
                key={g.id} // Mantém a key no componente filho também por segurança, ou remove do pai se for único
                id={g.id}
                label={g.nome}
                // Dados extras para o card, se ele suportar
                title={g.sigla || g.nome}
                slug={g.slug}
                image={g.image}
                description={g.descricao}
                // Passa a cor principal da diretoria
                color={diretoria.corFrom || '#1e40af'}
              />
          </div>
        ))}

        {gerencias.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">
                Nenhuma gerência encontrada.
            </div>
        )}
      </div>
    </div>
  );
}