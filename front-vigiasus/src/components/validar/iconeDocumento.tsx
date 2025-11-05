// src/components/validar/IconeDocumento.tsx

import React from 'react';
import Image from 'next/image';
import { FileType } from "@/components/contextosCard/contextoCard"; // Importa FileType atualizado

const docTypeConfig = {
  planilha: { src: "/icons/CONTEXTOS/PLA.svg", alt: "Ícone Planilha" }, // <-- Renomeado
  pdf: { src: "/icons/CONTEXTOS/PDF.svg", alt: "Ícone PDF" },
  doc: { src: "/icons/CONTEXTOS/DOC.svg", alt: "Ícone Word" },
  apresentacao: { src: "/icons/CONTEXTOS/PPTX.svg", alt: "Ícone PowerPoint" }, 
  dashboard: { src: "/icons/CONTEXTOS/GRA.svg", alt: "Ícone Dashboard" },
  resolucao: { src: "/icons/CONTEXTOS/RES.svg", alt: "Ícone Resolução" },
  indicador: { src: "/icons/CONTEXTOS/INDIC.svg", alt: "Ícone Indicador" },
  link: { src: "/icons/CONTEXTOS/LINK.svg", alt: "Ícone Link" },
  leis: { src: "/icons/CONTEXTOS/RES.svg", alt: "Ícone Lei" },
};

interface Props {
  type: FileType; 
}

export default function IconeDocumento({ type }: Props) {
  // Configuração de fallback
  const config = docTypeConfig[type] || docTypeConfig.doc; 

  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-cente">
      <Image
        src={config.src}
        alt={config.alt}
        width={32} 
        height={32}
      />
    </div>
  );
}