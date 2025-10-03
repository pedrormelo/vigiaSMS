import React from "react";

interface TwoColumnLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  leftColumn,
  rightColumn,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Coluna esquerda com rolagem independente */}
      <div className="flex flex-col min-h-0 overflow-y-auto space-y-6">
        {leftColumn}
      </div>

      {/* Coluna direita com rolagem independente */}
      <div className="flex flex-col min-h-0 overflow-y-auto space-y-6">
        {rightColumn}
      </div>
    </div>
  );
};
