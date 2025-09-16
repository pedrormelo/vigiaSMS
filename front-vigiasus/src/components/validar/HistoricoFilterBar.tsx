// src/components/validar/HistoricoFilterBar.tsx
"use client";

import { SearchBar } from "@/components/ui/search-bar";

// As propriedades que o componente irá receber.
//    - `searchValue`: O valor atual da pesquisa (controlado pela página pai).
//    - `onSearchChange`: A função que será chamada quando o valor da pesquisa mudar.
interface Props {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function HistoricoFilterBar({ searchValue, onSearchChange }: Props) {
  return (
    <div className="mb-6">
      <SearchBar
        value={searchValue}
        onChange={onSearchChange} // Passamos a função diretamente para o onChange.
        placeholder="Pesquise por nome do contexto ou solicitante..."
      />
    </div>
  );
}