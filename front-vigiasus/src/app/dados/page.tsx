import SectionTitle from "@/components/dados-gerais/sectionTitle";
import DiretoriasGrid from "@/components/dados-gerais/diretoriasGrid";
import FilterBar from "@/components/dados-gerais/gerencias-filterbar";
import GerenciasCarousel from "@/components/dados-gerais/gerenciasCarousel";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6">
      <div className="w-full mx-auto px-12">
        <SectionTitle>Dados Gerais</SectionTitle>
        <DiretoriasGrid />
        <FilterBar />
        <GerenciasCarousel />
      </div>
    </div>
  );
}
