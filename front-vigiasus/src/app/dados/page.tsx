// src/app/dados/page.tsx
"use client"; 

import { useEffect, useMemo, useState } from "react"; 
import SectionTitle from "@/components/dados-gerais/sectionTitle";
import DiretoriasGrid from "@/components/dados-gerais/diretoriasGrid"; 
import GerenciasFilterBar from "@/components/dados-gerais/gerencias-filterbar";
import GerenciasCarousel from "@/components/dados-gerais/gerenciasCarousel"; 
import { useDebounce } from "@/hooks/useDebounce"; 
import { getDiretorias, getGerencias, type Diretoria, type Gerencia } from "@/services/organizacaoService";

// ATUALIZADO: Interface agora inclui 'slug'
interface GerenciaParaFiltrar {
  id: string;
  slug?: string | null; // <-- Adicionado
  label: string; 
  color: string;
  diretoriaId: string; 
}

export default function Dashboard() {
  // --- ESTADOS PARA GERIR OS FILTROS ---
  const [searchValue, setSearchValue] = useState(""); 
  const [selectedDiretorias, setSelectedDiretorias] = useState<string[]>([]); 
  const debouncedSearchValue = useDebounce(searchValue, 300); 
  const [diretorias, setDiretorias] = useState<Diretoria[]>([]);
  const [gerencias, setGerencias] = useState<Gerencia[]>([]);

  // --- FUNÇÕES HANDLER PARA ATUALIZAR OS FILTROS ---
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSelectDiretoria = (diretoriaId: string) => {
    setSelectedDiretorias((prevSelected) =>
      prevSelected.includes(diretoriaId)
        ? prevSelected.filter((id) => id !== diretoriaId) 
        : [...prevSelected, diretoriaId] 
    );
  };

  const clearDiretoriaFilter = () => {
    setSelectedDiretorias([]);
  };

  // --- PREPARAÇÃO E FILTRAGEM DOS DADOS ---
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [dirs, gers] = await Promise.all([getDiretorias(), getGerencias()]);
        if (active) {
          setDiretorias(dirs);
          setGerencias(gers);
        }
      } catch {
        // noop
      }
    })();
    return () => { active = false; };
  }, []);

  // Obtém a lista completa de todas as gerências
  const todasGerencias = useMemo(() => {
    const colorByDiretoria = new Map<string, string>();
    diretorias.forEach(d => { if (d.id !== 'secretaria') colorByDiretoria.set(d.id, d.corFrom || '#1745FF'); });
    
    const gerenciasList: GerenciaParaFiltrar[] = [];
    (gerencias || []).forEach(g => {
      const color = colorByDiretoria.get(g.diretoriaId) || '#1745FF';
      gerenciasList.push({
        id: g.id,
        slug: g.slug, // <-- Mapeamos o slug aqui
        label: g.nome,
        color,
        diretoriaId: g.diretoriaId,
      });
    });
    return gerenciasList;
  }, [diretorias, gerencias]);

  // Filtra a lista 'todasGerencias'
  const gerenciasFiltradas = useMemo(() => {
    return todasGerencias.filter(gerencia => {
      const matchesSearch = debouncedSearchValue
        ? gerencia.label.toLowerCase().includes(debouncedSearchValue.toLowerCase())
        : true; 

      const matchesDiretoria = selectedDiretorias.length > 0
        ? selectedDiretorias.includes(gerencia.diretoriaId) 
        : true; 

      return matchesSearch && matchesDiretoria;
    });
  }, [todasGerencias, debouncedSearchValue, selectedDiretorias]);

  // --- RENDERIZAÇÃO DA PÁGINA ---
  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6">
      <div className="w-full mx-auto px-12">
        <SectionTitle>Dados Gerais</SectionTitle>

        {/* 1. Grade de Diretorias */}
        <DiretoriasGrid diretorias={diretorias} />

        {/* 2. Barra de Filtros */}
        <GerenciasFilterBar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          selectedDiretorias={selectedDiretorias}
          onSelectDiretoria={handleSelectDiretoria}
          clearDiretoriaFilter={clearDiretoriaFilter}
          diretorias={diretorias}
        />

        {/* 3. Carrossel de Gerências */}
        <GerenciasCarousel gerencias={gerenciasFiltradas} />
      </div>
    </div>
  );
}