import React from "react";

interface LayoutDuasColunasProps {
  colunaEsquerda: React.ReactNode;
  colunaDireita: React.ReactNode;
}

export const LayoutDuasColunas: React.FC<LayoutDuasColunasProps> = ({
  colunaEsquerda,
  colunaDireita,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full">
      <div className="flex flex-col h-full min-h-0 overflow-y-auto space-y-4 sm:space-y-6 pr-0 sm:pr-2 overscroll-contain">
        {colunaEsquerda}
      </div>
      <div className="flex flex-col h-full min-h-0 space-y-4 sm:space-y-6">
        {colunaDireita}
      </div>
    </div>
  );
};