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
import { diretoriasConfig } from "@/constants/diretorias";

import InfoPopover from "@/components/dashboard/InfoPopover";

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

  const diretoriaConfig = diretoria.slug ? diretoriasConfig[diretoria.slug] : undefined;
  const bannerImage = diretoria.bannerImage || diretoriaConfig?.bannerImage || null;
  const gradientFrom = diretoria.corFrom || diretoriaConfig?.cores?.from || "#1745FF";
  const gradientTo = diretoria.corTo || diretoriaConfig?.cores?.to || "#1D4ED8";
  const sobreDiretoria = diretoria.sobre || diretoriaConfig?.sobre || "Sem descrição disponível para esta diretoria.";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header alinhado ao dashboard de diretoria */}
      <div
        className="relative p-10 text-white shadow-md"
        style={
          bannerImage
            ? {
                backgroundImage: `url(${bannerImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
              }
        }
      >
        <div className="flex justify-between items-center">
          {/* Títulos */}
          <div className="min-h-[150px]">
            <h1 className="text-4xl font-regular">
              {diretoria.nome}
            </h1>
            <p className="text-5xl mt-2 font-bold opacity-100">MINHAS GERÊNCIAS</p>
          </div>

          {/* Botões do canto direito */}
          <div className="flex flex-col items-center gap-3">

            <InfoPopover
              trigger={
                <button
                  className="flex items-center justify-center mb-9 w-8 h-8 cursor-pointer bg-[#ffffff] text-[#1745FF] rounded-full border-none hover:bg-white/80 transition-all duration-200 shadow-sm"
                  aria-label="Sobre esta diretoria"
                >
                  <Info size={20} />
                </button>
              }
              heading="Sobre"
              title={diretoria.nome}
              description={sobreDiretoria}
              side="left"
              align="center"
              sideOffset={12}
              alignOffset={0}
              showTail={false}
            />

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
                label={g.nome}
                color={gradientFrom}
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