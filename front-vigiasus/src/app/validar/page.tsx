// src/app/validar/page.tsx
"use client";

import { useState } from "react";
import ContextoTable from "@/components/validar/ContextoTable";
import { membroColumns } from "@/components/validar/colunasTable/membroColumns";
import { gerenteColumns } from "@/components/validar/colunasTable/gerenteColumns";
import { diretorColumns } from "@/components/validar/colunasTable/diretorColumns";
import { Contexto, StatusContexto } from "@/components/validar/typesDados";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye } from "lucide-react";
import FilterTabs from "@/components/validar/filtroTable";
import DetalhesContextoModal from "@/components/popups/detalhesContextoModal";

// Dados de exemplo 
const mockData: Contexto[] = [
    {
        id: "1",
        solicitante: "Pedro Augusto Lorenzo",
        email: "pedro.augusto02@gmail.com",
        nome: "Monitoramento Financeiro COAPES",
        situacao: StatusContexto.AguardandoAnalise,
        docType: "excel",
        gerencia: "Gerência de Gestão Ensino e Serviço",
        data: "02-08-2025",
        detalhes: "Relatório detalhado contendo o monitoramento dos repasses financeiros para o Contrato Organizativo de Ação Pública Ensino-Saúde (COAPES) referente ao primeiro semestre de 2025."
    },
    {
        id: "2",
        solicitante: "Luiza Vitória de Alincatra",
        email: "luizaalcan_1234@yahoo.com.br",
        nome: "Emendas Parlamentares - 2025",
        situacao: StatusContexto.AguardandoGerente,
        docType: "excel",
        gerencia: "Gerência de Planejamento em Saúde",
        data: "02-08-2025",
        detalhes: "Planilha com a relação de todas as emendas parlamentares destinadas à saúde para o ano de 2025, incluindo valores, autores e status de execução."
    },
    {
        id: "3",
        solicitante: "Murilo Alencar Gomes",
        email: "muriloalencar@hotmail.com",
        nome: "Monitoramento Ouvidoria",
        situacao: StatusContexto.AguardandoDiretor,
        docType: "doc",
        gerencia: "Coordenação de Ouvidoria do SUS",
        data: "02-08-2025",
        detalhes: "Documento com a compilação e análise das principais demandas registradas na Ouvidoria do SUS no último trimestre, com foco em reclamações e sugestões sobre o atendimento nas unidades de saúde."
    },
    {
        id: "4",
        solicitante: "Julia Maria da Cunha Leite",
        email: "cunhajuliamaria02@gmail.com",
        nome: "Pagamento PV/JET - Julho de 2025",
        situacao: StatusContexto.Deferido,
        docType: "pdf",
        gerencia: "Gerência de Gestão do Trabalho",
        data: "02-08-2025",
        detalhes: "Comprovativo de pagamento referente ao Programa de Valorização dos Trabalhadores do SUS (PV/JET) para o mês de Julho de 2025."
    },
    {
        id: "5",
        solicitante: "Carlos Eduardo",
        email: "cadu@exemplo.com",
        nome: "Relatório Epidemiológico",
        situacao: StatusContexto.Indeferido,
        docType: "dashboard",
        gerencia: "Gerência de Vigilância em Saúde",
        data: "02-08-2025",
        detalhes: "Apresentação do relatório epidemiológico semanal."
    },
];


export default function ValidacaoContextos() {
  const [perfil, setPerfil] = useState<"diretor" | "gerente" | "membro">("gerente");

  // Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | null>(null);

  // Função para abrir o modal com os dados da linha clicada
  const handleViewClick = (contexto: Contexto) => {
    setSelectedContexto(contexto);
    setIsModalOpen(true);
  };

  const baseColumns =
    perfil === "membro"
      ? membroColumns
      : perfil === "gerente"
      ? gerenteColumns
      : diretorColumns;

  const columnsWithActions = baseColumns.map(col => {
    if (col.key === 'acoes') {
      return {
        ...col, // Mantém as propriedades originais da coluna
        render: (row: Contexto) => (
          <div className="flex items-center gap-4 text-gray-500">
            <button onClick={() => handleViewClick(row)} className="hover:text-blue-600" title="Visualizar Contexto">
              <Eye size={16} />
            </button>
            {/* Se o perfil for membro, também mostra o ícone de apagar */}
            {perfil === 'membro' && (
              <button className="hover:text-red-600" title="Apagar Contexto">
                {/* Ícone de apagar aqui, ex: <FaTrash size={16} /> */}
              </button>
            )}
          </div>
        )
      };
    }
    return col;
  });

  const pageTitle = perfil === "membro" ? "Requisição de Contextos" : "Validar Contextos";

  return (
    <div className="p-8">
      {/* Simulação de Perfil */}
      <div className="flex gap-2 mb-4 bg-yellow-100 p-2 rounded-md text-sm">
          <p className="font-bold my-auto">Simulação de Perfil:</p>
          <button onClick={() => setPerfil("diretor")} className={`px-3 py-1 rounded-md ${perfil === 'diretor' && 'bg-blue-200 font-semibold'}`}>Diretor</button>
          <button onClick={() => setPerfil("gerente")} className={`px-3 py-1 rounded-md ${perfil === 'gerente' && 'bg-blue-200 font-semibold'}`}>Gerente</button>
          <button onClick={() => setPerfil("membro")} className={`px-3 py-1 rounded-md ${perfil === 'membro' && 'bg-blue-200 font-semibold'}`}>Membro</button>
      </div>

      <h1 className="text-3xl font-bold text-[#1745FF] mb-8">{pageTitle}</h1>

      <div className="bg-gray-50 rounded-[2rem] p-6 shadow-sm">
        {perfil === "gerente" && <FilterTabs />}

        <h2 className="text-xl font-semibold text-[#1745FF] mb-4">Solicitações em aberto</h2>
        <ContextoTable data={mockData} columns={columnsWithActions} />
        <div className="flex justify-end mt-6">
          <Button variant="outline" className="bg-white rounded-full shadow-sm">
            Histórico
            <RefreshCw className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Renderiza o modal, passando os estados e a função para fechar */}
      <DetalhesContextoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contexto={selectedContexto}
        perfil={perfil} 
      />
    </div>
  );
}