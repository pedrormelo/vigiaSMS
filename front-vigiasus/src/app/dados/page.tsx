// src/app/dados/page.tsx
"use client"; // Necessário para usar hooks como useState e useMemo

import { useEffect, useMemo, useState } from "react"; // Importar hooks
import SectionTitle from "@/components/dados-gerais/sectionTitle";
import DiretoriasGrid from "@/components/dados-gerais/diretoriasGrid"; // Mostra todas as diretorias
import GerenciasFilterBar from "@/components/dados-gerais/gerencias-filterbar";import GerenciasCarousel from "@/components/dados-gerais/gerenciasCarousel"; // Mostra as gerências filtradas
import { useDebounce } from "@/hooks/useDebounce"; // Para otimizar a pesquisa
import { getDiretorias, getGerencias, type Diretoria, type Gerencia } from "@/services/organizacaoService";

// Interface para a estrutura de dados das gerências usadas no filtro e carrossel
interface GerenciaParaFiltrar {
  id: string;
  label: string; // GerenciaCard espera 'label'
  color: string;
  diretoriaId: string; // Necessário para filtrar por diretoria
}

export default function Dashboard() {
  // --- ESTADOS PARA GERIR OS FILTROS ---
  const [searchValue, setSearchValue] = useState(""); // Estado para a barra de pesquisa
  const [selectedDiretorias, setSelectedDiretorias] = useState<string[]>([]); // Estado para as diretorias selecionadas no filtro
  const debouncedSearchValue = useDebounce(searchValue, 300); // Valor da pesquisa com atraso
  const [diretorias, setDiretorias] = useState<Diretoria[]>([]);
  const [gerencias, setGerencias] = useState<Gerencia[]>([]);

  // --- FUNÇÕES HANDLER PARA ATUALIZAR OS FILTROS ---
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSelectDiretoria = (diretoriaId: string) => {
    // Adiciona ou remove a diretoria selecionada do array de filtros
    setSelectedDiretorias((prevSelected) =>
      prevSelected.includes(diretoriaId)
        ? prevSelected.filter((id) => id !== diretoriaId) // Remove se já selecionada
        : [...prevSelected, diretoriaId] // Adiciona se não selecionada
    );
  };

  const clearDiretoriaFilter = () => {
    // Limpa o filtro de diretorias
    setSelectedDiretorias([]);
  };

  // --- PREPARAÇÃO E FILTRAGEM DOS DADOS ---
  // Carrega diretorias e gerências do backend
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

  // Obtém a lista completa de todas as gerências (exceto da secretaria)
  const todasGerencias = useMemo(() => {
    const colorByDiretoria = new Map<string, string>();
    diretorias.forEach(d => { if (d.id !== 'secretaria') colorByDiretoria.set(d.id, d.corFrom || '#1745FF'); });
    const gerenciasList: GerenciaParaFiltrar[] = [];
    (gerencias || []).forEach(g => {
      const color = colorByDiretoria.get(g.diretoriaId) || '#1745FF';
      gerenciasList.push({
        id: g.id,
        label: g.nome,
        color,
        diretoriaId: g.diretoriaId,
      });
    });
    return gerenciasList;
  }, [diretorias, gerencias]);

  // Filtra a lista 'todasGerencias' com base nos filtros ativos (pesquisa e diretorias)
  const gerenciasFiltradas = useMemo(() => {
    return todasGerencias.filter(gerencia => {
      // Verifica se o nome da gerência corresponde à pesquisa (ignorando maiúsculas/minúsculas)
      const matchesSearch = debouncedSearchValue
        ? gerencia.label.toLowerCase().includes(debouncedSearchValue.toLowerCase())
        : true; // Se a pesquisa estiver vazia, considera que corresponde

      // Verifica se a gerência pertence a uma das diretorias selecionadas
      const matchesDiretoria = selectedDiretorias.length > 0
        ? selectedDiretorias.includes(gerencia.diretoriaId) // Se houver diretorias selecionadas, verifica se a gerência pertence a uma delas
        : true; // Se nenhuma diretoria estiver selecionada, considera que corresponde

      // A gerência só é incluída se corresponder a ambos os filtros
      return matchesSearch && matchesDiretoria;
    });
    // Re-executa a filtragem quando a lista base, a pesquisa ou as diretorias selecionadas mudam
  }, [todasGerencias, debouncedSearchValue, selectedDiretorias]);

  // --- RENDERIZAÇÃO DA PÁGINA ---
  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6">
      <div className="w-full mx-auto px-12">
        <SectionTitle>Dados Gerais</SectionTitle>

        {/* 1. Grade de Diretorias (Não é afetada pelos filtros) */}
        <DiretoriasGrid diretorias={diretorias} />

        {/* 2. Barra de Filtros (Recebe e atualiza os estados dos filtros) */}
        <GerenciasFilterBar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          selectedDiretorias={selectedDiretorias}
          onSelectDiretoria={handleSelectDiretoria}
          clearDiretoriaFilter={clearDiretoriaFilter}
          diretorias={diretorias}
        />

        {/* 3. Carrossel de Gerências (Recebe a lista JÁ FILTRADA) */}
        <GerenciasCarousel gerencias={gerenciasFiltradas} />
      </div>
    </div>
  );
}