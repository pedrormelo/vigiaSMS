// src/components/validar/IconeDocumento.tsx

import React from 'react';
import Image from 'next/image';
import { DocType } from './typesDados';
import { Link } from 'lucide-react'; 

const docTypeConfig = {
  excel: { src: "/icons/CONTEXTOS/PLA.svg", alt: "Ícone Excel" },
  pdf: { src: "/icons/CONTEXTOS/PDF.svg", alt: "Ícone PDF" },
  doc: { src: "/icons/CONTEXTOS/DOC.svg", alt: "Ícone Word" },
  apresentacao: { src: "/icons/CONTEXTOS/PPT.svg", alt: "Ícone PowerPoint" }, 
  dashboard: { src: "/icons/CONTEXTOS/GRA.svg", alt: "Ícone Dashboard" },
  resolucao: { src: "/icons/CONTEXTOS/RES.svg", alt: "Ícone Resolução" },
  indicador: { src: "/icons/CONTEXTOS/INDC.svg", alt: "Ícone Indicador" },
};

interface Props {
  type: DocType | 'link' | 'leis'; // Aceita tipos da FileType que não são DocType
}

export default function IconeDocumento({ type }: Props) {
  if (type === 'link') {
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
        <Link className="w-6 h-6 text-blue-500" />
      </div>
    );
  }

  // Verifica se o tipo é um DocType válido para o config
  if (type in docTypeConfig) {
    const config = docTypeConfig[type as keyof typeof docTypeConfig]; // Cast seguro
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

  // Fallback para tipos não mapeados (como 'leis' ou outros)
  const defaultConfig = docTypeConfig.doc; // 'doc' como padrão
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-cente">
      <Image
        src={defaultConfig.src}
        alt={defaultConfig.alt}
        width={32} 
        height={32}
      />
    </div>
  );
}