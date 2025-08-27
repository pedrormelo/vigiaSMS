import SectionTitle from "@/components/dados-gerais/sectionTitle";
import DiretoriasGrid from "@/components/dados-gerais/diretoriasGrid";
import FilterBar from "@/components/dados-gerais/filterBar";
import GerenciasCarousel from "@/components/dados-gerais/gerenciasCarousel";

export default function Dashboard() {
  return (
    <div className="p-6">
      <SectionTitle>Dados Gerais</SectionTitle>
      <DiretoriasGrid />

      <FilterBar />
      <GerenciasCarousel />
    </div>
  );
}
