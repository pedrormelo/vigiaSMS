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
};

interface Props {
  type: DocType;
}

export default function IconeDocumento({ type }: Props) {
  const config = docTypeConfig[type] || docTypeConfig.doc; // 'doc' como padrão

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