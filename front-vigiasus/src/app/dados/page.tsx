import SectionTitle from "@/components/dados-gerais/sectionTitle";
import DiretoriasGrid from "@/components/dados-gerais/diretoriasGrid";
import FilterBar from "@/components/dados-gerais/filterBar";
import GerenciasCarousel from "@/components/dados-gerais/gerenciasCarousel";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6">
      <div className="container mx-auto">
        <div>

        </div>
        <SectionTitle>Dados Gerais</SectionTitle>
        <DiretoriasGrid />

        <FilterBar />
        <GerenciasCarousel />
      </div>
    </div>
  );
}
