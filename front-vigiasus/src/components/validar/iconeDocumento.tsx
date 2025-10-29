// src/components/validar/IconeDocumento.tsx

import React from 'react';
import Image from 'next/image';
import { DocType } from './typesDados';

const docTypeConfig = {
  excel: { src: "/icons/CONTEXTOS/PLA.svg", alt: "Ícone Excel" },
  pdf: { src: "/icons/CONTEXTOS/PDF.svg", alt: "Ícone PDF" },
  doc: { src: "/icons/CONTEXTOS/DOC.svg", alt: "Ícone Word" },
  dashboard: { src: "/icons/CONTEXTOS/GRA.svg", alt: "Ícone Dashboard" },
  resolucao: { src: "/icons/CONTEXTOS/RES.svg", alt: "Ícone Resolução" },
  indicador: { src: "/icons/CONTEXTOS/INDC.svg", alt: "Ícone Indicador" },
  // Suporte para contexto do tipo "link" usado no VisualizarContexto
  link: { src: "/icons/CONTEXTOS/LINK.svg", alt: "Ícone Link" },
};

interface Props {
  // Aceita DocType padrão e também "link" para compatibilidade com FileType
  type: DocType | "link";
}

export default function IconeDocumento({ type }: Props) {
  const config = (docTypeConfig as any)[type] || docTypeConfig.doc; // 'doc' como padrão

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