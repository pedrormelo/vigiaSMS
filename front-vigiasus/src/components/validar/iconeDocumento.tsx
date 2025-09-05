// src/components/validar/IconeDocumento.tsx

import React from 'react';
import Image from 'next/image';
import { DocType } from './typesDados';

const docTypeConfig = {
  excel: { src: "/icons/planilha-icon-4.svg", alt: "Ícone Excel" },
  pdf: { src: "/icons/pdf-icon-2.svg", alt: "Ícone PDF" },
  doc: { src: "/icons/doc-icon.svg", alt: "Ícone Word" },
  dashboard: { src: "/icons/doc-icon.svg", alt: "Ícone Dashboard" },
  money: { src: "/icons/doc-icon.svg", alt: "Ícone Financeiro" },
};

interface Props {
  type: DocType;
}

export default function IconeDocumento({ type }: Props) {
  const config = docTypeConfig[type] || docTypeConfig.doc; // 'doc' como padrão

  return (

    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">

      <Image
        src={config.src}
        alt={config.alt}
        width={32} 
        height={32}
      />
    </div>
  );
}