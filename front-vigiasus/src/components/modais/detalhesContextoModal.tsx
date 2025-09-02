// src/components/validar/DetalhesContextoModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Contexto } from "@/components/validar/typesDados";
import { FileText, ArrowLeft, Download, Eye, MessageSquareText, ShieldX, ShieldCheck } from "lucide-react";
import IconeDocumento from "@/components/validar/iconeDocumento";

interface Props {
  contexto: Contexto | null;
  isOpen: boolean;
  onClose: () => void;
  perfil: "diretor" | "gerente" | "membro";
}

export default function DetalhesContextoModal({ contexto, isOpen, onClose, perfil }: Props) {
  const [comentario, setComentario] = useState("");

  if (!contexto) {
    return null;
  }

  const renderFooter = () => {
    if (perfil === "membro") {
      return (
        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-8 py-3 text-base">
          <MessageSquareText className="mr-2" size={20} />
          COMENTÁRIOS DESSE CONTEXTO
        </Button>
      );
    }
    return (
      <>
        <Button className="bg-[#E0440E] hover:bg-[#D94040] text-white rounded-xl px-8 py-3 text-base">
          <ShieldX className="mr-2" size={20} />
          INDEFERIR
        </Button>
        <Button className="bg-[#50CF5F] hover:bg-[#1E8C56] text-white rounded-b-lg px-8 py-3 text-base">
          <ShieldCheck className="mr-2" size={20} />
          DEFERIR
        </Button>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-3xl bg-transparent border-none p-0 shadow-none"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          <DialogHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 rounded-t-3xl flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-white" />
              <DialogTitle className="text-white text-xl">Detalhes do Contexto</DialogTitle>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full hover:bg-white/20">
              <ArrowLeft className="text-white" />
            </Button>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center text-gray-500">
              <p className="text-lg font-semibold text-gray-800">{contexto.nome}</p>
              <p className="text-sm">{new Date(contexto.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex justify-between items-start border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <IconeDocumento type={contexto.docType} />
                <span className="font-medium text-gray-700">pas_editado_versao_final.docx</span>
                <button className="text-gray-500 hover:text-gray-800" title="Baixar"><Download size={20} /></button>
                <button className="text-gray-500 hover:text-gray-800" title="Visualizar"><Eye size={20} /></button>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-gray-800">Postado por: {contexto.solicitante}</p>
                <p className="text-gray-500">{contexto.gerencia}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Detalhes do Contexto</h3>
              <div className="text-sm text-gray-600 border rounded-lg p-3 bg-gray-50 min-h-[100px]">
                {contexto.detalhes}
              </div>
            </div>
            {perfil !== "membro" && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Comentar Observação</h3>
                <textarea
                  placeholder="Exemplo: Contexto necessita de revisão nos dados de exames, favor corrigir até sexta..."
                  className="w-full border rounded-lg p-3 text-sm bg-gray-50 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* 👇 ALTERAÇÃO AQUI: Força a centralização horizontalmente */}
          <DialogFooter className="p-6 pt-0 sm:justify-center gap-4">
            {renderFooter()}
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
}